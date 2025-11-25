<?php
/**
 * Database Connection Script for superb.net
 * 
 * This script establishes a connection to the MySQL database hosted on superb.net
 * using mysqli for secure and modern database interaction.
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

// Database configuration - values injected via GitHub Actions during deployment
$db_host = getenv('DB_HOST');
$db_name = getenv('DB_USER');
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASSWORD');

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4 for full Unicode support
$conn->set_charset("utf8mb4");

// Connection successful
// echo "Connected successfully";

// The $conn variable is now available for database queries

?>
