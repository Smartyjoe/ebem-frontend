import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, Loader2, Package, ShoppingBag, X } from 'lucide-react';
import { formatNaira } from '../utils/currency';
import { verifyPaystackPayment, type PaystackVerifyResponse } from '../services/paystack';
import {
  getStoredAffiliateRef,
  trackAffiliateCtaClick,
  trackAffiliateEvent,
} from '../services/affiliate';

interface ThankYouState {
  reference?: string;
  orderId?: number;
  orderNumber?: string;
  email?: string;
}

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ThankYouState | null) ?? {};

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<PaystackVerifyResponse | null>(null);
  const [error, setError] = useState('');
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);

  useEffect(() => {
    if (!state.reference) {
      navigate('/shop', { replace: true });
      return;
    }
    verifyPaystackPayment(state.reference)
      .then((response) => setResult(response))
      .catch((err) => setError(err instanceof Error ? err.message : 'Verification failed'))
      .finally(() => setVerifying(false));
  }, [state.reference, navigate]);

  const success = result?.status === 'success';
  const affiliateJoinUrl = '/earn';

  useEffect(() => {
    if (!success) return;
    const shownKey = 'ebem_aff_checkout_trigger_shown';
    if (window.sessionStorage.getItem(shownKey) === '1') return;
    window.sessionStorage.setItem(shownKey, '1');
    setShowAffiliateModal(true);
    trackAffiliateEvent('affiliate_trigger_viewed', { trigger: 'post_checkout_success_modal' });
  }, [success]);

  useEffect(() => {
    if (!success || !state.orderId) return;
    const ref = getStoredAffiliateRef();
    if (!ref) return;
    trackAffiliateEvent('affiliate_tier1_conversion_detected', {
      orderId: state.orderId,
      orderNumber: result?.orderNumber ?? state.orderNumber ?? null,
      ref,
    });
  }, [result?.orderNumber, state.orderId, state.orderNumber, success]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_60%,#f0f4ff_100%)]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-500 text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-body)' }}>
            Confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_60%,#f0f4ff_100%)] pt-20 lg:pt-24">
      <div className="max-w-2xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-12">
          {success ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border border-green-100 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-100 mb-6">
              <Package className="w-10 h-10 text-red-500" />
            </div>
          )}

          <h1
            className="mb-3"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,8vw,5rem)', lineHeight: 0.92 }}
          >
            {success ? 'Order Confirmed!' : 'Payment Pending'}
          </h1>
          <p className="text-gray-500 text-sm lg:text-base max-w-md mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
            {success
              ? `Thank you! Your order has been received and is now being processed. A confirmation will be sent to ${state.email ?? 'your email'}.`
              : error || 'We could not confirm your payment. Please contact support if you were charged.'}
          </p>
        </div>

        {(result || state.orderId) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)] overflow-hidden mb-8">
            <div className="bg-black px-6 py-4 flex items-center justify-between">
              <span
                className="text-white text-xs uppercase tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
              >
                Order Summary
              </span>
              <span className="text-white/60 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                #{result?.orderNumber ?? state.orderNumber ?? state.orderId}
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              <Row label="Order Number" value={`#${result?.orderNumber ?? state.orderNumber ?? state.orderId}`} />
              <Row
                label="Status"
                value={(
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      result?.status === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${result?.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {result?.status === 'success' ? 'Payment Confirmed' : 'Pending'}
                  </span>
                )}
              />
              {result?.amount && <Row label="Amount Paid" value={formatNaira(result.amount / 100)} />}
              {result?.paidAt && (
                <Row
                  label="Paid At"
                  value={new Date(result.paidAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                />
              )}
              {result?.reference && <Row label="Reference" value={<span className="font-mono text-xs">{result.reference}</span>} />}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {state.orderId && (
            <Link
              to={`/account?tab=orders&order=${state.orderId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-900 transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              <Package className="w-4 h-4" />
              View Order
            </Link>
          )}
          <Link
            to="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-900 py-4 rounded-xl text-xs uppercase tracking-widest hover:border-black hover:bg-gray-50 transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            EbemGlobal Affiliate
          </p>
          <h3 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            You just purchased. Imagine earning every time someone else does.
          </h3>
          <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            Activate your affiliate account and get tracked commissions from your referrals.
          </p>
          <a
            href={affiliateJoinUrl}
            onClick={() => trackAffiliateCtaClick('thank_you_page')}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-xs uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Start Earning <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-center text-gray-400 text-xs mt-10" style={{ fontFamily: 'var(--font-body)' }}>
          Secured by Paystack | Powered by Ebem Global
        </p>
      </div>

      {showAffiliateModal && (
        <div className="fixed inset-0 z-40 bg-black/55 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-3 gap-3">
              <h3 className="text-2xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Earn from referrals too. Join our affiliate network.
              </h3>
              <button
                onClick={() => setShowAffiliateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close affiliate modal"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-5" style={{ fontFamily: 'var(--font-body)' }}>
              Turn your next recommendation into recurring tracked earnings.
            </p>
            <a
              href="/earn"
              onClick={() => trackAffiliateCtaClick('trigger_checkout_modal')}
              className="inline-flex items-center justify-center w-full bg-black text-white rounded-xl py-3 text-xs uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Join Affiliate Network
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <span className="text-sm text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>
        {value}
      </span>
    </div>
  );
}
