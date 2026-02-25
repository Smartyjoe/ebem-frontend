<?php
// Auth endpoints: register, login, logout, me, profile, password, orders

if (!defined('ABSPATH')) { exit; }

require_once __DIR__ . '/jwt.php';

function ebem_auth_current_user_from_bearer() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (stripos($auth, 'Bearer ') === 0) {
        $token = trim(substr($auth, 7));
        $payload = ebem_jwt_verify($token);
        if (!is_wp_error($payload)) {
            $user_id = intval($payload['sub'] ?? 0);
            if ($user_id > 0) { return get_user_by('id', $user_id); }
        }
    }
    return null;
}

function ebem_auth_current_user() {
    $user = ebem_auth_current_user_from_bearer();
    if ($user) { return $user; }
    if (isset($_COOKIE['ebem_refresh'])) {
        $payload = ebem_jwt_verify($_COOKIE['ebem_refresh']);
        if (!is_wp_error($payload)) {
            $uid = intval($payload['sub'] ?? 0);
            if ($uid > 0) { return get_user_by('id', $uid); }
        }
    }
    return null;
}

function ebem_auth_require_login() {
    $user = ebem_auth_current_user();
    if (!$user) {
        return new WP_Error('unauthorized', 'Not authenticated', ['status' => 401]);
    }
    return $user;
}

add_action('rest_api_init', function() {
    $ns = 'custom/v1';

    register_rest_route($ns, '/auth/register', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            $email = sanitize_email($req['email'] ?? '');
            $password = $req['password'] ?? '';
            $first_name = sanitize_text_field($req['firstName'] ?? '');
            $last_name = sanitize_text_field($req['lastName'] ?? '');

            if (!$email || !$password) {
                return new WP_Error('invalid_input', 'Email and password required', ['status' => 400]);
            }
            if (email_exists($email)) {
                return new WP_Error('email_exists', 'Email already registered', ['status' => 409]);
            }
            $username = sanitize_user(current(explode('@', $email)) . wp_generate_password(4, false));
            $user_id = wp_create_user($username, $password, $email);
            if (is_wp_error($user_id)) { return $user_id; }
            wp_update_user(['ID' => $user_id, 'first_name' => $first_name, 'last_name' => $last_name]);

            // Set as customer role
            $user = new WP_User($user_id);
            $user->set_role('customer');

            // Issue tokens
            $access = ebem_jwt_sign(['sub' => $user_id, 'typ' => 'access'], 60*15);
            ebem_set_refresh_cookie($user_id);

            return [
                'user' => [
                    'id' => $user_id,
                    'email' => $email,
                    'firstName' => $first_name,
                    'lastName' => $last_name,
                    'displayName' => $user->display_name,
                ],
                'accessToken' => $access,
            ];
        }
    ]);

    register_rest_route($ns, '/auth/login', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            $email = sanitize_email($req['email'] ?? '');
            $password = $req['password'] ?? '';
            $user = get_user_by('email', $email);
            if (!$user) { return new WP_Error('invalid_credentials', 'Invalid email or password', ['status' => 401]); }
            if (!wp_check_password($password, $user->user_pass, $user->ID)) {
                return new WP_Error('invalid_credentials', 'Invalid email or password', ['status' => 401]);
            }
            $access = ebem_jwt_sign(['sub' => $user->ID, 'typ' => 'access'], 60*15);
            ebem_set_refresh_cookie($user->ID);
            return [
                'user' => [
                    'id' => $user->ID,
                    'email' => $user->user_email,
                    'firstName' => get_user_meta($user->ID, 'first_name', true),
                    'lastName' => get_user_meta($user->ID, 'last_name', true),
                    'displayName' => $user->display_name,
                ],
                'accessToken' => $access,
            ];
        }
    ]);

    register_rest_route($ns, '/auth/logout', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function() {
            ebem_clear_refresh_cookie();
            return [ 'ok' => true ];
        }
    ]);

    register_rest_route($ns, '/me', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            $user = ebem_auth_current_user();
            if (!$user) { return new WP_Error('unauthorized', 'Not authenticated', ['status' => 401]); }
            return [
                'id' => $user->ID,
                'email' => $user->user_email,
                'firstName' => get_user_meta($user->ID, 'first_name', true),
                'lastName' => get_user_meta($user->ID, 'last_name', true),
                'displayName' => $user->display_name,
            ];
        }
    ]);

    register_rest_route($ns, '/profile', [
        'methods' => 'PATCH',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            $user = ebem_auth_require_login();
            if (is_wp_error($user)) { return $user; }
            $first = sanitize_text_field($req['firstName'] ?? '');
            $last = sanitize_text_field($req['lastName'] ?? '');
            $phone = sanitize_text_field($req['phone'] ?? '');

            wp_update_user(['ID' => $user->ID, 'first_name' => $first, 'last_name' => $last]);
            if ($phone) { update_user_meta($user->ID, 'billing_phone', $phone); }

            return [ 'ok' => true ];
        }
    ]);

    register_rest_route($ns, '/password/request', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            $email = sanitize_email($req['email'] ?? '');
            if (!$email) { return new WP_Error('invalid_input', 'Email required', ['status' => 400]); }
            $user = get_user_by('email', $email);
            if (!$user) { return [ 'ok' => true ]; } // do not leak existence

            $reset_key = get_password_reset_key($user);
            if (is_wp_error($reset_key)) { return new WP_Error('reset_failed', 'Could not generate reset link', ['status' => 500]); }
            $reset_url = add_query_arg(['key' => $reset_key, 'login' => rawurlencode($user->user_login)], wp_lostpassword_url());

            $subject = 'Password Reset Request';
            $message = 'Click the link to reset your password: ' . $reset_url;
            wp_mail($email, $subject, $message);
            return [ 'ok' => true ];
        }
    ]);

    register_rest_route($ns, '/orders', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function(WP_REST_Request $req) {
            if (!function_exists('wc_get_orders')) {
                return new WP_Error('woocommerce_missing', 'WooCommerce not active', ['status' => 500]);
            }
            $user = ebem_auth_require_login();
            if (is_wp_error($user)) { return $user; }
            $orders = wc_get_orders([
                'customer' => $user->ID,
                'limit' => 20,
                'orderby' => 'date',
                'order' => 'DESC',
            ]);
            $out = [];
            foreach ($orders as $order) {
                $out[] = [
                    'id' => $order->get_id(),
                    'number' => $order->get_order_number(),
                    'status' => $order->get_status(),
                    'total' => $order->get_total(),
                    'currency' => $order->get_currency(),
                    'dateCreated' => $order->get_date_created() ? $order->get_date_created()->date('c') : null,
                ];
            }
            return [ 'items' => $out ];
        }
    ]);
});
