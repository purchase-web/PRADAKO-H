<?php
declare(strict_types=1);

/*
 * PMEW Strategic Collaboration backend configuration.
 *
 * IMPORTANT:
 * - This file is intentionally outside public/.
 * - Do not hard-code the final website domain here.
 * - Optional extra allowed origins may be supplied with:
 *     PMEW_ALLOWED_ORIGINS=https://staging.example.com,https://api.example.com
 */

$extraOrigins = array_values(array_filter(array_map(
    static fn(string $origin): string => rtrim(trim($origin), '/'),
    explode(',', (string) (getenv('PMEW_ALLOWED_ORIGINS') ?: ''))
)));

return [
    // Keep these aligned with the `limits` object in collaboration.html.
    'max_files' => 8,
    'max_file_bytes' => 10 * 1024 * 1024,
    'max_total_bytes' => 30 * 1024 * 1024,

    // Private storage: PRADAKO-H/storage/collaboration
    'storage_path' => dirname(__DIR__, 2) . '/storage/collaboration',

    'notification_email' => getenv('PMEW_COLLAB_NOTIFICATION_EMAIL') ?: 'info@pradakomechanicals.com',
    'from_email' => getenv('PMEW_WEBSITE_FROM_EMAIL') ?: 'website@pradakomechanicals.com',
    'from_name' => 'Pradako Website',

    // Same-origin submissions work on local/staging/final domains without hard-coding a domain.
    'allow_same_origin' => true,

    // Add only deliberate cross-origin clients through PMEW_ALLOWED_ORIGINS.
    'allowed_origins' => $extraOrigins,

    'minimum_form_seconds' => 2,
    'rate_limit_submissions' => 5,
    'rate_limit_window_seconds' => 3600,
];
