import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react';

interface PaymentResultState {
  result?: {
    orderId?: number;
    status?: string;
    redirectUrl?: string;
  };
}

function readStoredResult(): PaymentResultState['result'] {
  if (typeof window === 'undefined') return undefined;
  const raw = window.sessionStorage.getItem('ebem_payment_result');
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as PaymentResultState['result'];
  } catch {
    return undefined;
  }
}

export default function Payment() {
  const location = useLocation();
  const routeState = (location.state as PaymentResultState | null)?.result;
  const result = routeState ?? readStoredResult();

  const view = useMemo(() => {
    const status = (result?.status ?? '').toLowerCase();
    if (status.includes('fail') || status.includes('cancel')) return 'failed';
    if (status.includes('success') || status.includes('paid') || status.includes('complete')) return 'success';
    return 'pending';
  }, [result?.status]);

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-[linear-gradient(120deg,#fefbf3_0%,#ffffff_35%,#f4f6fb_100%)]">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 lg:p-12 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-xs uppercase tracking-widest text-gray-500 mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Payment Flow
          </div>

          {view === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 0.95 }} className="mb-3">
                Payment Confirmed
              </h1>
              <p className="text-gray-600 mb-8">Your order has been successfully paid and is now processing in WooCommerce.</p>
            </>
          )}

          {view === 'pending' && (
            <>
              <Clock3 className="w-12 h-12 text-amber-500 mb-4" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 0.95 }} className="mb-3">
                Complete Payment
              </h1>
              <p className="text-gray-600 mb-8">
                Your order has been created. Continue to your payment provider to complete authorization.
              </p>
            </>
          )}

          {view === 'failed' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mb-4" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 0.95 }} className="mb-3">
                Payment Not Completed
              </h1>
              <p className="text-gray-600 mb-8">
                The payment did not complete. You can retry checkout without losing your cart.
              </p>
            </>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Order ID</p>
              <p className="text-gray-900">{result?.orderId ?? 'Unavailable'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Payment Status</p>
              <p className="text-gray-900">{result?.status ?? 'pending'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {result?.redirectUrl && (
              <a
                href={result.redirectUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs uppercase tracking-[0.2em] hover:bg-gray-800"
              >
                Continue To Gateway
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            <Link to="/checkout" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white">
              Back To Checkout
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-xs uppercase tracking-[0.2em] hover:border-black">
              Back To Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
