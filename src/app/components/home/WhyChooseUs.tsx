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
      className="group p-6 border border-gray-100 hover:border-black transition-all duration-400 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${index * 80}ms`,
        transitionDuration: '600ms',
      }}
    >
      <div className="w-10 h-10 border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center mb-4 transition-all duration-300 text-gray-600">
        {benefit.icon}
      </div>
      <h3
        className="text-gray-900 mb-2"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.1 }}
      >
        {benefit.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
        {benefit.desc}
      </p>
    </div>
  );
}

export function WhyChooseUs() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — sticky heading */}
          <div
            ref={ref}
            className="lg:sticky lg:top-28 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-24px)' }}
          >
            <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              Why Choose Us
            </p>
            <h2
              className="mb-6"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.92 }}
            >
              Why Buy<br />Through Us?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm" style={{ fontFamily: 'var(--font-body)' }}>
              We are not a marketplace. We are a direct supply channel between Chinese manufacturers and African buyers — cutting costs, eliminating middlemen, and delivering real value.
            </p>
            <div className="flex gap-8">
              {[
                { num: '500+', label: 'Verified Suppliers' },
                { num: '12K+', label: 'Products Sourced' },
                { num: '98%', label: 'Satisfaction Rate' },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1 }}>{stat.num}</p>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mt-1" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <BenefitCard key={b.title} benefit={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
