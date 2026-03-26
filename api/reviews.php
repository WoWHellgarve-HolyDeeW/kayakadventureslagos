<?php
/**
 * TripAdvisor Reviews API
 * Fetches, caches, and serves TripAdvisor reviews.
 * 
 * GET /api/reviews.php              - Returns cached reviews (public, filtered ≥4 stars)
 * GET /api/reviews.php?refresh=1    - Force refresh cache (requires admin auth)
 * GET /api/reviews.php?min_stars=5  - Override minimum stars filter
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

$AUTH_FILE = __DIR__ . '/auth.json';
$CACHE_FILE = __DIR__ . '/reviews_cache.json';
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

function getLocationId($url) {
    // Extract location ID from TripAdvisor URL
    // Example: /Attraction_Review-g189117-d4223914-Reviews-...
    if (preg_match('/d(\d{5,10})/', $url, $m)) {
        return $m[1];
    }
    return null;
}

function fetchTripAdvisorReviews($taUrl) {
    $locationId = getLocationId($taUrl);
    if (!$locationId) return ['error' => 'Invalid TripAdvisor URL', 'reviews' => []];
    
    // Method 1: Try to fetch the page HTML and parse reviews
    $reviews = fetchFromHtml($taUrl, $locationId);
    
    if (!empty($reviews)) {
        return ['success' => true, 'source' => 'tripadvisor', 'locationId' => $locationId, 'reviews' => $reviews, 'fetched' => date('c')];
    }
    
    return ['error' => 'Could not fetch reviews. Add them manually in the admin panel.', 'reviews' => [], 'locationId' => $locationId];
}

function fetchFromHtml($url, $locationId) {
    // Ensure we request a good number of reviews
    $fetchUrl = preg_replace('/(-Reviews-)/', '$1', $url);
    // Remove any query parameters
    $fetchUrl = strtok($fetchUrl, '?');
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $fetchUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'Cache-Control: no-cache',
        ],
        CURLOPT_ENCODING => 'gzip',
        CURLOPT_COOKIEJAR => sys_get_temp_dir() . '/ta_cookies.txt',
        CURLOPT_COOKIEFILE => sys_get_temp_dir() . '/ta_cookies.txt',
    ]);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$html) {
        return [];
    }
    
    $reviews = [];
    
    // Try to find review data in various formats TripAdvisor uses
    
    // Method A: Parse review bubbles from HTML (server-rendered reviews)
    $reviews = parseHtmlReviews($html);
    
    if (empty($reviews)) {
        // Method B: Look for JSON data in script tags
        $reviews = parseScriptData($html);
    }
    
    return $reviews;
}

function parseHtmlReviews($html) {
    $reviews = [];
    
    // TripAdvisor renders reviews with specific class patterns
    // Look for review containers with rating bubbles and text
    
    // Pattern: data-reviewid or class containing "review"
    // Rating is in bubble_X0 or ui_bubble_rating_X format
    
    // Extract review blocks
    if (preg_match_all('/<div[^>]*(?:data-reviewid|reviewSelector)[^>]*>(.*?)<\/div>\s*<\/div>\s*<\/div>/si', $html, $blocks)) {
        foreach ($blocks[0] as $block) {
            $review = parseReviewBlock($block);
            if ($review) $reviews[] = $review;
        }
    }
    
    // Alternative: Look for structured review data with bubble ratings
    if (empty($reviews)) {
        // Try matching individual pieces
        $ratingPattern = '/bubble_(\d)0/';
        $namePattern = '/<a[^>]*class="[^"]*ui_header_link[^"]*"[^>]*>([^<]+)<\/a>/i';
        $textPattern = '/<q[^>]*class="[^"]*IRsGHoPm[^"]*"[^>]*>([^<]*)<\/q>/si';
        
        // Get all review ratings
        preg_match_all($ratingPattern, $html, $ratings, PREG_OFFSET_CAPTURE);
        
        if (count($ratings[1]) > 0) {
            foreach ($ratings[1] as $i => $ratingMatch) {
                $rating = (int)$ratingMatch[0];
                $offset = $ratingMatch[1];
                
                // Look for nearby text content
                $nearby = substr($html, max(0, $offset - 2000), 5000);
                
                $name = 'Reviewer';
                if (preg_match('/<span[^>]*>[^<]*wrote a review[^<]*<\/span>|<a[^>]*>([A-Z][a-zA-Z\s\.]+)<\/a>/i', $nearby, $nameM)) {
                    $name = isset($nameM[1]) ? trim($nameM[1]) : $name;
                }
                
                $text = '';
                if (preg_match('/<q[^>]*>([^<]+)<\/q>|class="[^"]*partial_entry[^"]*"[^>]*>([^<]+)/i', $nearby, $textM)) {
                    $text = trim($textM[1] ?: $textM[2]);
                }
                
                if ($text && strlen($text) > 10) {
                    $reviews[] = [
                        'name' => htmlspecialchars_decode($name, ENT_QUOTES),
                        'rating' => $rating,
                        'text' => htmlspecialchars_decode($text, ENT_QUOTES),
                        'source' => 'tripadvisor',
                        'date' => ''
                    ];
                }
            }
        }
    }
    
    return $reviews;
}

function parseReviewBlock($block) {
    $rating = 0;
    if (preg_match('/bubble_(\d)0/', $block, $m)) {
        $rating = (int)$m[1];
    }
    
    $text = '';
    if (preg_match('/<q[^>]*>([^<]+)<\/q>/i', $block, $m)) {
        $text = trim($m[1]);
    } elseif (preg_match('/partial_entry[^>]*>([^<]+)/i', $block, $m)) {
        $text = trim($m[1]);
    }
    
    $name = '';
    if (preg_match('/<a[^>]*>([A-Z][a-zA-Z\s\.]{2,30})<\/a>/i', $block, $m)) {
        $name = trim($m[1]);
    }
    
    if ($rating > 0 && $text) {
        return [
            'name' => htmlspecialchars_decode($name ?: 'Reviewer', ENT_QUOTES),
            'rating' => $rating,
            'text' => htmlspecialchars_decode($text, ENT_QUOTES),
            'source' => 'tripadvisor',
            'date' => ''
        ];
    }
    
    return null;
}

function parseScriptData($html) {
    $reviews = [];
    
    // Try to find review data in __NEXT_DATA__ or similar JSON blocks
    if (preg_match('/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/si', $html, $m)) {
        $data = json_decode($m[1], true);
        if ($data) {
            $reviews = extractReviewsFromJson($data);
        }
    }
    
    // Try window.__WEB_CONTEXT__ pattern
    if (empty($reviews) && preg_match('/window\.__WEB_CONTEXT__\s*=\s*({.*?});/si', $html, $m)) {
        $data = json_decode($m[1], true);
        if ($data) {
            $reviews = extractReviewsFromJson($data);
        }
    }
    
    return $reviews;
}

function extractReviewsFromJson($data, $depth = 0) {
    if ($depth > 10) return [];
    $reviews = [];
    
    if (is_array($data)) {
        // Check if this looks like a review object
        if (isset($data['text']) && isset($data['rating']) && is_numeric($data['rating'])) {
            $reviews[] = [
                'name' => isset($data['username']) ? $data['username'] : (isset($data['author']) ? $data['author'] : 'Reviewer'),
                'rating' => (int)$data['rating'],
                'text' => is_string($data['text']) ? $data['text'] : '',
                'source' => 'tripadvisor',
                'date' => isset($data['publishedDate']) ? $data['publishedDate'] : ''
            ];
        }
        
        // Check for reviewListPage or similar
        if (isset($data['reviews']) && is_array($data['reviews'])) {
            foreach ($data['reviews'] as $r) {
                $sub = extractReviewsFromJson($r, $depth + 1);
                $reviews = array_merge($reviews, $sub);
            }
        }
        
        // Recursively search
        foreach ($data as $key => $value) {
            if (is_array($value) && $depth < 5) {
                if (in_array($key, ['reviews', 'reviewListPage', 'reviewData', 'result', 'data', 'props', 'pageProps'])) {
                    $sub = extractReviewsFromJson($value, $depth + 1);
                    $reviews = array_merge($reviews, $sub);
                }
            }
        }
    }
    
    return $reviews;
}

function getCache() {
    global $CACHE_FILE, $CACHE_TTL;
    if (!file_exists($CACHE_FILE)) return null;
    
    $data = json_decode(file_get_contents($CACHE_FILE), true);
    if (!$data || !isset($data['timestamp'])) return null;
    
    // Check if cache is still valid
    if (time() - $data['timestamp'] > $CACHE_TTL) return null;
    
    return $data;
}

function saveCache($data) {
    global $CACHE_FILE;
    $data['timestamp'] = time();
    file_put_contents($CACHE_FILE, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    @chmod($CACHE_FILE, 0600);
}

// ============ Main logic ============

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$minStars = isset($_GET['min_stars']) ? max(1, min(5, (int)$_GET['min_stars'])) : 4;
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

// Force refresh requires auth
if ($forceRefresh) {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// Try cache first
if (!$forceRefresh) {
    $cached = getCache();
    if ($cached && isset($cached['reviews'])) {
        $filtered = array_values(array_filter($cached['reviews'], function($r) use ($minStars) {
            return isset($r['rating']) && $r['rating'] >= $minStars;
        }));
        echo json_encode([
            'success' => true,
            'source' => $cached['source'] ?? 'cache',
            'count' => count($filtered),
            'total_cached' => count($cached['reviews']),
            'cache_age' => time() - ($cached['timestamp'] ?? 0),
            'reviews' => $filtered
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Need to fetch - get TA URL from site data
$DATA_FILE = __DIR__ . '/site-data.json';
$taUrl = '';

if (file_exists($DATA_FILE)) {
    $siteData = json_decode(file_get_contents($DATA_FILE), true);
    if ($siteData && isset($siteData['tripadvisorWidget']['url'])) {
        $taUrl = $siteData['tripadvisorWidget']['url'];
    }
}

if (!$taUrl) {
    echo json_encode(['error' => 'No TripAdvisor URL configured. Set it in the admin panel.', 'reviews' => []]);
    exit;
}

// Validate URL
if (!preg_match('/^https?:\/\/(www\.)?(tripadvisor\.\w+)/i', $taUrl)) {
    echo json_encode(['error' => 'Invalid TripAdvisor URL.', 'reviews' => []]);
    exit;
}

$result = fetchTripAdvisorReviews($taUrl);

if (!empty($result['reviews'])) {
    saveCache($result);
    
    $filtered = array_values(array_filter($result['reviews'], function($r) use ($minStars) {
        return isset($r['rating']) && $r['rating'] >= $minStars;
    }));
    
    echo json_encode([
        'success' => true,
        'source' => 'tripadvisor',
        'count' => count($filtered),
        'total_fetched' => count($result['reviews']),
        'reviews' => $filtered
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'error' => $result['error'] ?? 'Could not fetch reviews automatically. TripAdvisor may be blocking automated requests. Add reviews manually in the admin panel.',
        'reviews' => [],
        'hint' => 'Add your best TripAdvisor reviews manually via Admin > Testemunhos. Set source to "TripAdvisor" for proper branding.'
    ], JSON_UNESCAPED_UNICODE);
}
