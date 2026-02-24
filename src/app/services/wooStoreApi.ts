import type { CartItem } from '../context/AppContext';

const STORE_API_BASE = (import.meta.env.VITE_STORE_API_BASE_URL ?? '/wp-json/wc/store/v1').replace(/\/+$/, '');
const CART_TOKEN_KEY = 'ebem_store_cart_token';
const NONCE_KEY = 'ebem_store_nonce';

interface StoreApiCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  prices?: {
    price?: string;
    regular_price?: string;
    currency_minor_unit?: number;
  };
  images?: Array<{ src?: string }>;
}

interface StoreApiCart {
  items: StoreApiCartItem[];
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStored(key: string): string {
  if (!canUseStorage()) return '';
  return window.localStorage.getItem(key) ?? '';
}

function writeStored(key: string, value: string): void {
  if (!canUseStorage()) return;
  if (!value) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

function mapCart(cart: StoreApiCart): { items: CartItem[]; keysByProductId: Record<string, string> } {
  const keysByProductId: Record<string, string> = {};
  const items: CartItem[] = cart.items.map((item) => {
    keysByProductId[String(item.id)] = item.key;
    const minor = item.prices?.currency_minor_unit ?? 2;
    const rawPrice = Number.parseInt(item.prices?.price ?? '0', 10);
    const price = Number.isFinite(rawPrice) ? rawPrice / 10 ** minor : 0;

    return {
      id: String(item.id),
      name: item.name ?? 'Product',
      price,
      image: item.images?.[0]?.src ?? 'https://placehold.co/400x400?text=Product',
      quantity: item.quantity ?? 1,
      badge: 'Ready Stock',
    };
  });

  return { items, keysByProductId };
}

export async function callStoreApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; headers: Headers }> {
  const cartToken = readStored(CART_TOKEN_KEY);
  const nonce = readStored(NONCE_KEY);

  const headers = new Headers(options.headers ?? {});
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (cartToken) headers.set('Cart-Token', cartToken);
  if (nonce && options.method && options.method !== 'GET') headers.set('Nonce', nonce);

  const response = await fetch(`${STORE_API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const nextCartToken = response.headers.get('Cart-Token') ?? '';
  const nextNonce = response.headers.get('Nonce') ?? '';
  if (nextCartToken) writeStored(CART_TOKEN_KEY, nextCartToken);
  if (nextNonce) writeStored(NONCE_KEY, nextNonce);

  if (!response.ok) {
    let errorMessage = `Store API request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) errorMessage = payload.message;
    } catch {
      // Use generic message.
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as T;
  return { data, headers: response.headers };
}

export async function fetchWooCart() {
  const { data } = await callStoreApi<StoreApiCart>('/cart');
  return mapCart(data);
}

export async function addWooCartItem(productId: string, quantity = 1) {
  const { data } = await callStoreApi<StoreApiCart>('/cart/add-item', {
    method: 'POST',
    body: JSON.stringify({
      id: Number(productId),
      quantity,
    }),
  });
  return mapCart(data);
}

export async function updateWooCartItem(itemKey: string, quantity: number) {
  const { data } = await callStoreApi<StoreApiCart>('/cart/update-item', {
    method: 'POST',
    body: JSON.stringify({
      key: itemKey,
      quantity,
    }),
  });
  return mapCart(data);
}

export async function removeWooCartItem(itemKey: string) {
  const { data } = await callStoreApi<StoreApiCart>('/cart/remove-item', {
    method: 'POST',
    body: JSON.stringify({
      key: itemKey,
    }),
  });
  return mapCart(data);
}
