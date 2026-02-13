<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

// প্রি-ফ্লাইট রিকোয়েস্ট হ্যান্ডলিং
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    switch ($method) {
        case 'GET':
            // সব ক্লায়েন্ট ডাটা নিয়ে আসা
            $stmt = $pdo->query("SELECT * FROM clients ORDER BY createdAt DESC");
            $clients = $stmt->fetchAll();
            echo json_encode($clients);
            break;

        case 'POST':
            // নতুন ডাটা সেভ বা আপডেট করা
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data) {
                throw new Exception("No data provided");
            }

            $sql = "INSERT INTO clients (id, name, phone, email, eventDate, eventType, package, totalPrice, paidAmount, status, notes, createdAt) 
                    VALUES (:id, :name, :phone, :email, :eventDate, :eventType, :package, :totalPrice, :paidAmount, :status, :notes, :createdAt)
                    ON DUPLICATE KEY UPDATE 
                    name=:name, phone=:phone, email=:email, eventDate=:eventDate, eventType=:eventType, package=:package, 
                    totalPrice=:totalPrice, paidAmount=:paidAmount, status=:status, notes=:notes";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':eventDate' => $data['eventDate'],
                ':eventType' => $data['eventType'],
                ':package' => $data['package'] ?? 'Standard',
                ':totalPrice' => $data['totalPrice'],
                ':paidAmount' => $data['paidAmount'],
                ':status' => $data['status'],
                ':notes' => $data['notes'] ?? '',
                ':createdAt' => $data['createdAt'] ?? date('Y-m-d H:i:s')
            ]);

            echo json_encode(["status" => "success", "message" => "Client saved successfully"]);
            break;

        case 'DELETE':
            // ডাটা ডিলিট করা
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                echo json_encode(["status" => "success", "message" => "Client deleted"]);
            } else {
                throw new Exception("ID not provided");
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>