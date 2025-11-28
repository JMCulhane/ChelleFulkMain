<?php
/**
 * Session Handler - Consolidated Login/Logout Endpoint
 * 
 * Handles both login and logout operations based on the 'action' parameter
 * 
 * Actions:
 * - login: Authenticates admin users and generates token
 * - logout: Invalidates the user's token
 * 
 * NOTE: Using md5() for password comparison due to old PHP version on server.
 * This matches the setup_admin.php implementation which uses md5() instead of password_hash().
 */

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Include database connection
require_once 'db_connect.php';

if (!isset($conn) || $conn === null) {
    $errorMsg = isset($db_connection_error) ? $db_connection_error : 'Unknown connection error';
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $errorMsg]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Determine action
$action = isset($input['action']) ? $input['action'] : '';

// Route to appropriate handler
switch ($action) {
    case 'login':
        handleLogin($conn, $input);
        break;
    case 'logout':
        handleLogout($conn, $input);
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action. Use "login" or "logout"']);
        $conn->close();
        exit();
}

/**
 * Handle Login
 */
function handleLogin($conn, $input) {
    // Validate input
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username and password are required']);
        $conn->close();
        exit();
    }

    $username = $input['username'];
    $password = $input['password'];

    // Query to fetch user
    $stmt = $conn->prepare("SELECT id, username, password_hash, locked, role FROM chellefulk_main_admin WHERE username = ?");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error']);
        $conn->close();
        exit();
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Check if account is locked
    if ($user['locked']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Account is locked']);
        $conn->close();
        exit();
    }

    // Verify password using md5 (to match setup_admin.php)
    $password_hash = md5($password);
    if ($password_hash !== $user['password_hash']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        $conn->close();
        exit();
    }

    // Login successful - Generate token and store in database with 24 hour expiry
    $token = hash('sha256', uniqid($user['username'], true) . time() . mt_rand());
    $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Update user with new token and expiry
    $updateStmt = $conn->prepare("UPDATE chellefulk_main_admin SET token = ?, token_expiry = ? WHERE id = ?");
    $updateStmt->bind_param("ssi", $token, $expiry, $user['id']);

    if (!$updateStmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to store token']);
        $updateStmt->close();
        $conn->close();
        exit();
    }

    $updateStmt->close();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);

    $conn->close();
}

/**
 * Handle Logout
 */
function handleLogout($conn, $input) {
    // Get Authorization header - try custom X-Auth-Token first (FastCGI workaround)
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

    // Also check if token is in the input
    if (empty($authHeader) && isset($input['token'])) {
        $authHeader = $input['token'];
    }

    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No token provided']);
        $conn->close();
        exit();
    }

    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $authHeader);

    // Clear token from database
    $stmt = $conn->prepare("UPDATE chellefulk_main_admin SET token = NULL, token_expiry = NULL WHERE token = ?");
    $stmt->bind_param("s", $token);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid token'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to logout'
        ]);
    }

    $stmt->close();
    $conn->close();
}
?>
