/**
 * Payment.tsx – interim/redirect page (rarely seen in inline flow)
 * Shows only when user lands here without going through Checkout normally.
 * Inline Paystack means success → /thank-you, cancel → /checkout.
 * This page is a safety fallback.
 */
import { Link } from 'react-router';
import { ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Payment() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_60%,#f0f4ff_100%)]">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border border-gray-100 mb-6">
          <ShieldCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h1
          className="mb-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.5rem)', lineHeight: 0.92 }}
        >
          Payment Page
        </h1>
        <p className="text-gray-500 text-sm mb-8" style={{ fontFamily: 'var(--font-body)' }}>
          Payments are handled securely via Paystack inline on the checkout page.
          If you arrived here by mistake, please return to checkout.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/checkout"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-900 transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Checkout
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest hover:border-black hover:text-black transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            <ShoppingBag className="w-4 h-4" /> Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
