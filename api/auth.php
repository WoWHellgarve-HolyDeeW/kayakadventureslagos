<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

$AUTH_FILE = __DIR__ . '/auth.json';
$RATE_FILE = __DIR__ . '/rate_limits.json';
$MAX_ATTEMPTS = 5;
$LOCKOUT_MINUTES = 15;

function getAuth() {
    global $AUTH_FILE;
    if (!file_exists($AUTH_FILE)) {
        return null;
    }

    $auth = json_decode(file_get_contents($AUTH_FILE), true);
    if (!is_array($auth) || empty($auth['user']) || empty($auth['pass_hash'])) {
        return null;
    }

    $needsWrite = false;
    if (empty($auth['token'])) {
        $auth['token'] = bin2hex(random_bytes(32));
        $needsWrite = true;
    }
    if (!isset($auth['csrf_token'])) {
        $auth['csrf_token'] = bin2hex(random_bytes(32));
        $needsWrite = true;
    }
    if (!isset($auth['must_change'])) {
        $auth['must_change'] = false;
        $needsWrite = true;
    }
    if ($needsWrite) {
        file_put_contents($AUTH_FILE, json_encode($auth, JSON_PRETTY_PRINT), LOCK_EX);
        @chmod($AUTH_FILE, 0600);
    }

    return $auth;
}

function getClientIp() {
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    return preg_replace('/[^0-9a-f.:]/i', '', $ip);
}

function checkRateLimit() {
    global $RATE_FILE, $MAX_ATTEMPTS, $LOCKOUT_MINUTES;
    $ip = getClientIp();
    $data = [];
    if (file_exists($RATE_FILE)) {
        $data = json_decode(file_get_contents($RATE_FILE), true) ?: [];
    }
    $cutoff = time() - ($LOCKOUT_MINUTES * 60);
    // Clean old entries
    foreach ($data as $k => $entry) {
        if ($entry['last'] < $cutoff) unset($data[$k]);
    }
    if (isset($data[$ip]) && $data[$ip]['count'] >= $MAX_ATTEMPTS && $data[$ip]['last'] > $cutoff) {
        return false;
    }
    return true;
}

function recordFailedAttempt() {
    global $RATE_FILE, $LOCKOUT_MINUTES;
    $ip = getClientIp();
    $data = [];
    if (file_exists($RATE_FILE)) {
        $data = json_decode(file_get_contents($RATE_FILE), true) ?: [];
    }
    $cutoff = time() - ($LOCKOUT_MINUTES * 60);
    foreach ($data as $k => $entry) {
        if ($entry['last'] < $cutoff) unset($data[$k]);
    }
    if (!isset($data[$ip])) {
        $data[$ip] = ['count' => 0, 'last' => time()];
    }
    $data[$ip]['count']++;
    $data[$ip]['last'] = time();
    file_put_contents($RATE_FILE, json_encode($data), LOCK_EX);
    @chmod($RATE_FILE, 0600);
}

function clearRateLimit() {
    global $RATE_FILE;
    $ip = getClientIp();
    if (file_exists($RATE_FILE)) {
        $data = json_decode(file_get_contents($RATE_FILE), true) ?: [];
        unset($data[$ip]);
        file_put_contents($RATE_FILE, json_encode($data), LOCK_EX);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > 10000) {
    http_response_code(413);
    echo json_encode(['error' => 'Request too large']);
    exit;
}

$input = json_decode($rawInput, true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$action = isset($input['action']) ? $input['action'] : '';

if ($action === 'login') {
    if (!checkRateLimit()) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many attempts. Try again in ' . $LOCKOUT_MINUTES . ' minutes.']);
        exit;
    }

    $user = isset($input['user']) ? trim($input['user']) : '';
    $pass = isset($input['pass']) ? $input['pass'] : '';

    if (!$user || !$pass) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing credentials']);
        exit;
    }

    if (strlen($user) > 100 || strlen($pass) > 200) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    $auth = getAuth();
    if (!$auth) {
        http_response_code(503);
        echo json_encode(['error' => 'Admin access is not initialized.']);
        exit;
    }

    if ($user === $auth['user'] && password_verify($pass, $auth['pass_hash'])) {
        clearRateLimit();
        $resp = ['success' => true, 'token' => $auth['token'], 'csrf_token' => $auth['csrf_token']];
        if (!empty($auth['must_change'])) {
            $resp['must_change'] = true;
        }
        echo json_encode($resp);
    } else {
        recordFailedAttempt();
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
    if (!$auth) {
        http_response_code(503);
        echo json_encode(['error' => 'Admin access is not initialized.']);
        exit;
    }
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

    if (strlen($newPass) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 8 characters']);
        exit;
    }

    $auth['pass_hash'] = password_hash($newPass, PASSWORD_DEFAULT);
    $auth['token'] = bin2hex(random_bytes(32));
    $auth['csrf_token'] = bin2hex(random_bytes(32));
    $auth['must_change'] = false;
    file_put_contents($AUTH_FILE, json_encode($auth, JSON_PRETTY_PRINT), LOCK_EX);

    echo json_encode(['success' => true, 'token' => $auth['token'], 'csrf_token' => $auth['csrf_token']]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
