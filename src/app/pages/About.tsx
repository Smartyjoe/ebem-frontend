import { useScrollReveal } from '../hooks/useScrollReveal';
import { useApp } from '../context/AppContext';

export default function About() {
  const { ref, visible } = useScrollReveal();
  const { openPanel } = useApp();

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-black text-white py-24 lg:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1611250396725-294c6af32fdd?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.25, filter: 'grayscale(1)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>Our Story</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            China to Africa.<br />Direct.
          </h1>
          <p className="text-white/60 mt-6 max-w-lg text-sm lg:text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            NEXBRIDGE was founded with a singular mission: eliminate the cost gap between Chinese manufacturers and African consumers. We move containers. We source products. We deliver value.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-24px)', transition: 'all 700ms' }}>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>Our Mission</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.92 }}>
              Built for the<br />African Buyer.
            </h2>
            <p className="text-gray-500 mt-6 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              For too long, African businesses and consumers have paid inflated prices for products sourced through layers of intermediaries. We built NEXBRIDGE to change that — giving you direct access to the same factories that supply the world's biggest brands.
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Whether you're buying one item or a full container, you deserve factory pricing, transparent logistics, and a partner you can trust.
            </p>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1631349549824-fc1f8d971e3e?w=800&q=80"
              alt="Global Trade"
              className="w-full object-cover"
              style={{ aspectRatio: '4/3', filter: 'grayscale(0.2)' }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '500+', label: 'Verified Chinese Suppliers' },
              { num: '12,000+', label: 'Products Sourced' },
              { num: '98%', label: 'Customer Satisfaction' },
              { num: '4 yrs', label: 'In Operation' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>{stat.num}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 text-center">
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>Get Started</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
          Ready to Source<br />Directly?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <a href="/shop" className="px-10 py-4 bg-black text-white text-xs uppercase tracking-widest hover:scale-[1.02] transition-all" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Shop Now
          </a>
          <button onClick={() => openPanel('request')} className="px-10 py-4 border border-gray-200 text-black text-xs uppercase tracking-widest hover:border-black transition-all" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            Request a Product
          </button>
        </div>
      </div>
    </div>
  );
}
