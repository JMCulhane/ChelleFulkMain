<?php
/**
 * Seed Recordings Database
 * 
 * Creates tables and seeds initial recording data
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db_connect.php';

if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$results = [];

try {
    // Create recordings table
    $sql = "CREATE TABLE IF NOT EXISTS chellefulk_main_recordings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        year_published INT,
        description TEXT,
        track_count INT NOT NULL,
        link VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql)) {
        $results[] = "Table chellefulk_main_recordings created successfully";
    } else {
        throw new Exception("Error creating recordings table: " . $conn->error);
    }
    
    // Create recording_performers table
    $sql = "CREATE TABLE IF NOT EXISTS chellefulk_main_recording_performers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recording_id INT NOT NULL,
        performer_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (recording_id) REFERENCES chellefulk_main_recordings(id) ON DELETE CASCADE
    )";
    
    if ($conn->query($sql)) {
        $results[] = "Table chellefulk_main_recording_performers created successfully";
    } else {
        throw new Exception("Error creating recording_performers table: " . $conn->error);
    }
    
    // Create recording_samples table
    $sql = "CREATE TABLE IF NOT EXISTS chellefulk_main_recording_samples (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recording_id INT NOT NULL,
        track_name VARCHAR(255) NOT NULL,
        audio_url VARCHAR(500) NOT NULL,
        FOREIGN KEY (recording_id) REFERENCES chellefulk_main_recordings(id) ON DELETE CASCADE
    )";
    
    if ($conn->query($sql)) {
        $results[] = "Table chellefulk_main_recording_samples created successfully";
    } else {
        throw new Exception("Error creating recording_samples table: " . $conn->error);
    }
    
    // Check if recordings already exist
    $checkResult = $conn->query("SELECT COUNT(*) as count FROM chellefulk_main_recordings");
    $count = $checkResult->fetch_assoc()['count'];
    
    if ($count > 0) {
        $results[] = "Recordings already exist, skipping seed data";
    } else {
        // Seed Recording 1: 2doBeatles
        $stmt = $conn->prepare("INSERT INTO chellefulk_main_recordings (title, image_path, year_published, description, track_count, link) VALUES (?, ?, ?, ?, ?, ?)");
        $title = "2doBeatles";
        $imagePath = "/assets/recordings/images/2DoBeatles.png";
        $year = 2020;
        $description = "A collection of Beatles classics arranged for acoustic performance";
        $trackCount = 7;
        $link = "";
        $stmt->bind_param("ssisss", $title, $imagePath, $year, $description, $trackCount, $link);
        $stmt->execute();
        $recording1Id = $conn->insert_id;
        $results[] = "Inserted recording: 2doBeatles (ID: $recording1Id)";
        
        // Add performers for 2doBeatles
        $performers1 = ["Chelle Fulk", "Various Artists"];
        foreach ($performers1 as $performer) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
            $stmt->bind_param("is", $recording1Id, $performer);
            $stmt->execute();
        }
        
        // Add samples for 2doBeatles
        $samples1 = [
            ["The Fool On the Hill", "/assets/recordings/2doBeatles/1 The Fool On the Hill.mp3"],
            ["If I Fell", "/assets/recordings/2doBeatles/2 If I Fell.mp3"],
            ["All My Loving", "/assets/recordings/2doBeatles/3 All My Loving.mp3"],
            ["I'm Looking Through You", "/assets/recordings/2doBeatles/4 I'm Looking Through You.mp3"]
        ];
        
        foreach ($samples1 as $sample) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $recording1Id, $sample[0], $sample[1]);
            $stmt->execute();
        }
        $results[] = "Added " . count($samples1) . " samples for 2doBeatles";
        
        // Seed Recording 2: Island Time
        $stmt = $conn->prepare("INSERT INTO chellefulk_main_recordings (title, image_path, year_published, description, track_count, link) VALUES (?, ?, ?, ?, ?, ?)");
        $title = "Island Time";
        $imagePath = "/assets/recordings/images/IslandTime.png";
        $year = 2018;
        $description = "A diverse collection of island-inspired melodies and international classics";
        $trackCount = 15;
        $link = "";
        $stmt->bind_param("ssisss", $title, $imagePath, $year, $description, $trackCount, $link);
        $stmt->execute();
        $recording2Id = $conn->insert_id;
        $results[] = "Inserted recording: Island Time (ID: $recording2Id)";
        
        // Add performers for Island Time
        $performers2 = ["Chelle Fulk", "Tom Teasley", "Jody Marshall"];
        foreach ($performers2 as $performer) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
            $stmt->bind_param("is", $recording2Id, $performer);
            $stmt->execute();
        }
        
        // Add samples for Island Time
        $samples2 = [
            ["Yell Yell", "/assets/recordings/islandTime/01 Yell Yell.mp3"],
            ["Carolina in the Morning", "/assets/recordings/islandTime/02 Carolina in the Morning.mp3"],
            ["Shenandoah", "/assets/recordings/islandTime/03 Shenandoah.mp3"],
            ["Songs of Island", "/assets/recordings/islandTime/04 Songs of Island.mp3"],
            ["Cameron Polkas", "/assets/recordings/islandTime/05 Cameron Polkas.mp3"]
        ];
        
        foreach ($samples2 as $sample) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $recording2Id, $sample[0], $sample[1]);
            $stmt->execute();
        }
        $results[] = "Added " . count($samples2) . " samples for Island Time";
        
        // Seed Recording 3: Keltish
        $stmt = $conn->prepare("INSERT INTO chellefulk_main_recordings (title, image_path, year_published, description, track_count, link) VALUES (?, ?, ?, ?, ?, ?)");
        $title = "Keltish";
        $imagePath = "/assets/recordings/images/Keltish.png";
        $year = 2019;
        $description = "Celtic-inspired melodies and traditional Irish tunes with a modern twist";
        $trackCount = 4;
        $link = "";
        $stmt->bind_param("ssisss", $title, $imagePath, $year, $description, $trackCount, $link);
        $stmt->execute();
        $recording3Id = $conn->insert_id;
        $results[] = "Inserted recording: Keltish (ID: $recording3Id)";
        
        // Add performers for Keltish
        $performers3 = ["Chelle Fulk"];
        foreach ($performers3 as $performer) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_performers (recording_id, performer_name) VALUES (?, ?)");
            $stmt->bind_param("is", $recording3Id, $performer);
            $stmt->execute();
        }
        
        // Add samples for Keltish
        $samples3 = [
            ["Dublin Lullaby", "/assets/recordings/keltish/1 Dublin Lullaby.mp3"],
            ["Norwegian Wood", "/assets/recordings/keltish/2 Norwegian Wood.mp3"],
            ["Redhaired Boy-Drowsy Maggie", "/assets/recordings/keltish/3 Redhaired Boy-Drowsy Maggie.mp3"],
            ["Star of the County Down", "/assets/recordings/keltish/4 Star of the County Down.mp3"]
        ];
        
        foreach ($samples3 as $sample) {
            $stmt = $conn->prepare("INSERT INTO chellefulk_main_recording_samples (recording_id, track_name, audio_url) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $recording3Id, $sample[0], $sample[1]);
            $stmt->execute();
        }
        $results[] = "Added " . count($samples3) . " samples for Keltish";
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Recordings tables created and seeded successfully',
        'details' => $results
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
