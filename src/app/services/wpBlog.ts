/**
 * WordPress Blog Service
 * Fetches posts and categories from the WordPress REST API.
 * Uses the public /wp/v2 namespace — no authentication required.
 * Uses _embed to get featured images and author in a single request.
 */

const WP_BASE = (import.meta.env.VITE_WP_BASE_URL as string ?? '').replace(/\/+$/, '');
const WP_API = `${WP_BASE}/wp-json/wp/v2`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WpCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: string;           // decoded from title.rendered
  excerpt: string;         // plain text, stripped of HTML
  content: string;         // raw HTML from content.rendered (sanitize before render)
  featuredImage: string;   // URL of featured image or ''
  thumbnailImage: string;  // medium-size thumbnail or featuredImage fallback
  author: string;          // author display name
  categories: number[];    // array of category IDs
  categoryNames: string[]; // resolved category names
  readTime: number;        // estimated minutes
}

export interface WpPostsResponse {
  posts: WpPost[];
  total: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function estimateReadTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatWpPost(raw: Record<string, unknown>, categoryMap: Map<number, string>): WpPost {
  const embedded = (raw['_embedded'] as Record<string, unknown>) ?? {};

  // Featured image
  const mediaArr = (embedded['wp:featuredmedia'] as Record<string, unknown>[] | undefined) ?? [];
  const media = mediaArr[0] as Record<string, unknown> | undefined;
  const featuredImage = (media?.['source_url'] as string) ?? '';
  const mediaSizes = (media?.['media_details'] as Record<string, unknown>)?.['sizes'] as Record<string, unknown> | undefined;
  const thumbnailImage =
    (mediaSizes?.['medium_large'] as Record<string, unknown>)?.['source_url'] as string
    ?? (mediaSizes?.['medium'] as Record<string, unknown>)?.['source_url'] as string
    ?? featuredImage;

  // Author
  const authorArr = (embedded['author'] as Record<string, unknown>[] | undefined) ?? [];
  const author = (authorArr[0] as Record<string, unknown>)?.['name'] as string ?? 'Ebem Global';

  // Categories
  const categoryIds = (raw['categories'] as number[]) ?? [];
  const categoryNames = categoryIds.map(id => categoryMap.get(id) ?? '').filter(Boolean);

  const content = (raw['content'] as Record<string, unknown>)?.['rendered'] as string ?? '';
  const excerptRaw = (raw['excerpt'] as Record<string, unknown>)?.['rendered'] as string ?? '';

  return {
    id: raw['id'] as number,
    slug: raw['slug'] as string,
    date: raw['date'] as string,
    modified: raw['modified'] as string,
    title: decodeEntities((raw['title'] as Record<string, unknown>)?.['rendered'] as string ?? ''),
    excerpt: decodeEntities(stripHtml(excerptRaw)).replace(/\[&hellip;\]/, '…').replace(/\[…\]/, '…'),
    content,
    featuredImage,
    thumbnailImage,
    author,
    categories: categoryIds,
    categoryNames,
    readTime: estimateReadTime(content),
  };
}

// ─── Category cache ───────────────────────────────────────────────────────────

let _categoryCache: WpCategory[] | null = null;
let _categoryCacheExpiry = 0;
const CATEGORY_TTL = 10 * 60 * 1000; // 10 minutes

export async function getWpCategories(): Promise<WpCategory[]> {
  if (_categoryCache && Date.now() < _categoryCacheExpiry) return _categoryCache;

  const res = await fetch(`${WP_API}/categories?per_page=50&hide_empty=true`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as Array<{ id: number; name: string; slug: string; count: number }>;
  _categoryCache = data.map(c => ({
    id: c.id,
    name: decodeEntities(c.name),
    slug: c.slug,
    count: c.count,
  }));
  _categoryCacheExpiry = Date.now() + CATEGORY_TTL;
  return _categoryCache;
}

// ─── Posts list ───────────────────────────────────────────────────────────────

export async function getWpPosts(opts: {
  page?: number;
  perPage?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<WpPostsResponse> {
  const { page = 1, perPage = 9, categoryId, search } = opts;

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: 'wp:featuredmedia,author',
    status: 'publish',
    orderby: 'date',
    order: 'desc',
  });
  if (categoryId) params.set('categories', String(categoryId));
  if (search) params.set('search', search);

  // Fetch categories in parallel for name resolution
  const [res, categories] = await Promise.all([
    fetch(`${WP_API}/posts?${params.toString()}`, { headers: { Accept: 'application/json' } }),
    getWpCategories(),
  ]);

  if (!res.ok) throw new Error(`Failed to fetch posts (${res.status})`);

  const total = Number(res.headers.get('X-WP-Total') ?? 0);
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const raw = (await res.json()) as Record<string, unknown>[];
  const posts = raw.map(p => formatWpPost(p, categoryMap));

  return { posts, total, totalPages };
}

// ─── Single post by slug ──────────────────────────────────────────────────────

export async function getWpPostBySlug(slug: string): Promise<WpPost | null> {
  const params = new URLSearchParams({
    slug,
    _embed: 'wp:featuredmedia,author',
    status: 'publish',
  });

  const [res, categories] = await Promise.all([
    fetch(`${WP_API}/posts?${params.toString()}`, { headers: { Accept: 'application/json' } }),
    getWpCategories(),
  ]);

  if (!res.ok) return null;
  const raw = (await res.json()) as Record<string, unknown>[];
  if (!raw.length) return null;

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  return formatWpPost(raw[0], categoryMap);
}

// ─── Format date helper ───────────────────────────────────────────────────────

export function formatWpDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
