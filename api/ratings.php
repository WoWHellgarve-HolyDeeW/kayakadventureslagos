<?php
/**
 * Auto-fetch ratings from Google and TripAdvisor
 * 
 * GET /api/ratings.php          - Returns cached ratings (public)
 * GET /api/ratings.php?refresh=1 - Force refresh (admin only)
 * 
 * Google: Uses Places API (needs API key in settings)
 * TripAdvisor: Scrapes public page for overall rating
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: *');

$AUTH_FILE = __DIR__ . '/auth.json';
$CACHE_FILE = __DIR__ . '/ratings_cache.json';
$SETTINGS_FILE = __DIR__ . '/site-data.json';
$CACHE_TTL = 86400; // 24 hours

function checkAuth() {
    global $AUTH_FILE;
    $headers = getallheaders();
    $token = isset($headers['X-Admin-Token']) ? $headers['X-Admin-Token'] : '';
    if (!$token) $token = isset($headers['x-admin-token']) ? $headers['x-admin-token'] : '';
    if (!$token) return false;
    if (!file_exists($AUTH_FILE)) return false;
    $auth = json_decode(file_get_contents($AUTH_FILE), true);
    return isset($auth['token']) && hash_equals($auth['token'], $token);
}

function getSettings() {
    global $SETTINGS_FILE;
    if (!file_exists($SETTINGS_FILE)) return [];
    $data = json_decode(file_get_contents($SETTINGS_FILE), true);
    return $data ?: [];
}

function getCachedRatings() {
    global $CACHE_FILE, $CACHE_TTL;
    if (!file_exists($CACHE_FILE)) return null;
    $cache = json_decode(file_get_contents($CACHE_FILE), true);
    if (!$cache || !isset($cache['fetched'])) return null;
    if (time() - $cache['fetched'] > $CACHE_TTL) return null;
    return $cache;
}

function saveCachedRatings($data) {
    global $CACHE_FILE;
    $data['fetched'] = time();
    $data['fetched_date'] = date('c');
    file_put_contents($CACHE_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
    @chmod($CACHE_FILE, 0600);
}

/**
 * Fetch Google rating via Places API
 */
function fetchGoogleRating($placeId, $apiKey) {
    if (!$placeId || !$apiKey) return null;
    
    $url = 'https://maps.googleapis.com/maps/api/place/details/json?' . http_build_query([
        'place_id' => $placeId,
        'fields' => 'rating,user_ratings_total,name',
        'key' => $apiKey
    ]);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) return null;
    
    $data = json_decode($response, true);
    if (!$data || $data['status'] !== 'OK' || !isset($data['result'])) return null;
    
    return [
        'rating' => isset($data['result']['rating']) ? round($data['result']['rating'], 1) : null,
        'reviewCount' => isset($data['result']['user_ratings_total']) ? (int)$data['result']['user_ratings_total'] : null,
        'name' => isset($data['result']['name']) ? $data['result']['name'] : null,
    ];
}

/**
 * Fetch TripAdvisor rating by scraping public page
 */
function fetchTripAdvisorRating($taUrl) {
    if (!$taUrl) return null;
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $taUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml',
            'Accept-Language: en-US,en;q=0.9',
        ],
        CURLOPT_ENCODING => 'gzip',
    ]);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$html) return null;
    
    $rating = null;
    $reviewCount = null;
    
    // Method 1: Look for rating in JSON-LD structured data
    if (preg_match('/"ratingValue"\s*:\s*"?([\d.]+)"?/', $html, $m)) {
        $rating = round((float)$m[1], 1);
    }
    if (preg_match('/"reviewCount"\s*:\s*"?(\d+)"?/', $html, $m)) {
        $reviewCount = (int)$m[1];
    }
    
    // Method 2: Look for bubble rating class
    if (!$rating && preg_match('/bubble_(\d)(\d)/', $html, $m)) {
        $rating = (float)$m[1] + ((float)$m[2] / 10);
    }
    
    // Method 3: Look for rating text pattern
    if (!$rating && preg_match('/(\d\.\d)\s*(?:of|de)\s*5\s*(?:bubbles|bolhas)/i', $html, $m)) {
        $rating = round((float)$m[1], 1);
    }
    
    if ($rating) {
        return [
            'rating' => $rating,
            'reviewCount' => $reviewCount,
        ];
    }
    
    return null;
}

// === MAIN ===
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

// Force refresh requires admin auth
if ($forceRefresh && !checkAuth()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Return cache if valid and not forcing refresh
if (!$forceRefresh) {
    $cached = getCachedRatings();
    if ($cached) {
        echo json_encode($cached);
        exit;
    }
}

// Fetch fresh ratings
$settings = getSettings();
$result = [
    'google' => null,
    'tripadvisor' => null,
];

// Google Places
$googlePlaceId = isset($settings['settings']['googlePlaceId']) ? $settings['settings']['googlePlaceId'] : '';
$googleApiKey = isset($settings['settings']['googleApiKey']) ? $settings['settings']['googleApiKey'] : '';
if ($googlePlaceId && $googleApiKey) {
    $result['google'] = fetchGoogleRating($googlePlaceId, $googleApiKey);
}

// TripAdvisor
$taUrl = '';
if (isset($settings['tripadvisorWidget']['url'])) {
    $taUrl = $settings['tripadvisorWidget']['url'];
}
if (!$taUrl && isset($settings['social']['tripadvisor'])) {
    $taUrl = $settings['social']['tripadvisor'];
}
if ($taUrl) {
    $result['tripadvisor'] = fetchTripAdvisorRating($taUrl);
}

// Save to cache
saveCachedRatings($result);

echo json_encode($result);
