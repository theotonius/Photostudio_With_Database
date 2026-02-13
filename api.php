<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? 'clients'; // Added type parameter to distinguish between clients and settings

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($type === 'settings') {
        switch ($method) {
            case 'GET':
                $stmt = $pdo->query("SELECT * FROM studio_settings LIMIT 1");
                $settings = $stmt->fetch();
                echo json_encode($settings ?: null);
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                if (!$data) throw new Exception("No data provided");

                // Ensure the settings table exists or update the single row
                $pdo->exec("CREATE TABLE IF NOT EXISTS `studio_settings` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `name` varchar(255) NOT NULL,
                    `logo` longtext,
                    `address` text,
                    `phone` varchar(50),
                    `email` varchar(255),
                    `website` varchar(255),
                    `currency` varchar(10),
                    `taxNumber` varchar(100),
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                $stmt = $pdo->prepare("REPLACE INTO studio_settings (id, name, logo, address, phone, email, website, currency, taxNumber) 
                                      VALUES (1, :name, :logo, :address, :phone, :email, :website, :currency, :taxNumber)");
                $stmt->execute([
                    ':name' => $data['name'],
                    ':logo' => $data['logo'] ?? null,
                    ':address' => $data['address'] ?? '',
                    ':phone' => $data['phone'] ?? '',
                    ':email' => $data['email'] ?? '',
                    ':website' => $data['website'] ?? '',
                    ':currency' => $data['currency'] ?? '৳',
                    ':taxNumber' => $data['taxNumber'] ?? ''
                ]);
                echo json_encode(["status" => "success", "message" => "Settings updated"]);
                break;
        }
    } else {
        switch ($method) {
            case 'GET':
                $stmt = $pdo->query("SELECT * FROM clients ORDER BY createdAt DESC");
                $clients = $stmt->fetchAll();
                // Ensure numeric types are returned correctly
                foreach ($clients as &$client) {
                    $client['totalPrice'] = (float)$client['totalPrice'];
                    $client['paidAmount'] = (float)$client['paidAmount'];
                    $client['dueAmount'] = (float)$client['dueAmount'];
                }
                echo json_encode($clients);
                break;

            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                if (!$data) throw new Exception("No data provided");

                // Calculate dueAmount if not provided by client
                $dueAmount = $data['totalPrice'] - $data['paidAmount'];

                $sql = "INSERT INTO clients (id, name, phone, email, eventDate, eventType, location, image, package, totalPrice, paidAmount, dueAmount, status, notes, createdAt) 
                        VALUES (:id, :name, :phone, :email, :eventDate, :eventType, :location, :image, :package, :totalPrice, :paidAmount, :dueAmount, :status, :notes, :createdAt)
                        ON DUPLICATE KEY UPDATE 
                        name=:name, phone=:phone, email=:email, eventDate=:eventDate, eventType=:eventType, location=:location, image=:image, package=:package, 
                        totalPrice=:totalPrice, paidAmount=:paidAmount, dueAmount=:dueAmount, status=:status, notes=:notes";

                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':id' => $data['id'],
                    ':name' => $data['name'],
                    ':phone' => $data['phone'],
                    ':email' => $data['email'] ?? null,
                    ':eventDate' => $data['eventDate'],
                    ':eventType' => $data['eventType'],
                    ':location' => $data['location'] ?? '',
                    ':image' => $data['image'] ?? null,
                    ':package' => $data['package'] ?? 'Standard',
                    ':totalPrice' => $data['totalPrice'],
                    ':paidAmount' => $data['paidAmount'],
                    ':dueAmount' => $dueAmount,
                    ':status' => $data['status'],
                    ':notes' => $data['notes'] ?? '',
                    ':createdAt' => $data['createdAt'] ?? date('Y-m-d H:i:s')
                ]);

                echo json_encode(["status" => "success", "message" => "Client saved successfully"]);
                break;

            case 'DELETE':
                if (isset($_GET['id'])) {
                    $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
                    $stmt->execute([$_GET['id']]);
                    echo json_encode(["status" => "success", "message" => "Client deleted"]);
                } else {
                    throw new Exception("ID not provided");
                }
                break;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>