<?php
// আপনার হোস্টিং এর ডাটাবেস তথ্য এখানে দিন
$host = 'localhost';
$db_name = 'your_database_name';
$username = 'your_database_user';
$password = 'your_database_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Instead of die(), we throw an exception so api.php can catch it and return JSON
    throw new Exception("Database Connection failed: " . $e->getMessage());
}