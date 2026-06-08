<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['uid']) || $_SESSION['rol'] !== 'maestro') {
    echo json_encode(["success" => false, "message" => "Acceso no autorizado."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? ($_GET['action'] ?? null);

try {
    $db = new Database();
    $pdo = $db->connect();

    // LEER RÚBRICAS DEL GRUPO
    if ($action === 'list') {
        $id_grupo = $_GET['id_grupo'] ?? 0;
        $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? ORDER BY id_rubrica ASC");
        $stmt->execute([$id_grupo]);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        exit;
    }

    // CREAR UNA RÚBRICA
    if ($action === 'create') {
        $stmt = $pdo->prepare("INSERT INTO rubricas (id_grupo, categoria, porcentaje, color) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input['id_grupo'], $input['categoria'], $input['porcentaje'], $input['color'] ?? '#8b5cf6']);
        
        $id_rubrica = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_rubrica = ?");
        $stmt->execute([$id_rubrica]);
        
        echo json_encode(["success" => true, "data" => $stmt->fetch()]);
        exit;
    }
    
    // ACTUALIZAR UNA RÚBRICA
    if ($action === 'update') {
        $stmt = $pdo->prepare("UPDATE rubricas SET categoria = ?, porcentaje = ?, color = ? WHERE id_rubrica = ? AND id_grupo = ?");
        $stmt->execute([$input['categoria'], $input['porcentaje'], $input['color'], $input['id_rubrica'], $input['id_grupo']]);
        
        echo json_encode(["success" => true]);
        exit;
    }

    // BORRAR UNA RÚBRICA
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM rubricas WHERE id_rubrica = ?");
        $stmt->execute([$input['id_rubrica']]);
        echo json_encode(["success" => true]);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}