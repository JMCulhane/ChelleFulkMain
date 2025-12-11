<?php
// In-memory logger
$debug_log = [];
function log_upload_debug($msg) {
    global $debug_log;
    $ts = date('Y-m-d H:i:s');
    $debug_log[] = "[$ts] $msg";
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

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
    $uploadId = isset($_POST['uploadId']) ? preg_replace('/[^a-zA-Z0-9_-]/', '_', $_POST['uploadId']) : uniqid('upload_');
    $chunkFile = $uploadDir . $uploadId . '_' . $chunkNumber;
    log_upload_debug("Chunk number: $chunkNumber / $totalChunks, fileName: $fileName, recordingId: $recordingId, uploadId: $uploadId");
    
    if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
        log_upload_debug('No chunk uploaded or upload error.');
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No chunk uploaded', 'uploadId' => $uploadId, 'debug' => $debug_log]);
        exit;
    }
    
    if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkFile)) {
        log_upload_debug('Failed to save chunk.');
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save chunk', 'uploadId' => $uploadId, 'debug' => $debug_log]);
        exit;
    }
    
    log_upload_debug('Chunk saved to: ' . $chunkFile);
    
    if ($chunkNumber === $totalChunks - 1) {
        log_upload_debug('This is the final chunk, beginning assembly...');
        $finalDir = __DIR__ . '/../assets/recordings/' . $recordingId . '/';
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
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create directory', 'uploadId' => $uploadId, 'debug' => $debug_log]);
            exit;
        }
        
        $out = @fopen($finalPath, 'wb');
        if (!$out) {
            $fopenError = error_get_last();
            log_upload_debug('fopen failed for final file: ' . json_encode($fopenError));
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
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'uploadId' => $uploadId,
            'filePath' => '/assets/recordings/' . $recordingId . '/' . $fileName,
            'fileSize' => $finalFileSize,
            'absolutePath' => realpath($finalPath),
            'directoryPath' => realpath($finalDir),
            'debug' => $debug_log
        ]);
        exit;
    }
    
    http_response_code(200);
    echo json_encode(['success' => true, 'uploadId' => $uploadId, 'chunkNumber' => $chunkNumber, 'debug' => $debug_log]);
    exit;
}

log_upload_debug('--- New request ---');
log_upload_debug('Request method: ' . $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'debug' => $debug_log]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_upload_debug('Not a POST request.');
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed', 'debug' => $debug_log]);
    exit;
}

log_upload_debug('POST data: ' . json_encode($_POST));
log_upload_debug('FILES: ' . json_encode($_FILES));

log_upload_debug('Checking for title and audio...');
$title = isset($_POST['title']) ? $_POST['title'] : '';
if (!$title || !isset($_FILES['audio'])) {
    log_upload_debug('Missing title or audio file.');
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Title and audio file required', 'debug' => $debug_log]);
    exit;
}
log_upload_debug('Title and audio present.');


log_upload_debug('Sanitizing folder name...');
$folder = preg_replace('/[^a-zA-Z0-9-_]/', '_', $title);
$baseDir = __DIR__ . '/../public/assets/recordings/';
$targetDir = $baseDir . $folder . '/';
log_upload_debug('Target directory: ' . $targetDir);
if (!file_exists($targetDir)) {
    $mk = mkdir($targetDir, 0755, true);
    log_upload_debug("mkdir $targetDir result: " . ($mk ? 'success' : 'fail'));
} else {
    log_upload_debug('Target directory already exists.');
}


log_upload_debug('Checking file extension...');
$file = $_FILES['audio'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
log_upload_debug('File extension: ' . $ext);
$allowed = ['mp3', 'wav', 'm4a', 'mp4'];
if (!in_array($ext, $allowed)) {
    log_upload_debug('Invalid file type: ' . $ext);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type', 'debug' => $debug_log]);
    exit;
}
log_upload_debug('File type allowed.');

$targetPath = $targetDir . basename($file['name']);
log_upload_debug('Target path: ' . $targetPath);
log_upload_debug('Checking if tmp_name exists: ' . (file_exists($file['tmp_name']) ? 'yes' : 'no'));
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    log_upload_debug('move_uploaded_file success');
    echo json_encode([
        'success' => true,
        'path' => '/assets/recordings/' . $folder . '/' . basename($file['name']),
        'debug' => $debug_log
    ]);
} else {
    $err = error_get_last();
    log_upload_debug('move_uploaded_file failed. Error: ' . json_encode($err));
    log_upload_debug('$_FILES entry: ' . json_encode($file));
    log_upload_debug('Permissions on target dir: ' . substr(sprintf('%o', fileperms($targetDir)), -4));
    log_upload_debug('Current user: ' . get_current_user());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save file',
        'debug' => $debug_log
    ]);
}
