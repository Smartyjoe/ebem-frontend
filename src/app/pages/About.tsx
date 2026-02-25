import { useScrollReveal } from '../hooks/useScrollReveal';
import { useApp } from '../context/AppContext';

const VALUES = [
  { title: 'Integrity', desc: 'We operate with honesty, verification, and accountability in every transaction.' },
  { title: 'Trust & Transparency', desc: 'Clear pricing, real suppliers, and real processes — no hidden costs, no surprises.' },
  { title: 'Innovation', desc: 'Leveraging AI and smart systems to improve trade efficiency for African businesses.' },
  { title: 'Growth Partnership', desc: 'We grow with our clients and partners. Your success is our success.' },
  { title: 'Service Excellence', desc: 'Every transaction is treated as a long-term relationship, not a one-off deal.' },
  { title: 'Community Impact', desc: 'Empowering African entrepreneurs and businesses to compete globally.' },
];

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
            Ebem Global (Easy Buy Express MultiService) was founded with a singular mission: bridge the gap between Chinese manufacturers and African businesses. We simplify global sourcing, importation, and distribution — combining verified manufacturers, smart logistics, and AI-powered tools into one trusted system.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-24px)', transition: 'all 700ms' }}>
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>Our Mission</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 0.92 }}>
              Built for the<br />African Business.
            </h2>
            <p className="text-gray-500 mt-6 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              To simplify global trade and e-commerce for Africa by building a trusted ecosystem that connects verified manufacturers, smart logistics, and modern technology — enabling businesses to scale confidently across borders.
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              We serve retailers, wholesalers, entrepreneurs, SMEs, and institutions that want reliable access to global products — especially from China — while operating safely within Africa. Whether you're buying one item or a full container, you deserve factory pricing, transparent logistics, and a partner you can trust.
            </p>
            <blockquote className="mt-6 pl-4 border-l-2 border-black">
              <p className="text-gray-700 text-sm italic leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                "We believe global trade should be transparent, verifiable, and accessible — not reserved for a few insiders."
              </p>
              <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest" style={{ fontFamily: 'var(--font-body)' }}>— Armstrong Praise Kakulu, Founder & CEO</p>
            </blockquote>
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

      {/* What We Do */}
      <div className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>What We Do</p>
          <h2 className="mb-12" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
            A Multi-Division<br />Trade Company
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Global Trade Network', desc: 'EGTN connects verified Chinese manufacturers with African importers, wholesalers, and distributors through a structured, trusted network.' },
              { title: 'China Market Division', desc: 'Direct access to Chinese manufacturers — factory sourcing, price negotiation, MOQ management, product inspection, and RMB exchange.' },
              { title: 'E-commerce Division', desc: 'Dropshipping operations, wholesale listings, and product catalog management on our Nigeria-focused marketplace platform.' },
              { title: 'Logistics & Fulfillment', desc: 'Sea and air cargo coordination, CBM/weight-based shipping advisory, customs and clearing support, and last-mile delivery across Nigeria.' },
              { title: 'AI & Digital Solutions', desc: 'AI-powered product research, image-based product search, business automation systems, and sales/marketing AI workflows.' },
              { title: 'Bulk & Wholesale Supply', desc: 'Dedicated support for retailers, businesses, and distributors. Volume discounts, factory-direct pricing, and consolidated shipping.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-white border border-gray-100">
                <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1.1 }}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 lg:py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Our Foundation</p>
        <h2 className="mb-12" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.95 }}>
          Core Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', lineHeight: 1.1 }}>{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{v.desc}</p>
              </div>
            </div>
          ))}
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
              { num: 'China–Africa', label: 'Our Specialisation' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', lineHeight: 1 }}>{stat.num}</p>
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
          Ready to Trade<br />Without Borders?
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
