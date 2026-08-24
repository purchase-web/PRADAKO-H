<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function respond(int $status, bool $success, string $message, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(
        array_merge([
            'success' => $success,
            'message' => $message,
        ], $extra),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Only POST requests are accepted.');
}

session_start();

$now = time();
$lastSubmission = (int) ($_SESSION['pmew_enquiry_last_submission'] ?? 0);
if ($lastSubmission > 0 && ($now - $lastSubmission) < 12) {
    respond(429, false, 'Please wait a few seconds before sending another enquiry.');
}

// Honeypot field. Real visitors never fill this field.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, true, 'Thank you. Your enquiry has been received.');
}


function cutText(string $value, int $maxLength): string
{
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength)
        : substr($value, 0, $maxLength);
}

function textField(string $name, int $maxLength = 2000): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    return cutText($value, $maxLength);
}

function multilineField(string $name, int $maxLength = 10000): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return cutText($value, $maxLength);
}

$fullName = textField('full_name', 160);
$company = textField('company', 200);
$email = textField('email', 254);
$country = textField('country', 120);
$countryCode = textField('country_code', 8);
$mobile = textField('mobile', 30);
$quantity = textField('quantity', 40);
$quantityUnit = textField('quantity_unit', 40);
$requirementType = textField('requirement_type', 60);
$requirementSummary = multilineField('requirement_summary', 8000);
$enquiryMode = textField('enquiry_mode', 30);
$sourcePage = textField('source_page', 300);
$submittedAt = textField('submitted_at', 80);
$consent = textField('consent', 30);

$errors = [];

if ($fullName === '') $errors[] = 'Full name is required.';
if ($company === '') $errors[] = 'Company is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid work email is required.';
if ($country === '') $errors[] = 'Country is required.';
if (!preg_match('/^\+[0-9]{1,4}$/', $countryCode)) $errors[] = 'A valid country code is required.';
if (!preg_match('/^[0-9 ()-]{6,20}$/', $mobile)) $errors[] = 'A valid mobile or telephone number is required.';
if ($quantity === '' || !is_numeric($quantity) || (float) $quantity <= 0) $errors[] = 'A valid required quantity is required.';
if ($requirementSummary === '') $errors[] = 'Requirement summary is required.';
if ($consent !== 'accepted') $errors[] = 'Consent is required.';

$allowedRequirementTypes = ['standard', 'customised', 'technical-assistance'];
if (!in_array($requirementType, $allowedRequirementTypes, true)) {
    $requirementType = 'technical-assistance';
}

$enquiryMode = $enquiryMode === 'detailed' ? 'detailed' : 'quick';

$products = [];
$productsJson = (string) ($_POST['products_json'] ?? '[]');
$decodedProducts = json_decode($productsJson, true);

if (is_array($decodedProducts)) {
    foreach (array_slice($decodedProducts, 0, 20) as $product) {
        if (!is_array($product)) continue;

        $id = trim((string) ($product['id'] ?? ''));
        $name = trim((string) ($product['name'] ?? ''));
        if ($id === '' || $name === '') continue;

        $products[] = [
            'id' => cutText($id, 180),
            'name' => cutText($name, 240),
            'description' => cutText(trim((string) ($product['description'] ?? '')), 500),
            'source' => ($product['source'] ?? '') === 'customised' ? 'customised' : 'standard',
            'sourceLabel' => cutText(trim((string) ($product['sourceLabel'] ?? '')), 100),
            'category' => cutText(trim((string) ($product['category'] ?? '')), 160),
            'url' => cutText(trim((string) ($product['url'] ?? '')), 500),
            'image' => cutText(trim((string) ($product['image'] ?? '')), 500),
        ];
    }
}

if (count($products) > 20) {
    $errors[] = 'A maximum of 20 products may be submitted in one enquiry.';
}

if ($errors !== []) {
    respond(422, false, implode(' ', $errors));
}

$enquiryId = 'PMEW-' . gmdate('Ymd-His') . '-' . strtoupper(bin2hex(random_bytes(3)));

/*
 * Enquiries are stored outside the normal website document root when the
 * project follows this structure:
 *   /website/php/submit-featured-enquiry.php
 *   /pradako-private/enquiries/
 */
$storageRoot = dirname(__DIR__, 2)
    . DIRECTORY_SEPARATOR . 'pradako-private'
    . DIRECTORY_SEPARATOR . 'enquiries';
$enquiryDirectory = $storageRoot . DIRECTORY_SEPARATOR . $enquiryId;

if (!is_dir($enquiryDirectory) && !mkdir($enquiryDirectory, 0750, true) && !is_dir($enquiryDirectory)) {
    respond(500, false, 'The server could not create a secure enquiry record.');
}

$allowedExtensions = [
    'pdf', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf', 'png', 'jpg', 'jpeg', 'xlsx'
];
$maximumFileSize = 20 * 1024 * 1024;
$maximumFiles = 5;
$savedFiles = [];

if (isset($_FILES['drawings']) && is_array($_FILES['drawings']['name'] ?? null)) {
    $fileCount = count($_FILES['drawings']['name']);

    if ($fileCount > $maximumFiles) {
        respond(422, false, 'Upload a maximum of five drawing or specification files.');
    }

    for ($index = 0; $index < $fileCount; $index++) {
        $error = (int) ($_FILES['drawings']['error'][$index] ?? UPLOAD_ERR_NO_FILE);
        if ($error === UPLOAD_ERR_NO_FILE) continue;
        if ($error !== UPLOAD_ERR_OK) {
            respond(422, false, 'One of the uploaded files could not be received.');
        }

        $temporaryPath = (string) ($_FILES['drawings']['tmp_name'][$index] ?? '');
        $originalName = basename((string) ($_FILES['drawings']['name'][$index] ?? 'file'));
        $size = (int) ($_FILES['drawings']['size'][$index] ?? 0);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($extension, $allowedExtensions, true)) {
            respond(422, false, 'Unsupported drawing or specification file type.');
        }

        if ($size <= 0 || $size > $maximumFileSize) {
            respond(422, false, 'Each uploaded file must be smaller than 20 MB.');
        }

        $safeBase = preg_replace('/[^A-Za-z0-9._-]+/', '-', pathinfo($originalName, PATHINFO_FILENAME));
        $safeBase = trim((string) $safeBase, '-_.');
        if ($safeBase === '') $safeBase = 'drawing';

        $storedName = sprintf('%02d-%s-%s.%s', $index + 1, $safeBase, bin2hex(random_bytes(2)), $extension);
        $destination = $enquiryDirectory . DIRECTORY_SEPARATOR . $storedName;

        if (!is_uploaded_file($temporaryPath) || !move_uploaded_file($temporaryPath, $destination)) {
            respond(500, false, 'The server could not securely store an uploaded file.');
        }

        chmod($destination, 0640);
        $savedFiles[] = [
            'original_name' => $originalName,
            'stored_name' => $storedName,
            'size_bytes' => $size,
        ];
    }
}

$record = [
    'enquiry_id' => $enquiryId,
    'received_at_utc' => gmdate(DATE_ATOM),
    'submitted_at_client' => $submittedAt,
    'source_page' => $sourcePage,
    'client_ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'enquiry_mode' => $enquiryMode,
    'requirement_type' => $requirementType,
    'products' => $products,
    'requirement' => [
        'quantity' => $quantity,
        'quantity_unit' => $quantityUnit,
        'summary' => $requirementSummary,
        'size_thread' => textField('size_thread', 200),
        'material' => textField('material', 200),
        'grade' => textField('grade', 200),
        'finish' => textField('finish', 300),
        'annual_requirement' => textField('annual_requirement', 200),
        'required_delivery_date' => textField('required_delivery_date', 40),
        'diameter_thread' => textField('diameter_thread', 200),
        'product_length' => textField('product_length', 200),
        'material_specification' => textField('material_specification', 300),
        'strength_grade' => textField('strength_grade', 200),
        'coating' => textField('coating', 500),
        'tolerance' => textField('tolerance', 400),
        'application' => multilineField('application', 5000),
        'inspection_requirements' => textField('inspection_requirements', 500),
        'packaging_requirements' => textField('packaging_requirements', 500),
        'sample_available' => textField('sample_available', 40),
    ],
    'buyer' => [
        'full_name' => $fullName,
        'company' => $company,
        'email' => $email,
        'country' => $country,
        'country_code' => $countryCode,
        'mobile' => $mobile,
    ],
    'files' => $savedFiles,
];

$jsonPath = $enquiryDirectory . DIRECTORY_SEPARATOR . 'enquiry.json';
$jsonWritten = file_put_contents(
    $jsonPath,
    json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($jsonWritten === false) {
    respond(500, false, 'The server could not save the enquiry record.');
}
chmod($jsonPath, 0640);

/*
 * EMAIL CONFIGURATION
 * Set PRADAKO_ENQUIRY_EMAIL in the hosting environment, or replace the
 * fallback value below with the correct sales/enquiry email address.
 */
$recipient = getenv('PRADAKO_ENQUIRY_EMAIL') ?: 'sales@yourdomain.com';
$emailConfigured = filter_var($recipient, FILTER_VALIDATE_EMAIL)
    && preg_match('/@yourdomain\.com$/i', $recipient) !== 1;

if ($emailConfigured) {
    $productLines = $products === []
        ? 'General requirement (no product selected)'
        : implode("\n", array_map(
            static fn(array $product): string => '- ' . $product['name'] . ' [' . $product['source'] . '] ' . $product['url'],
            $products
        ));

    $subject = sprintf('[%s] Product enquiry from %s', $enquiryId, $company);
    $message = "A new Featured Hot Products enquiry was received.\n\n"
        . "Enquiry ID: {$enquiryId}\n"
        . "Name: {$fullName}\n"
        . "Company: {$company}\n"
        . "Email: {$email}\n"
        . "Telephone: {$countryCode} {$mobile}\n"
        . "Country: {$country}\n"
        . "Mode: {$enquiryMode}\n"
        . "Requirement type: {$requirementType}\n"
        . "Quantity: {$quantity} {$quantityUnit}\n\n"
        . "Products:\n{$productLines}\n\n"
        . "Requirement summary:\n{$requirementSummary}\n\n"
        . "Stored record: {$jsonPath}\n";

    $headers = [
        'From: Website Enquiries <no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '>',
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
    ];

    @mail($recipient, $subject, $message, implode("\r\n", $headers));
}

$_SESSION['pmew_enquiry_last_submission'] = $now;

respond(200, true, 'Thank you. Your product enquiry has been received.', [
    'enquiry_id' => $enquiryId,
]);
