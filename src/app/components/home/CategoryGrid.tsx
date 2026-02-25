import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const CATEGORIES = [
  {
    id: 1,
    name: 'Fashion & Apparel',
    count: 'Direct from China',
    image: 'https://images.unsplash.com/photo-1762343264418-1467f9394f49?w=800&q=80',
    span: 'col-span-2 row-span-2',
    href: '/shop?cat=fashion',
  },
  {
    id: 2,
    name: 'Mobile & Devices',
    count: 'Factory Pricing',
    image: 'https://images.unsplash.com/photo-1651565278701-91da491200c2?w=600&q=80',
    span: 'col-span-1 row-span-1',
    href: '/shop?cat=mobile',
  },
  {
    id: 3,
    name: 'Home & Decor',
    count: 'Ready Stock',
    image: 'https://images.unsplash.com/photo-1755624222023-621f7718950b?w=600&q=80',
    span: 'col-span-1 row-span-1',
    href: '/shop?cat=decor',
  },
  {
    id: 4,
    name: 'Home Appliances',
    count: 'Pre-Order Available',
    image: 'https://images.unsplash.com/photo-1611818830402-d07de749ed59?w=600&q=80',
    span: 'col-span-1 row-span-1',
    href: '/shop?cat=appliances',
  },
  {
    id: 5,
    name: 'Gadgets & Tech',
    count: 'Verified Suppliers',
    image: 'https://images.unsplash.com/photo-1759975652551-cf4cdcf52973?w=600&q=80',
    span: 'col-span-1 row-span-1',
    href: '/shop?cat=gadgets',
  },
];

function CategoryCard({ cat, index }: { cat: typeof CATEGORIES[0], index: number }) {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className={`${cat.span} relative overflow-hidden group cursor-pointer transition-all duration-700`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <Link to={cat.href} className="block h-full w-full">
        <div className="relative h-full w-full" style={{ minHeight: cat.span.includes('row-span-2') ? 500 : 240 }}>
          {/* Image */}
          <img
            src={cat.image}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ filter: 'brightness(0.75) grayscale(0.1)' }}
          />
          {/* Gradient */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%)', opacity: 1 }}
          />
          {/* Hover border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/50 transition-all duration-400" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1 transition-opacity duration-300" style={{ fontFamily: 'var(--font-body)' }}>
              {cat.count}
            </p>
            <div className="flex items-end justify-between">
              <h3
                className="text-white transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: cat.span.includes('row-span-2') ? 'clamp(2rem, 4vw, 3.5rem)' : 'clamp(1.4rem, 2.5vw, 2rem)',
                  lineHeight: 1,
                }}
              >
                {cat.name}
              </h3>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75">
                <ArrowUpRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function CategoryGrid() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          ref={ref}
          className="flex items-end justify-between mb-10 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
              Explore Categories
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
              Shop by<br />Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors pb-1 border-b border-gray-200 hover:border-black"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            All Categories
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
