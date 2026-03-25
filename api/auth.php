<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$AUTH_FILE = __DIR__ . '/auth.json';

function getAuth() {
    global $AUTH_FILE;
    if (!file_exists($AUTH_FILE)) {
        $default = ['user' => 'admin', 'pass_hash' => password_hash('admin123', PASSWORD_DEFAULT), 'token' => bin2hex(random_bytes(32))];
        file_put_contents($AUTH_FILE, json_encode($default, JSON_PRETTY_PRINT), LOCK_EX);
        chmod($AUTH_FILE, 0600);
        return $default;
    }
    return json_decode(file_get_contents($AUTH_FILE), true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$action = isset($input['action']) ? $input['action'] : '';

if ($action === 'login') {
    $user = isset($input['user']) ? trim($input['user']) : '';
    $pass = isset($input['pass']) ? $input['pass'] : '';

    if (!$user || !$pass) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing credentials']);
        exit;
    }

    $auth = getAuth();

    if ($user === $auth['user'] && password_verify($pass, $auth['pass_hash'])) {
        echo json_encode(['success' => true, 'token' => $auth['token']]);
    } else {
        sleep(1);
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

if ($action === 'change_password') {
    $headers = getallheaders();
    $token = isset($headers['X-Admin-Token']) ? $headers['X-Admin-Token'] : '';
    if (!$token) $token = isset($headers['x-admin-token']) ? $headers['x-admin-token'] : '';

    $auth = getAuth();
    if (!$token || !hash_equals($auth['token'], $token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $currentPass = isset($input['current']) ? $input['current'] : '';
    $newPass = isset($input['newPass']) ? $input['newPass'] : '';

    if (!password_verify($currentPass, $auth['pass_hash'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Current password incorrect']);
        exit;
    }

    if (strlen($newPass) < 4) {
        http_response_code(400);
        echo json_encode(['error' => 'Password too short']);
        exit;
    }

    $auth['pass_hash'] = password_hash($newPass, PASSWORD_DEFAULT);
    $auth['token'] = bin2hex(random_bytes(32));
    file_put_contents($AUTH_FILE, json_encode($auth, JSON_PRETTY_PRINT), LOCK_EX);

    echo json_encode(['success' => true, 'token' => $auth['token']]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
