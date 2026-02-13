<?php
ob_start(); // Prevent accidental output
error_reporting(E_ALL);
ini_set('display_errors', 0); 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    if (!file_exists('db_config.php')) {
        throw new Exception("db_config.php missing. Please configure your database.");
    }

    require_once 'db_config.php';

    // Simple check if placeholders are still present
    if (isset($host) && $host === 'localhost' && isset($db_name) && $db_name === 'your_database_name') {
        throw new Exception("Database credentials not configured in db_config.php");
    }

    if (!isset($pdo)) {
        throw new Exception("Database connection failed to initialize.");
    }

    $method = $_SERVER['REQUEST_METHOD'];
    $type = $_GET['type'] ?? 'clients';

    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Initialize tables automatically
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) NOT NULL UNIQUE,
        `email` varchar(255) NOT NULL UNIQUE,
        `password` varchar(255) NOT NULL,
        `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // SEEDING: Create a demo user if table is empty
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($userCount == 0) {
        $hashedDemo = password_hash('password123', PASSWORD_DEFAULT);
        $seedStmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $seedStmt->execute(['admin', 'admin@example.com', $hashedDemo]);
    }

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

    $pdo->exec("CREATE TABLE IF NOT EXISTS `clients` (
        `id` varchar(50) NOT NULL,
        `name` varchar(255) NOT NULL,
        `phone` varchar(50) NOT NULL,
        `email` varchar(255) DEFAULT NULL,
        `eventDate` date DEFAULT NULL,
        `eventType` varchar(100) DEFAULT NULL,
        `location` text,
        `image` longtext,
        `package` varchar(100) DEFAULT NULL,
        `totalPrice` decimal(10,2) DEFAULT 0.00,
        `paidAmount` decimal(10,2) DEFAULT 0.00,
        `dueAmount` decimal(10,2) DEFAULT 0.00,
        `status` varchar(50) DEFAULT NULL,
        `notes` text,
        `createdAt` datetime DEFAULT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    if ($type === 'auth') {
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);
        $action = $_GET['action'] ?? '';

        if ($action === 'signup') {
            if (empty($data['username']) || empty($data['password']) || empty($data['email'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "All fields required."]);
                exit();
            }

            $check = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $check->execute([$data['username'], $data['email']]);
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Username or Email exists."]);
                exit();
            }

            $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt->execute([$data['username'], $data['email'], $hashedPassword]);
            echo json_encode(["status" => "success", "message" => "Account created!"]);
            exit();
        } 
        elseif ($action === 'login') {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$data['username']]);
            $user = $stmt->fetch();
            if ($user && password_verify($data['password'], $user['password'])) {
                echo json_encode(["status" => "success", "user" => ["username" => $user['username'], "email" => $user['email']]]);
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
            }
            exit();
        }
    } 
    elseif ($type === 'settings') {
        switch ($method) {
            case 'GET':
                $stmt = $pdo->query("SELECT * FROM studio_settings LIMIT 1");
                echo json_encode($stmt->fetch() ?: null);
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                $stmt = $pdo->prepare("REPLACE INTO studio_settings (id, name, logo, address, phone, email, website, currency, taxNumber) 
                                      VALUES (1, :name, :logo, :address, :phone, :email, :website, :currency, :taxNumber)");
                $stmt->execute([
                    ':name' => $data['name'], ':logo' => $data['logo'] ?? null, ':address' => $data['address'] ?? '',
                    ':phone' => $data['phone'] ?? '', ':email' => $data['email'] ?? '', ':website' => $data['website'] ?? '',
                    ':currency' => $data['currency'] ?? '৳', ':taxNumber' => $data['taxNumber'] ?? ''
                ]);
                echo json_encode(["status" => "success"]);
                break;
        }
    } else {
        switch ($method) {
            case 'GET':
                $stmt = $pdo->query("SELECT * FROM clients ORDER BY createdAt DESC");
                echo json_encode($stmt->fetchAll());
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                $due = $data['totalPrice'] - $data['paidAmount'];
                $sql = "INSERT INTO clients (id, name, phone, email, eventDate, eventType, location, image, package, totalPrice, paidAmount, dueAmount, status, notes, createdAt) 
                        VALUES (:id, :name, :phone, :email, :eventDate, :eventType, :location, :image, :package, :totalPrice, :paidAmount, :dueAmount, :status, :notes, :createdAt)
                        ON DUPLICATE KEY UPDATE name=:name, phone=:phone, email=:email, eventDate=:eventDate, eventType=:eventType, location=:location, image=:image, 
                        package=:package, totalPrice=:totalPrice, paidAmount=:paidAmount, dueAmount=:dueAmount, status=:status, notes=:notes";
                $pdo->prepare($sql)->execute([
                    ':id' => $data['id'], ':name' => $data['name'], ':phone' => $data['phone'], ':email' => $data['email'] ?? null,
                    ':eventDate' => $data['eventDate'], ':eventType' => $data['eventType'], ':location' => $data['location'] ?? '',
                    ':image' => $data['image'] ?? null, ':package' => $data['package'] ?? 'Standard', ':totalPrice' => $data['totalPrice'],
                    ':paidAmount' => $data['paidAmount'], ':dueAmount' => $due, ':status' => $data['status'],
                    ':notes' => $data['notes'] ?? '', ':createdAt' => $data['createdAt'] ?? date('Y-m-d H:i:s')
                ]);
                echo json_encode(["status" => "success"]);
                break;
            case 'DELETE':
                if (isset($_GET['id'])) {
                    $pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$_GET['id']]);
                    echo json_encode(["status" => "success"]);
                }
                break;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
ob_end_flush();
