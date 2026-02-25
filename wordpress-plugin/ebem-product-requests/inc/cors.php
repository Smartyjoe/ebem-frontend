<?php
// CORS and preflight handling for custom REST endpoints

if (!defined('ABSPATH')) { exit; }

function ebem_cors_allowed_origins(): array {
    $origins = [
        'http://localhost:5173',
        'https://ebemglobal.com',
        'https://www.ebemglobal.com',
    ];

    /**
     * Filter allowed origins for custom REST CORS.
     *
     * Example:
     * add_filter('ebem_custom_cors_allowed_origins', function($origins) {
     *   $origins[] = 'https://staging.ebemglobal.com';
     *   return $origins;
     * });
     */
    $origins = apply_filters('ebem_custom_cors_allowed_origins', $origins);
    if (!is_array($origins)) {
        return [];
    }

    // Normalize and deduplicate to avoid mismatch due to whitespace/trailing slash.
    $normalized = [];
    foreach ($origins as $origin) {
        if (!is_string($origin)) { continue; }
        $trimmed = rtrim(trim($origin), '/');
        if ($trimmed !== '') {
            $normalized[] = $trimmed;
        }
    }

    return array_values(array_unique($normalized));
}

function ebem_origin_allowed(string $origin, array $allowed): bool {
    if ($origin === '') {
        return false;
    }

    if (in_array($origin, $allowed, true)) {
        return true;
    }

    // Allow first-party subdomains such as www/staging/preview under ebemglobal.com.
    if (preg_match('#^https://([a-z0-9-]+\.)*ebemglobal\.com$#i', $origin) === 1) {
        return true;
    }

    return false;
}

function ebem_send_cors_headers() {
    if (!function_exists('getallheaders')) {
        // Fallback for some environments
        $request_headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $request_headers[$name] = $value;
            }
        }
    } else {
        $request_headers = getallheaders();
    }

    $origin = '';
    foreach ($request_headers as $key => $value) {
        if (strtolower((string) $key) === 'origin') {
            $origin = is_string($value) ? rtrim(trim($value), '/') : '';
            break;
        }
    }
    if (!$origin) { return; }

    $allowed = ebem_cors_allowed_origins();
    if (ebem_origin_allowed($origin, $allowed)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    }
}

// Hook into REST API init to add CORS for our namespace only
add_action('rest_api_init', function() {
    // Preload CORS headers early for all custom endpoints
    add_action('rest_pre_serve_request', function($value, $server, $request) {
        // Only apply on our custom namespace
        if (is_a($request, 'WP_REST_Request')) {
            $route = $request->get_route();
            if (strpos($route, '/custom/v1/') === 0) {
                ebem_send_cors_headers();
            }
        }
        return $value;
    }, 10, 3);
});

// Handle OPTIONS preflight early
add_action('init', function() {
    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        $request_uri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($request_uri, '/wp-json/custom/v1/') !== false) {
            ebem_send_cors_headers();
            status_header(200);
            exit;
        }
    }
});
