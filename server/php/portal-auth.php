<?php

declare(strict_types=1);

/* =========================================================
   PRADAKO PORTAL LOGIN AUTHENTICATION
========================================================= */

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

$isHttps =
    isset($_SERVER['HTTPS']) &&
    $_SERVER['HTTPS'] !== '' &&
    $_SERVER['HTTPS'] !== 'off';

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function portalAuthResponse(
    bool $success,
    string $message,
    int $statusCode = 200,
    array $additionalData = []
): never {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $additionalData
        ),
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   METHOD VALIDATION
========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    portalAuthResponse(
        false,
        'Only POST requests are allowed.',
        405
    );
}

/* =========================================================
   LOGIN ATTEMPT LIMIT
========================================================= */

$currentTime = time();

$loginSecurity =
    $_SESSION['pradako_login_security'] ??
    [
        'failed_attempts' => 0,
        'locked_until' => 0
    ];

$lockedUntil =
    (int)($loginSecurity['locked_until'] ?? 0);

if ($lockedUntil > $currentTime) {
    $secondsRemaining =
        $lockedUntil - $currentTime;

    portalAuthResponse(
        false,
        'Too many unsuccessful attempts. Please wait ' .
        $secondsRemaining .
        ' seconds and try again.',
        429
    );
}

/* =========================================================
   READ REQUEST
========================================================= */

$rawInput = file_get_contents('php://input');

if (
    $rawInput === false ||
    trim($rawInput) === ''
) {
    portalAuthResponse(
        false,
        'No login information was received.',
        400
    );
}

$data = json_decode(
    $rawInput,
    true
);

if (
    json_last_error() !== JSON_ERROR_NONE ||
    !is_array($data)
) {
    portalAuthResponse(
        false,
        'Invalid login request.',
        400
    );
}

/* =========================================================
   NORMALISE INPUT
========================================================= */

$role = strtolower(
    trim((string)($data['role'] ?? ''))
);

$portalId = strtoupper(
    trim((string)($data['portalId'] ?? ''))
);

$password =
    (string)($data['password'] ?? '');

$portalId =
    preg_replace(
        '/[^A-Z0-9\-_]/',
        '',
        $portalId
    ) ?? '';

/* =========================================================
   BASIC VALIDATION
========================================================= */

$allowedRoles = [
    'employees',
    'client',
    'supplier',
    'agent',
    'distributor',
    'dealer'
];

if (
    !in_array($role, $allowedRoles, true) ||
    $portalId === '' ||
    strlen($portalId) > 80 ||
    $password === '' ||
    strlen($password) > 200
) {
    portalAuthResponse(
        false,
        'Please use the ID and password shared with you by Pradako.',
        401
    );
}

/* =========================================================
   LOAD APPROVED USERS
========================================================= */

$userFile =
    __DIR__ . '/portal-users.php';

if (!is_file($userFile)) {
    error_log(
        'Pradako portal user file was not found: ' .
        $userFile
    );

    portalAuthResponse(
        false,
        'The portal login service is not configured.',
        500
    );
}

$approvedUsers = require $userFile;

if (!is_array($approvedUsers)) {
    portalAuthResponse(
        false,
        'The portal login configuration is invalid.',
        500
    );
}

/* =========================================================
   VERIFY USER

   A dummy hash is used when the ID does not exist so the
   response timing remains more consistent.
========================================================= */

$dummyPasswordHash =
    '$2y$12$1qHrLJTv0cX/QULkqvfZSerKXZbQ2HcZP8lj.TCwB1RBgrvxfcltm';

$user =
    $approvedUsers[$portalId] ?? null;

$passwordHash =
    is_array($user) &&
    isset($user['password_hash'])
        ? (string)$user['password_hash']
        : $dummyPasswordHash;

$passwordMatches =
    password_verify(
        $password,
        $passwordHash
    );

$userExists =
    is_array($user);

$roleMatches =
    $userExists &&
    isset($user['role']) &&
    hash_equals(
        (string)$user['role'],
        $role
    );

$userIsActive =
    $userExists &&
    (($user['active'] ?? false) === true);

$loginIsValid =
    $userExists &&
    $roleMatches &&
    $userIsActive &&
    $passwordMatches;

/* =========================================================
   INVALID LOGIN
========================================================= */

if (!$loginIsValid) {
    $failedAttempts =
        (int)($loginSecurity['failed_attempts'] ?? 0);

    $failedAttempts += 1;

    if ($failedAttempts >= 5) {
        $_SESSION['pradako_login_security'] = [
            'failed_attempts' => 0,
            'locked_until' => $currentTime + 60
        ];

        portalAuthResponse(
            false,
            'Too many unsuccessful attempts. Please wait 60 seconds and try again.',
            429
        );
    }

    $_SESSION['pradako_login_security'] = [
        'failed_attempts' => $failedAttempts,
        'locked_until' => 0
    ];

    portalAuthResponse(
        false,
        'Please use the exact ID and password shared with you by the Pradako portal team.',
        401
    );
}

/* =========================================================
   SUCCESSFUL LOGIN
========================================================= */

session_regenerate_id(true);

$_SESSION['pradako_portal_authenticated'] = true;
$_SESSION['pradako_portal_id'] = $portalId;
$_SESSION['pradako_portal_role'] = $role;
$_SESSION['pradako_portal_login_time'] = $currentTime;

$_SESSION['pradako_login_security'] = [
    'failed_attempts' => 0,
    'locked_until' => 0
];

$redirectUrl =
    isset($user['redirect']) &&
    is_string($user['redirect']) &&
    str_starts_with($user['redirect'], '/')
        ? $user['redirect']
        : '/index.html';

portalAuthResponse(
    true,
    'Login successful.',
    200,
    [
        'redirect' => $redirectUrl,
        'role' => $role
    ]
);