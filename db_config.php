
<?php
// আপনার লোকাল সার্ভারের (যেমন XAMPP) ডাটাবেস তথ্য এখানে দিন
$host = 'localhost';
$db_name = 'photo_studio_db'; // আপনার তৈরি করা ডাটাবেসের নাম
$username = 'root';           // XAMPP এর ডিফল্ট ইউজার 'root'
$password = '';               // XAMPP এর ডিফল্ট পাসওয়ার্ড খালি থাকে

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // ডাটাবেস কানেকশন ফেইল করলে JSON মেসেজ পাঠাবে
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database Connection failed. Please check db_config.php. Error: " . $e->getMessage()
    ]);
    exit();
}
