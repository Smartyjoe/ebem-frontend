import { useEffect, useMemo, useState } from 'react';
import { Grid3X3, List } from 'lucide-react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { getProducts } from '../services/products';
import type { Product } from '../types/product';
import { formatNaira } from '../utils/currency';

export default function Shop() {
  const [activeCat, setActiveCat] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, openPanel } = useApp();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ perPage: 48 });
        if (!active) return;
        setProducts(data.items);
        setCategories(data.categories.length > 0 ? data.categories : ['All']);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeCat === 'All') return products;
    return products.filter((product) => product.categories.includes(activeCat));
  }, [activeCat, products]);

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      <div className="bg-black text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            Manufacturer Pricing
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            Shop All
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`flex-shrink-0 px-4 py-2 text-xs uppercase tracking-widest transition-all ${
                  activeCat === cat ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:border-black'
                }`}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'text-black' : 'text-gray-300'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'text-black' : 'text-gray-300'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-xs uppercase tracking-wider mb-8" style={{ fontFamily: 'var(--font-body)' }}>
          {loading ? 'Loading...' : `${filtered.length} Products`}
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            No products found.
          </p>
        )}

        <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {filtered.map((product) => (
            <div key={product.id} className={`group ${view === 'list' ? 'flex gap-6 border-b border-gray-100 pb-6' : ''}`}>
              <Link to={`/shop/${product.slug}`} className={view === 'list' ? 'block flex-shrink-0' : 'block'}>
                <div
                  className={`relative overflow-hidden bg-gray-50 ${view === 'list' ? 'w-32 h-32 flex-shrink-0' : 'mb-4'}`}
                  style={view === 'grid' ? { aspectRatio: '4/5' } : {}}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span
                      className={`px-2 py-0.5 text-xs uppercase tracking-wide ${
                        product.badge === 'Pre-Order' ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                    >
                      {product.badge}
                    </span>
                  </div>
                  {view === 'grid' && (
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, badge: product.badge });
                          openPanel('cart');
                        }}
                        className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </Link>
              <div className={view === 'list' ? 'flex-1 flex flex-col justify-center' : ''}>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                  {product.category}
                </p>
                <Link to={`/shop/${product.slug}`} className="inline-block">
                  <h3 className="text-gray-900 mb-1 hover:text-gray-600 transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem' }}>
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{formatNaira(product.price)}</span>
                  {product.originalPrice && <span className="text-gray-400 text-sm line-through">{formatNaira(product.originalPrice)}</span>}
                </div>
                {view === 'list' && (
                  <button
                    onClick={() => {
                      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, badge: product.badge });
                      openPanel('cart');
                    }}
                    className="w-fit px-5 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
