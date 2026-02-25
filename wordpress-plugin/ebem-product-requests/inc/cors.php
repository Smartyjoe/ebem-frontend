<?php
// CORS and preflight handling for custom REST endpoints

if (!defined('ABSPATH')) { exit; }

function ebem_cors_allowed_origins(): array {
    return [
        'http://localhost:5173',
        'https://ebemglobal.com',
    ];
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

    $origin = $request_headers['Origin'] ?? '';
    if (!$origin) { return; }

    $allowed = ebem_cors_allowed_origins();
    if (in_array($origin, $allowed, true)) {
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
    add_action('rest_pre_serve_request', function($value) {
        ebem_send_cors_headers();
        return $value;
    });
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
