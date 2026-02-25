import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProductByReference, getProducts } from '../services/products';
import type { Product } from '../types/product';
import { formatNaira } from '../utils/currency';

function htmlToText(value: string): string {
  if (!value) return '';

  if (typeof window !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = value;
    return (container.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function ProductDetails() {
  const { reference } = useParams<{ reference: string }>();
  const { addToCart, openPanel, setPrefillRequest } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!reference) return;

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const item = await getProductByReference(reference);
        if (!active) return;
        setProduct(item);
        setActiveImage(0);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [reference]);

  useEffect(() => {
    if (!product) return;

    let active = true;

    const loadRelated = async () => {
      try {
        const data = await getProducts({ perPage: 16 });
        if (!active) return;

        const sameCategory = data.items
          .filter((item) => item.id !== product.id && item.categories.some((category) => product.categories.includes(category)))
          .slice(0, 4);

        const fallback = data.items.filter((item) => item.id !== product.id).slice(0, 4);
        setRelatedProducts(sameCategory.length > 0 ? sameCategory : fallback);
      } catch {
        if (!active) return;
        setRelatedProducts([]);
      }
    };

    void loadRelated();
    return () => {
      active = false;
    };
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.images.length > 0 ? product.images : [product.image];
  }, [product]);

  const descriptionText = useMemo(() => {
    if (!product) return '';
    return htmlToText(product.description || product.shortDescription);
  }, [product]);

  const descriptionParts = useMemo(() => {
    if (!descriptionText) return [];

    return descriptionText
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .reduce<string[]>((parts, sentence, index) => {
        if (index % 2 === 0) {
          parts.push(sentence);
        } else {
          const last = parts[parts.length - 1] ?? '';
          parts[parts.length - 1] = `${last} ${sentence}`.trim();
        }
        return parts;
      }, []);
  }, [descriptionText]);

  const currentImage = gallery[activeImage] ?? '';

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        badge: product.badge,
      });
    }

    openPanel('cart');
  };

  const handleRequestProduct = () => {
    if (!product) return;

    setPrefillRequest(product.name);
    openPanel('request');
  };

  if (loading) {
    return (
      <div className="pt-20 lg:pt-24 min-h-screen bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <p className="text-sm text-stone-500" style={{ fontFamily: 'var(--font-body)' }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 lg:pt-24 min-h-screen bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <p className="text-sm text-red-600 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            {error ?? 'Product not found'}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-700 border-b border-stone-400/60 pb-1 hover:text-black"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-[#f7f5f0]">
      <section className="relative overflow-hidden border-b border-stone-200/80">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #f7f5f0 0%, #f1ede3 100%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-500" style={{ fontFamily: 'var(--font-body)' }}>
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-stone-700">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white" style={{ aspectRatio: '4 / 5' }}>
                {currentImage && (
                  <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                )}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev - 1 + gallery.length) % gallery.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-black"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev + 1) % gallery.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-black"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(index)}
                      className={`overflow-hidden rounded-xl border transition-all ${
                        activeImage === index ? 'border-stone-800 ring-1 ring-stone-800' : 'border-stone-200 hover:border-stone-400'
                      }`}
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 text-xs uppercase tracking-widest ${
                    product.badge === 'Pre-Order' ? 'bg-black text-white' : 'bg-white text-black border border-stone-300'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  {product.badge}
                </span>
                {product.hot && (
                  <span className="px-3 py-1 text-xs uppercase tracking-widest bg-stone-800 text-stone-50" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    Featured
                  </span>
                )}
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                {product.category}
              </p>

              <h1 className="text-stone-900 mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.1rem, 4.8vw, 4.2rem)', lineHeight: 0.95 }}>
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-stone-900" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                  {formatNaira(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-stone-500 line-through" style={{ fontFamily: 'var(--font-body)' }}>
                    {formatNaira(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-stone-700 mb-8 max-w-xl" style={{ fontFamily: 'var(--font-body)' }}>
                {descriptionParts[0] ?? 'Contact our team for complete sourcing details, lead time, and MOQ guidance for this product.'}
              </p>

              <div className="rounded-2xl border border-stone-200/90 bg-white/90 p-5 mb-7" style={{ boxShadow: '0 12px 30px rgba(36, 35, 31, 0.06)' }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500" style={{ fontFamily: 'var(--font-body)' }}>
                    Quantity
                  </p>
                  <div className="inline-flex items-center border border-stone-300 rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm text-stone-900" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(20, prev + 1))}
                      className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white text-xs uppercase tracking-[0.18em] hover:bg-black transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleRequestProduct}
                    className="px-6 py-3.5 border border-stone-300 text-stone-800 text-xs uppercase tracking-[0.18em] hover:border-stone-900 hover:text-black transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                  >
                    Request Bulk Quote
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-stone-700" style={{ fontFamily: 'var(--font-body)' }}>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-stone-900" /> Factory-direct sourcing and verified suppliers</p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-stone-900" /> Local delivery support across Nigeria</p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-stone-900" /> Dedicated support for wholesale and repeat orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
          <div>
            <h2 className="text-stone-900 mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1 }}>
              Product Overview
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-stone-700" style={{ fontFamily: 'var(--font-body)' }}>
              {(descriptionParts.length > 0 ? descriptionParts : [product.shortDescription || 'Details are available on request from our sourcing team.']).map((part) => (
                <p key={part}>{part}</p>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-stone-200 p-5 bg-[#faf9f6] h-fit">
            <h3 className="text-stone-900 mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem' }}>
              Sourcing Snapshot
            </h3>
            <dl className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-stone-500">Availability</dt>
                <dd className="text-stone-900">{product.inStock ? 'Ready Stock' : 'Pre-Order'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-stone-500">Supply model</dt>
                <dd className="text-stone-900">{product.badge}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-stone-500">Primary category</dt>
                <dd className="text-stone-900 text-right">{product.category}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-stone-500">Suitable for</dt>
                <dd className="text-stone-900 text-right">Retailers and bulk buyers</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="bg-[#f8f6f1]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                Similar Products
              </p>
              <h2 className="text-stone-900" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', lineHeight: 0.95 }}>
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex text-xs uppercase tracking-[0.2em] text-stone-600 border-b border-stone-300 pb-1 hover:text-stone-900 hover:border-stone-900"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              View all products
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <p className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-body)' }}>
              No related products available right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/shop/${item.slug}`} className="group">
                  <div className="overflow-hidden rounded-xl border border-stone-200 bg-white mb-3" style={{ aspectRatio: '4 / 5' }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {item.category}
                  </p>
                  <h3 className="text-sm text-stone-900 mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    {item.name}
                  </h3>
                  <p className="text-stone-900" style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                    {formatNaira(item.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
