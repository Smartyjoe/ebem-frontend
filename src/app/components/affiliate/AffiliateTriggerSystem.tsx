import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  hasSeenBlogTrigger,
  hasSeenProductTrigger,
  markBlogTriggerSeen,
  markProductTriggerSeen,
  maybeTriggerAffiliateEmailNudge,
  registerSessionProductView,
  trackAffiliateCtaClick,
  trackAffiliateEvent,
} from '../../services/affiliate';

export function AffiliateTriggerSystem() {
  const location = useLocation();
  const { user } = useAuth();

  const [showProductPopup, setShowProductPopup] = useState(false);
  const [showBlogBanner, setShowBlogBanner] = useState(false);

  useEffect(() => {
    if (!user?.id || !user.email) return;
    maybeTriggerAffiliateEmailNudge({ userId: user.id, email: user.email });
  }, [user]);

  useEffect(() => {
    if (!location.pathname.startsWith('/shop/')) return;
    if (hasSeenProductTrigger()) return;

    const viewedCount = registerSessionProductView(location.pathname);
    if (viewedCount < 3) return;

    markProductTriggerSeen();
    setShowProductPopup(true);
    trackAffiliateEvent('affiliate_trigger_viewed', { trigger: 'product_views_3_plus' });
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith('/blog')) return;
    if (hasSeenBlogTrigger()) return;

    const timer = window.setTimeout(() => {
      markBlogTriggerSeen();
      setShowBlogBanner(true);
      trackAffiliateEvent('affiliate_trigger_viewed', { trigger: 'blog_time_2min' });
    }, 120000);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  const productJoinUrl = useMemo(() => '/earn', [showProductPopup]);
  const blogJoinUrl = useMemo(() => '/earn', [showBlogBanner]);

  return (
    <>
      {showProductPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/55">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Exploring our products? Earn by sharing them.
              </h3>
              <button
                onClick={() => setShowProductPopup(false)}
                className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Close affiliate popup"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              Join the EbemGlobal affiliate network and monetize every qualified referral.
            </p>
            <a
              href={productJoinUrl}
              onClick={() => trackAffiliateCtaClick('trigger_product_popup')}
              className="inline-flex items-center justify-center w-full bg-black text-white rounded-xl py-3.5 text-xs uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Start Earning
            </a>
          </div>
        </div>
      )}

      {showBlogBanner && (
        <aside className="fixed right-4 bottom-4 z-30 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_18px_50px_-22px_rgba(0,0,0,0.35)]">
          <button
            onClick={() => setShowBlogBanner(false)}
            className="absolute right-2 top-2 w-7 h-7 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Close affiliate banner"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            Affiliate Prompt
          </p>
          <h4 className="text-lg leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Turn readers into revenue.
          </h4>
          <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            You already attract attention. Convert that traffic into tracked affiliate earnings.
          </p>
          <a
            href={blogJoinUrl}
            onClick={() => trackAffiliateCtaClick('trigger_blog_slide_in')}
            className="inline-flex items-center justify-center w-full bg-black text-white rounded-xl py-3 text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Join Affiliate Network
          </a>
          <Link
            to="/earn"
            className="inline-flex items-center justify-center w-full mt-3 text-xs uppercase tracking-[0.18em] text-gray-600 hover:text-black"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Learn More
          </Link>
        </aside>
      )}
    </>
  );
}
