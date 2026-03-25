<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$DATA_FILE = __DIR__ . '/site-data.json';
$AUTH_FILE = __DIR__ . '/auth.json';

function loadData() {
    global $DATA_FILE;
    if (file_exists($DATA_FILE)) {
        $raw = file_get_contents($DATA_FILE);
        $data = json_decode($raw, true);
        if ($data !== null) return $data;
    }
    return null;
}

function saveData($data) {
    global $DATA_FILE;
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    return file_put_contents($DATA_FILE, $json, LOCK_EX) !== false;
}

function checkAuth() {
    global $AUTH_FILE;
    $headers = getallheaders();
    $token = isset($headers['X-Admin-Token']) ? $headers['X-Admin-Token'] : '';
    if (!$token) {
        $token = isset($headers['x-admin-token']) ? $headers['x-admin-token'] : '';
    }
    if (!$token) return false;

    if (!file_exists($AUTH_FILE)) {
        $default = ['user' => 'admin', 'pass_hash' => password_hash('admin123', PASSWORD_DEFAULT), 'token' => bin2hex(random_bytes(32))];
        file_put_contents($AUTH_FILE, json_encode($default, JSON_PRETTY_PRINT), LOCK_EX);
        chmod($AUTH_FILE, 0600);
    }

    $auth = json_decode(file_get_contents($AUTH_FILE), true);
    return isset($auth['token']) && hash_equals($auth['token'], $token);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $data = loadData();
    if ($data === null) {
        http_response_code(404);
        echo json_encode(['error' => 'No data file found. Save from admin to create it.']);
    } else {
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'POST') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    if (saveData($data)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Could not save data']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
