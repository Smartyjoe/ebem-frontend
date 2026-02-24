import { useScrollReveal } from '../../hooks/useScrollReveal';

const STEPS = [
  {
    number: '01',
    title: 'Choose Product',
    desc: 'Browse our ready stock or request any product from China. Tell us exactly what you need.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'We Source from China',
    desc: 'Our team contacts verified manufacturers, negotiates the best factory price, and arranges production or shipment.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Fast Delivery to Nigeria',
    desc: 'Products are shipped via our logistics network, cleared through customs, and warehoused in Lagos.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Delivered to You',
    desc: 'Your order is delivered to your doorstep or business address anywhere in Nigeria.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-20 lg:py-32 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-16 lg:mb-24 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            The Process
          </p>
          <h2 className="text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.92 }}>
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-white/50 text-sm mb-6" style={{ fontFamily: 'var(--font-body)' }}>
            Ready to source directly from China?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/shop"
              className="px-10 py-4 bg-white text-black text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-2xl transition-all duration-200"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Shop Now
            </a>
            <a
              href="#request"
              className="px-10 py-4 border border-white/30 text-white text-xs uppercase tracking-widest hover:bg-white/10 transition-all duration-200"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              Request a Product
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, isLast }: { step: typeof STEPS[0]; index: number; isLast: boolean }) {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className="relative p-8 lg:p-10 border-b md:border-b-0 md:border-r border-white/10 last:border-0 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 600ms, transform 600ms',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Number */}
      <p
        className="text-white/10 mb-6 group-hover:text-white/20 transition-colors"
        style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1 }}
      >
        {step.number}
      </p>

      {/* Icon */}
      <div className="text-white/60 mb-5 group-hover:text-white transition-colors">
        {step.icon}
      </div>

      {/* Content */}
      <h3
        className="text-white mb-3"
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1.1 }}
      >
        {step.title}
      </h3>
      <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
        {step.desc}
      </p>

      {/* Arrow connector */}
      {!isLast && (
        <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 w-6 h-6 bg-black border border-white/20 rounded-full items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}