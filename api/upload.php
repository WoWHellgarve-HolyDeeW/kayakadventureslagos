<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

$AUTH_FILE = __DIR__ . '/auth.json';
$UPLOAD_DIR = __DIR__ . '/../images/uploads/';

function checkAuth() {
    global $AUTH_FILE;
    $headers = getallheaders();
    $token = isset($headers['X-Admin-Token']) ? $headers['X-Admin-Token'] : '';
    if (!$token) {
        $token = isset($headers['x-admin-token']) ? $headers['x-admin-token'] : '';
    }
    if (!$token) return false;
    if (!file_exists($AUTH_FILE)) return false;
    $auth = json_decode(file_get_contents($AUTH_FILE), true);
    if (!isset($auth['token']) || !hash_equals($auth['token'], $token)) return false;

    // CSRF check
    $csrf = isset($headers['X-CSRF-Token']) ? $headers['X-CSRF-Token'] : '';
    if (!$csrf) $csrf = isset($headers['x-csrf-token']) ? $headers['x-csrf-token'] : '';
    if (!$csrf || !isset($auth['csrf_token']) || !hash_equals($auth['csrf_token'], $csrf)) return false;

    return true;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!checkAuth()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 5MB.']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF.']);
    exit;
}

$extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$ext = $extensions[$mime];

if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

$filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destination = $UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

$url = 'images/uploads/' . $filename;
echo json_encode(['success' => true, 'url' => $url]);
