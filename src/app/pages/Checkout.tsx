import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchCheckoutState, submitCheckout, updateCheckoutCustomer, type AddressInput, type CheckoutPaymentMethod } from '../services/checkout';
import { formatNaira } from '../utils/currency';

const DEFAULT_COUNTRY = 'NG';

const EMPTY_ADDRESS: AddressInput = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: DEFAULT_COUNTRY,
  email: '',
  phone: '',
};

export default function Checkout() {
  const { cartItems, cartTotal } = useApp();
  const navigate = useNavigate();
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoadingMethods(true);
        const state = await fetchCheckoutState();
        if (!active) return;
        setPaymentMethods(state.paymentMethods);
        if (state.paymentMethods[0]) {
          setSelectedMethod(state.paymentMethods[0].payment_method_id);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load payment methods');
      } finally {
        if (active) setLoadingMethods(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (cartItems.length === 0) return false;
    if (!selectedMethod) return false;
    return (
      address.first_name.trim() !== '' &&
      address.last_name.trim() !== '' &&
      address.address_1.trim() !== '' &&
      address.city.trim() !== '' &&
      address.state.trim() !== '' &&
      address.country.trim() !== '' &&
      address.email.trim() !== '' &&
      address.phone.trim() !== ''
    );
  }, [address, cartItems.length, selectedMethod]);

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateCheckoutCustomer(address);
      const result = await submitCheckout({
        paymentMethodId: selectedMethod,
        billingAddress: address,
      });
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('ebem_payment_result', JSON.stringify(result));
      }
      navigate('/payment', { state: { result } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-[radial-gradient(circle_at_top_left,#f7f2ea_0%,#ffffff_40%)]">
      <div className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
            Secure Checkout
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <form onSubmit={handlePlaceOrder} className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-6">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 0.95 }}>
              Checkout
            </h1>
            <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected by WooCommerce
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="First name" value={address.first_name} onChange={(e) => setAddress((p) => ({ ...p, first_name: e.target.value }))} />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Last name" value={address.last_name} onChange={(e) => setAddress((p) => ({ ...p, last_name: e.target.value }))} />
            <input className="sm:col-span-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Email" type="email" value={address.email} onChange={(e) => setAddress((p) => ({ ...p, email: e.target.value }))} />
            <input className="sm:col-span-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Phone" value={address.phone} onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))} />
            <input className="sm:col-span-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Address line 1" value={address.address_1} onChange={(e) => setAddress((p) => ({ ...p, address_1: e.target.value }))} />
            <input className="sm:col-span-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Address line 2 (optional)" value={address.address_2 ?? ''} onChange={(e) => setAddress((p) => ({ ...p, address_2: e.target.value }))} />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="City" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="State" value={address.state} onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))} />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Postcode" value={address.postcode} onChange={(e) => setAddress((p) => ({ ...p, postcode: e.target.value }))} />
            <input className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" placeholder="Country code (NG)" value={address.country} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value.toUpperCase() }))} />
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <p className="text-sm uppercase tracking-widest text-gray-500">Payment Method</p>
            </div>
            {loadingMethods && <p className="text-sm text-gray-500">Loading methods...</p>}
            {!loadingMethods && paymentMethods.length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                No payment methods returned by Woo Store API. Enable a checkout gateway in WooCommerce.
              </p>
            )}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.payment_method_id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    selectedMethod === method.payment_method_id ? 'border-black bg-black text-white' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.payment_method_id}
                    checked={selectedMethod === method.payment_method_id}
                    onChange={() => setSelectedMethod(method.payment_method_id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm uppercase tracking-wider">{method.name}</p>
                    {method.description && <p className={`text-xs mt-1 ${selectedMethod === method.payment_method_id ? 'text-white/80' : 'text-gray-500'}`}>{method.description}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-8 w-full py-4 rounded-2xl bg-black text-white text-sm uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="bg-black text-white rounded-3xl p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-white/10" />
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-3">Order Snapshot</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 0.95 }} className="mb-6">
              {formatNaira(cartTotal)}
            </p>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm">{item.name}</p>
                    <p className="text-xs text-white/70">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm">{formatNaira(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <p className="text-sm uppercase tracking-widest text-gray-500">Fulfilment</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Shipping rates and taxes are computed by WooCommerce at order confirmation. You can still review details before final payment authorization.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
