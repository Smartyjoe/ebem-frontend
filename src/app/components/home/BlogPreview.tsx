import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const POSTS = [
  {
    id: 1,
    slug: 'china-manufacturing-guide',
    category: 'Sourcing',
    title: 'How Chinese Manufacturing Can Transform Your Business in Africa',
    excerpt: 'A complete breakdown of how African entrepreneurs are leveraging direct factory access through Ebem Global to cut costs by up to 60%.',
    date: 'Feb 18, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1611250396725-294c6af32fdd?w=800&q=80',
  },
  {
    id: 2,
    slug: 'pre-order-strategy',
    category: 'Trade',
    title: 'The Pre-Order Advantage: How to Get Products Before They Hit Nigerian Markets',
    excerpt: 'Smart retailers are using China pre-orders through Ebem Global to dominate local markets before stock even arrives.',
    date: 'Feb 12, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1734255026082-82fdc81991f0?w=800&q=80',
  },
  {
    id: 3,
    slug: 'shipping-container-guide',
    category: 'Logistics',
    title: 'Container Shipping 101: Everything Nigerian Importers Need to Know',
    excerpt: 'From FOB pricing to customs clearance in Nigeria — a plain-language guide to international freight with Ebem Global.',
    date: 'Feb 5, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1631349549824-fc1f8d971e3e?w=800&q=80',
  },
];

function BlogCard({ post, index }: { post: typeof POSTS[0]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <article
      ref={ref}
      className="group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 600ms, transform 600ms',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <Link to={`/blog/${post.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden mb-5" style={{ aspectRatio: '16/10' }}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
            style={{ filter: 'grayscale(0.8) brightness(0.9)' }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
          <div className="absolute top-4 left-4">
            <span
              className="px-3 py-1 bg-white text-black text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{post.date}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{post.readTime}</span>
        </div>

        {/* Title */}
        <h3
          className="text-gray-900 mb-2 group-hover:text-gray-600 transition-colors leading-tight"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem' }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          {post.excerpt}
        </p>

        {/* Read more */}
        <div className="flex items-center gap-2 text-black text-xs uppercase tracking-wider group-hover:gap-3 transition-all" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          Read Article
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </article>
  );
}

export function BlogPreview() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-32 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          ref={ref}
          className="flex items-end justify-between mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
              Trade Intelligence
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
              From Our<br />Blog
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-gray-200 hover:border-black pb-1"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            All Articles
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {POSTS.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
