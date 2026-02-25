import { API_BASE_URL as API_BASE } from './api';

const WP_BASE = import.meta.env.VITE_WP_BASE_URL;

// Helper to call WordPress custom API with credentials
async function wpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${WP_BASE}/wp-json/custom/v1${path}`,
    { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  if (!res.ok) throw new Error(await res.text() || `WP request failed: ${res.status}`);
  return (await res.json()) as T;
}

export interface AuthUser { id: number; email: string; firstName?: string; lastName?: string; displayName?: string }

export const authApi = {
  me: () => wpFetch<AuthUser>('/me', { method: 'GET' }),
  login: (email: string, password: string) => wpFetch<{ user: AuthUser; accessToken: string }>(
    '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (input: { email: string; password: string; firstName?: string; lastName?: string }) =>
    wpFetch<{ user: AuthUser; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  logout: () => wpFetch<{ ok: true }>('/auth/logout', { method: 'POST' }),
  updateProfile: (input: { firstName?: string; lastName?: string; phone?: string }) =>
    wpFetch<{ ok: true }>('/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  requestPassword: (email: string) => wpFetch<{ ok: true }>(
    '/password/request', { method: 'POST', body: JSON.stringify({ email }) }),
  orders: () => wpFetch<{ items: Array<{ id: number; number: string; status: string; total: string; currency: string; dateCreated: string | null }> }>(
    '/orders', { method: 'GET' }),
};
