
<?php
// WAMP/XAMPP Database Configuration
$host = 'localhost';
$db_name = 'photo_studio_db'; 
$username = 'root';           
$password = '';               

try {
    // 1. Connect to MySQL server first without selecting a DB
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 2. Try to create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    
    // 3. Connect to the specific database
    $pdo->exec("USE `$db_name`;");
    
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // If we fail here, we must return clean JSON for the frontend to handle
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database Connection failed. Ensure WAMP/XAMPP MySQL is running. Error: " . $e->getMessage()
    ]);
    exit();
}
