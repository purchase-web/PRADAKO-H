<?php
declare(strict_types=1);

return [
    // File limits: keep these aligned with the `limits` object in collaboration.html.
    'max_files' => 8,
    'max_file_bytes' => 10 * 1024 * 1024,
    'max_total_bytes' => 30 * 1024 * 1024,

    // Keep submission data outside the public web root when your hosting permits it.
    // Example: '/home/ACCOUNT/private/pradako-collaboration'
    'storage_path' => dirname(__DIR__) . '/storage',

    'notification_email' => 'info@pradakomechanicals.com',
    'from_email' => 'website@pradakomechanicals.com',
    'from_name' => 'Pradako Website',

    // Add the exact production domains that are permitted to post to this endpoint.
    'allowed_origins' => [
        'https://pradako.co',
        'https://www.pradako.co',
        'https://pradakogroup.com',
        'https://www.pradakogroup.com',
    ],

    'minimum_form_seconds' => 2,
    'rate_limit_submissions' => 5,
    'rate_limit_window_seconds' => 3600,
];
