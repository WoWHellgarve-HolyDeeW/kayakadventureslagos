<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

$AUTH_FILE = __DIR__ . '/auth.json';
$ANALYTICS_FILE = __DIR__ . '/analytics.json';
$MAX_INPUT_SIZE = 12000;
$RETENTION_DAYS = 180;

function requestHeaders() {
    if (function_exists('getallheaders')) {
        return getallheaders();
    }
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
            $headers[$name] = $value;
        }
    }
    return $headers;
}

function headerValue($headers, $name) {
    foreach ($headers as $key => $value) {
        if (strcasecmp($key, $name) === 0) return $value;
    }
    return '';
}

function checkAuth() {
    global $AUTH_FILE;
    $headers = requestHeaders();
    $token = headerValue($headers, 'X-Admin-Token');
    if (!$token || !file_exists($AUTH_FILE)) return false;

    $auth = json_decode(file_get_contents($AUTH_FILE), true);
    return is_array($auth) && isset($auth['token']) && hash_equals($auth['token'], $token);
}

function loadAnalytics() {
    global $ANALYTICS_FILE;
    if (!file_exists($ANALYTICS_FILE)) return ['days' => []];
    $data = json_decode(file_get_contents($ANALYTICS_FILE), true);
    if (!is_array($data) || !isset($data['days']) || !is_array($data['days'])) return ['days' => []];
    return $data;
}

function saveAnalytics($data) {
    global $ANALYTICS_FILE;
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    $ok = file_put_contents($ANALYTICS_FILE, $json, LOCK_EX) !== false;
    if ($ok) @chmod($ANALYTICS_FILE, 0600);
    return $ok;
}

function cleanPath($path) {
    $path = is_string($path) ? trim($path) : '/';
    if ($path === '') return '/';
    $parts = parse_url($path);
    $clean = isset($parts['path']) ? $parts['path'] : $path;
    $clean = '/' . ltrim($clean, '/');
    $clean = preg_replace('/[^a-zA-Z0-9_\-\.\/]/', '', $clean);
    return substr($clean, 0, 160) ?: '/';
}

function cleanReferrer($referrer) {
    if (!is_string($referrer) || trim($referrer) === '') return 'direct';
    $host = parse_url($referrer, PHP_URL_HOST);
    if (!$host) return 'direct';
    $host = strtolower(preg_replace('/^www\./', '', $host));
    if ($host === 'kayakadventureslagos.com') return 'direct';
    return substr(preg_replace('/[^a-z0-9\.\-]/', '', $host), 0, 80) ?: 'direct';
}

function cleanEventType($type) {
    $allowed = ['pageview', 'booking_click', 'whatsapp_click'];
    return in_array($type, $allowed, true) ? $type : '';
}

function trimOldDays($data) {
    global $RETENTION_DAYS;
    $cutoff = strtotime('-' . $RETENTION_DAYS . ' days');
    foreach ($data['days'] as $day => $stats) {
        $time = strtotime($day . ' 00:00:00 UTC');
        if ($time !== false && $time < $cutoff) unset($data['days'][$day]);
    }
    return $data;
}

function incrementKey(&$bucket, $key) {
    if (!isset($bucket[$key])) $bucket[$key] = 0;
    $bucket[$key]++;
}

function analyticsSummary($data) {
    $today = gmdate('Y-m-d');
    $cutoff30 = strtotime('-29 days');
    $totals = [
        'pageviewsToday' => 0,
        'bookingClicksToday' => 0,
        'whatsappClicksToday' => 0,
        'pageviews30' => 0,
        'bookingClicks30' => 0,
        'whatsappClicks30' => 0
    ];
    $days = [];
    $topPages = [];
    $topReferrers = [];

    ksort($data['days']);
    foreach ($data['days'] as $day => $stats) {
        $time = strtotime($day . ' 00:00:00 UTC');
        $pageviews = isset($stats['pageviews']) ? (int)$stats['pageviews'] : 0;
        $booking = isset($stats['events']['booking_click']) ? (int)$stats['events']['booking_click'] : 0;
        $whatsapp = isset($stats['events']['whatsapp_click']) ? (int)$stats['events']['whatsapp_click'] : 0;

        if ($day === $today) {
            $totals['pageviewsToday'] = $pageviews;
            $totals['bookingClicksToday'] = $booking;
            $totals['whatsappClicksToday'] = $whatsapp;
        }

        if ($time !== false && $time >= $cutoff30) {
            $totals['pageviews30'] += $pageviews;
            $totals['bookingClicks30'] += $booking;
            $totals['whatsappClicks30'] += $whatsapp;
            $days[] = ['date' => $day, 'pageviews' => $pageviews, 'bookingClicks' => $booking, 'whatsappClicks' => $whatsapp];
            if (isset($stats['pages']) && is_array($stats['pages'])) {
                foreach ($stats['pages'] as $page => $count) {
                    if (!isset($topPages[$page])) $topPages[$page] = 0;
                    $topPages[$page] += (int)$count;
                }
            }
            if (isset($stats['referrers']) && is_array($stats['referrers'])) {
                foreach ($stats['referrers'] as $referrer => $count) {
                    if (!isset($topReferrers[$referrer])) $topReferrers[$referrer] = 0;
                    $topReferrers[$referrer] += (int)$count;
                }
            }
        }
    }

    arsort($topPages);
    arsort($topReferrers);

    return [
        'success' => true,
        'totals' => $totals,
        'days' => array_slice($days, -30),
        'topPages' => array_slice($topPages, 0, 10, true),
        'topReferrers' => array_slice($topReferrers, 0, 10, true),
        'updatedAt' => isset($data['updatedAt']) ? $data['updatedAt'] : null
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    echo json_encode(analyticsSummary(loadAnalytics()), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (strlen($rawInput) > $MAX_INPUT_SIZE) {
        http_response_code(413);
        echo json_encode(['error' => 'Request too large']);
        exit;
    }

    $input = json_decode($rawInput, true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $type = cleanEventType(isset($input['type']) ? $input['type'] : '');
    if (!$type) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid event']);
        exit;
    }

    $day = gmdate('Y-m-d');
    $data = trimOldDays(loadAnalytics());
    if (!isset($data['days'][$day])) {
        $data['days'][$day] = ['pageviews' => 0, 'events' => [], 'pages' => [], 'referrers' => []];
    }

    if ($type === 'pageview') {
        $data['days'][$day]['pageviews']++;
        incrementKey($data['days'][$day]['pages'], cleanPath(isset($input['path']) ? $input['path'] : '/'));
        incrementKey($data['days'][$day]['referrers'], cleanReferrer(isset($input['referrer']) ? $input['referrer'] : ''));
    } else {
        incrementKey($data['days'][$day]['events'], $type);
    }

    $data['updatedAt'] = gmdate('c');
    if (!saveAnalytics($data)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not save analytics']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
