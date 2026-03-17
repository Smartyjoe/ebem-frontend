<?php
/**
 * Plugin Name: Ebem Product Requests & Auth
 * Description: Custom endpoints for product requests, headless auth, and Paystack gateway support.
 */
/**
 * Plugin Name: EBEM Product Requests API
 * Description: Captures storefront product requests and exposes admin REST endpoints.
 * Version: 1.0.0
 * Author: EBEM
 */

if (!defined('ABSPATH')) {
    exit;
}

final class EPR_Product_Requests_Plugin {
    const POST_TYPE = 'product_request';
    const CONTACT_POST_TYPE = 'contact_submission';
    const REST_NAMESPACE = 'custom/v1';
    const MAX_FILE_SIZE_BYTES = 15728640; // 15 MB
    const RATE_LIMIT_WINDOW = 600; // 10 minutes
    const RATE_LIMIT_MAX = 8;

    public function __construct() {
        add_action('init', array($this, 'register_post_type'));
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_post_type() {
        register_post_type(
            self::POST_TYPE,
            array(
                'labels' => array(
                    'name' => 'Product Requests',
                    'singular_name' => 'Product Request',
                ),
                'public' => false,
                'show_ui' => true,
                'show_in_rest' => false,
                'supports' => array('title'),
                'capability_type' => 'post',
                'map_meta_cap' => true,
            )
        );

        register_post_type(
            self::CONTACT_POST_TYPE,
            array(
                'labels' => array(
                    'name' => 'Contact Submissions',
                    'singular_name' => 'Contact Submission',
                ),
                'public' => false,
                'show_ui' => true,
                'show_in_rest' => false,
                'supports' => array('title'),
                'capability_type' => 'post',
                'map_meta_cap' => true,
            )
        );
    }

    public function register_routes() {
        register_rest_route(
            self::REST_NAMESPACE,
            '/product-request',
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_product_request'),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/product-requests',
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'list_product_requests'),
                'permission_callback' => array($this, 'admin_permission'),
                'args' => array(
                    'page' => array(
                        'default' => 1,
                        'sanitize_callback' => 'absint',
                    ),
                    'per_page' => array(
                        'default' => 20,
                        'sanitize_callback' => 'absint',
                    ),
                    'status' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'search' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/product-requests/(?P<id>\d+)',
            array(
                array(
                    'methods' => WP_REST_Server::READABLE,
                    'callback' => array($this, 'get_product_request'),
                    'permission_callback' => array($this, 'admin_permission'),
                ),
                array(
                    'methods' => WP_REST_Server::EDITABLE,
                    'callback' => array($this, 'update_product_request'),
                    'permission_callback' => array($this, 'admin_permission'),
                ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/contact-submission',
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_contact_submission'),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/contact-submissions',
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'list_contact_submissions'),
                'permission_callback' => array($this, 'admin_permission'),
                'args' => array(
                    'page' => array(
                        'default' => 1,
                        'sanitize_callback' => 'absint',
                    ),
                    'per_page' => array(
                        'default' => 20,
                        'sanitize_callback' => 'absint',
                    ),
                    'status' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'search' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/contact-submissions/(?P<id>\d+)',
            array(
                array(
                    'methods' => WP_REST_Server::READABLE,
                    'callback' => array($this, 'get_contact_submission'),
                    'permission_callback' => array($this, 'admin_permission'),
                ),
                array(
                    'methods' => WP_REST_Server::EDITABLE,
                    'callback' => array($this, 'update_contact_submission'),
                    'permission_callback' => array($this, 'admin_permission'),
                ),
            )
        );
    }

    public function admin_permission() {
        return current_user_can('edit_posts');
    }

    private function contact_debug_log($event, $context = array()) {
        $payload = array(
            'event' => $event,
            'context' => $context,
            'ts' => gmdate('c'),
        );
        error_log('[ebem_contact_debug] ' . wp_json_encode($payload));
    }

    private function get_client_ip() {
        $keys = array('HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $value = sanitize_text_field(wp_unslash($_SERVER[$key]));
                $parts = explode(',', $value);
                return trim($parts[0]);
            }
        }
        return 'unknown';
    }

    private function enforce_rate_limit() {
        $ip = $this->get_client_ip();
        $key = 'epr_rate_' . md5($ip);
        $bucket = get_transient($key);
        if (!is_array($bucket)) {
            $bucket = array(
                'count' => 0,
                'started' => time(),
            );
        }

        $elapsed = time() - (int) $bucket['started'];
        if ($elapsed > self::RATE_LIMIT_WINDOW) {
            $bucket = array(
                'count' => 0,
                'started' => time(),
            );
        }

        if ((int) $bucket['count'] >= self::RATE_LIMIT_MAX) {
            return new WP_Error('rate_limited', 'Too many requests. Please try again later.', array('status' => 429));
        }

        $bucket['count'] = (int) $bucket['count'] + 1;
        set_transient($key, $bucket, self::RATE_LIMIT_WINDOW);
        return true;
    }

    private function validate_file($file) {
        if (!$file || !isset($file['tmp_name']) || empty($file['tmp_name'])) {
            return true;
        }

        if (!isset($file['size']) || (int) $file['size'] > self::MAX_FILE_SIZE_BYTES) {
            return new WP_Error('invalid_file_size', 'File exceeds 15MB limit.', array('status' => 400));
        }

        $allowed_mimes = array(
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
            'application/pdf',
        );

        $detected = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
        $mime = !empty($detected['type']) ? $detected['type'] : '';

        if (!in_array($mime, $allowed_mimes, true)) {
            return new WP_Error('invalid_file_type', 'Only jpg, png, webp, mp4, and pdf files are allowed.', array('status' => 400));
        }

        return true;
    }

    private function map_request_post($post_id) {
        $attachment_id = (int) get_post_meta($post_id, 'attachment_id', true);
        return array(
            'id' => (int) $post_id,
            'title' => get_post_meta($post_id, 'product_title', true),
            'description' => get_post_meta($post_id, 'description', true),
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'status' => get_post_meta($post_id, 'status', true) ?: 'pending',
            'admin_response' => get_post_meta($post_id, 'admin_response', true),
            'media_id' => $attachment_id ?: null,
            'media_url' => $attachment_id ? wp_get_attachment_url($attachment_id) : null,
            'created_at' => get_post_field('post_date_gmt', $post_id),
            'updated_at' => get_post_field('post_modified_gmt', $post_id),
        );
    }

    private function map_contact_post($post_id) {
        return array(
            'id' => (int) $post_id,
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'subject' => get_post_meta($post_id, 'subject', true),
            'message' => get_post_meta($post_id, 'message', true),
            'status' => get_post_meta($post_id, 'status', true) ?: 'new',
            'admin_note' => get_post_meta($post_id, 'admin_note', true),
            'created_at' => get_post_field('post_date_gmt', $post_id),
            'updated_at' => get_post_field('post_modified_gmt', $post_id),
        );
    }

    private function notify_admins_in_app($notification_type, $title, $message, $action_url, $metadata = array(), $priority = 'normal') {
        if (!class_exists('ADA_Notifications')) {
            return;
        }

        ADA_Notifications::notify_admins(
            $notification_type,
            $title,
            $message,
            $action_url,
            $metadata,
            $priority
        );
    }

    public function create_product_request(WP_REST_Request $request) {
        $rate = $this->enforce_rate_limit();
        if (is_wp_error($rate)) {
            return $rate;
        }

        $title = sanitize_text_field((string) $request->get_param('product_title'));
        $description = wp_kses_post((string) $request->get_param('description'));
        $name = sanitize_text_field((string) $request->get_param('name'));
        $email = sanitize_email((string) $request->get_param('email'));

        if ($title === '' || $description === '' || $name === '' || !is_email($email)) {
            return new WP_Error('invalid_input', 'Missing or invalid product request fields.', array('status' => 400));
        }

        $attachment_id = 0;
        $files = $request->get_file_params();
        if (isset($files['reference_file'])) {
            $validation = $this->validate_file($files['reference_file']);
            if (is_wp_error($validation)) {
                return $validation;
            }

            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';

            $attachment_id = media_handle_upload('reference_file', 0);
            if (is_wp_error($attachment_id)) {
                return new WP_Error('upload_failed', 'File upload failed.', array('status' => 400));
            }
        }

        $post_id = wp_insert_post(
            array(
                'post_type' => self::POST_TYPE,
                'post_status' => 'publish',
                'post_title' => $title,
            ),
            true
        );

        if (is_wp_error($post_id)) {
            return new WP_Error('request_create_failed', 'Unable to create request.', array('status' => 500));
        }

        update_post_meta($post_id, 'product_title', $title);
        update_post_meta($post_id, 'description', $description);
        update_post_meta($post_id, 'name', $name);
        update_post_meta($post_id, 'email', $email);
        update_post_meta($post_id, 'status', 'pending');
        if ($attachment_id) {
            update_post_meta($post_id, 'attachment_id', (int) $attachment_id);
        }

        $this->notify_admins_in_app(
            'product_request',
            'New Product Request',
            sprintf('%s requested: %s', $name, $title),
            '/admin?view=product-requests&id=' . (int) $post_id,
            array('request_id' => (int) $post_id, 'email' => $email),
            'high'
        );

        return new WP_REST_Response($this->map_request_post($post_id), 201);
    }

    public function list_product_requests(WP_REST_Request $request) {
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $status = sanitize_text_field((string) $request->get_param('status'));
        $search = sanitize_text_field((string) $request->get_param('search'));

        $query_args = array(
            'post_type' => self::POST_TYPE,
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            's' => $search,
            'orderby' => 'date',
            'order' => 'DESC',
        );

        if ($status !== '') {
            $query_args['meta_query'] = array(
                array(
                    'key' => 'status',
                    'value' => $status,
                    'compare' => '=',
                ),
            );
        }

        $query = new WP_Query($query_args);
        $items = array();

        foreach ($query->posts as $post) {
            $items[] = $this->map_request_post($post->ID);
        }

        return new WP_REST_Response(
            array(
                'items' => $items,
                'page' => $page,
                'per_page' => $per_page,
                'total' => (int) $query->found_posts,
                'total_pages' => (int) $query->max_num_pages,
            ),
            200
        );
    }

    public function get_product_request(WP_REST_Request $request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (!$post || $post->post_type !== self::POST_TYPE) {
            return new WP_Error('not_found', 'Product request not found.', array('status' => 404));
        }

        return new WP_REST_Response($this->map_request_post($id), 200);
    }

    public function update_product_request(WP_REST_Request $request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (!$post || $post->post_type !== self::POST_TYPE) {
            return new WP_Error('not_found', 'Product request not found.', array('status' => 404));
        }

        $previous_status = get_post_meta($id, 'status', true);
        $previous_response = get_post_meta($id, 'admin_response', true);

        $allowed_status = array('pending', 'sourcing', 'closed');
        $status = sanitize_text_field((string) $request->get_param('status'));
        $admin_response = sanitize_textarea_field((string) $request->get_param('admin_response'));

        if ($status !== '' && !in_array($status, $allowed_status, true)) {
            return new WP_Error('invalid_status', 'Invalid status value.', array('status' => 400));
        }

        if ($status !== '') {
            update_post_meta($id, 'status', $status);
        }

        if ($admin_response !== '') {
            update_post_meta($id, 'admin_response', $admin_response);
        }

        $current_status = $status !== '' ? $status : $previous_status;
        $status_changed = $status !== '' && $status !== $previous_status;
        $response_changed = $admin_response !== '' && $admin_response !== $previous_response;

        if ($status_changed || $response_changed) {
            $recipient = get_post_meta($id, 'email', true);
            if (is_email($recipient)) {
                $name = get_post_meta($id, 'name', true);
                $product_title = get_post_meta($id, 'product_title', true);
                $site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);

                $subject_parts = array();
                if (!empty($product_title)) {
                    $subject_parts[] = $product_title;
                }
                $subject_parts[] = 'Product Request Update';
                $subject = sprintf('[%s] %s', $site_name, implode(' - ', $subject_parts));

                $lines = array();
                if (!empty($name)) {
                    $lines[] = sprintf('Hi %s,', $name);
                    $lines[] = '';
                }

                if ($status_changed) {
                    $lines[] = sprintf('Your request status is now: %s', $current_status ?: 'pending');
                    $lines[] = '';
                }

                if ($response_changed) {
                    $lines[] = 'Message from our team:';
                    $lines[] = wpautop(wp_kses_post($admin_response));
                    $lines[] = '';
                }

                $lines[] = 'Thank you for reaching out to us.';
                $message = implode("\n", $lines);

                wp_mail(
                    $recipient,
                    $subject,
                    $message,
                    array('Content-Type: text/html; charset=UTF-8')
                );
            }
        }

        return new WP_REST_Response($this->map_request_post($id), 200);
    }

    public function create_contact_submission(WP_REST_Request $request) {
        $this->contact_debug_log('create_start', array(
            'has_name' => (string) $request->get_param('name') !== '',
            'has_email' => (string) $request->get_param('email') !== '',
            'has_subject' => (string) $request->get_param('subject') !== '',
            'has_message' => (string) $request->get_param('message') !== '',
        ));

        $rate = $this->enforce_rate_limit();
        if (is_wp_error($rate)) {
            $this->contact_debug_log('create_rate_limited');
            return $rate;
        }

        $name = sanitize_text_field((string) $request->get_param('name'));
        $email = sanitize_email((string) $request->get_param('email'));
        $subject = sanitize_text_field((string) $request->get_param('subject'));
        $message = sanitize_textarea_field((string) $request->get_param('message'));

        if ($name === '' || !is_email($email) || $subject === '' || $message === '') {
            $this->contact_debug_log('create_invalid_input', array(
                'name' => $name !== '',
                'email_valid' => is_email($email),
                'subject' => $subject !== '',
                'message' => $message !== '',
            ));
            return new WP_Error('invalid_input', 'Missing or invalid contact fields.', array('status' => 400));
        }

        $post_id = wp_insert_post(
            array(
                'post_type' => self::CONTACT_POST_TYPE,
                'post_status' => 'publish',
                'post_title' => $subject,
            ),
            true
        );

        if (is_wp_error($post_id)) {
            $this->contact_debug_log('create_insert_failed', array(
                'error' => $post_id->get_error_message(),
            ));
            return new WP_Error('contact_create_failed', 'Unable to submit contact message.', array('status' => 500));
        }

        update_post_meta($post_id, 'name', $name);
        update_post_meta($post_id, 'email', $email);
        update_post_meta($post_id, 'subject', $subject);
        update_post_meta($post_id, 'message', $message);
        update_post_meta($post_id, 'status', 'new');

        $this->notify_admins_in_app(
            'contact_submission',
            'New Contact Submission',
            sprintf('%s sent: %s', $name, $subject),
            '/admin?view=contact-submissions&id=' . (int) $post_id,
            array('submission_id' => (int) $post_id, 'email' => $email),
            'normal'
        );

        $this->contact_debug_log('create_success', array('id' => (int) $post_id));
        return new WP_REST_Response($this->map_contact_post($post_id), 201);
    }

    public function list_contact_submissions(WP_REST_Request $request) {
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $status = sanitize_text_field((string) $request->get_param('status'));
        $search = sanitize_text_field((string) $request->get_param('search'));

        $this->contact_debug_log('list_start', array(
            'page' => $page,
            'per_page' => $per_page,
            'status' => $status,
            'search' => $search,
            'can_edit_posts' => current_user_can('edit_posts'),
        ));

        $query_args = array(
            'post_type' => self::CONTACT_POST_TYPE,
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'paged' => $page,
            's' => $search,
            'orderby' => 'date',
            'order' => 'DESC',
        );

        if ($status !== '') {
            $query_args['meta_query'] = array(
                array(
                    'key' => 'status',
                    'value' => $status,
                    'compare' => '=',
                ),
            );
        }

        $query = new WP_Query($query_args);
        $items = array();

        foreach ($query->posts as $post) {
            $items[] = $this->map_contact_post($post->ID);
        }

        $this->contact_debug_log('list_success', array(
            'found' => (int) $query->found_posts,
            'returned' => count($items),
        ));

        return new WP_REST_Response(
            array(
                'items' => $items,
                'page' => $page,
                'per_page' => $per_page,
                'total' => (int) $query->found_posts,
                'total_pages' => (int) $query->max_num_pages,
            ),
            200
        );
    }

    public function get_contact_submission(WP_REST_Request $request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        $this->contact_debug_log('get_start', array(
            'id' => $id,
            'post_exists' => (bool) $post,
            'post_type' => $post ? $post->post_type : null,
        ));

        if (!$post || $post->post_type !== self::CONTACT_POST_TYPE) {
            $this->contact_debug_log('get_not_found', array('id' => $id));
            return new WP_Error('not_found', 'Contact submission not found.', array('status' => 404));
        }

        $this->contact_debug_log('get_success', array('id' => $id));
        return new WP_REST_Response($this->map_contact_post($id), 200);
    }

    public function update_contact_submission(WP_REST_Request $request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        $this->contact_debug_log('update_start', array(
            'id' => $id,
            'post_exists' => (bool) $post,
            'post_type' => $post ? $post->post_type : null,
        ));

        if (!$post || $post->post_type !== self::CONTACT_POST_TYPE) {
            $this->contact_debug_log('update_not_found', array('id' => $id));
            return new WP_Error('not_found', 'Contact submission not found.', array('status' => 404));
        }

        $allowed_status = array('new', 'in_progress', 'resolved');
        $status = sanitize_text_field((string) $request->get_param('status'));
        $admin_note = sanitize_textarea_field((string) $request->get_param('admin_note'));

        if ($status !== '' && !in_array($status, $allowed_status, true)) {
            $this->contact_debug_log('update_invalid_status', array(
                'id' => $id,
                'status' => $status,
            ));
            return new WP_Error('invalid_status', 'Invalid status value.', array('status' => 400));
        }

        if ($status !== '') {
            update_post_meta($id, 'status', $status);
        }

        if ($admin_note !== '') {
            update_post_meta($id, 'admin_note', $admin_note);
        }

        $this->contact_debug_log('update_success', array(
            'id' => $id,
            'status' => $status,
            'has_admin_note' => $admin_note !== '',
        ));
        return new WP_REST_Response($this->map_contact_post($id), 200);
    }
}

// Bootstrap existing product requests plugin
new EPR_Product_Requests_Plugin();

// Load Ebem headless modules
require_once __DIR__ . '/inc/cors.php';
require_once __DIR__ . '/inc/jwt.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/paystack.php';
require_once __DIR__ . '/inc/settings.php';
