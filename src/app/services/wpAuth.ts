import { API_BASE_URL as API_BASE } from './api';

const WP_BASE = import.meta.env.VITE_WP_BASE_URL;
const ACCESS_TOKEN_KEY = 'ebem_access_token';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readToken(): string {
  if (!canUseStorage()) return '';
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
}

function writeToken(token: string): void {
  if (!canUseStorage()) return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function parseErrorText(errorText: string, status: number): string {
  if (!errorText) return `WP request failed: ${status}`;
  try {
    const payload = JSON.parse(errorText) as { message?: string };
    if (payload.message) return payload.message;
  } catch {
    // Use raw response text below.
  }
  return errorText;
}

// Helper to call WordPress custom API with credentials
async function wpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readToken();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${WP_BASE}/wp-json/custom/v1${path}`, {
    credentials: 'omit',
    ...init,
    headers,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(parseErrorText(errorText, res.status));
  }
  return (await res.json()) as T;
}

export interface AuthUser { id: number; email: string; firstName?: string; lastName?: string; displayName?: string }

export const authApi = {
  me: () => wpFetch<AuthUser>('/me', { method: 'GET' }),
  login: async (email: string, password: string) => {
    const payload = await wpFetch<{ user: AuthUser; accessToken: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    );
    writeToken(payload.accessToken ?? '');
    return payload;
  },
  register: async (input: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const payload = await wpFetch<{ user: AuthUser; accessToken: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(input) },
    );
    writeToken(payload.accessToken ?? '');
    return payload;
  },
  logout: async () => {
    writeToken('');
    try {
      return await wpFetch<{ ok: true }>('/auth/logout', { method: 'POST' });
    } catch {
      return { ok: true } as const;
    }
  },
  updateProfile: (input: { firstName?: string; lastName?: string; phone?: string }) =>
    wpFetch<{ ok: true }>('/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  requestPassword: (email: string) => wpFetch<{ ok: true }>(
    '/password/request', { method: 'POST', body: JSON.stringify({ email }) }),
  orders: () => wpFetch<{ items: Array<{ id: number; number: string; status: string; total: string; currency: string; dateCreated: string | null }> }>(
    '/orders', { method: 'GET' }),
};
