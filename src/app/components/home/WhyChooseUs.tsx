import { useScrollReveal } from '../../hooks/useScrollReveal';

const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Manufacturer Pricing',
    desc: 'We source directly from verified Chinese factories. No middlemen. No inflated margins. Pure factory cost.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Nigeria Ready Stock',
    desc: 'Hundreds of products available in Lagos for immediate delivery across Nigeria. No waiting times.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'China Pre-Order Access',
    desc: 'Order any product from China before it reaches local markets. We handle sourcing, shipping, and customs.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Bulk Order Support',
    desc: 'Dedicated support for retailers, businesses, and distributors. Volume discounts and consolidated shipping.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: 'Multiple payment options including bank transfer, card, and escrow for bulk orders. Every transaction protected.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Verified Suppliers',
    desc: 'Every supplier is vetted for quality, reliability, and compliance. We only work with factories we trust.',
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof BENEFITS[0]; index: number }) {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl p-6 border border-stone-200/80 bg-white/85 backdrop-blur-[1px] hover:-translate-y-1 hover:border-stone-300 transition-all duration-300 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${index * 80}ms`,
        transitionDuration: '600ms',
        boxShadow: '0 12px 30px rgba(36, 35, 31, 0.06)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(180deg, rgba(212, 204, 187, 0.3) 0%, rgba(212, 204, 187, 0) 100%)' }}
      />
      <div className="relative w-10 h-10 rounded-full border border-stone-300/80 bg-stone-50/70 group-hover:border-stone-500 group-hover:bg-stone-800 group-hover:text-stone-50 flex items-center justify-center mb-4 transition-all duration-300 text-stone-600">
        {benefit.icon}
      </div>
      <h3
        className="relative text-stone-900 mb-2"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.1 }}
      >
        {benefit.title}
      </h3>
      <p className="relative text-stone-600 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
        {benefit.desc}
      </p>
    </div>
  );
}

export function WhyChooseUs() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: 'linear-gradient(180deg, #f7f5f0 0%, #f3f0e9 45%, #f7f6f2 100%)' }}
    >
      <div
        className="pointer-events-none absolute -top-28 -right-12 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-55"
        style={{ background: 'radial-gradient(circle, rgba(222, 214, 196, 0.55) 0%, rgba(222, 214, 196, 0) 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 w-[24rem] h-[24rem] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(205, 211, 210, 0.45) 0%, rgba(205, 211, 210, 0) 70%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left - sticky heading */}
          <div
            ref={ref}
            className="lg:sticky lg:top-28 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-24px)' }}
          >
            <p className="text-stone-500 text-xs uppercase tracking-[0.28em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Why Choose Us
            </p>
            <h2
              className="mb-6 text-stone-900"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.92, letterSpacing: '-0.01em' }}
            >
              Why Buy<br />Through Us?
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-9 max-w-sm" style={{ fontFamily: 'var(--font-body)' }}>
              We are not a marketplace. We are a direct supply channel between Chinese manufacturers and African buyers, cutting costs, eliminating middlemen, and delivering real value.
            </p>
            <div className="flex gap-7 md:gap-8 pt-6 border-t border-stone-300/80">
              {[
                { num: '500+', label: 'Verified Suppliers' },
                { num: '12K+', label: 'Products Sourced' },
                { num: '98%', label: 'Satisfaction Rate' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-stone-900" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1 }}>{stat.num}</p>
                  <p className="text-stone-500 text-xs uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {BENEFITS.map((b, i) => (
              <BenefitCard key={b.title} benefit={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
