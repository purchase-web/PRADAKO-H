<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$config = require dirname(__DIR__, 3) . '/server/config/collaboration.php';

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function text_field(string $key, int $max = 500): string {
    $value = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max, 'UTF-8');
}

function checked(string $key): bool {
    return isset($_POST[$key]) && $_POST[$key] === '1';
}

function flatten_uploads(array $uploads): array {
    if (!isset($uploads['name'])) return [];
    if (!is_array($uploads['name'])) return [$uploads];
    $flat = [];
    foreach ($uploads['name'] as $i => $name) {
        $flat[] = [
            'name' => $name,
            'type' => $uploads['type'][$i] ?? '',
            'tmp_name' => $uploads['tmp_name'][$i] ?? '',
            'error' => $uploads['error'][$i] ?? UPLOAD_ERR_NO_FILE,
            'size' => $uploads['size'][$i] ?? 0,
        ];
    }
    return $flat;
}

function safe_mail(string $to, string $subject, string $body, array $config, ?string $replyTo = null): bool {
    $fromName = str_replace(["\r", "\n"], '', $config['from_name']);
    $fromEmail = filter_var($config['from_email'], FILTER_VALIDATE_EMAIL) ?: '';
    if ($fromEmail === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers[] = 'Reply-To: ' . $replyTo;
    return mail($to, $subject, $body, implode("\r\n", $headers));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['success' => false, 'message' => 'Method not allowed.']);

$origin = rtrim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''), '/');

function current_request_origin(): string {
    $host = trim((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if ($host === '') return '';

    $forwardedProto = strtolower(trim((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')));
    $https = (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
        || $forwardedProto === 'https';

    return ($https ? 'https' : 'http') . '://' . $host;
}

function origin_is_allowed(string $origin, array $config): bool {
    if ($origin === '') return true;

    $allowed = array_map(
        static fn($value): string => rtrim((string) $value, '/'),
        is_array($config['allowed_origins'] ?? null) ? $config['allowed_origins'] : []
    );

    if (in_array($origin, $allowed, true)) return true;

    if (!empty($config['allow_same_origin'])) {
        $sameOrigin = rtrim(current_request_origin(), '/');
        if ($sameOrigin !== '' && hash_equals($sameOrigin, $origin)) return true;
    }

    return false;
}

if (!origin_is_allowed($origin, $config)) {
    respond(403, ['success' => false, 'message' => 'This submission source is not permitted.']);
}
if (text_field('website_confirm', 20) !== '') respond(400, ['success' => false, 'message' => 'Submission rejected.']);

$startedMs = filter_input(INPUT_POST, 'form_started_at', FILTER_VALIDATE_INT);
$elapsed = $startedMs ? (int) floor((microtime(true) * 1000 - $startedMs) / 1000) : 0;
if ($elapsed < (int) $config['minimum_form_seconds']) respond(429, ['success' => false, 'message' => 'Please wait a moment and submit again.']);

$storage = rtrim((string) $config['storage_path'], DIRECTORY_SEPARATOR);
$rateDir = $storage . '/rate-limits';
$submissionDir = $storage . '/submissions';
foreach ([$storage, $rateDir, $submissionDir] as $dir) {
    if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) respond(500, ['success' => false, 'message' => 'Server storage is not available.']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = $rateDir . '/' . hash('sha256', $ip) . '.json';
$now = time();
$attempts = [];
if (is_file($rateFile)) {
    $decoded = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($decoded)) $attempts = $decoded;
}
$attempts = array_values(array_filter($attempts, fn($stamp) => is_int($stamp) && $stamp > $now - (int) $config['rate_limit_window_seconds']));
if (count($attempts) >= (int) $config['rate_limit_submissions']) respond(429, ['success' => false, 'message' => 'Too many submissions. Please try again later.']);

$data = [
    'full_name' => text_field('full_name', 120), 'designation' => text_field('designation', 120),
    'company' => text_field('company', 160), 'website' => text_field('website', 240),
    'country' => text_field('country', 100), 'business_email' => text_field('business_email', 190),
    'contact_number' => text_field('contact_number', 50), 'partnership_category' => text_field('partnership_category', 160),
    'industry' => text_field('industry', 120), 'product_category' => text_field('product_category', 200),
    'annual_requirement' => text_field('annual_requirement', 120), 'target_market' => text_field('target_market', 160),
    'project_stage' => text_field('project_stage', 120), 'timeline' => text_field('timeline', 160),
    'requirement_summary' => text_field('requirement_summary', 5000), 'required_standards' => text_field('required_standards', 500),
    'required_materials' => text_field('required_materials', 500), 'coating' => text_field('coating', 500),
    'nda_required' => checked('nda_required'), 'private_label' => checked('private_label'),
    'customer_tooling' => checked('customer_tooling'), 'physical_sample' => checked('physical_sample'),
];

foreach (['full_name','company','country','business_email','partnership_category','industry','requirement_summary'] as $required) {
    if ($data[$required] === '') respond(422, ['success' => false, 'message' => 'Please complete all required fields.']);
}
if (!filter_var($data['business_email'], FILTER_VALIDATE_EMAIL)) respond(422, ['success' => false, 'message' => 'Enter a valid business email address.']);
if ($data['website'] !== '' && !filter_var($data['website'], FILTER_VALIDATE_URL)) respond(422, ['success' => false, 'message' => 'Enter a complete website URL beginning with https://.']);
if (!checked('consent')) respond(422, ['success' => false, 'message' => 'Consent is required before submission.']);

$allowed = [
    'pdf' => ['application/pdf'],
    'jpg' => ['image/jpeg'], 'jpeg' => ['image/jpeg'], 'png' => ['image/png'],
    'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
    'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
    'zip' => ['application/zip', 'application/x-zip-compressed'],
];
$uploads = flatten_uploads($_FILES['attachments'] ?? []);
$uploads = array_values(array_filter($uploads, fn($file) => ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE));
if (count($uploads) > (int) $config['max_files']) respond(413, ['success' => false, 'message' => 'Too many files were selected.']);

$finfo = new finfo(FILEINFO_MIME_TYPE);
$total = 0;
$validated = [];
foreach ($uploads as $file) {
    if ((int) $file['error'] !== UPLOAD_ERR_OK) respond(400, ['success' => false, 'message' => 'One of the files could not be uploaded.']);
    $size = (int) $file['size']; $total += $size;
    if ($size < 1 || $size > (int) $config['max_file_bytes']) respond(413, ['success' => false, 'message' => 'A file is empty or exceeds the per-file limit.']);
    if ($total > (int) $config['max_total_bytes']) respond(413, ['success' => false, 'message' => 'The attachments exceed the total upload limit.']);
    if (!is_uploaded_file((string) $file['tmp_name'])) respond(400, ['success' => false, 'message' => 'Invalid upload detected.']);
    $original = basename(str_replace('\\', '/', (string) $file['name']));
    $extension = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $mime = $finfo->file((string) $file['tmp_name']) ?: 'application/octet-stream';
    if (!isset($allowed[$extension]) || !in_array($mime, $allowed[$extension], true)) respond(415, ['success' => false, 'message' => 'A selected file type is not permitted.']);
    $validated[] = ['original_name' => mb_substr($original, 0, 220), 'extension' => $extension, 'mime' => $mime, 'size' => $size, 'tmp_name' => $file['tmp_name']];
}

$reference = 'PMEW-COL-' . gmdate('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
$target = $submissionDir . '/' . $reference;
if (!mkdir($target, 0750, true) && !is_dir($target)) respond(500, ['success' => false, 'message' => 'Could not create secure submission storage.']);

$storedFiles = [];
foreach ($validated as $file) {
    $storedName = bin2hex(random_bytes(16)) . '.' . $file['extension'];
    if (!move_uploaded_file($file['tmp_name'], $target . '/' . $storedName)) respond(500, ['success' => false, 'message' => 'A file could not be stored securely.']);
    chmod($target . '/' . $storedName, 0640);
    $storedFiles[] = ['original_name' => $file['original_name'], 'stored_name' => $storedName, 'mime' => $file['mime'], 'size' => $file['size']];
}

$data['reference'] = $reference;
$data['submitted_at_utc'] = gmdate('c');
$data['files'] = $storedFiles;
$data['ip_hash'] = hash('sha256', $ip);
$data['user_agent'] = mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);
$brief = text_field('partnership_brief', 12000);
$metadataFile = $target . '/submission.json';
file_put_contents($metadataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
chmod($metadataFile, 0640);

$attempts[] = $now;
file_put_contents($rateFile, json_encode($attempts), LOCK_EX);
chmod($rateFile, 0640);

$fileNames = $storedFiles ? implode("\n", array_map(fn($f) => '- ' . $f['original_name'] . ' (' . number_format($f['size'] / 1048576, 2) . ' MB)', $storedFiles)) : '- None';
$adminBody = "New PMEW collaboration submission\n\nReference: {$reference}\nSubmitted: {$data['submitted_at_utc']}\n\n" . ($brief ?: $data['requirement_summary']) . "\n\nFILES\n{$fileNames}\n\nSecure server folder: {$reference}";
$adminSent = safe_mail($config['notification_email'], "New collaboration opportunity - {$reference}", $adminBody, $config, $data['business_email']);

$customerBody = "Dear {$data['full_name']},\n\nThank you for submitting a collaboration opportunity to Pradako Mechanical and Engineering Works.\n\nYour submission reference is {$reference}. Please retain it for future correspondence.\n\nOur team will review the information and contact you using the details supplied.\n\nRegards,\nPradako Mechanical and Engineering Works";
$customerSent = safe_mail($data['business_email'], "Pradako submission received - {$reference}", $customerBody, $config, $config['notification_email']);

$data['email_status'] = ['admin_notification' => $adminSent, 'customer_confirmation' => $customerSent];
file_put_contents($metadataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);

respond(201, [
    'success' => true,
    'reference' => $reference,
    'email_sent' => $adminSent && $customerSent,
    'message' => $adminSent ? 'Submission received.' : 'Submission saved; email delivery requires server mail configuration.',
]);
