# Payment Setup Guide (Cross-Domain: `ebemglobal.com` + `api.ebemglobal.com`)

This guide is for your current architecture:
- Frontend: `https://ebemglobal.com`
- WordPress + WooCommerce: `https://api.ebemglobal.com`

The goal is stable Store API cart + checkout flow with minimal cross-domain errors.

## What was implemented in this repo

1. Frontend Store API cart client with session token support:
- `src/app/services/wooStoreApi.ts`

2. Cart context now syncs local UI cart with Woo Store API cart endpoints:
- `src/app/context/AppContext.tsx`

3. Cart panel checkout button routes to configurable checkout URL (default `/checkout`):
- `src/app/components/panels/CartPanel.tsx`

4. Dev proxy support for `/wp-json` was added in Vite (if `VITE_WP_BASE_URL` is set):
- `vite.config.ts`

5. Custom frontend checkout and payment pages were added:
- `src/app/pages/Checkout.tsx`
- `src/app/pages/Payment.tsx`
- `src/app/services/checkout.ts`

6. Required env vars were added:
- `.env.example`

## Environment variables to set (frontend)

In root `.env`:

```env
VITE_WP_BASE_URL=https://api.ebemglobal.com
VITE_STORE_API_BASE_URL=/wp-json/wc/store/v1
VITE_USE_WOO_STORE_CART=true
VITE_WP_CHECKOUT_URL=https://api.ebemglobal.com/checkout
```

Notes:
- Keep `VITE_STORE_API_BASE_URL` relative (`/wp-json/...`) so browser calls same-origin path and relies on proxy/gateway.
- In development, Vite proxies `/wp-json` to `VITE_WP_BASE_URL`.

## WordPress/WooCommerce configuration checklist

1. Enable WooCommerce checkout and payment gateway(s)
- WooCommerce > Settings > Payments
- Enable the gateway(s) you plan to use.

2. Ensure checkout is accessible
- Confirm `https://api.ebemglobal.com/checkout` works.

3. Ensure Store API endpoints are reachable
- `GET https://api.ebemglobal.com/wp-json/wc/store/v1/products`
- `GET https://api.ebemglobal.com/wp-json/wc/store/v1/cart`

4. Caching exclusions (critical)
- Exclude these paths from full-page caching/CDN cache:
- `/wp-json/wc/store/*`
- `/cart`
- `/checkout`
- Woo session/cookie and cart endpoints must not be cached.

5. HTTPS everywhere
- Both frontend and API domains must have valid TLS certificates.

## Production reverse proxy setup (recommended)

Use your web server/CDN in front of `ebemglobal.com` to proxy `/wp-json/*` to `api.ebemglobal.com`.

Why:
- Makes browser call same-origin (`ebemglobal.com/wp-json/...`)
- Reduces CORS/session issues significantly
- More stable cart and checkout behavior

Example Nginx shape (adapt to your infra):

```nginx
location /wp-json/ {
  proxy_pass https://api.ebemglobal.com/wp-json/;
  proxy_set_header Host api.ebemglobal.com;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto https;
}
```

If you use Cloudflare Workers/Rules instead of Nginx, apply equivalent path proxy behavior.

## Checkout behavior in current implementation

Current behavior:
1. Add/update/remove cart attempts to sync with Woo Store API.
2. User clicks `Proceed to Checkout`.
3. User is redirected to `VITE_WP_CHECKOUT_URL`.

If the selected payment method returns a redirect URL, the payment page shows a "Continue to Gateway" action.

## Test plan (must pass before launch)

1. Cart persistence
- Add item on frontend.
- Refresh page.
- Ensure cart remains.

2. Quantity updates
- Increase/decrease quantity.
- Verify no errors and cart totals match Woo behavior.

3. Multi-tab consistency
- Open second tab and verify cart state converges after operations.

4. Checkout redirect
- Click checkout in panel.
- Verify user lands on Woo checkout with expected cart.

5. Payment success/failure
- Test gateway success path and failed/cancelled payment path.
- Verify Woo order status transitions correctly.

6. Mobile browser validation
- Test iOS Safari and Android Chrome for cookie/session behavior.

## Known limitations in this phase

1. Cart sync is best-effort; local UI updates immediately, then reconciles with Store API response.
2. Gateway-specific payment fields are not yet mapped (for gateways that require additional payload fields).
3. Product listing is still served by your Node API path (already integrated), not direct Store API.

## Recommended next implementation steps

1. Add gateway-specific field mapping in `submitCheckout` for your production payment provider.
2. Add user-facing error banners for cart sync failures (`409`, `403`, `500`) with retry action.
3. Add telemetry/logging for cart sync and checkout conversion events.
4. Add order confirmation lookup page using Store API order endpoint for post-payment verification.
