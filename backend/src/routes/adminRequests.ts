import { Router, Response } from 'express';
import crypto from 'crypto';
import { env } from '../env';

type ParsedError = { message: string; code?: string };

const router = Router();

function buildWpCustomBase(): string {
  const raw = env.WP_BASE_URL || 'https://api.ebemglobal.com';
  return `${raw.replace(/\/+$/, '').replace(/\/wp-json$/, '')}/wp-json/custom/v1`;
}

const WP_CUSTOM_BASE = buildWpCustomBase();

function basicAuthHeader(): string {
  const username = env.WP_APP_USERNAME || '';
  const password = env.WP_APP_PASSWORD || '';
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function parseWpError(text: string): ParsedError {
  if (!text) {
    return { message: 'Upstream request failed' };
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; code?: string };
    if (parsed?.message) {
      return { message: parsed.message, code: parsed.code };
    }
  } catch {
    // fall through to raw text
  }

  return { message: text };
}

async function proxyJson(
  res: Response,
  path: string,
  init?: RequestInit,
  options?: { requireAuth?: boolean },
): Promise<void> {
  const requestId = crypto.randomUUID();
  const requireAuth = options?.requireAuth !== false;

  if (requireAuth && (!env.WP_APP_USERNAME || !env.WP_APP_PASSWORD)) {
    res.status(500).json({
      error: 'Missing WordPress admin credentials on API server.',
      request_id: requestId,
    });
    return;
  }

  const controller = new AbortController();
  const timeoutMs = env.WP_TIMEOUT_MS ?? 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${WP_CUSTOM_BASE}${path}`, {
      method: init?.method || 'GET',
      body: init?.body,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(requireAuth ? { Authorization: basicAuthHeader() } : {}),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
    });

    const text = await response.text().catch(() => '');

    if (!response.ok) {
      const parsed = parseWpError(text);
      res.status(response.status).json({
        error: parsed.message || `Upstream request failed (${response.status})`,
        code: parsed.code,
        request_id: requestId,
      });
      return;
    }

    if (!text) {
      res.status(response.status).json({});
      return;
    }

    try {
      res.status(response.status).json(JSON.parse(text));
    } catch {
      res.status(502).json({
        error: 'Invalid JSON response from WordPress API',
        request_id: requestId,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed';
    res.status(502).json({
      error: message,
      request_id: requestId,
    });
  } finally {
    clearTimeout(timer);
  }
}

function toSearchParams(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Admin: Product requests
router.get('/admin/product-requests', async (req, res) => {
  const qs = toSearchParams(req.query as Record<string, unknown>);
  await proxyJson(res, `/product-requests${qs}`);
});

router.get('/admin/product-requests/:id', async (req, res) => {
  await proxyJson(res, `/product-requests/${req.params.id}`);
});

router.patch('/admin/product-requests/:id', async (req, res) => {
  await proxyJson(res, `/product-requests/${req.params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(req.body ?? {}),
  });
});

// Admin: Contact submissions
router.get('/admin/contact-submissions', async (req, res) => {
  const qs = toSearchParams(req.query as Record<string, unknown>);
  await proxyJson(res, `/contact-submissions${qs}`);
});

router.get('/admin/contact-submissions/:id', async (req, res) => {
  await proxyJson(res, `/contact-submissions/${req.params.id}`);
});

router.patch('/admin/contact-submissions/:id', async (req, res) => {
  await proxyJson(res, `/contact-submissions/${req.params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(req.body ?? {}),
  });
});

// Public: storefront contact submission (no auth)
router.post('/contact-submission', async (req, res) => {
  await proxyJson(res, `/contact-submission`, {
    method: 'POST',
    body: JSON.stringify(req.body ?? {}),
  }, { requireAuth: false });
});

export { router as adminRequestsRouter };
