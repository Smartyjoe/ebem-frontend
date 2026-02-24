import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

const POSTS = [
  { id: 1, slug: 'china-manufacturing-guide', category: 'Sourcing', title: 'How Chinese Manufacturing Can Transform Your Business in Africa', excerpt: 'A complete breakdown of how African entrepreneurs are leveraging direct factory access to cut costs by up to 60%.', date: 'Feb 18, 2026', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1611250396725-294c6af32fdd?w=800&q=80' },
  { id: 2, slug: 'pre-order-strategy', category: 'Trade', title: 'The Pre-Order Advantage: How to Get Products Before They Hit Nigerian Markets', excerpt: "Smart retailers are using China pre-orders to dominate local markets. Here's the exact playbook.", date: 'Feb 12, 2026', readTime: '4 min read', image: 'https://images.unsplash.com/photo-1734255026082-82fdc81991f0?w=800&q=80' },
  { id: 3, slug: 'shipping-container-guide', category: 'Logistics', title: 'Container Shipping 101: Everything Nigerian Importers Need to Know', excerpt: 'From FOB pricing to customs clearance in Lagos — a plain-language guide to international freight.', date: 'Feb 5, 2026', readTime: '8 min read', image: 'https://images.unsplash.com/photo-1631349549824-fc1f8d971e3e?w=800&q=80' },
  { id: 4, slug: 'bulk-sourcing-guide', category: 'Bulk Orders', title: 'Why Bulk Sourcing from China is the Future for Nigerian Retailers', excerpt: 'Retailers who buy in bulk are winning on margin, speed, and market share. Here\'s how to do it right.', date: 'Jan 28, 2026', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1674573071057-029f03b6add6?w=800&q=80' },
  { id: 5, slug: 'verified-suppliers', category: 'Suppliers', title: 'How We Verify Every Chinese Supplier Before Working with Them', excerpt: 'Not all factories are equal. Our 7-step verification process ensures you only get quality, reliable sourcing.', date: 'Jan 20, 2026', readTime: '7 min read', image: 'https://images.unsplash.com/photo-1762343264418-1467f9394f49?w=800&q=80' },
  { id: 6, slug: 'africa-ecommerce-2026', category: 'Market', title: 'Africa\'s Ecommerce Boom in 2026: What It Means for Importers', excerpt: "Nigeria's digital commerce is growing 30% year over year. Here's why China sourcing is the smartest play right now.", date: 'Jan 14, 2026', readTime: '5 min read', image: 'https://images.unsplash.com/photo-1744907895363-d351aa6019ef?w=800&q=80' },
];

export default function Blog() {
  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Trade Intelligence</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            Our Blog
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {/* Featured Post */}
        <Link to={`/blog/${POSTS[0].slug}`} className="group block mb-16 border-b border-gray-100 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img src={POSTS[0].image} alt={POSTS[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: 'grayscale(0.3)' }} />
            </div>
            <div>
              <span className="px-3 py-1 bg-black text-white text-xs uppercase tracking-widest mb-4 inline-block" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{POSTS[0].category}</span>
              <h2 className="mb-4 group-hover:text-gray-600 transition-colors" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05 }}>{POSTS[0].title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6" style={{ fontFamily: 'var(--font-body)' }}>{POSTS[0].excerpt}</p>
              <div className="flex items-center gap-2 text-black text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                Read Article <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {POSTS.slice(1).map(post => (
            <article key={post.id} className="group">
              <Link to={`/blog/${post.slug}`}>
                <div className="overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: 'grayscale(0.4)' }} />
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs uppercase tracking-widest mb-3 inline-block" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{post.category}</span>
                <h3 className="text-gray-900 mb-2 group-hover:text-gray-600 transition-colors leading-tight" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem' }}>{post.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3" style={{ fontFamily: 'var(--font-body)' }}>{post.excerpt}</p>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{post.date}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-400 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{post.readTime}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
