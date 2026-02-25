import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldCheck, Lock, ChevronRight, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../utils/currency';
import { initPaystackPayment, openPaystackPopup, type BillingAddress, type CartLineItem } from '../services/paystack';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

interface FormData extends BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart } = useApp();
  const { user, accessToken } = useAuth();

  const [form, setForm] = useState<FormData>({
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'NG',
    email: user?.email ?? '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'details' | 'review'>('details');

  // Pre-fill when user loads
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        first_name: prev.first_name || user.firstName || '',
        last_name: prev.last_name || user.lastName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const required: (keyof FormData)[] = ['first_name','last_name','address_1','city','state','country','email','phone'];
  const isValid = useMemo(() => required.every(f => form[f]?.trim()), [form]);

  const handlePay = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const items: CartLineItem[] = cartItems.map(i => ({ productId: i.id, quantity: i.quantity }));
      const billing: BillingAddress = { ...form };
      const init = await initPaystackPayment(billing, items, accessToken ?? undefined);

      await openPaystackPopup({
        key: init.publicKey,
        email: init.email,
        amount: init.amount,
        currency: init.currency,
        reference: init.reference,
        accessCode: init.accessCode,
        onSuccess: ({ reference }) => {
          navigate('/thank-you', {
            state: {
              reference,
              orderId: init.orderId,
              orderNumber: init.orderNumber,
              email: init.email,
            },
          });
        },
        onCancel: () => {
          setError('Payment was cancelled. Your order has been saved — you can retry anytime.');
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[linear-gradient(135deg,#fefbf3_0%,#fff_60%,#f0f4ff_100%)]">
        <div className="text-center px-6">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', lineHeight: 1 }} className="mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-sm" style={{ fontFamily: 'var(--font-body)' }}>Add some products before checking out.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-xs uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-colors" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Browse Shop <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 bg-[linear-gradient(135deg,#fefbf3_0%,#ffffff_50%,#f0f4ff_100%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-black">Checkout</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,6vw,4.5rem)', lineHeight: 0.92 }}>
            Secure Checkout
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700" style={{ fontFamily: 'var(--font-body)' }}>SSL encrypted · Powered by Paystack</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Guest/login prompt */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800" style={{ fontFamily: 'var(--font-body)' }}>
                  <Link to="/account" className="font-semibold underline">Sign in</Link> to track your orders later.
                  You can also continue as guest.
                </p>
              </div>
            )}

            {/* Billing details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>
                  Delivery &amp; Billing Information
                </h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input value={form.first_name} onChange={set('first_name')} placeholder="Ada" className={inputCls} />
                  </Field>
                  <Field label="Last Name" required>
                    <input value={form.last_name} onChange={set('last_name')} placeholder="Okafor" className={inputCls} />
                  </Field>
                </div>
                <Field label="Company / Business (optional)">
                  <input value={form.company} onChange={set('company')} placeholder="Ebem Traders Ltd." className={inputCls} />
                </Field>
                <Field label="Email Address" required>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
                </Field>
                <Field label="Phone Number" required>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" className={inputCls} />
                </Field>
                <Field label="Delivery Address" required>
                  <input value={form.address_1} onChange={set('address_1')} placeholder="Street address, house number" className={inputCls} />
                </Field>
                <Field label="Apartment / Landmark (optional)">
                  <input value={form.address_2} onChange={set('address_2')} placeholder="Flat 3B, near GTBank" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" required>
                    <input value={form.city} onChange={set('city')} placeholder="Lagos" className={inputCls} />
                  </Field>
                  <Field label="State" required>
                    <select value={form.state} onChange={set('state')} className={inputCls}>
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Postcode (optional)">
                    <input value={form.postcode} onChange={set('postcode')} placeholder="100001" className={inputCls} />
                  </Field>
                  <Field label="Country" required>
                    <select value={form.country} onChange={set('country')} className={inputCls}>
                      <option value="NG">Nigeria</option>
                      <option value="GH">Ghana</option>
                      <option value="KE">Kenya</option>
                      <option value="ZA">South Africa</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            {/* Payment method display */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>Payment Method</h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-black bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-[#00C3F7] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-body)' }}>Paystack</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
                      Card, bank transfer, USSD, mobile money — all secured by Paystack
                    </p>
                  </div>
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-black bg-black flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden sticky top-28">
              <div className="bg-black px-6 py-5">
                <h3 className="text-white text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  Order Summary
                </h3>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="relative flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-semibold leading-none" style={{ width: '18px', height: '18px' }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate" style={{ fontFamily: 'var(--font-body)' }}>{item.name}</p>
                      {item.badge && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>{item.badge}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0" style={{ fontFamily: 'var(--font-body)' }}>
                      {formatNaira(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-5 py-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-xs text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
                  <span>Subtotal</span><span>{formatNaira(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
                  <span>Shipping</span><span className="text-green-600 font-medium">Calculated at order</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100" style={{ fontFamily: 'var(--font-body)' }}>
                  <span>Total</span><span>{formatNaira(cartTotal)}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-6">
                <button
                  onClick={handlePay}
                  disabled={loading || !isValid}
                  className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-xl text-sm uppercase tracking-widest font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:scale-[1.01]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Pay {formatNaira(cartTotal)}</>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-3" style={{ fontFamily: 'var(--font-body)' }}>
                  By placing your order you agree to our{' '}
                  <Link to="/about" className="underline hover:text-black">terms</Link>.
                  Payment secured by Paystack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all placeholder:text-gray-400';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
