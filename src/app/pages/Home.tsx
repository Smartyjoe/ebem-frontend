import { HeroSection } from '../components/home/HeroSection';
import { TrustBanner } from '../components/home/TrustBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { HowItWorks } from '../components/home/HowItWorks';
import { BlogPreview } from '../components/home/BlogPreview';
import { useApp } from '../context/AppContext';
import { trackAffiliateCtaClick } from '../services/affiliate';

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
          Can't find what you need? Ebem Global's sourcing team will locate it, negotiate factory pricing directly with verified Chinese manufacturers, and ship it to your door in Nigeria.
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

function AffiliateCTA() {
  const affiliateUrl = '/earn';
  return (
    <section className="py-14 bg-[#f2f5f7] border-y border-gray-200">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
          Affiliate Network
        </p>
        <h3 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', lineHeight: 0.95 }}>
          Build An Income Stream With EbemGlobal
        </h3>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-6" style={{ fontFamily: 'var(--font-body)' }}>
          Turn your audience and referrals into tracked earnings with direct and network commissions.
        </p>
        <a
          href={affiliateUrl}
          onClick={() => trackAffiliateCtaClick('home_bottom')}
          className="inline-flex items-center justify-center bg-black text-white rounded-xl px-7 py-3 text-xs uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Earn With Us
        </a>
      </div>
    </section>
  );
}

function AffiliateInlineAd() {
  const affiliateUrl = '/earn';
  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="rounded-2xl border border-gray-200 bg-[linear-gradient(120deg,#ffffff_0%,#edf4fb_100%)] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1" style={{ fontFamily: 'var(--font-body)' }}>
              Revenue Layer
            </p>
            <h3 className="text-3xl" style={{ fontFamily: 'var(--font-display)', lineHeight: 0.95 }}>
              Selling is great. Earning on referrals is better.
            </h3>
          </div>
          <a
            href={affiliateUrl}
            onClick={() => trackAffiliateCtaClick('home_mid_inline_ad')}
            className="inline-flex items-center justify-center whitespace-nowrap bg-black text-white rounded-xl px-6 py-3 text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Explore Affiliate Earnings
          </a>
        </div>
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
      <AffiliateInlineAd />
      <HowItWorks />
      <RequestCTA />
      <AffiliateCTA />
      <BlogPreview />
    </>
  );
}
