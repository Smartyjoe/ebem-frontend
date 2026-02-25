/**
 * Paystack headless integration
 * – Calls our WP plugin REST endpoints (not Paystack directly)
 * – Lazily injects the Paystack Inline JS only on the payment page
 */

const WP_BASE = (import.meta.env.VITE_WP_BASE_URL as string ?? '').replace(/\/+$/, '');

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  email: string;
  phone: string;
}

export interface CartLineItem {
  productId: string;
  quantity: number;
}

export interface PaystackInitResponse {
  orderId: number;
  orderNumber: string;
  reference: string;
  accessCode: string;
  authorizationUrl: string;
  publicKey: string;
  amount: number;       // in kobo / subunit
  email: string;
  currency: string;
  testMode: boolean;
}

export interface PaystackVerifyResponse {
  status: 'success' | 'failed' | 'abandoned' | string;
  orderId: number;
  orderNumber: string;
  reference: string;
  amount?: number;
  currency?: string;
  paidAt?: string | null;
}

/** Call WP to create a WC order and get a Paystack access code */
export async function initPaystackPayment(
  billing: BillingAddress,
  items: CartLineItem[],
  accessToken?: string,
): Promise<PaystackInitResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${WP_BASE}/wp-json/custom/v1/paystack/init`, {
    method: 'POST',
    credentials: 'omit',
    headers,
    body: JSON.stringify({ billing, items }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Payment initialisation failed' }));
    throw new Error((err as { message?: string }).message ?? 'Payment initialisation failed');
  }
  return (await res.json()) as PaystackInitResponse;
}

/** Verify a Paystack payment reference via WP */
export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const token = typeof window !== 'undefined' ? (window.localStorage.getItem('ebem_access_token') ?? '') : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${WP_BASE}/wp-json/custom/v1/paystack/verify`, {
    method: 'POST',
    credentials: 'omit',
    headers,
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Verification failed' }));
    throw new Error((err as { message?: string }).message ?? 'Verification failed');
  }
  return (await res.json()) as PaystackVerifyResponse;
}

/** Lazily inject Paystack Inline JS — only called on payment page */
let _paystackScriptPromise: Promise<void> | null = null;
export function loadPaystackScript(): Promise<void> {
  if (_paystackScriptPromise) return _paystackScriptPromise;
  _paystackScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { resolve(); return; }
    if ((window as unknown as Record<string, unknown>)['PaystackPop']) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
  return _paystackScriptPromise;
}

export interface OpenPaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  accessCode: string;
  onSuccess: (response: { reference: string }) => void;
  onCancel: () => void;
}

/** Open the Paystack inline popup after ensuring the script is loaded */
export async function openPaystackPopup(opts: OpenPaystackOptions): Promise<void> {
  await loadPaystackScript();
  const PaystackPop = (window as unknown as Record<string, unknown>)['PaystackPop'] as {
    setup: (config: unknown) => { openIframe: () => void };
  };
  const handler = PaystackPop.setup({
    key: opts.key,
    email: opts.email,
    amount: opts.amount,
    currency: opts.currency,
    ref: opts.reference,
    access_code: opts.accessCode,
    onSuccess: opts.onSuccess,
    onCancel: opts.onCancel,
  });
  handler.openIframe();
}
