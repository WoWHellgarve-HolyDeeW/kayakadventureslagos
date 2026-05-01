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

function cleanProvider($provider) {
    $provider = is_string($provider) ? strtolower(trim($provider)) : '';
    $provider = preg_replace('/[^a-z0-9_\-]/', '', $provider);
    if ($provider === 'support') return 'whatsapp';
    $allowed = ['fareharbor', 'whatsapp', 'site', 'support', 'external', 'unknown'];
    return in_array($provider, $allowed, true) ? $provider : 'unknown';
}

function cleanDateParam($value, $fallback) {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return $fallback;
    $time = strtotime($value . ' 00:00:00 UTC');
    return $time === false ? $fallback : gmdate('Y-m-d', $time);
}

function clientIp() {
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $key) {
        if (empty($_SERVER[$key])) continue;
        $value = explode(',', $_SERVER[$key])[0];
        $value = trim($value);
        if ($value !== '') return $value;
    }
    return 'unknown';
}

function visitorHash($input) {
    $visitorId = isset($input['visitorId']) && is_string($input['visitorId']) ? $input['visitorId'] : '';
    $visitorId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $visitorId);
    if ($visitorId !== '') {
        return hash('sha256', 'visitor|' . substr($visitorId, 0, 96));
    }
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 180) : 'unknown';
    return hash('sha256', 'fallback|' . clientIp() . '|' . $ua);
}

function ensureDayShape(&$dayStats) {
    if (!isset($dayStats['pageviews'])) $dayStats['pageviews'] = 0;
    if (!isset($dayStats['events']) || !is_array($dayStats['events'])) $dayStats['events'] = [];
    if (!isset($dayStats['rawEvents']) || !is_array($dayStats['rawEvents'])) $dayStats['rawEvents'] = [];
    if (!isset($dayStats['duplicateEvents']) || !is_array($dayStats['duplicateEvents'])) $dayStats['duplicateEvents'] = [];
    if (!isset($dayStats['eventProviders']) || !is_array($dayStats['eventProviders'])) $dayStats['eventProviders'] = [];
    if (!isset($dayStats['rawEventProviders']) || !is_array($dayStats['rawEventProviders'])) $dayStats['rawEventProviders'] = [];
    if (!isset($dayStats['pages']) || !is_array($dayStats['pages'])) $dayStats['pages'] = [];
    if (!isset($dayStats['uniquePages']) || !is_array($dayStats['uniquePages'])) $dayStats['uniquePages'] = [];
    if (!isset($dayStats['referrers']) || !is_array($dayStats['referrers'])) $dayStats['referrers'] = [];
    if (!isset($dayStats['visitorKeys']) || !is_array($dayStats['visitorKeys'])) $dayStats['visitorKeys'] = [];
    if (!isset($dayStats['pageviewKeys']) || !is_array($dayStats['pageviewKeys'])) $dayStats['pageviewKeys'] = [];
    if (!isset($dayStats['eventKeys']) || !is_array($dayStats['eventKeys'])) $dayStats['eventKeys'] = [];
    if (!isset($dayStats['uniqueVisitors'])) $dayStats['uniqueVisitors'] = count($dayStats['visitorKeys']);
}

function incrementProvider(&$bucket, $eventType, $provider) {
    if (!isset($bucket[$eventType]) || !is_array($bucket[$eventType])) $bucket[$eventType] = [];
    incrementKey($bucket[$eventType], $provider);
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

function getCount($stats, $group, $type, $fallbackGroup = null) {
    if (isset($stats[$group][$type])) return (int)$stats[$group][$type];
    if ($fallbackGroup && isset($stats[$fallbackGroup][$type])) return (int)$stats[$fallbackGroup][$type];
    return 0;
}

function addProviderCounts(&$totals, $stats, $group, $fallbackGroup = null) {
    $hasProviderData = false;
    if (isset($stats[$group]) && is_array($stats[$group])) {
        foreach ($stats[$group] as $type => $providers) {
            if (!is_array($providers)) continue;
            if (!isset($totals[$type])) $totals[$type] = [];
            foreach ($providers as $provider => $count) {
                $hasProviderData = true;
                if ($provider === 'support') $provider = 'whatsapp';
                if (!isset($totals[$type][$provider])) $totals[$type][$provider] = 0;
                $totals[$type][$provider] += (int)$count;
            }
        }
        if ($hasProviderData) return;
    }
    if ($fallbackGroup && isset($stats[$fallbackGroup]) && is_array($stats[$fallbackGroup])) {
        foreach ($stats[$fallbackGroup] as $type => $count) {
            if (!isset($totals[$type])) $totals[$type] = [];
            if (!isset($totals[$type]['unknown'])) $totals[$type]['unknown'] = 0;
            $totals[$type]['unknown'] += (int)$count;
        }
    }
}

function resolveRange($data) {
    global $RETENTION_DAYS;
    $today = gmdate('Y-m-d');
    $defaultStart = gmdate('Y-m-d', strtotime('-29 days'));
    $range = isset($_GET['range']) ? strtolower(trim($_GET['range'])) : '';

    if ($range === '7') $defaultStart = gmdate('Y-m-d', strtotime('-6 days'));
    if ($range === 'month') $defaultStart = gmdate('Y-m-01');
    if ($range === 'all' && !empty($data['days'])) {
        $keys = array_keys($data['days']);
        sort($keys);
        $defaultStart = $keys[0];
    }

    $start = cleanDateParam(isset($_GET['start']) ? $_GET['start'] : '', $defaultStart);
    $end = cleanDateParam(isset($_GET['end']) ? $_GET['end'] : '', $today);
    if (strtotime($start . ' 00:00:00 UTC') > strtotime($end . ' 00:00:00 UTC')) {
        $tmp = $start;
        $start = $end;
        $end = $tmp;
    }
    $minStart = gmdate('Y-m-d', strtotime('-' . ($RETENTION_DAYS - 1) . ' days'));
    if (strtotime($start . ' 00:00:00 UTC') < strtotime($minStart . ' 00:00:00 UTC')) $start = $minStart;
    if (strtotime($end . ' 00:00:00 UTC') > strtotime($today . ' 00:00:00 UTC')) $end = $today;

    return ['start' => $start, 'end' => $end];
}

function analyticsSummary($data) {
    $today = gmdate('Y-m-d');
    $cutoff30 = strtotime('-29 days');
    $range = resolveRange($data);
    $startTime = strtotime($range['start'] . ' 00:00:00 UTC');
    $endTime = strtotime($range['end'] . ' 23:59:59 UTC');
    $totals = [
        'pageviewsToday' => 0,
        'bookingClicksToday' => 0,
        'whatsappClicksToday' => 0,
        'pageviews30' => 0,
        'bookingClicks30' => 0,
        'whatsappClicks30' => 0,
        'pageviews' => 0,
        'uniqueVisitors' => 0,
        'bookingClicks' => 0,
        'whatsappClicks' => 0,
        'rawBookingClicks' => 0,
        'rawWhatsappClicks' => 0,
        'duplicateBookingClicks' => 0,
        'duplicateWhatsappClicks' => 0,
        'duplicatesFiltered' => 0,
        'conversionRate' => 0
    ];
    $days = [];
    $topPages = [];
    $topReferrers = [];
    $providers = [];
    $rawProviders = [];
    $rangeVisitorKeys = [];
    $hasRangeVisitorKeys = false;

    ksort($data['days']);
    foreach ($data['days'] as $day => $stats) {
        $time = strtotime($day . ' 00:00:00 UTC');
        ensureDayShape($stats);
        $pageviews = isset($stats['pageviews']) ? (int)$stats['pageviews'] : 0;
        $uniqueVisitors = isset($stats['uniqueVisitors']) ? (int)$stats['uniqueVisitors'] : 0;
        $booking = getCount($stats, 'events', 'booking_click');
        $whatsapp = getCount($stats, 'events', 'whatsapp_click');
        $rawBooking = getCount($stats, 'rawEvents', 'booking_click', 'events');
        $rawWhatsapp = getCount($stats, 'rawEvents', 'whatsapp_click', 'events');
        $duplicateBooking = getCount($stats, 'duplicateEvents', 'booking_click');
        $duplicateWhatsapp = getCount($stats, 'duplicateEvents', 'whatsapp_click');

        if ($day === $today) {
            $totals['pageviewsToday'] = $pageviews;
            $totals['bookingClicksToday'] = $booking;
            $totals['whatsappClicksToday'] = $whatsapp;
        }

        if ($time !== false && $time >= $cutoff30) {
            $totals['pageviews30'] += $pageviews;
            $totals['bookingClicks30'] += $booking;
            $totals['whatsappClicks30'] += $whatsapp;
        }

        if ($time !== false && $time >= $startTime && $time <= $endTime) {
            $totals['pageviews'] += $pageviews;
            $totals['uniqueVisitors'] += $uniqueVisitors;
            $totals['bookingClicks'] += $booking;
            $totals['whatsappClicks'] += $whatsapp;
            $totals['rawBookingClicks'] += $rawBooking;
            $totals['rawWhatsappClicks'] += $rawWhatsapp;
            $totals['duplicateBookingClicks'] += $duplicateBooking;
            $totals['duplicateWhatsappClicks'] += $duplicateWhatsapp;
            $totals['duplicatesFiltered'] += $duplicateBooking + $duplicateWhatsapp;
            if (isset($stats['visitorKeys']) && is_array($stats['visitorKeys']) && count($stats['visitorKeys']) > 0) {
                $hasRangeVisitorKeys = true;
                foreach ($stats['visitorKeys'] as $visitorKey => $seen) {
                    $rangeVisitorKeys[$visitorKey] = 1;
                }
            }
            $days[] = [
                'date' => $day,
                'pageviews' => $pageviews,
                'uniqueVisitors' => $uniqueVisitors,
                'bookingClicks' => $booking,
                'whatsappClicks' => $whatsapp,
                'rawBookingClicks' => $rawBooking,
                'rawWhatsappClicks' => $rawWhatsapp,
                'duplicatesFiltered' => $duplicateBooking + $duplicateWhatsapp
            ];
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
            addProviderCounts($providers, $stats, 'eventProviders', 'events');
            addProviderCounts($rawProviders, $stats, 'rawEventProviders', 'events');
        }
    }

    arsort($topPages);
    arsort($topReferrers);
    if ($totals['pageviews'] > 0) {
        $totals['conversionRate'] = round(($totals['bookingClicks'] / $totals['pageviews']) * 100, 2);
    }
    if ($hasRangeVisitorKeys) {
        $totals['uniqueVisitors'] = count($rangeVisitorKeys);
    }

    return [
        'success' => true,
        'totals' => $totals,
        'range' => $range,
        'days' => $days,
        'topPages' => array_slice($topPages, 0, 10, true),
        'topReferrers' => array_slice($topReferrers, 0, 10, true),
        'providers' => $providers,
        'rawProviders' => $rawProviders,
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
    ensureDayShape($data['days'][$day]);

    $path = cleanPath(isset($input['path']) ? $input['path'] : '/');
    $provider = cleanProvider(isset($input['provider']) ? $input['provider'] : 'unknown');
    $visitor = visitorHash($input);

    if ($type === 'pageview') {
        $data['days'][$day]['pageviews']++;
        incrementKey($data['days'][$day]['pages'], $path);
        incrementKey($data['days'][$day]['referrers'], cleanReferrer(isset($input['referrer']) ? $input['referrer'] : ''));
        if (!isset($data['days'][$day]['visitorKeys'][$visitor])) {
            $data['days'][$day]['visitorKeys'][$visitor] = 1;
            $data['days'][$day]['uniqueVisitors']++;
        }
        $pageviewKey = hash('sha256', 'page|' . $visitor . '|' . $path);
        if (!isset($data['days'][$day]['pageviewKeys'][$pageviewKey])) {
            $data['days'][$day]['pageviewKeys'][$pageviewKey] = 1;
            incrementKey($data['days'][$day]['uniquePages'], $path);
        }
    } else {
        incrementKey($data['days'][$day]['rawEvents'], $type);
        incrementProvider($data['days'][$day]['rawEventProviders'], $type, $provider);
        $eventKey = hash('sha256', 'event|' . $type . '|' . $visitor);
        if (isset($data['days'][$day]['eventKeys'][$eventKey])) {
            incrementKey($data['days'][$day]['duplicateEvents'], $type);
        } else {
            $data['days'][$day]['eventKeys'][$eventKey] = 1;
            incrementKey($data['days'][$day]['events'], $type);
            incrementProvider($data['days'][$day]['eventProviders'], $type, $provider);
        }
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
