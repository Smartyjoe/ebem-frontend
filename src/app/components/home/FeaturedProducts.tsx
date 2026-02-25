import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { getFeaturedProducts } from '../../services/products';
import type { Product } from '../../types/product';
import { formatNaira } from '../../utils/currency';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart, openPanel } = useApp();
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal(0.05);

  return (
    <div
      ref={ref}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 600ms, transform 600ms',
        transitionDelay: `${index * 70}ms`,
      }}
    >
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-gray-50 mb-4" style={{ aspectRatio: '4/5' }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span
              className={`px-2.5 py-1 text-xs uppercase tracking-wider ${
                product.badge === 'Pre-Order' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              {product.badge}
            </span>
            {product.hot && (
              <span
                className="px-2.5 py-1 text-xs uppercase tracking-wider bg-gray-800 text-white"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
              >
                Hot
              </span>
            )}
          </div>

          <div
            className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300"
            style={{ transform: hovered ? 'translateY(0)' : 'translateY(100%)', opacity: hovered ? 1 : 0 }}
          >
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  badge: product.badge,
                });
                openPanel('cart');
              }}
              className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </Link>

      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          {product.category}
        </p>
        <Link to={`/shop/${product.slug}`} className="inline-block">
          <h3
            className="text-gray-900 mb-1 group-hover:text-gray-600 transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem' }}
          >
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{formatNaira(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through" style={{ fontFamily: 'var(--font-body)' }}>
              {formatNaira(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { ref, visible } = useScrollReveal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts(8);
        if (!active) return;
        setProducts(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load featured products');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div
          ref={ref}
          className="flex items-end justify-between mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
              Manufacturer Pricing
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
              Featured
              <br />
              Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-gray-200 hover:border-black pb-1"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading && (
            <p className="col-span-full text-sm text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              Loading featured products...
            </p>
          )}
          {error && !loading && (
            <p className="col-span-full text-sm text-red-600" style={{ fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="col-span-full text-sm text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
              No featured products available.
            </p>
          )}
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 border border-black px-10 py-4 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
