<?php

declare(strict_types=1);

/* =========================================================
   PRADAKO PORTAL REQUEST SMTP HANDLER
========================================================= */

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

/* =========================================================
   SESSION
========================================================= */

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/* =========================================================
   RESPONSE FUNCTION
========================================================= */

function respond(
    bool $success,
    string $message,
    int $statusCode = 200,
    array $extra = []
): void {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $extra
        ),
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* =========================================================
   TEXT LENGTH HELPER
========================================================= */

function portalTextLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

/* =========================================================
   HTML ESCAPE HELPER
========================================================= */

function portalEscape(string $value): string
{
    return htmlspecialchars(
        $value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
}

/* =========================================================
   METHOD CHECK
========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(
        false,
        'Only POST requests are permitted.',
        405
    );
}

/* =========================================================
   FILE LOCATIONS
========================================================= */

/*
 * Expected structure:
 *
 * public_html/
 * ├── portal-login.html
 * ├── portal-request.php
 * ├── portal-mail-config.php
 * ├── composer.json
 * └── vendor/
 *
 * If portal-mail-config.php is placed somewhere else,
 * change the path below.
 */

$autoloadPath = __DIR__ . '/vendor/autoload.php';
$configPath = __DIR__ . '/portal-mail-config.php';

if (!is_file($autoloadPath)) {
    error_log(
        'Pradako portal: PHPMailer autoload file not found at ' .
        $autoloadPath
    );

    respond(
        false,
        'The email service has not been installed on the server. Please contact the administrator.',
        500
    );
}

if (!is_file($configPath)) {
    error_log(
        'Pradako portal: mail configuration not found at ' .
        $configPath
    );

    respond(
        false,
        'The email service has not been configured. Please contact the administrator.',
        500
    );
}

require_once $autoloadPath;

$config = require $configPath;

if (!is_array($config)) {
    respond(
        false,
        'The email service configuration is invalid.',
        500
    );
}

/* =========================================================
   CONFIGURATION VALIDATION
========================================================= */

$requiredConfigKeys = [
    'host',
    'port',
    'encryption',
    'username',
    'password',
    'from_email',
    'from_name',
    'admin_email',
    'admin_name'
];

foreach ($requiredConfigKeys as $requiredKey) {
    if (
        !array_key_exists($requiredKey, $config) ||
        trim((string)$config[$requiredKey]) === ''
    ) {
        error_log(
            'Pradako portal: missing SMTP configuration value: ' .
            $requiredKey
        );

        respond(
            false,
            'The email service is not fully configured. Please contact the administrator.',
            500
        );
    }
}

if (
    $config['password'] === 'YOUR_EMAIL_PASSWORD_HERE'
) {
    error_log(
        'Pradako portal: SMTP password has not been configured.'
    );

    respond(
        false,
        'The email account password has not been configured on the server.',
        500
    );
}

/* =========================================================
   RATE LIMIT
========================================================= */

$currentTime = time();

$lastRequestTime =
    isset($_SESSION['pradako_portal_last_request'])
        ? (int)$_SESSION['pradako_portal_last_request']
        : 0;

if (
    $lastRequestTime > 0 &&
    ($currentTime - $lastRequestTime) < 45
) {
    respond(
        false,
        'Please wait 45 seconds before submitting another request.',
        429
    );
}

/* =========================================================
   REQUEST SIZE
========================================================= */

$contentLength =
    isset($_SERVER['CONTENT_LENGTH'])
        ? (int)$_SERVER['CONTENT_LENGTH']
        : 0;

if ($contentLength > 20000) {
    respond(
        false,
        'The submitted request is too large.',
        413
    );
}

/* =========================================================
   READ JSON DATA
========================================================= */

$rawInput = file_get_contents('php://input');

if (
    $rawInput === false ||
    trim($rawInput) === ''
) {
    respond(
        false,
        'No request information was received.',
        400
    );
}

$data = json_decode($rawInput, true);

if (
    json_last_error() !== JSON_ERROR_NONE ||
    !is_array($data)
) {
    respond(
        false,
        'The submitted request format is invalid.',
        400
    );
}

/* =========================================================
   HONEYPOT
========================================================= */

$website = trim(
    (string)($data['website'] ?? '')
);

if ($website !== '') {
    /*
     * Do not notify bots that the honeypot caught them.
     */

    respond(
        true,
        'Request accepted.',
        200,
        [
            'reference' => 'PMEW-REQ-PENDING',
            'confirmationEmailSent' => false
        ]
    );
}

/* =========================================================
   NORMALISE DATA
========================================================= */

$fullName = trim(
    (string)($data['fullName'] ?? '')
);

$company = trim(
    (string)($data['company'] ?? '')
);

$email = trim(
    (string)($data['email'] ?? '')
);

$phone = trim(
    (string)($data['phone'] ?? '')
);

$role = trim(
    (string)($data['role'] ?? '')
);

$reason = trim(
    (string)($data['reason'] ?? '')
);

/*
 * Remove control characters from single-line values.
 */

$fullName =
    preg_replace('/[\x00-\x1F\x7F]/u', '', $fullName)
    ?? '';

$company =
    preg_replace('/[\x00-\x1F\x7F]/u', '', $company)
    ?? '';

$email =
    preg_replace('/[\r\n\x00-\x1F\x7F]/u', '', $email)
    ?? '';

$phone =
    preg_replace('/[\x00-\x1F\x7F]/u', '', $phone)
    ?? '';

$role =
    preg_replace('/[\x00-\x1F\x7F]/u', '', $role)
    ?? '';

/* =========================================================
   VALIDATION
========================================================= */

if (
    $fullName === '' ||
    portalTextLength($fullName) > 100
) {
    respond(
        false,
        'Please enter a valid full name.',
        422
    );
}

if (
    $company === '' ||
    portalTextLength($company) > 150
) {
    respond(
        false,
        'Please enter a valid company name.',
        422
    );
}

if (
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    portalTextLength($email) > 150
) {
    respond(
        false,
        'Please enter a valid business email address.',
        422
    );
}

if (
    $phone === '' ||
    portalTextLength($phone) > 30 ||
    !preg_match('/^[0-9+\-()\s]{7,30}$/', $phone)
) {
    respond(
        false,
        'Please enter a valid contact number.',
        422
    );
}

$allowedRoles = [
    'employees' => 'Employees',
    'client' => 'Client',
    'supplier' => 'Supplier',
    'agent' => 'Agent',
    'distributor' => 'Distributor',
    'dealer' => 'Dealer'
];

if (!array_key_exists($role, $allowedRoles)) {
    respond(
        false,
        'Please select a valid portal category.',
        422
    );
}

if (portalTextLength($reason) > 1000) {
    respond(
        false,
        'The reason for access cannot exceed 1,000 characters.',
        422
    );
}

if ($reason === '') {
    $reason = 'No additional reason was provided.';
}

/* =========================================================
   REQUEST REFERENCE
========================================================= */

try {
    $randomNumber = random_int(1000, 9999);
} catch (Throwable $throwable) {
    $randomNumber = mt_rand(1000, 9999);
}

$requestReference =
    'PMEW-REQ-' .
    date('ymd') .
    '-' .
    $randomNumber;

$portalName = $allowedRoles[$role];

$submittedAt = date(
    'd F Y, h:i A'
);

$ipAddress =
    $_SERVER['REMOTE_ADDR'] ?? 'Unavailable';

$userAgent =
    $_SERVER['HTTP_USER_AGENT'] ?? 'Unavailable';

/* =========================================================
   PHPMailer FACTORY
========================================================= */

function createPortalMailer(array $config): PHPMailer
{
    $mailer = new PHPMailer(true);

    $mailer->isSMTP();

    $mailer->Host =
        (string)$config['host'];

    $mailer->SMTPAuth = true;

    $mailer->Username =
        (string)$config['username'];

    $mailer->Password =
        (string)$config['password'];

    $mailer->Port =
        (int)$config['port'];

    $encryption = strtolower(
        trim((string)$config['encryption'])
    );

    if ($encryption === 'ssl') {
        $mailer->SMTPSecure =
            PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($encryption === 'tls') {
        $mailer->SMTPSecure =
            PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mailer->SMTPAutoTLS = false;
    }

    $mailer->CharSet = 'UTF-8';

    $mailer->Encoding = 'base64';

    $mailer->Timeout = 25;

    $mailer->SMTPDebug = 0;

    $mailer->setFrom(
        (string)$config['from_email'],
        (string)$config['from_name']
    );

    return $mailer;
}

/* =========================================================
   ESCAPED EMAIL VALUES
========================================================= */

$safeReference = portalEscape(
    $requestReference
);

$safePortalName = portalEscape(
    $portalName
);

$safeFullName = portalEscape(
    $fullName
);

$safeCompany = portalEscape(
    $company
);

$safeEmail = portalEscape(
    $email
);

$safePhone = portalEscape(
    $phone
);

$safeReason = nl2br(
    portalEscape($reason)
);

$safeSubmittedAt = portalEscape(
    $submittedAt
);

$safeIpAddress = portalEscape(
    $ipAddress
);

$safeUserAgent = portalEscape(
    $userAgent
);

/* =========================================================
   ADMINISTRATOR EMAIL
========================================================= */

$adminSubject =
    'Portal Access Request - ' .
    $portalName .
    ' - ' .
    $requestReference;

$adminHtmlBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{$adminSubject}</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#17243a;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:30px 15px;">
    <tr>
        <td align="center">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe6ef;border-radius:18px;overflow:hidden;">

                <tr>
                    <td style="padding:28px 30px;background:#356ed7;color:#ffffff;">
                        <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                            Pradako Portal
                        </div>

                        <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">
                            New portal access request
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding:30px;">

                        <p style="margin:0 0 20px;color:#566274;font-size:14px;line-height:1.7;">
                            A visitor has submitted a request for a Pradako portal ID and password.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;width:38%;">
                                    Request reference
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;font-weight:700;">
                                    {$safeReference}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Required portal
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safePortalName}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Full name
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safeFullName}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Company
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safeCompany}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Business email
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safeEmail}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Contact number
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safePhone}
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;color:#778496;font-size:13px;">
                                    Submitted
                                </td>

                                <td style="padding:11px;border-bottom:1px solid #e5eaf1;font-size:13px;">
                                    {$safeSubmittedAt}
                                </td>
                            </tr>

                        </table>

                        <div style="margin-top:22px;padding:18px;background:#f8fafe;border:1px solid #dfe6ef;border-radius:12px;">
                            <div style="margin-bottom:8px;color:#2553a8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                                Reason for access
                            </div>

                            <div style="font-size:14px;line-height:1.7;color:#566274;">
                                {$safeReason}
                            </div>
                        </div>

                        <div style="margin-top:22px;padding:18px;background:#edf8f2;border:1px solid #bfe1ce;border-radius:12px;">
                            <strong style="font-size:14px;color:#20734e;">
                                Administrator action required
                            </strong>

                            <p style="margin:7px 0 0;color:#50695d;font-size:13px;line-height:1.7;">
                                Review this request and email the approved portal ID and password directly to {$safeEmail}.
                            </p>
                        </div>

                        <div style="margin-top:24px;color:#8a94a3;font-size:11px;line-height:1.7;">
                            IP: {$safeIpAddress}<br>
                            Device: {$safeUserAgent}
                        </div>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
HTML;

$adminPlainBody = <<<TEXT
PRADAKO PORTAL ACCESS REQUEST

Request Reference: {$requestReference}
Required Portal: {$portalName}
Submitted: {$submittedAt}

APPLICANT DETAILS
Full Name: {$fullName}
Company: {$company}
Business Email: {$email}
Contact Number: {$phone}

REASON FOR ACCESS
{$reason}

ADMINISTRATOR ACTION
Review the request and send the approved portal ID and password directly to {$email}.

TECHNICAL INFORMATION
IP Address: {$ipAddress}
Device: {$userAgent}
TEXT;

/* =========================================================
   SEND ADMINISTRATOR EMAIL
========================================================= */

try {
    $adminMailer = createPortalMailer(
        $config
    );

    $adminMailer->addAddress(
        (string)$config['admin_email'],
        (string)$config['admin_name']
    );

    $adminMailer->addReplyTo(
        $email,
        $fullName
    );

    $adminMailer->isHTML(true);

    $adminMailer->Subject =
        $adminSubject;

    $adminMailer->Body =
        $adminHtmlBody;

    $adminMailer->AltBody =
        $adminPlainBody;

    $adminMailer->send();

} catch (Exception $exception) {
    error_log(
        'Pradako portal administrator email failed. ' .
        'Reference: ' . $requestReference . '. ' .
        'Error: ' . $exception->getMessage()
    );

    respond(
        false,
        'The email server could not send your request. Please verify the website SMTP settings or contact info@pradakomechanicals.com.',
        500
    );
}

/* =========================================================
   USER CONFIRMATION EMAIL
========================================================= */

$userConfirmationSent = false;

$userSubject =
    'Pradako Portal Request Received - ' .
    $requestReference;

$userHtmlBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{$userSubject}</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#17243a;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:30px 15px;">
    <tr>
        <td align="center">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe6ef;border-radius:18px;overflow:hidden;">

                <tr>
                    <td style="padding:28px 30px;background:#356ed7;color:#ffffff;">
                        <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                            Pradako Portal
                        </div>

                        <h1 style="margin:10px 0 0;font-size:25px;line-height:1.3;">
                            Your access request has been received
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding:30px;">

                        <p style="margin:0;color:#17243a;font-size:15px;line-height:1.7;">
                            Dear {$safeFullName},
                        </p>

                        <p style="margin:16px 0 0;color:#566274;font-size:14px;line-height:1.8;">
                            Your request for access to the {$safePortalName} portal has been successfully sent to the Pradako administrator team.
                        </p>

                        <div style="margin-top:22px;padding:18px;background:#edf8f2;border:1px solid #bfe1ce;border-radius:12px;">

                            <strong style="display:block;color:#20734e;font-size:15px;">
                                Please wait for your portal credentials.
                            </strong>

                            <p style="margin:7px 0 0;color:#50695d;font-size:13px;line-height:1.7;">
                                Pradako will review your request and send your portal ID and password shortly. Please check your inbox and spam folder.
                            </p>

                        </div>

                        <div style="margin-top:22px;padding:15px;background:#f8fafe;border:1px solid #dfe6ef;border-radius:12px;">

                            <div style="color:#778496;font-size:11px;text-transform:uppercase;letter-spacing:1px;">
                                Request reference
                            </div>

                            <div style="margin-top:6px;color:#2553a8;font-size:15px;font-weight:700;">
                                {$safeReference}
                            </div>

                        </div>

                        <p style="margin:22px 0 0;color:#566274;font-size:13px;line-height:1.7;">
                            If you do not receive your credentials after review, contact
                            <a href="mailto:info@pradakomechanicals.com" style="color:#2553a8;">
                                info@pradakomechanicals.com
                            </a>.
                        </p>

                        <p style="margin:24px 0 0;color:#17243a;font-size:13px;line-height:1.7;">
                            Regards,<br>
                            <strong>Pradako Portal Team</strong>
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
HTML;

$userPlainBody = <<<TEXT
Dear {$fullName},

Your request for access to the {$portalName} portal has been successfully sent to the Pradako administrator team.

REQUEST REFERENCE
{$requestReference}

Please wait for Pradako to review your request and send your portal ID and password shortly.

Please check your inbox and spam folder.

If you do not receive your credentials after review, contact:
info@pradakomechanicals.com

Regards,
Pradako Portal Team
TEXT;

try {
    $userMailer = createPortalMailer(
        $config
    );

    $userMailer->addAddress(
        $email,
        $fullName
    );

    $userMailer->isHTML(true);

    $userMailer->Subject =
        $userSubject;

    $userMailer->Body =
        $userHtmlBody;

    $userMailer->AltBody =
        $userPlainBody;

    $userMailer->send();

    $userConfirmationSent = true;

} catch (Exception $exception) {
    /*
     * The administrator already received the request.
     * Do not show the entire request as failed merely because
     * the visitor confirmation could not be delivered.
     */

    error_log(
        'Pradako portal user confirmation failed. ' .
        'Reference: ' . $requestReference . '. ' .
        'Applicant: ' . $email . '. ' .
        'Error: ' . $exception->getMessage()
    );
}

/* =========================================================
   SUCCESS
========================================================= */

$_SESSION['pradako_portal_last_request'] =
    $currentTime;

respond(
    true,
    'Your access request was emailed successfully to the Pradako administrator team.',
    200,
    [
        'reference' => $requestReference,
        'confirmationEmailSent' => $userConfirmationSent
    ]
);