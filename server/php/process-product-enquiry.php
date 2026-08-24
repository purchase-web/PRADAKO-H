<?php
declare(strict_types=1);

/*
 * Pradako consolidated product enquiry receiver.
 * Place this file in the same directory as the HTML page, or update
 * ENQUIRY_ENDPOINT in the HTML file to match its deployed location.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const MAX_PRODUCTS = 10;
const MAX_BODY_BYTES = 200000;
const ENQUIRY_EMAIL = 'sales@example.com'; // CHANGE THIS to the actual enquiry email.
const STORAGE_DIRECTORY = __DIR__ . '/storage/enquiries';
const STORAGE_FILE = STORAGE_DIRECTORY . '/product-enquiries.jsonl';

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function text_value(mixed $value, int $maxLength): string
{
    $text = trim((string)($value ?? ''));
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }
    return substr($text, 0, $maxLength);
}

function valid_phone(string $phone): bool
{
    return preg_match('/^[0-9+()\-\s.]{7,30}$/', $phone) === 1;
}

function generate_reference(): string
{
    return 'PRD-RFQ-' . gmdate('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'Only POST requests are accepted.'
    ]);
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > MAX_BODY_BYTES) {
    respond(413, [
        'success' => false,
        'message' => 'The enquiry request is too large.'
    ]);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || trim($rawBody) === '') {
    respond(400, [
        'success' => false,
        'message' => 'No enquiry data was received.'
    ]);
}

try {
    $data = json_decode($rawBody, true, 64, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    respond(400, [
        'success' => false,
        'message' => 'The enquiry data is not valid JSON.'
    ]);
}

if (!is_array($data)) {
    respond(400, [
        'success' => false,
        'message' => 'Invalid enquiry data.'
    ]);
}

$customerInput = is_array($data['customer'] ?? null) ? $data['customer'] : [];
$productsInput = is_array($data['products'] ?? null) ? $data['products'] : [];

if (count($productsInput) < 1 || count($productsInput) > MAX_PRODUCTS) {
    respond(422, [
        'success' => false,
        'message' => 'An enquiry must contain between 1 and 10 products.'
    ]);
}

$customer = [
    'name' => text_value($customerInput['name'] ?? '', 100),
    'company' => text_value($customerInput['company'] ?? '', 150),
    'email' => text_value($customerInput['email'] ?? '', 180),
    'phone' => text_value($customerInput['phone'] ?? '', 30),
    'country' => text_value($customerInput['country'] ?? '', 100),
    'generalMessage' => text_value($customerInput['generalMessage'] ?? '', 3000),
    'consent' => ($customerInput['consent'] ?? false) === true,
];

$errors = [];
if ($customer['name'] === '') $errors[] = 'Full name is required.';
if ($customer['company'] === '') $errors[] = 'Company name is required.';
if (!filter_var($customer['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid business email is required.';
if (!valid_phone($customer['phone'])) $errors[] = 'A valid phone number is required.';
if ($customer['country'] === '') $errors[] = 'Country is required.';
if (!$customer['consent']) $errors[] = 'Consent is required.';

$products = [];
foreach ($productsInput as $index => $productInput) {
    if (!is_array($productInput)) {
        $errors[] = 'Product line ' . ($index + 1) . ' is invalid.';
        continue;
    }

    $productName = text_value($productInput['productName'] ?? '', 180);
    $quantity = filter_var($productInput['quantity'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 1000000000]
    ]);
    $unit = text_value($productInput['unit'] ?? '', 40);

    if ($productName === '') $errors[] = 'Product name is required on line ' . ($index + 1) . '.';
    if ($quantity === false) $errors[] = 'A valid quantity is required on line ' . ($index + 1) . '.';
    if ($unit === '') $errors[] = 'A unit is required on line ' . ($index + 1) . '.';

    $products[] = [
        'line' => $index + 1,
        'productId' => text_value($productInput['productId'] ?? '', 250),
        'productName' => $productName,
        'category' => text_value($productInput['category'] ?? '', 220),
        'image' => text_value($productInput['image'] ?? '', 500),
        'quantity' => $quantity === false ? 0 : $quantity,
        'unit' => $unit,
        'specifications' => text_value($productInput['specifications'] ?? '', 2000),
        'notes' => text_value($productInput['notes'] ?? '', 2000),
    ];
}

if ($errors !== []) {
    respond(422, [
        'success' => false,
        'message' => implode(' ', $errors),
        'errors' => $errors
    ]);
}

$reference = generate_reference();
$record = [
    'reference' => $reference,
    'receivedAt' => gmdate(DATE_ATOM),
    'sourcePage' => text_value($data['sourcePage'] ?? '', 500),
    'submittedAt' => text_value($data['submittedAt'] ?? '', 80),
    'customer' => $customer,
    'products' => $products,
    'requestMeta' => [
        'ipHash' => hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown')),
        'userAgent' => text_value($_SERVER['HTTP_USER_AGENT'] ?? '', 500),
    ],
];

if (!is_dir(STORAGE_DIRECTORY) && !mkdir(STORAGE_DIRECTORY, 0750, true) && !is_dir(STORAGE_DIRECTORY)) {
    error_log('Unable to create enquiry storage directory: ' . STORAGE_DIRECTORY);
    respond(500, [
        'success' => false,
        'message' => 'The enquiry could not be saved. Please contact the website administrator.'
    ]);
}

$encodedRecord = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($encodedRecord === false || file_put_contents(STORAGE_FILE, $encodedRecord . PHP_EOL, FILE_APPEND | LOCK_EX) === false) {
    error_log('Unable to save product enquiry: ' . $reference);
    respond(500, [
        'success' => false,
        'message' => 'The enquiry could not be saved. Please try again.'
    ]);
}

/* Optional email notification. The enquiry is already safely stored above. */
if (ENQUIRY_EMAIL !== 'sales@example.com' && filter_var(ENQUIRY_EMAIL, FILTER_VALIDATE_EMAIL)) {
    $subject = 'New Product RFQ: ' . $reference . ' — ' . $customer['company'];
    $lines = [
        'Reference: ' . $reference,
        'Name: ' . $customer['name'],
        'Company: ' . $customer['company'],
        'Email: ' . $customer['email'],
        'Phone: ' . $customer['phone'],
        'Country: ' . $customer['country'],
        '',
        'Products:'
    ];

    foreach ($products as $product) {
        $lines[] = sprintf(
            '%d. %s — %d %s',
            $product['line'],
            $product['productName'],
            $product['quantity'],
            $product['unit']
        );
        if ($product['specifications'] !== '') $lines[] = '   Specifications: ' . $product['specifications'];
        if ($product['notes'] !== '') $lines[] = '   Notes: ' . $product['notes'];
    }

    if ($customer['generalMessage'] !== '') {
        $lines[] = '';
        $lines[] = 'General message: ' . $customer['generalMessage'];
    }

    $safeReplyTo = str_replace(["\r", "\n"], '', $customer['email']);
    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $safeReplyTo,
        'X-Mailer: PHP/' . PHP_VERSION,
    ];

    @mail(ENQUIRY_EMAIL, $subject, implode(PHP_EOL, $lines), implode("\r\n", $headers));
}

respond(201, [
    'success' => true,
    'reference' => $reference,
    'message' => 'Your consolidated product enquiry has been received successfully.'
]);
