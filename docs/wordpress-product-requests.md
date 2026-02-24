# WordPress Product Requests API (Application Password Auth)

This document describes exactly what was implemented in the plugin at:
`wordpress-plugin/ebem-product-requests/ebem-product-requests.php`

## 1) Install the plugin

1. Copy folder `wordpress-plugin/ebem-product-requests` into your WordPress site `wp-content/plugins/`.
2. Activate **EBEM Product Requests API** in WordPress admin.
3. Confirm routes are available:
- `POST /wp-json/custom/v1/product-request`
- `GET /wp-json/custom/v1/product-requests`
- `GET /wp-json/custom/v1/product-requests/{id}`
- `PATCH /wp-json/custom/v1/product-requests/{id}`

## 2) Data storage model

The plugin stores requests as WordPress custom posts:
- Post type: `product_request`
- Meta fields:
- `product_title`
- `description`
- `name`
- `email`
- `attachment_id` (optional)
- `status` (`pending`, `sourcing`, `closed`)
- `admin_response` (optional)

Uploads are handled by WordPress `media_handle_upload()` and stored in the standard media library.

## 3) Storefront submit endpoint (public)

### `POST /wp-json/custom/v1/product-request`

Content type: `multipart/form-data`

Fields:
- `product_title` (required)
- `description` (required)
- `name` (required)
- `email` (required, valid email)
- `reference_file` (optional: jpg/png/webp/mp4/pdf, max 15MB)

Response `201`:
```json
{
  "id": 123,
  "title": "Samsung S24 Ultra",
  "description": "Need 10 units, black, 256GB",
  "name": "John Doe",
  "email": "john@example.com",
  "status": "pending",
  "admin_response": "",
  "media_id": 456,
  "media_url": "https://example.com/wp-content/uploads/2026/02/file.jpg",
  "created_at": "2026-02-24 14:20:00",
  "updated_at": "2026-02-24 14:20:00"
}
```

Validation/rules already implemented:
- Required field checks
- Email validation
- File type whitelist
- File size limit 15MB
- Basic IP rate limit (8 requests / 10 minutes)

## 4) Admin endpoints (authenticated with WordPress Application Password)

These routes require a WordPress user authenticated by Application Password and with capability `edit_posts`.

### Create Application Password
1. In WordPress Admin, open the target user profile.
2. Generate **Application Password**.
3. Save the generated value immediately (WordPress shows it once).

### Auth header format
Use HTTP Basic auth:
- username: WordPress login username
- password: generated application password

Header:
- `Authorization: Basic base64(username:application_password)`

### `GET /wp-json/custom/v1/product-requests`

Query params:
- `page` (default 1)
- `per_page` (default 20, max 100)
- `status` (`pending|sourcing|closed`)
- `search` (text search)

Response `200`:
```json
{
  "items": [],
  "page": 1,
  "per_page": 20,
  "total": 0,
  "total_pages": 0
}
```

### `GET /wp-json/custom/v1/product-requests/{id}`

Returns one request record.

### `PATCH /wp-json/custom/v1/product-requests/{id}`

Payload fields:
- `status` (`pending|sourcing|closed`)
- `admin_response` (text)

Example:
```json
{
  "status": "sourcing",
  "admin_response": "We found options and will send quotation shortly."
}
```

## 5) Admin backend implementation guidance (non-frontend)

Recommended pattern:
1. Your admin backend stores:
- `WP_BASE_URL`
- `WP_APP_USERNAME`
- `WP_APP_PASSWORD`
2. Admin backend creates Basic token server-side and calls WordPress custom endpoints.
3. Admin frontend calls your admin backend only (do not expose application password to browser code).

Pseudo flow:
1. Admin frontend -> `GET /admin/product-requests`
2. Admin backend -> WordPress `GET /wp-json/custom/v1/product-requests` (Basic auth)
3. Admin backend returns sanitized response to frontend

## 6) cURL examples

### Public submit
```bash
curl -X POST "https://YOUR_WP_SITE/wp-json/custom/v1/product-request" \
  -F "product_title=Air Fryer XL" \
  -F "description=Need 5 units, 6L minimum" \
  -F "name=Jane Doe" \
  -F "email=jane@example.com" \
  -F "reference_file=@/path/to/spec.pdf"
```

### Admin list (Application Password)
```bash
curl -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  "https://YOUR_WP_SITE/wp-json/custom/v1/product-requests?page=1&per_page=20&status=pending"
```

### Admin update
```bash
curl -X PATCH \
  -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  -H "Content-Type: application/json" \
  -d '{"status":"closed","admin_response":"Handled and completed."}' \
  "https://YOUR_WP_SITE/wp-json/custom/v1/product-requests/123"
```

## 7) Frontend integration in this repo

Storefront request panel now submits to WordPress endpoint directly via:
- `src/app/services/productRequests.ts`
- `src/app/components/panels/RequestProductPanel.tsx`

Required env var in storefront:
- `VITE_WP_BASE_URL=https://api.ebemglobal.com`

If your WordPress API is on a different domain than the storefront, ensure CORS is configured on the WordPress host/reverse proxy.
