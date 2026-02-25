import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CheckCircle2, Package, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { formatNaira } from '../utils/currency';
import { verifyPaystackPayment, type PaystackVerifyResponse } from '../services/paystack';

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

  useEffect(() => {
    if (!state.reference) {
      navigate('/shop', { replace: true });
      return;
    }
    verifyPaystackPayment(state.reference)
      .then(r => setResult(r))
      .catch(e => setError(e instanceof Error ? e.message : 'Verification failed'))
      .finally(() => setVerifying(false));
  }, [state.reference, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_60%,#f0f4ff_100%)]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-500 text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-body)' }}>
            Confirming your payment…
          </p>
        </div>
      </div>
    );
  }

  const success = result?.status === 'success';

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_60%,#f0f4ff_100%)] pt-20 lg:pt-24">
      <div className="max-w-2xl mx-auto px-6 py-16 lg:py-24">

        {/* Icon + heading */}
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

        {/* Order details card */}
        {(result || state.orderId) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)] overflow-hidden mb-8">
            {/* Card header */}
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

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              <Row label="Order Number" value={`#${result?.orderNumber ?? state.orderNumber ?? state.orderId}`} />
              <Row label="Status" value={
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  result?.status === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${result?.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {result?.status === 'success' ? 'Payment Confirmed' : 'Pending'}
                </span>
              } />
              {result?.amount && (
                <Row label="Amount Paid" value={formatNaira(result.amount / 100)} />
              )}
              {result?.paidAt && (
                <Row label="Paid At" value={new Date(result.paidAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })} />
              )}
              {result?.reference && (
                <Row label="Reference" value={<span className="font-mono text-xs">{result.reference}</span>} />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
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

        {/* Trust strip */}
        <p className="text-center text-gray-400 text-xs mt-10" style={{ fontFamily: 'var(--font-body)' }}>
          Secured by Paystack · Powered by Ebem Global
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
      <span className="text-sm text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>{value}</span>
    </div>
  );
}
