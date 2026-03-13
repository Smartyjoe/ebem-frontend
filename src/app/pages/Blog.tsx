import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Search, Clock, ChevronRight, ArrowLeft, Loader2, AlertCircle, Calendar, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import {
  getWpPosts, getWpPostBySlug, getWpCategories,
  formatWpDate,
  type WpPost, type WpCategory,
} from '../services/wpBlog';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { trackAffiliateCtaClick } from '../services/affiliate';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-5 bg-gray-200 rounded w-3/5" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, featured = false }: { post: WpPost; featured?: boolean }) {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer ${featured ? 'lg:grid lg:grid-cols-2 lg:gap-0' : ''}`}
    >
      {/* Image */}
      <div className={`overflow-hidden bg-gray-100 ${featured ? 'aspect-[4/3] lg:aspect-auto' : 'aspect-[16/9]'}`}>
        {post.thumbnailImage || post.featuredImage ? (
          <img
            src={post.thumbnailImage || post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', opacity: 0.12 }}>E</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-6 flex flex-col justify-center ${featured ? 'lg:p-10' : ''}`}>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {post.categoryNames[0] && (
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-white bg-black px-2.5 py-1 rounded-full"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              {post.categoryNames[0]}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
            <Clock className="w-3 h-3" /> {post.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h2
          className={`font-medium text-gray-900 group-hover:text-black mb-3 leading-tight ${featured ? 'text-2xl lg:text-4xl' : 'text-lg'}`}
          style={{ fontFamily: featured ? 'var(--font-display)' : 'var(--font-body)' }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">
              {post.author[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              {post.author} · {formatWpDate(post.date)}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </article>
  );
}

// ─── Blog List ────────────────────────────────────────────────────────────────
function BlogList() {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [categories, setCategories] = useState<WpCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Load categories once
  useEffect(() => {
    getWpCategories().then(setCategories).catch(() => {});
  }, []);

  // Load posts when filters change
  const loadPosts = useCallback(async (pg: number, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const res = await getWpPosts({
        page: pg,
        perPage: 9,
        categoryId: activeCatId ?? undefined,
        search: search || undefined,
      });
      setPosts(prev => append ? [...prev, ...res.posts] : res.posts);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCatId, search]);

  useEffect(() => {
    setPage(1);
    loadPosts(1, false);
  }, [activeCatId, search, loadPosts]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await loadPosts(next, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const [featured, ...rest] = posts;
  const affiliateUrl = '/earn';

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Hero */}
      <div className="bg-black text-white py-16 lg:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            Ebem Global Journal
          </p>
          <h1
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 9vw, 8rem)', lineHeight: 0.9 }}
            className="mb-6"
          >
            Trade Insights &<br />Sourcing Intelligence
          </h1>
          <p className="text-gray-400 max-w-xl text-sm lg:text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            Market reports, sourcing tips, import guides, and business intelligence for Africa's next generation of importers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {/* Search + Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCatId(null)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${activeCatId === null ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:border-black hover:text-black'}`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${activeCatId === cat.id ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:border-black hover:text-black'}`}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search posts…"
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full w-52 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </form>
        </div>

        <aside className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 lg:max-w-sm lg:ml-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Affiliate CTA
          </p>
          <h3 className="text-2xl leading-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Monetize your audience with EbemGlobal.
          </h3>
          <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            Promote products, track referrals, and grow recurring commission streams.
          </p>
          <a
            href={affiliateUrl}
            onClick={() => trackAffiliateCtaClick('blog_sidebar')}
            className="inline-flex items-center justify-center bg-black text-white rounded-xl px-5 py-3 text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Join Affiliate Network
          </a>
        </aside>

        {/* Results count */}
        {!loading && total > 0 && (
          <p className="text-xs text-gray-400 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            {total} article{total !== 1 ? 's' : ''} {search ? `for "${search}"` : ''}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-8">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        )}

        {/* Posts */}
        {!loading && posts.length > 0 && (
          <div className="space-y-6">
            {/* Featured first post */}
            {featured && <PostCard post={featured} featured={true} />}

            {/* Rest grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-24">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', opacity: 0.06, lineHeight: 1 }}>BLOG</p>
            <p className="text-gray-500 text-sm mt-4" style={{ fontFamily: 'var(--font-body)' }}>
              {search ? `No posts found for "${search}"` : 'No posts published yet. Check back soon.'}
            </p>
          </div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-10 py-4 border border-gray-200 text-sm uppercase tracking-widest hover:border-black hover:bg-black hover:text-white disabled:opacity-50 transition-all rounded-xl"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</> : 'Load More Posts'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single Post View ─────────────────────────────────────────────────────────
function BlogPostView({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getWpPostBySlug(slug)
      .then(p => {
        if (!p) setError('Post not found');
        else setPost(p);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen pt-28 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen pt-28 flex items-center justify-center px-6">
      <div className="text-center">
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', opacity: 0.06, lineHeight: 1 }}>404</p>
        <p className="text-gray-600 mb-6" style={{ fontFamily: 'var(--font-body)' }}>{error || 'Post not found'}</p>
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-2 text-sm underline text-gray-600 hover:text-black" style={{ fontFamily: 'var(--font-body)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    </div>
  );

  const safeContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ['p','br','strong','em','b','i','ul','ol','li','h1','h2','h3','h4','h5','h6',
      'a','img','figure','figcaption','blockquote','pre','code','table','thead','tbody','tr','th','td','span','div'],
    ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','style','width','height'],
  });

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Back nav */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-black uppercase tracking-wider transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Articles
        </button>
      </div>

      {/* Hero image */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100">
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {post.categoryNames[0] && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-white bg-black px-2.5 py-1 rounded-full" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {post.categoryNames[0]}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
            <Clock className="w-3 h-3" /> {post.readTime} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
            <Calendar className="w-3 h-3" /> {formatWpDate(post.date)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
            <User className="w-3 h-3" /> {post.author}
          </span>
        </div>

        {/* Title */}
        <h1
          className="mb-6"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1 }}
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-500 leading-relaxed border-l-4 border-black pl-5 mb-10" style={{ fontFamily: 'var(--font-body)' }}>
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-sm lg:prose-base max-w-none prose-headings:font-normal prose-a:text-black prose-a:underline prose-img:rounded-xl prose-blockquote:border-black prose-blockquote:not-italic"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              {post.author[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>{post.author}</p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>Ebem Global Team</p>
            </div>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-gray-200 px-5 py-2.5 rounded-full hover:border-black hover:bg-black hover:text-white transition-all"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            More Articles
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Affiliate CTA
          </p>
          <h3 className="text-2xl mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Monetize your audience with EbemGlobal.
          </h3>
          <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            Turn readers into revenue with referral links and real-time conversion visibility.
          </p>
          <a
            href="/earn"
            onClick={() => trackAffiliateCtaClick('blog_post_footer')}
            className="inline-flex items-center justify-center bg-black text-white rounded-xl px-5 py-3 text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Become an Affiliate
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Blog() {
  const { slug } = useParams<{ slug?: string }>();
  return slug ? <BlogPostView slug={slug} /> : <BlogList />;
}
