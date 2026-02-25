import { env } from '../env.js';

interface FetchProductsArgs {
  page: number;
  perPage: number;
  search?: string;
  category?: string;
  featured?: boolean;
}

function withTimeout(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    signal: withTimeout(12000),
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`WooCommerce request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as T;
}

function appendAuth(url: URL): void {
  if (!env.WC_USE_STORE_API) {
    if (!env.WC_CONSUMER_KEY || !env.WC_CONSUMER_SECRET) {
      throw new Error('WC_CONSUMER_KEY and WC_CONSUMER_SECRET are required when WC_USE_STORE_API=false');
    }
    url.searchParams.set('consumer_key', env.WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', env.WC_CONSUMER_SECRET);
  }
}

export async function fetchWooProducts(args: FetchProductsArgs): Promise<unknown[]> {
  const path = env.WC_USE_STORE_API ? '/wp-json/wc/store/v1/products' : '/wp-json/wc/v3/products';
  const url = new URL(path, env.WC_BASE_URL);

  url.searchParams.set('page', String(args.page));
  url.searchParams.set('per_page', String(args.perPage));

  if (args.search) {
    url.searchParams.set('search', args.search);
  }
  if (args.category) {
    url.searchParams.set('category', args.category);
  }
  if (args.featured) {
    url.searchParams.set('featured', 'true');
  }

  appendAuth(url);
  return fetchJson<unknown[]>(url);
}

export async function fetchWooProductByReference(reference: string): Promise<unknown | null> {
  const path = env.WC_USE_STORE_API ? '/wp-json/wc/store/v1/products' : '/wp-json/wc/v3/products';

  // Numeric references can be fetched directly via the product resource endpoint.
  if (/^\d+$/.test(reference)) {
    const byIdUrl = new URL(`${path}/${reference}`, env.WC_BASE_URL);
    appendAuth(byIdUrl);
    try {
      return await fetchJson<unknown>(byIdUrl);
    } catch {
      return null;
    }
  }

  const slugUrl = new URL(path, env.WC_BASE_URL);
  slugUrl.searchParams.set('slug', reference);
  slugUrl.searchParams.set('per_page', '1');
  appendAuth(slugUrl);
  const bySlug = await fetchJson<unknown[]>(slugUrl);
  if (bySlug.length > 0) return bySlug[0];

  // Fallback for providers that may not support slug filtering consistently.
  const searchUrl = new URL(path, env.WC_BASE_URL);
  searchUrl.searchParams.set('search', reference.replace(/-/g, ' '));
  searchUrl.searchParams.set('per_page', '10');
  appendAuth(searchUrl);
  const bySearch = await fetchJson<unknown[]>(searchUrl);
  const exact = bySearch.find((entry) => {
    const candidate = entry as { slug?: string };
    return candidate.slug === reference;
  });

  return exact ?? null;
}
