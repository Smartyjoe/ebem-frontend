<?php
/**
 * Paystack Gateway Endpoints
 * Registers WooCommerce custom gateway + headless REST API endpoints:
 *   POST /custom/v1/paystack/init      – create WC order, init Paystack transaction
 *   POST /custom/v1/paystack/verify    – verify Paystack payment, mark order paid
 *   POST /custom/v1/paystack/webhook   – Paystack server webhook (HMAC verified)
 */

if (!defined('ABSPATH')) { exit; }

require_once __DIR__ . '/jwt.php';

// ──────────────────────────────────────────────────────────────────────
// 1. Helper: read Paystack keys from plugin settings
// ──────────────────────────────────────────────────────────────────────
function ebem_paystack_keys(): array {
    $opts     = get_option('ebem_paystack_settings', []);
    $testmode = !empty($opts['test_mode']);
    return [
        'public_key'  => $testmode ? ($opts['test_public_key']  ?? '') : ($opts['live_public_key']  ?? ''),
        'secret_key'  => $testmode ? ($opts['test_secret_key']  ?? '') : ($opts['live_secret_key']  ?? ''),
        'test_mode'   => $testmode,
    ];
}

// ──────────────────────────────────────────────────────────────────────
// 2. WooCommerce Payment Gateway class
// ──────────────────────────────────────────────────────────────────────
add_action('plugins_loaded', function() {
    if (!class_exists('WC_Payment_Gateway')) { return; }

    class WC_Ebem_Paystack_Gateway extends WC_Payment_Gateway {
        public function __construct() {
            $this->id                 = 'ebem_paystack';
            $this->method_title       = 'Paystack (Ebem Global)';
            $this->method_description = 'Accept payments via Paystack – managed from Ebem Global plugin settings.';
            $this->has_fields         = false;
            $this->supports           = ['products'];
            $this->title              = 'Pay with Paystack';
            $this->description        = 'Securely pay with your card or bank transfer via Paystack.';
            $this->enabled            = 'yes';
        }

        /** Never redirect – headless flow handles everything via REST. */
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            $order->update_status('pending', 'Awaiting Paystack payment.');
            return ['result' => 'success', 'redirect' => ''];
        }
    }

    add_filter('woocommerce_payment_gateways', function($gateways) {
        $gateways[] = 'WC_Ebem_Paystack_Gateway';
        return $gateways;
    });
});

// ──────────────────────────────────────────────────────────────────────
// 3. REST endpoints
// ──────────────────────────────────────────────────────────────────────
add_action('rest_api_init', function() {
    $ns = 'custom/v1';

    // ── 3a. POST /paystack/init ──────────────────────────────────────
    register_rest_route($ns, '/paystack/init', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function(WP_REST_Request $req) {

            if (!function_exists('wc_create_order')) {
                return new WP_Error('woocommerce_missing', 'WooCommerce not active', ['status' => 500]);
            }

            // ── Resolve user (logged-in or guest) ────────────────────
            $current_user = ebem_auth_current_user();

            // ── Validate billing input ───────────────────────────────
            $billing = $req->get_param('billing');
            if (!is_array($billing)) {
                return new WP_Error('invalid_input', 'billing object required', ['status' => 400]);
            }
            $required_fields = ['first_name','last_name','email','phone','address_1','city','state','country'];
            foreach ($required_fields as $f) {
                if (empty($billing[$f])) {
                    return new WP_Error('invalid_input', "billing.$f is required", ['status' => 400]);
                }
            }

            $email = sanitize_email($billing['email']);
            if (!is_email($email)) {
                return new WP_Error('invalid_input', 'Invalid email address', ['status' => 400]);
            }

            // ── Cart items ───────────────────────────────────────────
            $cart_items = $req->get_param('items');
            if (!is_array($cart_items) || empty($cart_items)) {
                return new WP_Error('invalid_input', 'items array required', ['status' => 400]);
            }

            // ── Create WooCommerce order ─────────────────────────────
            $order = wc_create_order([
                'customer_id' => $current_user ? $current_user->ID : 0,
                'status'      => 'pending',
            ]);
            if (is_wp_error($order)) {
                return new WP_Error('order_failed', 'Could not create order', ['status' => 500]);
            }

            // ── Add line items ───────────────────────────────────────
            $order_total = 0;
            foreach ($cart_items as $item) {
                $product_id = absint($item['productId'] ?? 0);
                $qty        = max(1, absint($item['quantity'] ?? 1));
                $product    = wc_get_product($product_id);
                if (!$product) { continue; }

                $order->add_product($product, $qty);
                $order_total += floatval($product->get_price()) * $qty;
            }

            if ($order_total <= 0) {
                $order->delete(true);
                return new WP_Error('invalid_cart', 'Cart total must be greater than zero', ['status' => 400]);
            }

            // ── Set addresses ────────────────────────────────────────
            $addr = [
                'first_name' => sanitize_text_field($billing['first_name']),
                'last_name'  => sanitize_text_field($billing['last_name']),
                'company'    => sanitize_text_field($billing['company'] ?? ''),
                'address_1'  => sanitize_text_field($billing['address_1']),
                'address_2'  => sanitize_text_field($billing['address_2'] ?? ''),
                'city'       => sanitize_text_field($billing['city']),
                'state'      => sanitize_text_field($billing['state']),
                'postcode'   => sanitize_text_field($billing['postcode'] ?? ''),
                'country'    => sanitize_text_field($billing['country']),
                'email'      => $email,
                'phone'      => sanitize_text_field($billing['phone']),
            ];
            $order->set_address($addr, 'billing');
            $order->set_address($addr, 'shipping');
            $order->set_payment_method('ebem_paystack');
            $order->set_payment_method_title('Paystack');
            $order->calculate_totals();
            $order->save();

            $order_id    = $order->get_id();
            $order_total = $order->get_total();
            $currency    = $order->get_currency();

            // ── Convert to kobo (Paystack uses subunit) ──────────────
            // NGN 1 = 100 kobo; USD 1 = 100 cents etc.
            $amount_kobo = intval(round(floatval($order_total) * 100));

            // ── Initialise Paystack transaction ──────────────────────
            $keys = ebem_paystack_keys();
            if (empty($keys['secret_key'])) {
                $order->delete(true);
                return new WP_Error('paystack_config', 'Paystack secret key not configured', ['status' => 500]);
            }

            $reference = 'EBM-' . $order_id . '-' . time();
            $callback_url = get_site_url() . '/wp-json/custom/v1/paystack/verify?reference=' . $reference;

            $ps_response = wp_remote_post('https://api.paystack.co/transaction/initialize', [
                'timeout' => 20,
                'headers' => [
                    'Authorization' => 'Bearer ' . $keys['secret_key'],
                    'Content-Type'  => 'application/json',
                ],
                'body' => wp_json_encode([
                    'email'        => $email,
                    'amount'       => $amount_kobo,
                    'currency'     => $currency,
                    'reference'    => $reference,
                    'callback_url' => $callback_url,
                    'metadata'     => [
                        'order_id'   => $order_id,
                        'order_num'  => $order->get_order_number(),
                        'cancel_action' => 'close',
                    ],
                ]),
            ]);

            if (is_wp_error($ps_response)) {
                $order->update_status('failed', 'Paystack init error: ' . $ps_response->get_error_message());
                return new WP_Error('paystack_init_failed', $ps_response->get_error_message(), ['status' => 502]);
            }

            $body = json_decode(wp_remote_retrieve_body($ps_response), true);
            if (empty($body['status']) || !$body['status']) {
                $order->update_status('failed', 'Paystack init failed: ' . ($body['message'] ?? 'unknown'));
                return new WP_Error('paystack_init_failed', $body['message'] ?? 'Paystack initialisation failed', ['status' => 502]);
            }

            // Store reference on order
            $order->update_meta_data('_paystack_reference', $reference);
            $order->save();

            return new WP_REST_Response([
                'orderId'       => $order_id,
                'orderNumber'   => $order->get_order_number(),
                'reference'     => $reference,
                'accessCode'    => $body['data']['access_code'] ?? '',
                'authorizationUrl' => $body['data']['authorization_url'] ?? '',
                'publicKey'     => $keys['public_key'],
                'amount'        => $amount_kobo,
                'email'         => $email,
                'currency'      => $currency,
                'testMode'      => $keys['test_mode'],
            ], 200);
        },
    ]);

    // ── 3b. POST /paystack/verify ────────────────────────────────────
    register_rest_route($ns, '/paystack/verify', [
        'methods'             => ['POST', 'GET'],
        'permission_callback' => '__return_true',
        'callback'            => function(WP_REST_Request $req) {
            $reference = sanitize_text_field($req->get_param('reference') ?? '');
            if (!$reference) {
                return new WP_Error('invalid_input', 'reference required', ['status' => 400]);
            }

            $keys = ebem_paystack_keys();
            if (empty($keys['secret_key'])) {
                return new WP_Error('paystack_config', 'Paystack secret key not configured', ['status' => 500]);
            }

            // Verify with Paystack
            $ps_response = wp_remote_get(
                'https://api.paystack.co/transaction/verify/' . rawurlencode($reference),
                [
                    'timeout' => 20,
                    'headers' => ['Authorization' => 'Bearer ' . $keys['secret_key']],
                ]
            );

            if (is_wp_error($ps_response)) {
                return new WP_Error('paystack_verify_failed', $ps_response->get_error_message(), ['status' => 502]);
            }

            $body = json_decode(wp_remote_retrieve_body($ps_response), true);
            if (empty($body['status']) || !$body['status']) {
                return new WP_Error('paystack_verify_failed', $body['message'] ?? 'Verification failed', ['status' => 400]);
            }

            $data   = $body['data'] ?? [];
            $status = $data['status'] ?? '';

            // Find the WC order by reference meta
            $orders = wc_get_orders([
                'meta_key'   => '_paystack_reference',
                'meta_value' => $reference,
                'limit'      => 1,
            ]);

            if (empty($orders)) {
                return new WP_Error('order_not_found', 'No order found for this reference', ['status' => 404]);
            }

            $order = $orders[0];

            if ($status === 'success') {
                if (!$order->is_paid()) {
                    $order->payment_complete($reference);
                    $order->add_order_note('Paystack payment verified. Reference: ' . $reference);
                }
                return new WP_REST_Response([
                    'status'      => 'success',
                    'orderId'     => $order->get_id(),
                    'orderNumber' => $order->get_order_number(),
                    'reference'   => $reference,
                    'amount'      => $data['amount'] ?? 0,
                    'currency'    => $data['currency'] ?? '',
                    'paidAt'      => $data['paid_at'] ?? null,
                ], 200);
            }

            // Payment not successful
            $order->update_status('failed', 'Paystack verification status: ' . $status);
            return new WP_REST_Response([
                'status'    => $status,
                'orderId'   => $order->get_id(),
                'reference' => $reference,
            ], 200);
        },
    ]);

    // ── 3c. POST /paystack/webhook ───────────────────────────────────
    register_rest_route($ns, '/paystack/webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function(WP_REST_Request $req) {
            $keys = ebem_paystack_keys();
            if (empty($keys['secret_key'])) {
                return new WP_REST_Response(['ok' => false], 400);
            }

            // HMAC validation
            $sig  = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
            $body = $req->get_body();
            $expected = hash_hmac('sha512', $body, $keys['secret_key']);
            if (!hash_equals($expected, $sig)) {
                return new WP_REST_Response(['ok' => false], 401);
            }

            $event = json_decode($body, true);
            $event_type = $event['event'] ?? '';

            if ($event_type === 'charge.success') {
                $data      = $event['data'] ?? [];
                $reference = $data['reference'] ?? '';
                if (!$reference) { return new WP_REST_Response(['ok' => true], 200); }

                $orders = wc_get_orders([
                    'meta_key'   => '_paystack_reference',
                    'meta_value' => $reference,
                    'limit'      => 1,
                ]);

                if (!empty($orders)) {
                    $order = $orders[0];
                    if (!$order->is_paid()) {
                        $order->payment_complete($reference);
                        $order->add_order_note('Paystack webhook confirmed payment. Reference: ' . $reference);
                    }
                }
            }

            return new WP_REST_Response(['ok' => true], 200);
        },
    ]);

    // ── 3d. GET /paystack/order/:id – get order status (authenticated) ──
    register_rest_route($ns, '/paystack/order/(?P<id>\d+)', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function(WP_REST_Request $req) {
            $user = ebem_auth_require_login();
            if (is_wp_error($user)) { return $user; }

            $order_id = absint($req['id']);
            $order    = wc_get_order($order_id);
            if (!$order) { return new WP_Error('not_found', 'Order not found', ['status' => 404]); }

            // Security: order must belong to this user
            if ($order->get_customer_id() !== $user->ID) {
                return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
            }

            $items_out = [];
            foreach ($order->get_items() as $item) {
                $product = $item->get_product();
                $items_out[] = [
                    'name'     => $item->get_name(),
                    'qty'      => $item->get_quantity(),
                    'total'    => wc_format_decimal($item->get_total(), 2),
                    'image'    => $product ? wp_get_attachment_url($product->get_image_id()) : '',
                ];
            }

            return new WP_REST_Response([
                'id'          => $order->get_id(),
                'number'      => $order->get_order_number(),
                'status'      => $order->get_status(),
                'total'       => $order->get_total(),
                'currency'    => $order->get_currency(),
                'dateCreated' => $order->get_date_created() ? $order->get_date_created()->date('c') : null,
                'items'       => $items_out,
                'billing'     => [
                    'firstName' => $order->get_billing_first_name(),
                    'lastName'  => $order->get_billing_last_name(),
                    'email'     => $order->get_billing_email(),
                    'phone'     => $order->get_billing_phone(),
                    'address1'  => $order->get_billing_address_1(),
                    'city'      => $order->get_billing_city(),
                    'state'     => $order->get_billing_state(),
                    'country'   => $order->get_billing_country(),
                ],
                'reference'   => $order->get_meta('_paystack_reference'),
            ], 200);
        },
    ]);
});
