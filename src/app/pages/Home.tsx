import { HeroSection } from '../components/home/HeroSection';
import { TrustBanner } from '../components/home/TrustBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { HowItWorks } from '../components/home/HowItWorks';
import { BlogPreview } from '../components/home/BlogPreview';
import { useApp } from '../context/AppContext';

function RequestCTA() {
  const { openPanel } = useApp();
  return (
    <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <p
          className="absolute -top-8 left-0 text-gray-50 whitespace-nowrap"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(8rem, 20vw, 20rem)', lineHeight: 1 }}
          aria-hidden="true"
        >
          SOURCE
        </p>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          Can't find it?
        </p>
        <h2
          className="mb-6"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.92 }}
        >
          We'll Source It<br />From China.
        </h2>
        <p
          className="text-gray-500 text-sm lg:text-base leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Can't find what you need? Our sourcing team will locate it, negotiate factory pricing, and ship it directly to Nigeria for you.
        </p>
        <button
          onClick={() => openPanel('request')}
          className="inline-flex items-center gap-3 bg-black text-white px-12 py-5 text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-2xl transition-all duration-200"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Request a Product
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <CategoryGrid />
      <WhyChooseUs />
      <FeaturedProducts />
      <HowItWorks />
      <RequestCTA />
      <BlogPreview />
    </>
  );
}
