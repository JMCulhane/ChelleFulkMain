<?php
// In-memory logger for chunked uploads
$debug_log = [];
function log_upload_debug($msg) {
    global $debug_log;
    $ts = date('Y-m-d H:i:s');
    $debug_log[] = "[$ts] $msg";
}

// Handle chunked audio upload
if (
    $_SERVER['REQUEST_METHOD'] === 'POST' &&
    isset($_GET['action']) && $_GET['action'] === 'upload_chunk'
) {
    log_upload_debug('--- New chunked upload request ---');
    $uploadDir = __DIR__ . '/../assets/recordings/chunks/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $chunkNumber = isset($_POST['chunkNumber']) ? intval($_POST['chunkNumber']) : 0;
    $totalChunks = isset($_POST['totalChunks']) ? intval($_POST['totalChunks']) : 1;
    $fileName = isset($_POST['fileName']) ? preg_replace('/[^a-zA-Z0-9._-]/', '_', $_POST['fileName']) : uniqid('audio_');
    $recordingId = isset($_POST['recordingId']) ? preg_replace('/[^a-zA-Z0-9-_]/', '_', $_POST['recordingId']) : 'unknown';
    $recordingTitle = isset($_POST['recordingTitle']) ? $_POST['recordingTitle'] : $recordingId;
    // Sanitize folder name same way as main POST handler
    $folderName = preg_replace('/[^a-zA-Z0-9-_ ]/', '', $recordingTitle);
    $folderName = str_replace(' ', '_', $folderName);
    if (empty($folderName)) $folderName = 'recording_' . uniqid();
    $uploadId = isset($_POST['uploadId']) ? preg_replace('/[^a-zA-Z0-9_-]/', '_', $_POST['uploadId']) : uniqid('upload_');
    $chunkFile = $uploadDir . $uploadId . '_' . $chunkNumber;
    log_upload_debug("Chunk number: $chunkNumber / $totalChunks, fileName: $fileName, recordingId: $recordingId, recordingTitle: $recordingTitle, folderName: $folderName, uploadId: $uploadId");
    
    if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
        log_upload_debug('No chunk uploaded or upload error.');
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No chunk uploaded', 'uploadId' => $uploadId, 'debug' => $debug_log]);
        exit;
    }
    
    if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkFile)) {
        log_upload_debug('Failed to save chunk.');
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save chunk', 'uploadId' => $uploadId, 'debug' => $debug_log]);
        exit;
    }
    
    log_upload_debug('Chunk saved to: ' . $chunkFile);
    
    if ($chunkNumber === $totalChunks - 1) {
        log_upload_debug('This is the final chunk, beginning assembly...');
        $finalDir = __DIR__ . '/../assets/recordings/' . $folderName . '/';
        log_upload_debug('__DIR__ is: ' . __DIR__);
        log_upload_debug('Final directory (relative): ' . $finalDir);
        
        $parentDir = dirname($finalDir);
        log_upload_debug('Parent directory: ' . $parentDir);
        log_upload_debug('Parent directory exists: ' . (file_exists($parentDir) ? 'yes' : 'no'));
        log_upload_debug('Parent directory writable: ' . (is_writable($parentDir) ? 'yes' : 'no'));
        
        if (!file_exists($finalDir)) {
            log_upload_debug('Final directory does not exist, attempting to create...');
            $mkdirResult = @mkdir($finalDir, 0755, true);
            $mkdirError = error_get_last();
            log_upload_debug('mkdir result: ' . ($mkdirResult ? 'success' : 'failed'));
            if (!$mkdirResult && $mkdirError) {
                log_upload_debug('mkdir error: ' . json_encode($mkdirError));
            }
            log_upload_debug('Final directory exists after mkdir: ' . (file_exists($finalDir) ? 'yes' : 'no'));
        } else {
            log_upload_debug('Final directory already exists');
        }
        
        log_upload_debug('Final directory writable: ' . (is_writable($finalDir) ? 'yes' : 'no'));
        log_upload_debug('Final directory permissions: ' . (file_exists($finalDir) ? substr(sprintf('%o', fileperms($finalDir)), -4) : 'N/A'));
        
        $finalPath = $finalDir . $fileName;
        log_upload_debug('Final file path: ' . $finalPath);
        
        if (!file_exists($finalDir)) {
            log_upload_debug('ERROR: Final directory still does not exist, cannot create file');
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create directory', 'uploadId' => $uploadId, 'debug' => $debug_log]);
            exit;
        }
        
        $out = @fopen($finalPath, 'wb');
        if (!$out) {
            $fopenError = error_get_last();
            log_upload_debug('fopen failed for final file: ' . json_encode($fopenError));
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create final file', 'uploadId' => $uploadId, 'debug' => $debug_log]);
            exit;
        }
        log_upload_debug('Opened final file for writing');
        
        for ($i = 0; $i < $totalChunks; $i++) {
            $part = $uploadDir . $uploadId . '_' . $i;
            if (!file_exists($part)) {
                log_upload_debug('Missing chunk ' . $i . ' at path: ' . $part);
                fclose($out);
                ob_end_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Missing chunk ' . $i, 'uploadId' => $uploadId, 'debug' => $debug_log]);
                exit;
            }
            log_upload_debug('Processing chunk ' . $i . ', size: ' . filesize($part) . ' bytes');
            $in = fopen($part, 'rb');
            stream_copy_to_stream($in, $out);
            fclose($in);
            unlink($part);
            log_upload_debug('Chunk ' . $i . ' copied and deleted');
        }
        fclose($out);
        
        $finalFileSize = file_exists($finalPath) ? filesize($finalPath) : 0;
        log_upload_debug('All chunks assembled. Final file size: ' . $finalFileSize . ' bytes');
        log_upload_debug('Final file exists: ' . (file_exists($finalPath) ? 'yes' : 'no'));
        
        ob_end_clean();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'uploadId' => $uploadId,
            'filePath' => '/assets/recordings/' . $folderName . '/' . $fileName,
            'fileSize' => $finalFileSize,
            'absolutePath' => realpath($finalPath),
            'directoryPath' => realpath($finalDir),
            'debug' => $debug_log
        ]);
        exit;
    }
    
    // Not last chunk, respond with uploadId
    ob_end_clean();
    http_response_code(200);
    echo json_encode(['success' => true, 'uploadId' => $uploadId, 'chunkNumber' => $chunkNumber, 'debug' => $debug_log]);
    exit;
}
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
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

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

// Handle sample deletion endpoint
if (
    $_SERVER['REQUEST_METHOD'] === 'DELETE' &&
    isset($_GET['action']) && $_GET['action'] === 'delete_sample' &&
    isset($_GET['recording_id']) && isset($_GET['sample_id'])
) {
    // Check authentication
    $authHeader = '';
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-Auth-Token'])) {
            $authHeader = $headers['X-Auth-Token'];
        } elseif (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    if (empty($authHeader)) {
        if (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
            $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    if (empty($authHeader)) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - No token provided']);
        exit;
    }
    
    $token = str_replace('Bearer ', '', $authHeader);
    $stmt = $conn->prepare("SELECT id FROM chellefulk_main_admin WHERE token = ? AND token_expiry > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $stmt->close();
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized - Invalid or expired token']);
        exit;
    }
    $stmt->close();
    
    $recordingId = intval($_GET['recording_id']);
    $sampleId = intval($_GET['sample_id']);
    
    // Get sample info before deletion
    $stmt = $conn->prepare("SELECT rs.audio_url, r.title FROM chellefulk_main_recording_samples rs JOIN chellefulk_main_recordings r ON rs.recording_id = r.id WHERE rs.id = ? AND rs.recording_id = ?");
    $stmt->bind_param("ii", $sampleId, $recordingId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        ob_end_clean();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Sample not found']);
        exit;
    }
    
    $sample = $result->fetch_assoc();
    $audioUrl = $sample['audio_url'];
    $stmt->close();
    
    // Delete from database
    $stmt = $conn->prepare("DELETE FROM chellefulk_main_recording_samples WHERE id = ? AND recording_id = ?");
    $stmt->bind_param("ii", $sampleId, $recordingId);
    
    if ($stmt->execute()) {
        $stmt->close();
        
        // Delete the audio file from disk
        if (!empty($audioUrl)) {
            $filePath = __DIR__ . '/..' . $audioUrl;
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        
        ob_end_clean();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Sample deleted successfully']);
    } else {
        $stmt->close();
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete sample: ' . $conn->error]);
    }
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
    $stmt = $conn->prepare("SELECT id, track_name, audio_url FROM chellefulk_main_recording_samples WHERE recording_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $samples = [];
    while ($row = $result->fetch_assoc()) {
        $samples[] = [
            'id' => (int)$row['id'],
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

// Helper to sanitize folder names - used by both POST and PUT
function sanitizeFolderName($name) {
    $name = preg_replace('/[^a-zA-Z0-9-_ ]/', '', $name); // Remove special chars
    $name = str_replace(' ', '_', $name); // Spaces to underscores
    return $name;
}

switch ($method) {
    case 'GET':
        // Only return all recordings, not single
        $result = $conn->query("SELECT id FROM chellefulk_main_recordings ORDER BY created_at DESC");
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
        
        // Audit log collector
        $audit_log = [];
        function log_audit($msg) {
            global $audit_log;
            $audit_log[] = $msg;
            error_log($msg);
        }
        
        // Debug logging
        $debug_info = [
            'POST_keys' => array_keys($_POST),
            'FILES_keys' => array_keys($_FILES),
            'POST_values' => $_POST,
            'FILES_info' => array_map(function($f) {
                return [
                    'name' => $f['name'] ?? 'N/A',
                    'size' => $f['size'] ?? 0,
                    'error' => $f['error'] ?? -1,
                    'type' => $f['type'] ?? 'N/A'
                ];
            }, $_FILES)
        ];
        log_audit('POST /recordings.php - Debug: ' . json_encode($debug_info));
        
        log_audit('');
        log_audit('╔════════════════════════════════════════════════════════════════════════╗');
        log_audit('║                    POST REQUEST - FULL AUDIT LOG                       ║');
        log_audit('╚════════════════════════════════════════════════════════════════════════╝');
        log_audit('');
        
        log_audit('📥 STEP 1: REQUEST RECEIVED');
        log_audit('   Request Method: ' . $_SERVER['REQUEST_METHOD']);
        log_audit('   Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
        log_audit('   Content-Length: ' . ($_SERVER['CONTENT_LENGTH'] ?? 'not set'));
        log_audit('');
        
        log_audit('📋 STEP 2: POST DATA INVENTORY');
        log_audit('   $_POST keys (' . count($_POST) . '): ' . implode(', ', array_keys($_POST)));
        foreach ($_POST as $key => $value) {
            $display = is_string($value) && strlen($value) > 100 ? substr($value, 0, 100) . '...' : $value;
            if (is_array($value)) {
                log_audit('      ' . $key . ' = [array with ' . count($value) . ' elements]');
            } else {
                log_audit('      ' . $key . ' = ' . $display);
            }
        }
        log_audit('');
        
        log_audit('📁 STEP 3: FILES INVENTORY');
        log_audit('   $_FILES keys (' . count($_FILES) . '): ' . implode(', ', array_keys($_FILES)));
        foreach ($_FILES as $key => $fileData) {
            log_audit('      ' . $key . ':');
            log_audit('         name: ' . ($fileData['name'] ?? 'N/A'));
            log_audit('         type: ' . ($fileData['type'] ?? 'N/A'));
            log_audit('         size: ' . ($fileData['size'] ?? 'N/A') . ' bytes');
            log_audit('         tmp_name: ' . ($fileData['tmp_name'] ?? 'N/A'));
            log_audit('         error: ' . ($fileData['error'] ?? 'N/A') . ' (' . ($fileData['error'] === UPLOAD_ERR_OK ? 'OK' : 'ERROR') . ')');
        }
        log_audit('');
        
        log_audit('🔍 STEP 4: PARSING INPUT DATA');
        
        // Handle multipart/form-data for image upload
        $title = isset($_POST['title']) ? $_POST['title'] : null;
        log_audit('   title = ' . ($title ?? 'null'));
        $yearPublished = isset($_POST['yearPublished']) ? intval($_POST['yearPublished']) : null;
        log_audit('   yearPublished = ' . ($yearPublished ?? 'null'));
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        log_audit('   description length = ' . (isset($description) ? strlen($description) : 0) . ' chars');
        $trackCount = isset($_POST['trackCount']) ? intval($_POST['trackCount']) : null;
        log_audit('   trackCount = ' . ($trackCount ?? 'null'));
        $link = isset($_POST['link']) ? $_POST['link'] : '';
        log_audit('   link = "' . $link . '"');
        $performers = isset($_POST['performers']) ? json_decode($_POST['performers'], true) : [];
        log_audit('   performers (JSON decode): ' . json_encode($performers));
        $samples = isset($_POST['samples']) ? json_decode($_POST['samples'], true) : [];
        log_audit('   samples (JSON decode): ' . json_encode($samples));
        log_audit('');
        
        log_audit('✅ STEP 5: VALIDATION CHECKS');
        $validationErrors = [];
        if (!$title) $validationErrors[] = 'title';
        if (!$trackCount) $validationErrors[] = 'trackCount';
        if (empty($performers)) $validationErrors[] = 'performers';
        
        if (!empty($validationErrors)) {
            log_audit('   ❌ VALIDATION FAILED: Missing ' . implode(', ', $validationErrors));
        } else {
            log_audit('   ✓ All required fields present');
        }
        log_audit('');
        
        log_audit('Decoded samples: ' . json_encode($samples));
        log_audit('Decoded performers: ' . json_encode($performers));
        
        // Validate required fields
        if (!$title || !$trackCount || empty($performers)) {
            log_audit('❌ EXITING: Validation failed');
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: title, trackCount, performers']);
            exit;
        }
        
        log_audit('📁 STEP 6: FOLDER SETUP');

        // Create per-recording folder for media (under public/assets so files are web-accessible)
        $recordingFolder = sanitizeFolderName($title);
        log_audit('   Sanitized folder name: "' . $recordingFolder . '"');
        $baseRecordingDir = "../public/assets/recordings/";
        log_audit('   Base recording dir: "' . $baseRecordingDir . '"');
        $recordingDir = $baseRecordingDir . $recordingFolder . "/";
        log_audit('   Full recording dir: "' . $recordingDir . '"');
        if (!file_exists($recordingDir)) {
            log_audit('   Creating directory...');
            mkdir($recordingDir, 0755, true);
            log_audit('   ✓ Directory created');
        } else {
            log_audit('   ✓ Directory already exists');
        }
        log_audit('');

        log_audit('🖼️  STEP 7: IMAGE UPLOAD PROCESSING');
        // Handle image upload (always to images folder)
        $imagePath = '';
        log_audit('   Checking $_FILES["image"]...');
        log_audit('      isset: ' . (isset($_FILES['image']) ? 'yes' : 'no'));
        if (isset($_FILES['image'])) {
            log_audit('      error code: ' . $_FILES['image']['error']);
            log_audit('      UPLOAD_ERR_OK = ' . UPLOAD_ERR_OK);
        }
        log_audit('   Checking $_FILES["image"]...');
        log_audit('      isset: ' . (isset($_FILES['image']) ? 'yes' : 'no'));
        if (isset($_FILES['image'])) {
            log_audit('      error code: ' . $_FILES['image']['error']);
            log_audit('      UPLOAD_ERR_OK = ' . UPLOAD_ERR_OK);
        }
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            log_audit('   ✓ Image file received');
            $allowedTypes = ['image/png'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            log_audit('      File type: ' . $_FILES['image']['type']);
            log_audit('      File size: ' . $_FILES['image']['size'] . ' bytes');
            log_audit('      Allowed types: ' . implode(', ', $allowedTypes));
            log_audit('      Max size: ' . $maxSize . ' bytes');
            
            if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                log_audit('   ❌ EXITING: Invalid file type');
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid file type. Only PNG images are allowed.']);
                exit;
            }
            if ($_FILES['image']['size'] > $maxSize) {
                log_audit('   ❌ EXITING: File too large');
                ob_end_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 5MB.']);
                exit;
            }
            log_audit('   ✓ Validation passed');
            
            $filename = uniqid() . '_' . basename($_FILES['image']['name']);
            log_audit('   Generated filename: "' . $filename . '"');
            $imageDir = __DIR__ . '/../assets/recordings/images/';
            log_audit('   Image directory: "' . $imageDir . '"');
            if (!file_exists($imageDir)) {
                log_audit('   Creating image directory...');
                mkdir($imageDir, 0755, true);
                log_audit('   ✓ Directory created');
            } else {
                log_audit('   ✓ Image directory exists');
            }
            $targetPath = $imageDir . $filename;
            log_audit('   Target path: "' . $targetPath . '"');
            log_audit('   Attempting move_uploaded_file...');
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = '/assets/recordings/images/' . $filename;
                log_audit('   ✓ SUCCESS: Image moved to ' . $targetPath);
                log_audit('   ✓ Image path for DB: ' . $imagePath);
            } else {
                log_audit('   ❌ EXITING: move_uploaded_file failed');
                log_audit('      tmp_name was: ' . $_FILES['image']['tmp_name']);
                log_audit('      target was: ' . $targetPath);
                log_audit('      file_exists(tmp): ' . (file_exists($_FILES['image']['tmp_name']) ? 'yes' : 'no'));
                log_audit('      is_writable(dir): ' . (is_writable($imageDir) ? 'yes' : 'no'));
                ob_end_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
                exit;
            }
        } else {
            log_audit('   ❌ EXITING: No image file or upload error');
            if (isset($_FILES['image'])) {
                log_audit('      Error code was: ' . $_FILES['image']['error']);
            }
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Image file is required']);
            exit;
        }
        log_audit('');

        log_audit('🎵 STEP 8: AUDIO SAMPLE PROCESSING');
        // Handle sample uploads (audio files) to per-recording folder and collect URLs for DB
        $mediaFiles = [];
        $allowedSampleExts = ['mp3', 'mp4', 'm4a', 'wav'];
        $sampleUrlMap = [];
        $uploadedSampleCount = 0;
        
        log_audit('   Allowed audio extensions: ' . implode(', ', $allowedSampleExts));
        log_audit('');
        
        log_audit('   STEP 8a: Checking for chunked upload file paths in $_POST');
        // Check for chunked upload file paths first
        if (isset($_POST['audioFilePath'])) {
            log_audit('      ✓ Found $_POST["audioFilePath"]: ' . $_POST['audioFilePath']);
            // Single audio file from chunked upload
            $mediaFiles[] = $_POST['audioFilePath'];
            $sampleUrlMap['audioFile'] = $_POST['audioFilePath'];
            // Also map to first sample if we have samples array
            if (!empty($samples) && isset($samples[0]['trackName'])) {
                $sampleKey = 'sample_' . preg_replace('/[^a-zA-Z0-9]/', '', $samples[0]['trackName']);
                $sampleUrlMap[$sampleKey] = $_POST['audioFilePath'];
                log_audit('      Mapped to sample key: ' . $sampleKey);
            }
            $uploadedSampleCount++;
            log_audit('      Uploaded sample count: ' . $uploadedSampleCount);
        } else {
            log_audit('      No $_POST["audioFilePath"] found');
        }
        
        // Check for multiple chunked upload file paths
        log_audit('   STEP 8b: Checking for multiple chunked upload paths (audioFilePath_X)');
        $chunkedFileIndex = 0;
        foreach ($_POST as $key => $value) {
            if (strpos($key, 'audioFilePath_') === 0 && !empty($value)) {
                log_audit('      ✓ Found ' . $key . ': ' . $value);
                $mediaFiles[] = $value;
                $sampleUrlMap[$key] = $value;
                // Map to corresponding sample by index
                if (!empty($samples) && isset($samples[$chunkedFileIndex]['trackName'])) {
                    $sampleKey = 'sample_' . preg_replace('/[^a-zA-Z0-9]/', '', $samples[$chunkedFileIndex]['trackName']);
                    $sampleUrlMap[$sampleKey] = $value;
                    log_audit('      Mapped to sample[' . $chunkedFileIndex . ']: ' . $sampleKey);
                }
                $chunkedFileIndex++;
                $uploadedSampleCount++;
            }
        }
        log_audit('      Total chunked paths found: ' . $chunkedFileIndex);
        log_audit('');
        
        log_audit('   STEP 8c: Processing regular file uploads from $_FILES');
        // Handle regular file uploads (for files under 2MB or non-chunked uploads)
        $processedFileKeys = [];
        foreach ($_FILES as $key => $file) {
            // Skip the image file - we already processed it
            if ($key === 'image') {
                log_audit('      Skipping "image" key (already processed)');
                continue;
            }
            
            log_audit('      Processing $_FILES["' . $key . '"]');
            log_audit('         name: ' . ($file['name'] ?? 'N/A'));
            log_audit('         error: ' . ($file['error'] ?? 'N/A'));
            
            if ($file['error'] === UPLOAD_ERR_OK) {
                log_audit('         ✓ Upload OK');
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                log_audit('         Extension: ' . $ext);
                
                if (!in_array($ext, $allowedSampleExts)) {
                    log_audit('         ⚠ Extension not in allowed list - SKIPPING');
                    continue;
                }
                
                log_audit('         ✓ Extension allowed');
                $sampleFilename = uniqid() . '_' . basename($file['name']);
                log_audit('         Generated filename: ' . $sampleFilename);
                $sampleTargetPath = $recordingDir . $sampleFilename;
                log_audit('         Target path: ' . $sampleTargetPath);
                log_audit('         Attempting move_uploaded_file...');
                
                if (move_uploaded_file($file['tmp_name'], $sampleTargetPath)) {
                    log_audit('         ✓ SUCCESS: File moved');
                    $url = '/assets/recordings/' . $recordingFolder . '/' . $sampleFilename;
                    log_audit('         URL for DB: ' . $url);
                    $mediaFiles[] = $url;
                    // Support both array-style and normal keys
                    $sampleUrlMap[$key] = $url;
                    if (preg_match('/audioFiles\\[(\\d+)\\]/', $key, $matches)) {
                        $sampleUrlMap['audioFiles_' . $matches[1]] = $url;
                        log_audit('         Also mapped as: audioFiles_' . $matches[1]);
                    }
                    $uploadedSampleCount++;
                    $processedFileKeys[] = $key;
                } else {
                    // Provide detailed failure info for debugging
                    log_audit('         ❌ EXITING: move_uploaded_file FAILED');
                    log_audit('            tmp_name: ' . $file['tmp_name']);
                    log_audit('            target: ' . $sampleTargetPath);
                    log_audit('            file_exists(tmp): ' . (file_exists($file['tmp_name']) ? 'yes' : 'no'));
                    log_audit('            is_writable(dir): ' . (is_writable($recordingDir) ? 'yes' : 'no'));
                    $lastError = error_get_last();
                    ob_end_clean();
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Failed to save audio sample', 'key' => $key, 'targetPath' => $sampleTargetPath, 'phpError' => $lastError]);
                    exit;
                }
            } else {
                log_audit('         ⚠ Upload error code: ' . $file['error']);
            }
        }
        log_audit('      Processed file keys: ' . implode(', ', $processedFileKeys));
        log_audit('      Total uploaded sample count: ' . $uploadedSampleCount);
        log_audit('');
        
        log_audit('   STEP 8d: Sample upload validation');
        // Only report error if samples were expected AND we checked for uploads AND found none
        $hasUploadAttempt = !empty($_FILES) || isset($_POST['audioFilePath']) || count(array_filter(array_keys($_POST), function($k) { return strpos($k, 'audioFilePath_') === 0; })) > 0;
        log_audit('      Samples expected: ' . (!empty($samples) ? 'yes (' . count($samples) . ')' : 'no'));
        log_audit('      Upload attempt detected: ' . ($hasUploadAttempt ? 'yes' : 'no'));
        log_audit('      Uploaded sample count: ' . $uploadedSampleCount);
        
        if (!empty($samples) && $uploadedSampleCount === 0 && $hasUploadAttempt) {
            log_audit('      ❌ EXITING: Samples expected but none uploaded');
            ob_end_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => 'No audio samples saved. Check allowed extensions and field names.', 
                'receivedFiles' => array_keys($_FILES), 
                'receivedPaths' => array_keys(array_filter($_POST, function($k) { return strpos($k, 'audioFilePath') === 0; }, ARRAY_FILTER_USE_KEY)),
                'samples' => $samples
            ]);
            exit;
        } else {
            log_audit('      ✓ Validation passed (or no samples expected)');
        }
        log_audit('');
        
        log_audit('💾 STEP 9: DATABASE INSERT - RECORDING');
        // Insert recording
        $stmt = $conn->prepare("INSERT INTO chellefulk_main_recordings (title, image_path, year_published, description, track_count, link) VALUES (?, ?, ?, ?, ?, ?)");
        log_audit('   Prepared statement for INSERT');
        log_audit('   Values:');
        log_audit('      title = "' . $title . '"');
        log_audit('      image_path = "' . $imagePath . '"');
        log_audit('      year_published = ' . ($yearPublished ?? 'null'));
        log_audit('      description length = ' . strlen($description) . ' chars');
        log_audit('      track_count = ' . $trackCount);
        log_audit('      link = "' . $link . '"');
        $stmt->bind_param("ssisss", $title, $imagePath, $yearPublished, $description, $trackCount, $link);
        log_audit('   Executing...');
        
        if ($stmt->execute()) {
            $recordingId = $conn->insert_id;
            log_audit('   ✓ SUCCESS: Recording inserted with ID = ' . $recordingId);
            log_audit('');
            
            log_audit('💾 STEP 10: DATABASE INSERT - PERFORMERS');
            // Insert performers
            log_audit('   Performer count: ' . count($performers));
            foreach ($performers as $index => $performer) {
                log_audit('      [' . $index . '] "' . $performer . '"');
                $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
                $stmt->bind_param("is", $recordingId, $performer);
                $stmt->execute();
                log_audit('         ✓ Inserted');
            }
            log_audit('');
            
            log_audit('💾 STEP 11: DATABASE INSERT - SAMPLES');
            // Insert samples, using uploaded file URLs if present
            log_audit('   Sample count: ' . count($samples));
            log_audit('   Sample URL map keys: ' . implode(', ', array_keys($sampleUrlMap)));
            foreach ($samples as $index => $sample) {
                if (isset($sample['trackName'])) {
                    log_audit('   [' . $index . '] Processing sample: "' . $sample['trackName'] . '"');
                    $audioUrl = '';
                    $folderForUrl = isset($recordingFolder) ? $recordingFolder : sanitizeFolderName($title);
                    // Try all possible keys for the uploaded file
                    $sampleKey = 'sample_' . preg_replace('/[^a-zA-Z0-9]/', '', $sample['trackName']);
                    $mediaKey = 'media_' . preg_replace('/[^a-zA-Z0-9]/', '', $sample['trackName']);
                    $audioFilesKey = 'audioFiles_' . array_search($sample['trackName'], array_column($samples, 'trackName'));
                    log_audit('      Trying keys: ' . $sampleKey . ', ' . $mediaKey . ', ' . $audioFilesKey);
                    if (isset($sampleUrlMap[$sampleKey])) {
                        $audioUrl = $sampleUrlMap[$sampleKey];
                        log_audit('      ✓ Found via sampleKey: ' . $audioUrl);
                    } elseif (isset($sampleUrlMap[$mediaKey])) {
                        $audioUrl = $sampleUrlMap[$mediaKey];
                        log_audit('      ✓ Found via mediaKey: ' . $audioUrl);
                    } elseif (isset($sampleUrlMap[$audioFilesKey])) {
                        $audioUrl = $sampleUrlMap[$audioFilesKey];
                        log_audit('      ✓ Found via audioFilesKey: ' . $audioUrl);
                    } elseif (isset($sample['audioUrl']) && $sample['audioUrl']) {
                        $filenameOnly = basename($sample['audioUrl']);
                        $audioUrl = '/assets/recordings/' . $folderForUrl . '/' . $filenameOnly;
                        log_audit('      ✓ Using provided audioUrl: ' . $audioUrl);
                    } else {
                        log_audit('      ⚠ No URL found - sample will have empty audioUrl');
                    }
                    log_audit('      Inserting into DB...');
                    $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
                    $stmt->bind_param("iss", $recordingId, $sample['trackName'], $audioUrl);
                    $stmt->execute();
                    log_audit('      ✓ Inserted with audioUrl: "' . $audioUrl . '"');
                }
            }
            log_audit('');
            
            log_audit('📊 STEP 12: FETCH COMPLETE RECORDING DATA');
            $recording = getRecordingData($conn, $recordingId);
            log_audit('   ✓ Retrieved recording data for ID ' . $recordingId);
            log_audit('');
            
            log_audit('✅ STEP 13: FILE VALIDATION - Checking physical files exist on disk');
            $fileValidation = [
                'imageFile' => [
                    'path' => $imagePath,
                    'fullPath' => '..' . $imagePath,
                    'exists' => file_exists('..' . $imagePath),
                    'size' => file_exists('..' . $imagePath) ? filesize('..' . $imagePath) : 0
                ],
                'recordingFolder' => [
                    'path' => $recordingDir,
                    'exists' => file_exists($recordingDir),
                    'isDir' => is_dir($recordingDir)
                ],
                'audioFiles' => []
            ];
            
            // Check each audio file
            foreach ($mediaFiles as $mediaUrl) {
                // Chunked uploads go to ../assets/, regular uploads would be in ../public/assets/
                // Check both locations
                $fullPathWithPublic = '../public' . $mediaUrl;
                $fullPathWithoutPublic = '..' . $mediaUrl;
                $exists = file_exists($fullPathWithPublic) || file_exists($fullPathWithoutPublic);
                $actualPath = file_exists($fullPathWithPublic) ? $fullPathWithPublic : $fullPathWithoutPublic;
                $fileValidation['audioFiles'][] = [
                    'url' => $mediaUrl,
                    'fullPath' => $actualPath,
                    'checkedPaths' => [$fullPathWithPublic, $fullPathWithoutPublic],
                    'exists' => $exists,
                    'size' => $exists ? filesize($actualPath) : 0
                ];
            }
            
            log_audit('   Image file validation: ' . json_encode($fileValidation['imageFile']));
            log_audit('   Recording folder validation: ' . json_encode($fileValidation['recordingFolder']));
            log_audit('   Audio files validation: ' . json_encode($fileValidation['audioFiles']));
            log_audit('');
            
            log_audit('✅ STEP 14: SUCCESS RESPONSE');
            log_audit('   Sending 201 Created response');
            ob_end_clean();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Recording created',
                'id' => $recordingId,
                'recording' => $recording,
                'fileValidation' => $fileValidation,
                'auditLog' => $audit_log
            ]);
            log_audit('');
            log_audit('╔════════════════════════════════════════════════════════════════════════╗');
            log_audit('║                    POST REQUEST COMPLETED SUCCESSFULLY                 ║');
            log_audit('╚════════════════════════════════════════════════════════════════════════╝');
            log_audit('');
        } else {
            log_audit('');
            log_audit('❌ STEP 9 FAILED: Database INSERT failed');
            log_audit('   Error: ' . $conn->error);
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create recording: ' . $conn->error]);
            log_audit('');
            log_audit('╔════════════════════════════════════════════════════════════════════════╗');
            log_audit('║                    POST REQUEST FAILED AT DB INSERT                    ║');
            log_audit('╚════════════════════════════════════════════════════════════════════════╝');
            log_audit('');
        }
        break;
        
    case 'PUT':
        checkAuth();
        
        // Audit log collector for PUT
        $audit_log = [];
        $log_to_audit = function($msg) use (&$audit_log) {
            $audit_log[] = $msg;
            error_log($msg);
        };
        
        $log_to_audit('=== PUT REQUEST START ===');
        $log_to_audit('ID: ' . ($id ?? 'null'));
        
        if (!$id) {
            $log_to_audit('ERROR: No ID provided');
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
        // Get existing recording to check if it exists and get current image path and folder
        $stmt = $conn->prepare("SELECT title, image_path FROM chellefulk_main_recordings WHERE id = ?");
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
        $oldTitle = $existing['title'];
        $oldFolder = sanitizeFolderName($oldTitle);
        $imagePath = $existing['image_path']; // Keep existing image by default
        $stmt->close();
        // If title changed, rename folder
        $newFolder = sanitizeFolderName($title);
        $log_to_audit('Old folder: ' . $oldFolder);
        $log_to_audit('New folder: ' . $newFolder);
        
        $oldDir = __DIR__ . '/../assets/recordings/' . $oldFolder . '/';
        $newDir = __DIR__ . '/../assets/recordings/' . $newFolder . '/';
        
        $log_to_audit('Old dir: ' . $oldDir);
        $log_to_audit('New dir: ' . $newDir);
        
        if ($oldFolder !== $newFolder && file_exists($oldDir)) {
            $log_to_audit('Renaming folder from ' . $oldFolder . ' to ' . $newFolder);
            rename($oldDir, $newDir);
        }

        // Ensure folder exists
        if (!file_exists($newDir)) {
            $log_to_audit('Creating new directory: ' . $newDir);
            mkdir($newDir, 0755, true);
        }

        // Handle new image upload if provided (always to images folder)
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
            $filename = uniqid() . '_' . basename($_FILES['image']['name']);
            $imageDir = __DIR__ . '/../assets/recordings/images/';
            if (!file_exists($imageDir)) {
                mkdir($imageDir, 0755, true);
            }
            $targetPath = $imageDir . $filename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                // Delete old image from images folder if not a seed image
                if (!in_array(basename($imagePath), ['2DoBeatles.png', 'IslandTime.png', 'Keltish.png']) && $imagePath) {
                    $oldImagePath = $imageDir . basename($imagePath);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $imagePath = '/assets/recordings/images/' . $filename;
            }
        }

        // Handle audio/video uploads (mp3/mp4) to per-recording folder
        $mediaFiles = [];
        $allowedMediaTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'video/mp4'];
        $allowedMediaExts = ['mp3', 'mp4', 'm4a', 'wav'];
        
        // Check for chunked upload file paths first
        if (isset($_POST['audioFilePath'])) {
            // Single audio file from chunked upload
            $mediaFiles[] = $_POST['audioFilePath'];
        }
        
        // Check for multiple chunked upload file paths
        foreach ($_POST as $key => $value) {
            if (strpos($key, 'audioFilePath_') === 0 && !empty($value)) {
                $mediaFiles[] = $value;
            }
        }
        
        // Handle regular file uploads (for files under 2MB or non-chunked uploads)
        foreach ($_FILES as $key => $file) {
            // Accept both 'sample_' and 'media_' keys for audio/video
            if ((strpos($key, 'sample_') === 0 || strpos($key, 'media_') === 0) && $file['error'] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                if (!in_array($ext, $allowedMediaExts)) continue;
                $mediaFilename = uniqid() . '_' . basename($file['name']);
                $mediaTargetPath = $newDir . $mediaFilename;
                if (move_uploaded_file($file['tmp_name'], $mediaTargetPath)) {
                    $mediaFiles[] = '/assets/recordings/' . $newFolder . '/' . $mediaFilename;
                }
            }
        }
        // Update recording
        $stmt = $conn->prepare("UPDATE chellefulk_main_recordings SET title=?, image_path=?, year_published=?, description=?, track_count=?, link=? WHERE id=?");
        $stmt->bind_param("ssisssi", $title, $imagePath, $yearPublished, $description, $trackCount, $link, $id);
        if ($stmt->execute()) {
            // Delete existing performers
            $conn->query("DELETE FROM chellefulk_main_recording_performers WHERE recording_id=$id");
            // Insert new performers
            foreach ($performers as $performer) {
                $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
                $stmt->bind_param("is", $id, $performer);
                $stmt->execute();
            }
            // Insert new samples
            foreach ($samples as $sample) {
                if (isset($sample['trackName']) && isset($sample['audioUrl'])) {
                    $audioUrl = $sample['audioUrl'];
                    // If audioUrl doesn't start with '/', it's just a filename - prepend the folder path
                    if (substr($audioUrl, 0, 1) !== '/') {
                        // Replace spaces with underscores to match how files are saved
                        $audioUrl = str_replace(' ', '_', $audioUrl);
                        $audioUrl = '/assets/recordings/' . $newFolder . '/' . $audioUrl;
                        $log_to_audit('Converted relative audio URL to: ' . $audioUrl);
                    }
                    $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
                    $stmt->bind_param("iss", $id, $sample['trackName'], $audioUrl);
                    $stmt->execute();
                }
            }
            $recording = getRecordingData($conn, $id);
            $log_to_audit('✓ SUCCESS: Recording updated');
            $log_to_audit('=== PUT REQUEST END ===');
            ob_end_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Recording updated',
                'recording' => $recording,
                'auditLog' => $audit_log
            ]);
        } else {
            $log_to_audit('❌ ERROR: Failed to update recording: ' . $conn->error);
            $log_to_audit('=== PUT REQUEST END (FAILED) ===');
            ob_end_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update recording: ' . $conn->error, 'auditLog' => $audit_log]);
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
            // Delete image file from images folder if it's not one of the seed images
            if (!in_array(basename($recording['image']), ['2DoBeatles.png', 'IslandTime.png', 'Keltish.png'])) {
                $imageDir = __DIR__ . '/../assets/recordings/images/';
                $imagePath = $imageDir . basename($recording['image']);
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


