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

    // 1. GUARDAR FECHAS DE UN PERIODO
    if ($action === 'update_dates') {
        $campo = $input['tipo'] === 'inicio' ? 'fecha_inicio' : 'fecha_fin';
        $stmt = $pdo->prepare("UPDATE periodos SET $campo = ? WHERE id_periodo = ?");
        $stmt->execute([$input['fecha'], $input['id_periodo']]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 2. AVANZAR AL SIGUIENTE PERIODO
    if ($action === 'next_period') {
        $id_grupo = $input['id_grupo'];
        
        // Obtener el periodo activo actual
        $stmt = $pdo->prepare("SELECT id_periodo FROM periodos WHERE id_grupo = ? AND activo = 1 LIMIT 1");
        $stmt->execute([$id_grupo]);
        $activo = $stmt->fetch();

        if ($activo) {
            // Buscar el siguiente periodo cronológicamente
            $stmtNext = $pdo->prepare("SELECT id_periodo FROM periodos WHERE id_grupo = ? AND id_periodo > ? ORDER BY id_periodo ASC LIMIT 1");
            $stmtNext->execute([$id_grupo, $activo['id_periodo']]);
            
            if ($next = $stmtNext->fetch()) {
                $pdo->prepare("UPDATE periodos SET activo = 0 WHERE id_grupo = ?")->execute([$id_grupo]);
                $pdo->prepare("UPDATE periodos SET activo = 1 WHERE id_periodo = ?")->execute([$next['id_periodo']]);
                echo json_encode(["success" => true, "message" => "Se ha avanzado al siguiente periodo con éxito."]);
                exit;
            }
            echo json_encode(["success" => false, "message" => "Este ya es el último periodo del ciclo."]);
            exit;
        }
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}