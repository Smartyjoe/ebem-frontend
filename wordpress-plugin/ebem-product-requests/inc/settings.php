<?php
/**
 * Ebem Global – Plugin Settings Page
 * Adds an admin menu page under Settings > Ebem Global
 * where you can manage Paystack test/live keys and toggle modes.
 */

if (!defined('ABSPATH')) { exit; }

add_action('admin_menu', function() {
    add_options_page(
        'Ebem Global Settings',
        'Ebem Global',
        'manage_options',
        'ebem-global-settings',
        'ebem_settings_page_render'
    );
});

add_action('admin_init', function() {
    register_setting('ebem_paystack_settings_group', 'ebem_paystack_settings', [
        'sanitize_callback' => 'ebem_sanitize_paystack_settings',
    ]);
});

function ebem_sanitize_paystack_settings($input): array {
    $clean = [];
    $clean['test_mode']        = !empty($input['test_mode']) ? 1 : 0;
    $clean['test_public_key']  = sanitize_text_field($input['test_public_key']  ?? '');
    $clean['test_secret_key']  = sanitize_text_field($input['test_secret_key']  ?? '');
    $clean['live_public_key']  = sanitize_text_field($input['live_public_key']  ?? '');
    $clean['live_secret_key']  = sanitize_text_field($input['live_secret_key']  ?? '');
    return $clean;
}

function ebem_settings_page_render() {
    if (!current_user_can('manage_options')) { return; }
    $opts     = get_option('ebem_paystack_settings', []);
    $testmode = !empty($opts['test_mode']);
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:24px;">⚡</span> Ebem Global Settings
        </h1>
        <hr class="wp-header-end">

        <?php settings_errors(); ?>

        <form method="post" action="options.php">
            <?php settings_fields('ebem_paystack_settings_group'); ?>

            <div style="max-width:680px;margin-top:24px;">

                <!-- Paystack Card -->
                <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 32px;margin-bottom:24px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
                    <h2 style="margin-top:0;font-size:18px;display:flex;align-items:center;gap:8px;">
                        <img src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png"
                             style="width:22px;height:22px;background:#00C3F7;border-radius:4px;padding:2px;" alt="">
                        Paystack Configuration
                    </h2>
                    <p style="color:#6b7280;font-size:13px;margin-top:-4px;">
                        Keys are stored securely in the WordPress database. The active key set is determined by Test Mode.
                    </p>

                    <!-- Test Mode Toggle -->
                    <table class="form-table" style="margin-top:0;">
                        <tr>
                            <th scope="row" style="padding-left:0;">Test Mode</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="ebem_paystack_settings[test_mode]" value="1" <?php checked($testmode); ?> />
                                    Enable Test Mode (use test keys)
                                </label>
                                <p class="description">
                                    <?php if($testmode): ?>
                                        <span style="color:#d97706;font-weight:600;">⚠ Test mode is ON. No real payments will be processed.</span>
                                    <?php else: ?>
                                        <span style="color:#16a34a;font-weight:600;">✔ Live mode is active. Real payments will be processed.</span>
                                    <?php endif; ?>
                                </p>
                            </td>
                        </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="margin:20px 0;border:none;border-top:1px solid #f3f4f6;">

                    <h3 style="font-size:15px;margin-bottom:12px;color:#374151;">🧪 Test Keys</h3>
                    <table class="form-table" style="margin-top:0;">
                        <tr>
                            <th scope="row" style="padding-left:0;">Test Public Key</th>
                            <td>
                                <input type="text" name="ebem_paystack_settings[test_public_key]"
                                       value="<?php echo esc_attr($opts['test_public_key'] ?? ''); ?>"
                                       class="regular-text" placeholder="pk_test_..." />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="padding-left:0;">Test Secret Key</th>
                            <td>
                                <input type="password" name="ebem_paystack_settings[test_secret_key]"
                                       value="<?php echo esc_attr($opts['test_secret_key'] ?? ''); ?>"
                                       class="regular-text" placeholder="sk_test_..." />
                                <p class="description">Stored encrypted. Never exposed to the frontend.</p>
                            </td>
                        </tr>
                    </table>

                    <hr style="margin:20px 0;border:none;border-top:1px solid #f3f4f6;">

                    <h3 style="font-size:15px;margin-bottom:12px;color:#374151;">🚀 Live Keys</h3>
                    <table class="form-table" style="margin-top:0;">
                        <tr>
                            <th scope="row" style="padding-left:0;">Live Public Key</th>
                            <td>
                                <input type="text" name="ebem_paystack_settings[live_public_key]"
                                       value="<?php echo esc_attr($opts['live_public_key'] ?? ''); ?>"
                                       class="regular-text" placeholder="pk_live_..." />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="padding-left:0;">Live Secret Key</th>
                            <td>
                                <input type="password" name="ebem_paystack_settings[live_secret_key]"
                                       value="<?php echo esc_attr($opts['live_secret_key'] ?? ''); ?>"
                                       class="regular-text" placeholder="sk_live_..." />
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Webhook Info Card -->
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                    <h3 style="margin-top:0;font-size:15px;color:#15803d;">🔗 Webhook URL</h3>
                    <p style="font-size:13px;color:#166534;margin-bottom:8px;">
                        Add this URL in your <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" style="color:#15803d;">Paystack dashboard</a> under Webhooks:
                    </p>
                    <code style="display:block;background:#dcfce7;padding:10px 14px;border-radius:8px;font-size:13px;word-break:break-all;">
                        <?php echo esc_url(get_site_url()); ?>/wp-json/custom/v1/paystack/webhook
                    </code>
                </div>

                <?php submit_button('Save Settings', 'primary', 'submit', true, ['style' => 'margin-top:8px;']); ?>
            </div>
        </form>
    </div>
    <?php
}
