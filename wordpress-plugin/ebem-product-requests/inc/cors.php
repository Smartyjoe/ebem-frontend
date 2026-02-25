<?php
/**
 * CORS handler for Ebem Global headless endpoints.
 *
 * Strategy:
 *  1. Fire as early as possible via `init` (priority 1) to beat other plugins.
 *  2. Handle OPTIONS preflight immediately and exit — no WP REST dispatch needed.
 *  3. Set CORS headers on every REST response via `rest_pre_serve_request`.
 *  4. Also hook `send_headers` as a safety net for edge cases.
 */

if (!defined('ABSPATH')) { exit; }

define('EBEM_ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'https://ebemglobal.com',
    'https://www.ebemglobal.com',
]);

/**
 * Emit the correct CORS headers for the current request origin.
 * Safe to call multiple times — uses a static flag to avoid duplicate headers.
 */
function ebem_send_cors_headers(): void {
    static $sent = false;
    if ($sent) { return; }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Only set for allowed origins
    if (!in_array($origin, EBEM_ALLOWED_ORIGINS, true)) {
        return;
    }

    // Prevent header injection
    $safe_origin = esc_url_raw($origin);

    if (!headers_sent()) {
        header('Access-Control-Allow-Origin: ' . $safe_origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
        header('Access-Control-Max-Age: 600');
        header('Vary: Origin');
    }

    $sent = true;
}

/**
 * Is this request targeting our custom namespace?
 */
function ebem_is_custom_route(): bool {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    return strpos($uri, '/wp-json/custom/v1/') !== false;
}

// ── 1. Earliest possible hook — fires before most plugins ────────────────────
add_action('init', function () {
    if (!ebem_is_custom_route()) { return; }

    ebem_send_cors_headers();

    // Handle preflight OPTIONS — respond immediately, no further WP processing
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (!headers_sent()) {
            header('HTTP/1.1 204 No Content');
            header('Content-Length: 0');
        }
        exit;
    }
}, 1); // Priority 1 = very early

// ── 2. REST API hook — ensures headers are on every REST response ─────────────
add_action('rest_api_init', function () {
    // Remove WP core's own CORS handling so it doesn't conflict
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($value, $server, $request) {
        if (!$request instanceof WP_REST_Request) { return $value; }
        if (strpos($request->get_route(), '/custom/v1/') !== 0) { return $value; }

        ebem_send_cors_headers();
        return $value;
    }, 10, 3);
}, 15);

// ── 3. Safety net — send_headers fires just before WP outputs anything ────────
add_action('send_headers', function () {
    if (!ebem_is_custom_route()) { return; }
    ebem_send_cors_headers();
});
