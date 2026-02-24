import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const PRODUCTS = [
  {
    id: '1',
    name: 'Pro Smartwatch X1',
    category: 'Gadgets',
    price: 45000,
    originalPrice: 68000,
    image: 'https://images.unsplash.com/photo-1616640044918-0622649122f0?w=600&q=80',
    badge: 'Ready Stock',
    hot: true,
  },
  {
    id: '2',
    name: 'Portable Blender Pro',
    category: 'Appliances',
    price: 28000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1606746448655-6d7d999ebf31?w=600&q=80',
    badge: 'Ready Stock',
    hot: false,
  },
  {
    id: '3',
    name: 'UltraBook 14" Laptop',
    category: 'Electronics',
    price: 380000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1628072004495-19b19c64dee1?w=600&q=80',
    badge: 'Pre-Order',
    hot: false,
  },
  {
    id: '4',
    name: 'Streetwear Sneakers',
    category: 'Fashion',
    price: 32000,
    originalPrice: 48000,
    image: 'https://images.unsplash.com/photo-1722988739840-741f160d7a08?w=600&q=80',
    badge: 'Ready Stock',
    hot: true,
  },
  {
    id: '5',
    name: 'Compact Speaker 360°',
    category: 'Gadgets',
    price: 18500,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1586078875290-c22eb791ad5d?w=600&q=80',
    badge: 'Ready Stock',
    hot: false,
  },
  {
    id: '6',
    name: 'True Wireless Earbuds',
    category: 'Gadgets',
    price: 12000,
    originalPrice: 19000,
    image: 'https://images.unsplash.com/photo-1759975652551-cf4cdcf52973?w=600&q=80',
    badge: 'Ready Stock',
    hot: false,
  },
  {
    id: '7',
    name: 'Flagship Smartphone Pro',
    category: 'Mobile',
    price: 210000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1651565278701-91da491200c2?w=600&q=80',
    badge: 'Pre-Order',
    hot: true,
  },
  {
    id: '8',
    name: 'Modern Desk Lamp',
    category: 'Home Decor',
    price: 15500,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1755624222023-621f7718950b?w=600&q=80',
    badge: 'Ready Stock',
    hot: false,
  },
];

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
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
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 mb-4" style={{ aspectRatio: '4/5' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-1 text-xs uppercase tracking-wider ${
              product.badge === 'Pre-Order'
                ? 'bg-black text-white'
                : 'bg-white text-black'
            }`}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            {product.badge}
          </span>
          {product.hot && (
            <span className="px-2.5 py-1 text-xs uppercase tracking-wider bg-gray-800 text-white" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Hot
            </span>
          )}
        </div>

        {/* Add to Cart Overlay */}
        <div
          className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300"
          style={{ transform: hovered ? 'translateY(0)' : 'translateY(100%)', opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={() => {
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

      {/* Info */}
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          {product.category}
        </p>
        <h3
          className="text-gray-900 mb-1 group-hover:text-gray-600 transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem' }}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
            ₦{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through" style={{ fontFamily: 'var(--font-body)' }}>
              ₦{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
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
              Featured<br />Products
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {PRODUCTS.map((product, i) => (
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