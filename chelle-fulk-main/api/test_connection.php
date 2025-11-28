<?php
/**
 * Database Connection Test Endpoint
 * 
 * Simple API endpoint to test database connectivity
 */

// Catch ALL errors and output as JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set headers immediately
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'OPTIONS handled']);
    exit();
}

// Start output buffering
ob_start();

try {
    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed: ' . $_SERVER['REQUEST_METHOD']);
    }

    // Check if db_connect.php exists
    $dbConnectPath = __DIR__ . '/db_connect.php';
    if (!file_exists($dbConnectPath)) {
        throw new Exception('db_connect.php not found at: ' . $dbConnectPath);
    }
    
    // Include database connection
    require_once $dbConnectPath;

    // Check if connection was established
    if (!isset($conn) || $conn === null) {
        $errorMsg = isset($db_connection_error) ? $db_connection_error : 'Unknown connection error';
        throw new Exception('Database connection failed: ' . $errorMsg);
    }

    // Test the connection with a simple query
    $result = $conn->query("SELECT 1 as test");
    
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }
    
    $row = $result->fetch_assoc();
    
    // Get all tables in the database
    $tablesResult = $conn->query("SHOW TABLES");
    $allTables = [];
    if ($tablesResult) {
        while ($tableRow = $tablesResult->fetch_array()) {
            $tableName = $tableRow[0];
            // Get row count for each table
            $countResult = $conn->query("SELECT COUNT(*) as count FROM `$tableName`");
            $rowCount = 0;
            if ($countResult) {
                $rowCount = $countResult->fetch_assoc()['count'];
            }
            $allTables[] = [
                'name' => $tableName,
                'row_count' => $rowCount
            ];
        }
    }
    
    // Check if admin table exists and get row count
    $checkAdminTable = $conn->query("SHOW TABLES LIKE 'chellefulk_main_admin'");
    $adminTableExists = $checkAdminTable->num_rows > 0;
    
    $adminRowCount = 0;
    $adminUsers = [];
    if ($adminTableExists) {
        $countResult = $conn->query("SELECT COUNT(*) as count FROM chellefulk_main_admin");
        if ($countResult) {
            $adminRowCount = $countResult->fetch_assoc()['count'];
        }
        
        // Get all admin users (without password hashes for security)
        $usersResult = $conn->query("SELECT id, username, locked, role FROM chellefulk_main_admin");
        if ($usersResult) {
            while ($userRow = $usersResult->fetch_assoc()) {
                $adminUsers[] = $userRow;
            }
        }
    }
    
    // Clear buffer
    ob_end_clean();
    
    // Success response (admin details removed)
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'database' => isset($db_name) ? $db_name : 'unknown',
        'host' => isset($db_host) ? $db_host : 'unknown',
        'timestamp' => date('Y-m-d H:i:s'),
        'test_result' => $row['test'],
        'all_tables' => $allTables,
        'php_version' => phpversion(),
        'features' => [
            'password_hash' => function_exists('password_hash'),
            'random_bytes' => function_exists('random_bytes'),
            'openssl' => extension_loaded('openssl'),
            'mysqli' => extension_loaded('mysqli'),
            'session' => function_exists('session_start')
        ]
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    ob_end_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Exception caught',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Error $e) {
    ob_end_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'PHP Error',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
?>
