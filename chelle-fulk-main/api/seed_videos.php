<?php
/**
 * Video Seeding Script
 * 
 * Seeds the video table with initial video data from the frontend videoService.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to avoid duplicate entries.
 * 
 * USAGE: Access this file once via browser to seed the database, then delete it for security.
 * URL: https://www.chellefulk.com/api/seed_videos.php
 */

header('Content-Type: application/json');

require_once 'db_connect.php';

if (!isset($conn) || $conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Connection failed']);
    exit;
}

// First, create the video table if it doesn't exist
$createTableSQL = "CREATE TABLE IF NOT EXISTS chellefulk_main_video (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    embed_id VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)";

if (!$conn->query($createTableSQL)) {
    echo json_encode(['success' => false, 'error' => 'Failed to create table: ' . $conn->error]);
    exit;
}

// Video seed data from videoService.ts
$videos = [
    [
        'title' => 'Percussion and Violin - Sampler reel; Tom Teasley, Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/kNK10pnNKUY/hqdefault.jpg',
        'embed_id' => 'kNK10pnNKUY'
    ],
    [
        'title' => 'Solo fiddle - two Celtic tunes; Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/fOxnJQsSRaA/hqdefault.jpg',
        'embed_id' => 'fOxnJQsSRaA'
    ],
    [
        'title' => "Anthem String Trio - I'm a Believer; Janet Greene, Kristen Jones, Chelle Fulk",
        'thumbnail' => 'https://img.youtube.com/vi/XMJJsnUIxQM/hqdefault.jpg',
        'embed_id' => 'XMJJsnUIxQM'
    ],
    [
        'title' => 'Electric Violin & Cello - sampler reel; Kristen Jones, Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/C-OkCsUhpE4/hqdefault.jpg',
        'embed_id' => 'C-OkCsUhpE4'
    ],
    [
        'title' => 'Anthem String Trio - The Kiss; Janet Greene, Kristen Jones, Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/4zvSnvMHMio/hqdefault.jpg',
        'embed_id' => '4zvSnvMHMio'
    ],
    [
        'title' => 'Catnip Fling Celtic Trio - sampler reel; Jody Marshall, Kristen Jones, Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/Lo1s3xsWiu8/hqdefault.jpg',
        'embed_id' => 'Lo1s3xsWiu8'
    ],
    [
        'title' => 'Anthem Electric Quartet - Here Comes the Sun; Janet Greene, Kristen Jones, Caroline Little, Chelle Fulk',
        'thumbnail' => 'https://img.youtube.com/vi/JN_iBLdzju8/hqdefault.jpg',
        'embed_id' => 'JN_iBLdzju8'
    ],
    [
        'title' => 'Hardanger d\'Amore and Cicadas - Emergence; Chelle Fulk, Cicada choir',
        'thumbnail' => 'https://img.youtube.com/vi/7qopMvCLVpw/hqdefault.jpg',
        'embed_id' => '7qopMvCLVpw'
    ]
];

$inserted = 0;
$updated = 0;
$errors = [];

foreach ($videos as $video) {
    $title = $conn->real_escape_string($video['title']);
    $thumbnail = $conn->real_escape_string($video['thumbnail']);
    $embed_id = $conn->real_escape_string($video['embed_id']);
    
    $sql = "INSERT INTO chellefulk_main_video (title, thumbnail, embed_id) 
            VALUES ('$title', '$thumbnail', '$embed_id')
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                thumbnail = VALUES(thumbnail)";
    
    if ($conn->query($sql)) {
        if ($conn->affected_rows == 1) {
            $inserted++;
        } elseif ($conn->affected_rows == 2) {
            $updated++;
        }
    } else {
        $errors[] = "Failed to insert '{$video['title']}': " . $conn->error;
    }
}

// Get final count
$result = $conn->query("SELECT COUNT(*) as count FROM chellefulk_main_video");
$totalVideos = $result->fetch_assoc()['count'];

$conn->close();

echo json_encode([
    'success' => true,
    'message' => 'Video seeding complete',
    'inserted' => $inserted,
    'updated' => $updated,
    'total_videos' => $totalVideos,
    'errors' => $errors
]);
?>
