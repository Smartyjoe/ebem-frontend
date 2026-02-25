<?php
// Minimal HS256 JWT utilities using AUTH_KEY as secret

if (!defined('ABSPATH')) { exit; }

function ebem_base64url_encode($data) { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
function ebem_base64url_decode($data) { return base64_decode(strtr($data, '-_', '+/')); }

function ebem_jwt_sign(array $payload, int $ttl_seconds = 900): string {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now = time();
    $payload = array_merge($payload, [
        'iat' => $now,
        'exp' => $now + $ttl_seconds,
        'iss' => get_site_url(),
    ]);
    $secret = defined('AUTH_KEY') ? AUTH_KEY : wp_salt('auth');

    $segments = [
        ebem_base64url_encode(json_encode($header)),
        ebem_base64url_encode(json_encode($payload)),
    ];
    $signing_input = implode('.', $segments);
    $signature = hash_hmac('sha256', $signing_input, $secret, true);
    $segments[] = ebem_base64url_encode($signature);
    return implode('.', $segments);
}

function ebem_jwt_verify(string $token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) { return new WP_Error('invalid_token', 'Invalid token'); }
    [$h64, $p64, $s64] = $parts;
    $header = json_decode(ebem_base64url_decode($h64), true);
    $payload = json_decode(ebem_base64url_decode($p64), true);
    $sig = ebem_base64url_decode($s64);

    if (!is_array($header) || !is_array($payload)) { return new WP_Error('invalid_token', 'Invalid token payload'); }
    if (($header['alg'] ?? '') !== 'HS256') { return new WP_Error('invalid_token', 'Unsupported alg'); }

    $secret = defined('AUTH_KEY') ? AUTH_KEY : wp_salt('auth');
    $expected = hash_hmac('sha256', $h64 . '.' . $p64, $secret, true);
    if (!hash_equals($expected, $sig)) { return new WP_Error('invalid_token', 'Signature mismatch'); }

    if (isset($payload['exp']) && time() >= intval($payload['exp'])) { return new WP_Error('token_expired', 'Token expired'); }

    return $payload;
}

function ebem_set_refresh_cookie(int $user_id) {
    $token = ebem_jwt_sign(['sub' => $user_id, 'typ' => 'refresh'], 60 * 60 * 24 * 7); // 7 days
    $secure = is_ssl();
    setcookie('ebem_refresh', $token, [
        'expires' => time() + 60 * 60 * 24 * 7,
        'path' => '/',
        'domain' => parse_url(get_site_url(), PHP_URL_HOST),
        'secure' => true, // require HTTPS
        'httponly' => true,
        'samesite' => 'None',
    ]);
}

function ebem_clear_refresh_cookie() {
    setcookie('ebem_refresh', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => parse_url(get_site_url(), PHP_URL_HOST),
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);
}
