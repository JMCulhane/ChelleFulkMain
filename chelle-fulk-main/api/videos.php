<?php
/**
 * Video CRUD API Endpoint
 * 
 * Provides Create, Read, Update, Delete operations for videos
 * 
 * Routes:
 * GET    /videos.php           - Get all videos (public)
 * POST   /videos.php           - Create new video (admin only)
 * PUT    /videos.php?id=1      - Update video (admin only)
 * DELETE /videos.php?id=1      - Delete video (admin only)
 */

// Start output buffering to prevent any premature output
ob_start();

// Set CORS headers FIRST before any output
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

require_once 'db_connect.php';

if (!isset($conn) || $conn->connect_error) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Database token validation for protected routes
function checkAuth() {
    global $conn;
    
    // Try multiple methods to get the Authorization header
    $authHeader = '';
    
    // Method 1: Check for custom X-Auth-Token header (FastCGI workaround)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-Auth-Token'])) {
            $authHeader = $headers['X-Auth-Token'];
        } elseif (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    
    // Method 2: Check $_SERVER variables
    if (empty($authHeader)) {
        if (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
            $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    
    // DEBUG: Log what we received
    error_log("AUTH DEBUG - authHeader: " . $authHeader);
    error_log("AUTH DEBUG - _SERVER keys: " . implode(', ', array_keys($_SERVER)));
    
    // Check if token provided
    if (empty($authHeader)) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - No token provided', 'debug' => 'No auth header found']);
        exit;
    }
    
    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $authHeader);
    error_log("AUTH DEBUG - token after Bearer removal: " . $token);
    
    // Validate token against database
    $stmt = $conn->prepare("SELECT id, username, role, token, token_expiry FROM chellefulk_main_admin WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    error_log("AUTH DEBUG - rows found: " . $result->num_rows);
    
    if ($result->num_rows === 0) {
        // Check if token exists at all and if it's expired
        $checkStmt = $conn->prepare("SELECT token, token_expiry FROM chellefulk_main_admin WHERE token = ?");
        $checkStmt->bind_param("s", $token);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            $tokenData = $checkResult->fetch_assoc();
            error_log("AUTH DEBUG - Token exists but expired. Expiry: " . $tokenData['token_expiry']);
            $checkStmt->close();
            $stmt->close();
            ob_end_clean();
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized - Token expired', 'debug' => 'Token expired at ' . $tokenData['token_expiry']]);
            exit;
        }
        
        $checkStmt->close();
        $stmt->close();
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Invalid token', 'debug' => 'Token not found in database']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Check expiry manually
    $expiry = strtotime($user['token_expiry']);
    $now = time();
    
    if ($expiry < $now) {
        error_log("AUTH DEBUG - Token expired. Expiry: " . $user['token_expiry'] . ", Now: " . date('Y-m-d H:i:s', $now));
        $stmt->close();
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Token expired']);
        exit;
    }
    
    $stmt->close();
    
    // Return user info for potential use
    return $user;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        // Get all videos (public access)
        $result = $conn->query("SELECT id, title, thumbnail, embed_id FROM chellefulk_main_video ORDER BY created_at DESC");
        $videos = [];
        while ($row = $result->fetch_assoc()) {
            $videos[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'thumbnail' => $row['thumbnail'],
                'embedId' => $row['embed_id']
            ];
        }
        ob_end_clean();
        http_response_code(200);
        echo json_encode($videos);
        break;
        
    case 'POST':
        checkAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['thumbnail']) || !isset($input['embedId'])) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: title, thumbnail, embedId']);
            exit;
        }
        
        $title = $conn->real_escape_string($input['title']);
        $thumbnail = $conn->real_escape_string($input['thumbnail']);
        $embedId = $conn->real_escape_string($input['embedId']);
        
        $sql = "INSERT INTO chellefulk_main_video (title, thumbnail, embed_id) VALUES ('$title', '$thumbnail', '$embedId')";
        
        if ($conn->query($sql)) {
            $newId = $conn->insert_id;
            ob_end_clean();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Video created',
                'id' => $newId,
                'video' => [
                    'id' => $newId,
                    'title' => $input['title'],
                    'thumbnail' => $input['thumbnail'],
                    'embedId' => $embedId
                ]
            ]);
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create video: ' . $conn->error]);
        }
        break;
        
    case 'PUT':
        checkAuth();
        
        if (!$id) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID required for update']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['thumbnail']) || !isset($input['embedId'])) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: title, thumbnail, embedId']);
            exit;
        }
        
        $title = $conn->real_escape_string($input['title']);
        $thumbnail = $conn->real_escape_string($input['thumbnail']);
        $embedId = $conn->real_escape_string($input['embedId']);
        
        $sql = "UPDATE chellefulk_main_video SET title='$title', thumbnail='$thumbnail', embed_id='$embedId' WHERE id=$id";
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                ob_end_clean();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Video updated',
                    'video' => [
                        'id' => $id,
                        'title' => $input['title'],
                        'thumbnail' => $input['thumbnail'],
                        'embedId' => $embedId
                    ]
                ]);
            } else {
                ob_end_clean();
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Video not found or no changes made']);
            }
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update video: ' . $conn->error]);
        }
        break;
        
    case 'DELETE':
        checkAuth();
        
        if (!$id) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID required for delete']);
            exit;
        }
        
        $sql = "DELETE FROM chellefulk_main_video WHERE id=$id";
        
        if ($conn->query($sql)) {
            if ($conn->affected_rows > 0) {
                ob_end_clean();
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Video deleted']);
            } else {
                ob_end_clean();
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Video not found']);
            }
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete video: ' . $conn->error]);
        }
        break;
        
    default:
        ob_end_clean();
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

$conn->close();
?>
