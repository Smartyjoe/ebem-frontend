import { useEffect, type ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Link2, LineChart, Wallet } from 'lucide-react';
import {
  AFFILIATE_DASHBOARD_URL,
  buildAffiliateJoinUrl,
  buildProductReferralUrl,
  buildStoreReferralUrl,
  markAffiliatePageView,
  trackAffiliateCtaClick,
} from '../services/affiliate';

const FAQS = [
  {
    q: 'How do I get paid?',
    a: 'Affiliate earnings are tracked inside your dashboard. Payouts are requested from your available balance and processed through the configured payout workflow.',
  },
  {
    q: 'Is there a minimum withdrawal?',
    a: 'Withdrawal limits are defined inside the affiliate dashboard policy. You will always see available and pending balances separately before requesting payouts.',
  },
  {
    q: 'How are referrals tracked?',
    a: 'Every affiliate has a unique referral code and link. Clicks, conversions, and attribution are recorded against that code in your dashboard.',
  },
  {
    q: 'Is it free to join?',
    a: 'Yes. Registration is free for qualified users.',
  },
  {
    q: 'When are commissions approved?',
    a: 'Commissions move from pending to approved after order validation windows and fraud checks are completed.',
  },
];

export default function Earn() {
  useEffect(() => {
    markAffiliatePageView();
  }, []);

  const primaryCtaUrl = buildAffiliateJoinUrl('earn_hero_primary');
  const secondaryCtaUrl = buildAffiliateJoinUrl('earn_hero_secondary');
  const finalCtaUrl = buildAffiliateJoinUrl('earn_final_push');
  const exampleCode = 'CODE';
  const platformReferral = `${AFFILIATE_DASHBOARD_URL}?ref=${exampleCode}`;
  const storeReferral = buildStoreReferralUrl(exampleCode, '/');
  const productReferral = buildProductReferralUrl(exampleCode, '/product/slug/');

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-[#f6f7f8]">
      <section className="relative overflow-hidden border-b border-gray-200 bg-[radial-gradient(circle_at_top_left,#dcefff_0%,#f6f7f8_45%,#ffffff_100%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 mb-5" style={{ fontFamily: 'var(--font-body)' }}>
            EbemGlobal Affiliate
          </p>
          <h1 className="max-w-4xl mb-6 text-slate-950" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,7vw,6.4rem)', lineHeight: 0.9 }}>
            Earn From Every Sale - Even The Ones You Didn&apos;t Make.
          </h1>
          <p className="max-w-2xl text-slate-600 text-base lg:text-lg mb-10" style={{ fontFamily: 'var(--font-body)' }}>
            Promote products. Build a network. Track every click. Withdraw with confidence.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={primaryCtaUrl}
              onClick={() => trackAffiliateCtaClick('earn_hero_primary')}
              className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-xl text-xs uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Start Earning Now <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={secondaryCtaUrl}
              onClick={() => trackAffiliateCtaClick('earn_hero_secondary')}
              className="inline-flex items-center gap-2 border border-slate-300 px-7 py-3.5 rounded-xl text-xs uppercase tracking-[0.18em] text-slate-700 hover:border-black hover:text-black"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <h2 className="text-slate-950 mb-7" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.5vw,3.8rem)', lineHeight: 0.95 }}>
          Two Income Streams
        </h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-gray-200 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>Direct Sales (Tier 1)</p>
            <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>Promote and earn on every successful purchase.</h3>
            <ul className="space-y-2.5 text-sm text-slate-600" style={{ fontFamily: 'var(--font-body)' }}>
              <li>Promote any product</li>
              <li>Earn per successful purchase</li>
              <li>Real-time tracking dashboard</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>Network Earnings (Tier 2)</p>
            <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>Build an affiliate network that keeps compounding.</h3>
            <ul className="space-y-2.5 text-sm text-slate-600" style={{ fontFamily: 'var(--font-body)' }}>
              <li>Invite other affiliates</li>
              <li>Earn from their sales</li>
              <li>Build recurring passive income</li>
            </ul>
          </article>
        </div>
        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-950 text-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4" style={{ fontFamily: 'var(--font-body)' }}>Earnings Paths</p>
          <div className="grid sm:grid-cols-2 gap-5 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">You &rarr; Customer</div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">You &rarr; Affiliate &rarr; Customer</div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <h2 className="text-slate-950 mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.5vw,3.8rem)', lineHeight: 0.95 }}>
            The Affiliate Engine
          </h2>
          <div className="grid lg:grid-cols-3 gap-5 mb-7">
            <FeatureBlock
              title="Promotion Engine"
              icon={<Link2 className="w-4 h-4" />}
              points={[
                'Unique affiliate code & links',
                'Per-product link generator',
                'One-click sharing tools',
                'Marketing toolkit downloads',
              ]}
            />
            <FeatureBlock
              title="Intelligence & Tracking"
              icon={<LineChart className="w-4 h-4" />}
              points={[
                'Click & conversion tracking',
                'Conversion rate insights',
                'Top-performing products',
                'Performance trends',
                'Device & funnel breakdown',
              ]}
            />
            <FeatureBlock
              title="Earnings Control"
              icon={<Wallet className="w-4 h-4" />}
              points={[
                'Available vs pending balance',
                'Tier 1 & Tier 2 split',
                'Withdrawal request system',
                'Transparent payout tracking',
              ]}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4" style={{ fontFamily: 'var(--font-body)' }}>Dashboard Preview</p>
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>Performance Overview</p>
                <div className="h-28 rounded-lg bg-[linear-gradient(180deg,#f7fbff_0%,#ecf2fa_100%)] border border-slate-200 mb-3" />
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['Clicks', 'Conversions', 'CR'].map((label) => (
                    <div key={label} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500" style={{ fontFamily: 'var(--font-body)' }}>{label}</p>
                      <p className="text-lg text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>--</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>Earnings Wallet</p>
                <div className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Available</span><span className="text-slate-900">--</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Pending</span><span className="text-slate-900">--</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Tier 1</span><span className="text-slate-900">--</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Tier 2</span><span className="text-slate-900">--</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            Referral Tracking
          </p>
          <h3 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            Link formats your ecosystem supports
          </h3>
          <div className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            <code className="block bg-slate-100 rounded-lg px-3 py-2 break-all">{platformReferral}</code>
            <code className="block bg-slate-100 rounded-lg px-3 py-2 break-all">{storeReferral}</code>
            <code className="block bg-slate-100 rounded-lg px-3 py-2 break-all">{productReferral}</code>
          </div>
          <p className="text-xs text-slate-500 mt-4" style={{ fontFamily: 'var(--font-body)' }}>
            The store captures `ref` and persists it in cookie/local attribution for configurable duration.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <h2 className="text-slate-950 mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.2vw,3.4rem)', lineHeight: 0.95 }}>
          Why It&apos;s Built For Growth
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700" style={{ fontFamily: 'var(--font-body)' }}>
          <li className="rounded-xl bg-white border border-slate-200 p-4 flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Earn two ways from one ecosystem</li>
          <li className="rounded-xl bg-white border border-slate-200 p-4 flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Track every click and conversion</li>
          <li className="rounded-xl bg-white border border-slate-200 p-4 flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Scale beyond your personal effort</li>
          <li className="rounded-xl bg-white border border-slate-200 p-4 flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Use ready-made marketing materials</li>
          <li className="rounded-xl bg-white border border-slate-200 p-4 flex gap-2 sm:col-span-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Withdraw earnings with clarity</li>
        </ul>
      </section>

      <section className="bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <h2 className="text-slate-950 mb-7" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4.2vw,3.4rem)', lineHeight: 0.95 }}>
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <article key={item.q} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg mb-2 text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{item.q}</h3>
                <p className="text-sm text-slate-600" style={{ fontFamily: 'var(--font-body)' }}>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="rounded-2xl bg-slate-950 text-white p-8 lg:p-12">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,4.4rem)', lineHeight: 0.92 }}>
            Turn Traffic Into Income. Turn Referrals Into Assets.
          </h2>
          <a
            href={finalCtaUrl}
            onClick={() => trackAffiliateCtaClick('earn_final_push')}
            className="inline-flex items-center gap-2 mt-3 bg-white text-black px-7 py-3.5 rounded-xl text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Join The EbemGlobal Affiliate Network <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureBlock({
  title,
  points,
  icon,
}: {
  title: string;
  points: string[];
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-2xl text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <ul className="space-y-2 text-sm text-slate-600" style={{ fontFamily: 'var(--font-body)' }}>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}
