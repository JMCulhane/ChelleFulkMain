<?php
/**
 * Database Connection Test Endpoint
 * 
 * Simple API endpoint to test database connectivity
 */

// Enable CORS for React development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Include database connection
require_once 'db_connect.php';

// Test the connection
try {
    // Simple query to verify connection
    $result = $conn->query("SELECT 1 as test");
    
    if ($result) {
        $row = $result->fetch_assoc();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'database' => $db_name,
            'host' => $db_host,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        throw new Exception('Query failed');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
