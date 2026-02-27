# Admin Dashboard Integration Guide

This guide is for the admin engineer implementing **Product Requests** and **Contact Form Submissions** into the admin dashboard.

It assumes no prior knowledge of this codebase.

---

## 1) Production Topology (Live)

- Storefront frontend: `https://ebemglobal.com`
- Node API app (middleware/proxy): `https://app.ebemglobal.com`
- WordPress + WooCommerce backend: `https://api.ebemglobal.com`

Recommended data flow for admin dashboard:

1. Admin UI -> Node API (`app.ebemglobal.com`)
2. Node API -> WordPress custom endpoints (`api.ebemglobal.com/wp-json/custom/v1/...`)
3. Node API -> Admin UI (sanitized response)

Do **not** call WordPress admin endpoints directly from browser/admin frontend.

---

## 2) What Already Exists

### Product Requests (Ready)

WordPress plugin already exposes:

- `POST /wp-json/custom/v1/product-request` (storefront submit)
- `GET /wp-json/custom/v1/product-requests` (admin list)
- `GET /wp-json/custom/v1/product-requests/{id}` (admin detail)
- `PATCH /wp-json/custom/v1/product-requests/{id}` (admin update)

Auth for admin routes:

- WordPress Application Password (Basic Auth)
- WordPress user must have `edit_posts`

### Contact Submissions (Not Ready Yet)

Current storefront contact page is UI-only and does not post to backend.

- File: `src/app/pages/Contact.tsx`
- No existing WordPress endpoint for listing contact submissions.

You must implement contact submission storage + admin fetch path (defined below).

---

## 3) Required Node API Environment Variables

Set these in Node app at `app.ebemglobal.com`:

```env
WP_BASE_URL=https://api.ebemglobal.com
WP_APP_USERNAME=your_wp_admin_or_editor_username
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

Optional but recommended:

```env
WP_TIMEOUT_MS=15000
```

---

## 4) Product Requests: Admin API Contract (Node Side)

Implement these Node endpoints:

### 4.1 List requests

`GET /api/v1/admin/product-requests?page=1&per_page=20&status=pending&search=phone`

Node should proxy to:

`GET {WP_BASE_URL}/wp-json/custom/v1/product-requests?...`

Return shape:

```json
{
  "items": [],
  "page": 1,
  "per_page": 20,
  "total": 0,
  "total_pages": 0
}
```

### 4.2 Request detail

`GET /api/v1/admin/product-requests/:id`

Proxy to:

`GET {WP_BASE_URL}/wp-json/custom/v1/product-requests/{id}`

### 4.3 Update request

`PATCH /api/v1/admin/product-requests/:id`

Body:

```json
{
  "status": "pending|sourcing|closed",
  "admin_response": "Your message to customer/internal"
}
```

Proxy to:

`PATCH {WP_BASE_URL}/wp-json/custom/v1/product-requests/{id}`

---

## 5) Contact Submissions: Required Implementation

## 5.1 Data Model (WordPress)

Create a new contact submission resource in WordPress plugin:

- Post type: `contact_submission`
- Fields:
  - `name`
  - `email`
  - `subject`
  - `message`
  - `status` (`new|in_progress|resolved`) optional but recommended
  - `admin_note` optional
  - `created_at`, `updated_at`

## 5.2 WordPress Endpoints to Add

Add these endpoints under `custom/v1`:

- `POST /contact-submission` (public submit)
- `GET /contact-submissions` (admin list, requires Application Password)
- `GET /contact-submissions/{id}` (admin detail)
- `PATCH /contact-submissions/{id}` (admin update/status)

Use same auth/permission pattern as product requests admin routes.

## 5.3 Node Endpoints for Admin Dashboard

Implement in Node:

- `GET /api/v1/admin/contact-submissions`
- `GET /api/v1/admin/contact-submissions/:id`
- `PATCH /api/v1/admin/contact-submissions/:id`

Each proxies server-to-server to WordPress custom endpoints using Basic Auth.

## 5.4 Storefront Contact Form Submit

Update storefront to submit to:

- Preferred: `POST https://app.ebemglobal.com/api/v1/contact-submission`

Node forwards to:

- `POST https://api.ebemglobal.com/wp-json/custom/v1/contact-submission`

Why this is preferred:

- Keeps WordPress credentials and CORS complexity out of browser.
- Gives a single API surface for frontend.

---

## 6) Security Requirements (Production)

1. Never expose `WP_APP_PASSWORD` in frontend.
2. Protect all `/api/v1/admin/*` routes with admin auth (JWT/session).
3. Add rate limiting to Node admin endpoints.
4. Validate and sanitize all query/body fields.
5. Return normalized error objects.
6. Log request IDs for traceability.

---

## 7) Error Handling Standard

Node should always return:

```json
{
  "error": "Readable message",
  "code": "machine_code_optional",
  "request_id": "trace-id"
}
```

Upstream mapping:

- WP `401/403` -> `"Upstream authentication failed"`
- WP `404` -> `"Record not found"`
- WP `429` -> `"Rate limited"`
- WP `5xx` -> `"Upstream service error"`

---

## 8) Admin Dashboard UI Requirements

For both Product Requests and Contact Submissions:

1. Filter bar:
   - Search
   - Status
   - Date range (optional)
2. Paginated table:
   - Key fields + created date
3. Detail drawer/modal:
   - Full message
   - Attachment (for product request)
4. Update action:
   - Status dropdown
   - Admin response/note
   - Save button

---

## 9) Postman Smoke Tests (Must Pass)

Assume Node base is `https://app.ebemglobal.com`.

### Product requests

1. `GET /api/v1/admin/product-requests?page=1&per_page=20`
2. `GET /api/v1/admin/product-requests/{id}`
3. `PATCH /api/v1/admin/product-requests/{id}`

### Contact submissions

1. `POST /api/v1/contact-submission` (from storefront flow)
2. `GET /api/v1/admin/contact-submissions?page=1&per_page=20`
3. `GET /api/v1/admin/contact-submissions/{id}`
4. `PATCH /api/v1/admin/contact-submissions/{id}`

---

## 10) Quick Delivery Sequence (Junior-Friendly)

1. Implement Node product request proxy routes first (already supported by WP).
2. Verify admin dashboard can list/update product requests.
3. Add WordPress contact submission post type + endpoints.
4. Add Node contact submission proxy routes.
5. Update storefront contact form to submit through Node.
6. Build admin contact submissions table/detail/update.
7. Run smoke tests.
8. Lock down auth/rate-limit/logging.

---

## 11) Notes Specific to This Project

- Existing product request docs:
  - `docs/wordpress-product-requests.md`
- Existing payment docs:
  - `docs/payment-setup-guide.md`
- Existing Node app serves other APIs already; keep admin routes namespaced under:
  - `/api/v1/admin/...`

---

If this guide is followed exactly, product requests will integrate immediately, and contact submissions will be production-ready after the WordPress contact endpoint addition.

