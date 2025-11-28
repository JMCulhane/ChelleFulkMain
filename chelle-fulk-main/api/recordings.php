<?php
/**
 * Recording CRUD API Endpoint
 * 
 * Provides Create, Read, Update, Delete operations for recordings
 * 
 * Routes:
 * GET    /recordings.php           - Get all recordings (public)
 * POST   /recordings.php           - Create new recording (admin only)
 * PUT    /recordings.php?id=1      - Update recording (admin only)
 * DELETE /recordings.php?id=1      - Delete recording (admin only)
 */

// Start output buffering to prevent any premature output
ob_start();

// Set CORS headers FIRST before any output
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
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
    
    // Check if token provided
    if (empty($authHeader)) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - No token provided']);
        exit;
    }
    
    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $authHeader);
    
    // Validate token against database
    $stmt = $conn->prepare("SELECT id, username, role, token, token_expiry FROM chellefulk_main_admin WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Invalid token']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Check expiry
    $expiry = strtotime($user['token_expiry']);
    $now = time();
    
    if ($expiry < $now) {
        $stmt->close();
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Token expired']);
        exit;
    }
    
    $stmt->close();
    return $user;
}

// Helper function to get recording with performers and samples
function getRecordingData($conn, $id) {
    // Get recording
    $stmt = $conn->prepare("SELECT id, title, image_path, year_published, description, track_count, link FROM chellefulk_main_recordings WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return null;
    }
    
    $recording = $result->fetch_assoc();
    $stmt->close();
    
    // Get performers
    $stmt = $conn->prepare("SELECT performer_name FROM chellefulk_main_recording_performers WHERE recording_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $performers = [];
    while ($row = $result->fetch_assoc()) {
        $performers[] = $row['performer_name'];
    }
    $stmt->close();
    
    // Get samples
    $stmt = $conn->prepare("SELECT track_name, audio_url FROM chellefulk_main_recording_samples WHERE recording_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $samples = [];
    while ($row = $result->fetch_assoc()) {
        $samples[] = [
            'trackName' => $row['track_name'],
            'audioUrl' => $row['audio_url']
        ];
    }
    $stmt->close();
    
    return [
        'id' => (int)$recording['id'],
        'title' => $recording['title'],
        'image' => $recording['image_path'],
        'yearPublished' => $recording['year_published'] ? (int)$recording['year_published'] : null,
        'description' => $recording['description'],
        'trackCount' => (int)$recording['track_count'],
        'link' => $recording['link'],
        'performers' => $performers,
        'samples' => $samples
    ];
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Support POST _method override for file upload updates
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

switch ($method) {
    case 'GET':
        // Only return all recordings, not single
        $result = $conn->query("SELECT id FROM chellefulk_main_recordings ORDER BY id ASC");
        $recordings = [];
        while ($row = $result->fetch_assoc()) {
            $recording = getRecordingData($conn, $row['id']);
            if ($recording) {
                $recordings[] = $recording;
            }
        }
        ob_end_clean();
        http_response_code(200);
        echo json_encode($recordings);
        break;
        
    case 'POST':
        checkAuth();
        
        // Handle multipart/form-data for image upload
        $title = isset($_POST['title']) ? $_POST['title'] : null;
        $yearPublished = isset($_POST['yearPublished']) ? intval($_POST['yearPublished']) : null;
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        $trackCount = isset($_POST['trackCount']) ? intval($_POST['trackCount']) : null;
        $link = isset($_POST['link']) ? $_POST['link'] : '';
        $performers = isset($_POST['performers']) ? json_decode($_POST['performers'], true) : [];
        $samples = isset($_POST['samples']) ? json_decode($_POST['samples'], true) : [];
        
        // Validate required fields
        if (!$title || !$trackCount || empty($performers)) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: title, trackCount, performers']);
            exit;
        }
        
        // Handle image upload
        $imagePath = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/png'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only PNG images are allowed.']);
                exit;
            }
            
            if ($_FILES['image']['size'] > $maxSize) {
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            
            $targetDir = "../public/assets/recordings/images/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            
            $filename = uniqid() . '_' . basename($_FILES['image']['name']);
            $targetPath = $targetDir . $filename;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = '/assets/recordings/images/' . $filename;
            } else {
                ob_end_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
                exit;
            }
        } else {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Image file is required']);
            exit;
        }
        
        // Insert recording
        $stmt = $conn->prepare("INSERT INTO chellefulk_main_recordings (title, image_path, year_published, description, track_count, link) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssisss", $title, $imagePath, $yearPublished, $description, $trackCount, $link);
        
        if ($stmt->execute()) {
            $recordingId = $conn->insert_id;
            
            // Insert performers
            foreach ($performers as $performer) {
                $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
                $stmt->bind_param("is", $recordingId, $performer);
                $stmt->execute();
            }
            
            // Insert samples
            foreach ($samples as $sample) {
                if (isset($sample['trackName']) && isset($sample['audioUrl'])) {
                    $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
                    $stmt->bind_param("iss", $recordingId, $sample['trackName'], $sample['audioUrl']);
                    $stmt->execute();
                }
            }
            
            $recording = getRecordingData($conn, $recordingId);
            
            ob_end_clean();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Recording created',
                'id' => $recordingId,
                'recording' => $recording
            ]);
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create recording: ' . $conn->error]);
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
        // Handle multipart/form-data for image upload
        $title = isset($_POST['title']) ? $_POST['title'] : null;
        $yearPublished = isset($_POST['yearPublished']) ? intval($_POST['yearPublished']) : null;
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        $trackCount = isset($_POST['trackCount']) ? intval($_POST['trackCount']) : null;
        $link = isset($_POST['link']) ? $_POST['link'] : '';
        $performers = isset($_POST['performers']) ? json_decode($_POST['performers'], true) : [];
        $samples = isset($_POST['samples']) ? json_decode($_POST['samples'], true) : [];
        // Validate required fields
        if (!$title || !$trackCount || empty($performers)) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: title, trackCount, performers']);
            exit;
        }
        // Get existing recording to check if it exists and get current image path
        $stmt = $conn->prepare("SELECT image_path FROM chellefulk_main_recordings WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            ob_end_clean();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Recording not found']);
            exit;
        }
        $existing = $result->fetch_assoc();
        $imagePath = $existing['image_path']; // Keep existing image by default
        $stmt->close();
        // Handle new image upload if provided
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/png'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only PNG images are allowed.']);
                exit;
            }
            if ($_FILES['image']['size'] > $maxSize) {
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            $targetDir = "../public/assets/recordings/images/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $filename = uniqid() . '_' . basename($_FILES['image']['name']);
            $targetPath = $targetDir . $filename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                // Delete old image if it's not one of the seed images
                if (!in_array(basename($imagePath), ['2DoBeatles.png', 'IslandTime.png', 'Keltish.png'])) {
                    $oldImagePath = "../public" . $imagePath;
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $imagePath = '/assets/recordings/images/' . $filename;
            }
        }
        // Update recording
        $stmt = $conn->prepare("UPDATE chellefulk_main_recordings SET title=?, image_path=?, year_published=?, description=?, track_count=?, link=? WHERE id=?");
        $stmt->bind_param("ssisssi", $title, $imagePath, $yearPublished, $description, $trackCount, $link, $id);
        if ($stmt->execute()) {
            // Delete existing performers and samples
            $conn->query("DELETE FROM chellefulk_main_recording_performers WHERE recording_id=$id");
            $conn->query("DELETE FROM chellefulk_main_recording_samples WHERE recording_id=$id");
            // Insert new performers
            foreach ($performers as $performer) {
                $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
                $stmt->bind_param("is", $id, $performer);
                $stmt->execute();
            }
            // Insert new samples
            foreach ($samples as $sample) {
                if (isset($sample['trackName']) && isset($sample['audioUrl'])) {
                    $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
                    $stmt->bind_param("iss", $id, $sample['trackName'], $sample['audioUrl']);
                    $stmt->execute();
                }
            }
            $recording = getRecordingData($conn, $id);
            ob_end_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Recording updated',
                'recording' => $recording
            ]);
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update recording: ' . $conn->error]);
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
        // Check if recording exists
        $recording = getRecordingData($conn, $id);
        if (!$recording) {
            ob_end_clean();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Recording not found']);
            exit;
        }
        // Delete recording (CASCADE will delete performers and samples)
        $sql = "DELETE FROM chellefulk_main_recordings WHERE id=$id";
        if ($conn->query($sql)) {
            // Delete image file if it's not one of the seed images
            if (!in_array(basename($recording['image']), ['2DoBeatles.png', 'IslandTime.png', 'Keltish.png'])) {
                $imagePath = "../public" . $recording['image'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            ob_end_clean();
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Recording deleted']);
        } else {
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete recording: ' . $conn->error]);
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
