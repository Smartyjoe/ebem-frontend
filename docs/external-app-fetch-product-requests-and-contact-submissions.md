# External App Guide: Fetch Product Requests and Contact Form Submissions

This guide is based on the implemented code in:

- `wordpress-plugin/ebem-product-requests/ebem-product-requests.php`
- `src/app/pages/RequestTest.tsx`

It documents how an external application can fetch:

- Product request list/detail
- Contact form submission list/detail

from the same WordPress backend using WordPress Application Password (Basic Auth).

## 1) Base URL

Use your WordPress site base:

- `https://api.ebemglobal.com`

All endpoints below are under:

- `https://api.ebemglobal.com/wp-json/custom/v1`

## 2) Authentication Required for Fetching Lists/Details

The list/detail endpoints for both resources are protected by `admin_permission()` and require:

- Basic Auth with WordPress username + Application Password
- A user that has `edit_posts` capability

Auth header format:

- `Authorization: Basic base64(username:application_password)`

`RequestTest.tsx` in this repo confirms this exact pattern is used for admin fetch calls.

## 3) Product Requests: GET Endpoints

## 3.1 List product requests

`GET /wp-json/custom/v1/product-requests`

Optional query params:

- `page` (default `1`)
- `per_page` (default `20`, max `100`)
- `status` (typically `pending`, `sourcing`, `closed`)
- `search` (text search)

Response shape:

```json
{
  "items": [
    {
      "id": 123,
      "title": "Samsung S24 Ultra",
      "description": "Need 10 units",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "pending",
      "admin_response": "",
      "media_id": 456,
      "media_url": "https://YOUR_WP_SITE/wp-content/uploads/...",
      "created_at": "2026-02-27 14:20:00",
      "updated_at": "2026-02-27 14:20:00"
    }
  ],
  "page": 1,
  "per_page": 20,
  "total": 1,
  "total_pages": 1
}
```

## 3.2 Get one product request

`GET /wp-json/custom/v1/product-requests/{id}`

Response shape is one object with the same fields as each list item.

## 4) Contact Submissions: GET Endpoints

## 4.1 List contact submissions

`GET /wp-json/custom/v1/contact-submissions`

Optional query params:

- `page` (default `1`)
- `per_page` (default `20`, max `100`)
- `status` (typically `new`, `in_progress`, `resolved`)
- `search` (text search)

Response shape:

```json
{
  "items": [
    {
      "id": 321,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subject": "Bulk order enquiry",
      "message": "Need quotation",
      "status": "new",
      "admin_note": "",
      "created_at": "2026-02-27 14:20:00",
      "updated_at": "2026-02-27 14:20:00"
    }
  ],
  "page": 1,
  "per_page": 20,
  "total": 1,
  "total_pages": 1
}
```

## 4.2 Get one contact submission

`GET /wp-json/custom/v1/contact-submissions/{id}`

Response shape is one object with the same fields as each list item.

## 5) cURL Examples (GET)

## 5.1 Product requests list

```bash
curl -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  "https://YOUR_WP_SITE/wp-json/custom/v1/product-requests?page=1&per_page=20"
```

## 5.2 Product request detail

```bash
curl -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  "https://YOUR_WP_SITE/wp-json/custom/v1/product-requests/123"
```

## 5.3 Contact submissions list

```bash
curl -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  "https://YOUR_WP_SITE/wp-json/custom/v1/contact-submissions?page=1&per_page=20"
```

## 5.4 Contact submission detail

```bash
curl -u "wp_username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  "https://YOUR_WP_SITE/wp-json/custom/v1/contact-submissions/321"
```

## 6) JavaScript Fetch Example (External App)

```ts
const wpBase = "https://YOUR_WP_SITE";
const username = process.env.WP_USERNAME!;
const appPassword = process.env.WP_APP_PASSWORD!;
const basic = Buffer.from(`${username}:${appPassword}`).toString("base64");

async function getProductRequests() {
  const url = `${wpBase}/wp-json/custom/v1/product-requests?page=1&per_page=20`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${basic}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function getContactSubmissions() {
  const url = `${wpBase}/wp-json/custom/v1/contact-submissions?page=1&per_page=20`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${basic}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}
```

## 7) Important Behavior Notes

- GET list endpoints return newest first (`orderby: date`, `order: DESC`).
- Pagination is implemented (`page`, `per_page`, `total`, `total_pages`).
- `search` is applied using WordPress query search.
- Public create endpoints (`POST /product-request`, `POST /contact-submission`) have rate limiting (`8` requests per `10` minutes per IP), but list/detail GET endpoints do not apply this rate limiter.

## 8) Browser/CORS Note

For direct browser-to-WordPress calls, CORS in this plugin allows only:

- `http://localhost:5173`
- `https://ebemglobal.com`
- `https://www.ebemglobal.com`

If your external application is server-to-server, this CORS restriction does not apply.
