import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1674573071057-029f03b6add6?w=1920&q=85',
    eyebrow: 'Direct from Manufacturers',
    headline: 'Factory\nPrices.\nNo\nMiddlemen.',
    sub: 'Source premium products directly from Chinese manufacturers at wholesale rates.',
    cta: 'Shop Now',
    href: '/shop',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1631349549824-fc1f8d971e3e?w=1920&q=85',
    eyebrow: 'Nigeria Ready Stock',
    headline: 'Now In\nNigeria.\nImmediate\nDispatch.',
    sub: 'Hundreds of products available for immediate delivery across Nigeria.',
    cta: 'Browse Stock',
    href: '/shop',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1744907895363-d351aa6019ef?w=1920&q=85',
    eyebrow: 'China Pre-Order Access',
    headline: 'Pre-Order\nFrom China\nBefore It\nTrends.',
    sub: 'Access unreleased products and upcoming inventory before they hit local markets.',
    cta: 'Pre-Order Now',
    href: '/shop',
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 400);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100dvh', minHeight: 600 }}>
      {/* Background Images with parallax */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ transform: `translateY(${scrollY * 0.3}px)`, willChange: 'transform' }}
          >
            <img
              src={s.image}
              alt=""
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.1)', filter: 'brightness(0.5) contrast(1.1) grayscale(0.2)' }}
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24">
        <div
          className="transition-all duration-500"
          style={{ transform: transitioning ? 'translateY(20px)' : 'translateY(0)', opacity: transitioning ? 0 : 1 }}
        >
          <p className="text-white/60 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            {slide.eyebrow}
          </p>
          <h1
            className="text-white mb-6 whitespace-pre-line"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.01em',
            }}
          >
            {slide.headline}
          </h1>
          <p className="text-white/70 mb-8 max-w-md text-sm lg:text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            {slide.sub}
          </p>
          <div className="flex items-center gap-4">
            <Link
              to={slide.href}
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 group"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              {slide.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="text-white/60 hover:text-white text-xs uppercase tracking-widest transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-6 mt-12">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Counter */}
          <p className="text-white/40 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-10 bg-white animate-pulse" />
      </div>
    </section>
  );
}
