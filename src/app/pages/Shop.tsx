import { useState } from 'react';
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ALL_PRODUCTS = [
  { id: '1', name: 'Pro Smartwatch X1', category: 'Gadgets', price: 45000, originalPrice: 68000, image: 'https://images.unsplash.com/photo-1616640044918-0622649122f0?w=600&q=80', badge: 'Ready Stock', hot: true },
  { id: '2', name: 'Portable Blender Pro', category: 'Appliances', price: 28000, originalPrice: null, image: 'https://images.unsplash.com/photo-1606746448655-6d7d999ebf31?w=600&q=80', badge: 'Ready Stock', hot: false },
  { id: '3', name: 'UltraBook 14" Laptop', category: 'Electronics', price: 380000, originalPrice: null, image: 'https://images.unsplash.com/photo-1628072004495-19b19c64dee1?w=600&q=80', badge: 'Pre-Order', hot: false },
  { id: '4', name: 'Streetwear Sneakers', category: 'Fashion', price: 32000, originalPrice: 48000, image: 'https://images.unsplash.com/photo-1722988739840-741f160d7a08?w=600&q=80', badge: 'Ready Stock', hot: true },
  { id: '5', name: 'Compact Speaker 360°', category: 'Gadgets', price: 18500, originalPrice: null, image: 'https://images.unsplash.com/photo-1586078875290-c22eb791ad5d?w=600&q=80', badge: 'Ready Stock', hot: false },
  { id: '6', name: 'True Wireless Earbuds', category: 'Gadgets', price: 12000, originalPrice: 19000, image: 'https://images.unsplash.com/photo-1759975652551-cf4cdcf52973?w=600&q=80', badge: 'Ready Stock', hot: false },
  { id: '7', name: 'Flagship Smartphone Pro', category: 'Mobile', price: 210000, originalPrice: null, image: 'https://images.unsplash.com/photo-1651565278701-91da491200c2?w=600&q=80', badge: 'Pre-Order', hot: true },
  { id: '8', name: 'Modern Desk Lamp', category: 'Home Decor', price: 15500, originalPrice: null, image: 'https://images.unsplash.com/photo-1755624222023-621f7718950b?w=600&q=80', badge: 'Ready Stock', hot: false },
];

const CATS = ['All', 'Gadgets', 'Mobile', 'Fashion', 'Appliances', 'Electronics', 'Home Decor'];

export default function Shop() {
  const [activeCat, setActiveCat] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { addToCart, openPanel } = useApp();

  const filtered = activeCat === 'All' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === activeCat);

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-black text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Manufacturer Pricing</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            Shop All
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATS.map(cat => (
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
          {filtered.length} Products
        </p>

        {/* Product Grid */}
        <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {filtered.map(product => (
            <div key={product.id} className={`group ${view === 'list' ? 'flex gap-6 border-b border-gray-100 pb-6' : ''}`}>
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
                  <span className={`px-2 py-0.5 text-xs uppercase tracking-wide ${product.badge === 'Pre-Order' ? 'bg-black text-white' : 'bg-white text-black'}`} style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    {product.badge}
                  </span>
                </div>
                {view === 'grid' && (
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => { addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, badge: product.badge }); openPanel('cart'); }}
                      className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
              <div className={view === 'list' ? 'flex-1 flex flex-col justify-center' : ''}>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>{product.category}</p>
                <h3 className="text-gray-900 mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem' }}>{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>₦{product.price.toLocaleString()}</span>
                  {product.originalPrice && <span className="text-gray-400 text-sm line-through">₦{product.originalPrice.toLocaleString()}</span>}
                </div>
                {view === 'list' && (
                  <button
                    onClick={() => { addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, badge: product.badge }); openPanel('cart'); }}
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
