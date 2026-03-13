export const AFFILIATE_DASHBOARD_URL = 'https://dashboard.ebemglobal.com/affiliate';
export const AFFILIATE_STORE_BASE_URL = 'https://ebemglobal.com';

const REF_COOKIE_KEY = 'ebem_aff_ref';
const REF_CAPTURED_AT_KEY = 'ebem_aff_ref_captured_at';
const PRODUCT_VIEWS_KEY = 'ebem_aff_product_views';
const PRODUCT_TRIGGER_SHOWN_KEY = 'ebem_aff_product_trigger_shown';
const BLOG_TRIGGER_SHOWN_KEY = 'ebem_aff_blog_trigger_shown';
const JOIN_CTA_CLICKED_KEY = 'ebem_aff_join_cta_clicked';
const EMAIL_NUDGE_SENT_PREFIX = 'ebem_aff_email_nudge_sent_';
const ACCOUNT_FIRST_SEEN_PREFIX = 'ebem_aff_account_first_seen_';
const SIGNUP_COMPLETION_CAPTURED_KEY = 'ebem_aff_signup_completion_captured';

const TRACKING_ENDPOINT = (import.meta.env.VITE_AFFILIATE_TRACKING_ENDPOINT as string | undefined) ?? '';
const EMAIL_NUDGE_ENDPOINT = (import.meta.env.VITE_AFFILIATE_EMAIL_NUDGE_ENDPOINT as string | undefined) ?? '';

function canUseBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function clampCookieDays(input: number): number {
  if (Number.isNaN(input) || input <= 0) return 45;
  return Math.min(60, Math.max(30, Math.floor(input)));
}

function getCookieDays(): number {
  const raw = Number(import.meta.env.VITE_AFFILIATE_REF_COOKIE_DAYS ?? 45);
  return clampCookieDays(raw);
}

function sanitizeRefCode(value: string | null): string {
  if (!value) return '';
  const cleaned = value.trim();
  if (!/^[A-Za-z0-9_-]{2,64}$/.test(cleaned)) return '';
  return cleaned;
}

function writeCookie(name: string, value: string, days: number): void {
  if (!canUseBrowser()) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function readCookie(name: string): string {
  if (!canUseBrowser()) return '';
  const target = `${name}=`;
  const parts = document.cookie.split(';');
  for (const raw of parts) {
    const cookie = raw.trim();
    if (cookie.startsWith(target)) {
      return decodeURIComponent(cookie.slice(target.length));
    }
  }
  return '';
}

function readJsonArray(key: string): string[] {
  if (!canUseBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, value: string[]): void {
  if (!canUseBrowser()) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function captureAffiliateRefFromSearch(search: string): string | null {
  if (!canUseBrowser()) return null;
  const params = new URLSearchParams(search);
  const ref = sanitizeRefCode(params.get('ref'));
  if (!ref) return null;

  const days = getCookieDays();
  writeCookie(REF_COOKIE_KEY, ref, days);
  window.localStorage.setItem(REF_CAPTURED_AT_KEY, String(Date.now()));
  trackAffiliateEvent('affiliate_ref_captured', { ref });
  return ref;
}

export function getStoredAffiliateRef(): string {
  return sanitizeRefCode(readCookie(REF_COOKIE_KEY));
}

export function buildAffiliateJoinUrl(source?: string): string {
  const url = new URL(AFFILIATE_DASHBOARD_URL);
  const ref = getStoredAffiliateRef();
  if (ref) url.searchParams.set('ref', ref);
  if (source) url.searchParams.set('src', source);
  return url.toString();
}

export function buildStoreReferralUrl(refCode: string, path = '/'): string {
  const clean = sanitizeRefCode(refCode);
  const url = new URL(path, AFFILIATE_STORE_BASE_URL);
  if (clean) url.searchParams.set('ref', clean);
  return url.toString();
}

export function buildProductReferralUrl(refCode: string, productPath: string): string {
  return buildStoreReferralUrl(refCode, productPath);
}

type EventPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackAffiliateEvent(event: string, payload: EventPayload = {}): void {
  if (!canUseBrowser()) return;

  const body = {
    event,
    payload,
    path: window.location.pathname,
    search: window.location.search,
    ts: new Date().toISOString(),
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(body);
  }

  if (TRACKING_ENDPOINT) {
    fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackAffiliateCtaClick(placement: string): void {
  const ref = getStoredAffiliateRef();
  markAffiliateJoinIntent();
  trackAffiliateEvent('affiliate_cta_clicked', { placement, ref: ref || null });
}

export function markAffiliateJoinIntent(): void {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(JOIN_CTA_CLICKED_KEY, String(Date.now()));
}

export function hasAffiliateJoinIntent(): boolean {
  if (!canUseBrowser()) return false;
  return Boolean(window.localStorage.getItem(JOIN_CTA_CLICKED_KEY));
}

export function registerSessionProductView(productKey: string): number {
  if (!canUseBrowser() || !productKey) return 0;
  const current = readJsonArray(PRODUCT_VIEWS_KEY);
  const next = current.includes(productKey) ? current : [...current, productKey];
  writeJsonArray(PRODUCT_VIEWS_KEY, next);
  return next.length;
}

export function getSessionProductViewsCount(): number {
  return readJsonArray(PRODUCT_VIEWS_KEY).length;
}

export function hasSeenProductTrigger(): boolean {
  if (!canUseBrowser()) return false;
  return window.sessionStorage.getItem(PRODUCT_TRIGGER_SHOWN_KEY) === '1';
}

export function markProductTriggerSeen(): void {
  if (!canUseBrowser()) return;
  window.sessionStorage.setItem(PRODUCT_TRIGGER_SHOWN_KEY, '1');
}

export function hasSeenBlogTrigger(): boolean {
  if (!canUseBrowser()) return false;
  return window.sessionStorage.getItem(BLOG_TRIGGER_SHOWN_KEY) === '1';
}

export function markBlogTriggerSeen(): void {
  if (!canUseBrowser()) return;
  window.sessionStorage.setItem(BLOG_TRIGGER_SHOWN_KEY, '1');
}

export function markAffiliatePageView(): void {
  trackAffiliateEvent('affiliate_landing_viewed');
}

export function captureAffiliateSignupCompletion(search: string): void {
  if (!canUseBrowser()) return;
  const params = new URLSearchParams(search);
  const signal = params.get('affiliate_signup');
  const normalized = signal?.toLowerCase() ?? '';
  if (normalized !== '1' && normalized !== 'success' && normalized !== 'true') return;
  if (window.sessionStorage.getItem(SIGNUP_COMPLETION_CAPTURED_KEY) === '1') return;
  window.sessionStorage.setItem(SIGNUP_COMPLETION_CAPTURED_KEY, '1');
  trackAffiliateEvent('affiliate_signup_completed');
}

export function getAccountFirstSeen(userId: number): number | null {
  if (!canUseBrowser()) return null;
  const raw = window.localStorage.getItem(`${ACCOUNT_FIRST_SEEN_PREFIX}${userId}`);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

export function setAccountFirstSeen(userId: number, ts: number): void {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(`${ACCOUNT_FIRST_SEEN_PREFIX}${userId}`, String(ts));
}

export function hasSentEmailNudge(userId: number): boolean {
  if (!canUseBrowser()) return false;
  return window.localStorage.getItem(`${EMAIL_NUDGE_SENT_PREFIX}${userId}`) === '1';
}

export function markEmailNudgeSent(userId: number): void {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(`${EMAIL_NUDGE_SENT_PREFIX}${userId}`, '1');
}

export function maybeTriggerAffiliateEmailNudge(input: { userId: number; email: string }): void {
  if (!canUseBrowser()) return;

  const { userId, email } = input;
  if (!userId || !email || hasAffiliateJoinIntent() || hasSentEmailNudge(userId)) return;

  const now = Date.now();
  const firstSeen = getAccountFirstSeen(userId);
  if (!firstSeen) {
    setAccountFirstSeen(userId, now);
    return;
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (now - firstSeen < sevenDaysMs) return;

  trackAffiliateEvent('affiliate_email_nudge_due', { userId, email });
  if (EMAIL_NUDGE_ENDPOINT) {
    fetch(EMAIL_NUDGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, event: 'affiliate_email_nudge_due' }),
      keepalive: true,
    }).catch(() => {});
  }
  markEmailNudgeSent(userId);
}
