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

if (!isset($_FILES['image'])) {
    http_response_code(400);
    $phpMax = ini_get('upload_max_filesize');
    $postMax = ini_get('post_max_size');
    echo json_encode(['error' => "No image received. PHP limits: upload_max={$phpMax}, post_max={$postMax}. File may exceed server limit."]);
    exit;
}

if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit (' . ini_get('upload_max_filesize') . '). Contact hosting or increase upload_max_filesize.',
        UPLOAD_ERR_FORM_SIZE  => 'File exceeds form limit.',
        UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded. Try again.',
        UPLOAD_ERR_NO_FILE    => 'No file was selected.',
        UPLOAD_ERR_NO_TMP_DIR => 'Server temp folder missing. Contact hosting.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write to disk. Check server permissions.',
        UPLOAD_ERR_EXTENSION  => 'Upload blocked by server extension.',
    ];
    $code = $_FILES['image']['error'];
    $msg = isset($errors[$code]) ? $errors[$code] : "Upload error (code: {$code})";
    http_response_code(400);
    echo json_encode(['error' => $msg]);
    exit;
}

$file = $_FILES['image'];
$maxSize = 10 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 10MB.']);
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
