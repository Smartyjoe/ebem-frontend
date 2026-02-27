import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { getWpPosts, formatWpDate, type WpPost } from '../../services/wpBlog';

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: WpPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        {post.thumbnailImage || post.featuredImage ? (
          <img
            src={post.thumbnailImage || post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', opacity: 0.1 }}>E</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2.5">
          {post.categoryNames[0] && (
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              {post.categoryNames[0]}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto" style={{ fontFamily: 'var(--font-body)' }}>
            <Clock className="w-3 h-3" /> {post.readTime} min
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-black" style={{ fontFamily: 'var(--font-body)' }}>
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>
            {formatWpDate(post.date)}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

export function BlogPreview() {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWpPosts({ page: 1, perPage: 3 })
      .then(res => setPosts(res.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if no posts and not loading
  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
              Ebem Journal
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.92 }}
            >
              Trade Insights &<br />Market Intelligence
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-gray-200 px-5 py-3 rounded-full hover:border-black hover:bg-black hover:text-white transition-all flex-shrink-0"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            All Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map(post => <BlogCard key={post.id} post={post} />)
          }
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden text-center mt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-gray-200 px-6 py-3 rounded-full hover:border-black hover:bg-black hover:text-white transition-all"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            All Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
