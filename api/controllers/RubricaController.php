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
        $id_periodo = $_GET['id_periodo'] ?? null;
        
        if ($id_periodo) {
            $stmt = $pdo->prepare("SELECT r.*, p.nombre_periodo FROM rubricas r JOIN periodos p ON r.id_periodo = p.id_periodo WHERE r.id_grupo = ? AND r.id_periodo = ? ORDER BY r.id_rubrica ASC");
            $stmt->execute([$id_grupo, $id_periodo]);
        } else {
            $stmt = $pdo->prepare("SELECT r.*, 'Global' as nombre_periodo FROM rubricas r WHERE r.id_grupo = ? AND r.id_periodo IS NULL ORDER BY r.id_rubrica ASC");
            $stmt->execute([$id_grupo]);
        }
        
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        exit;
    }

    // CREAR UNA RÚBRICA
    if ($action === 'create') {
        $stmt = $pdo->prepare("INSERT INTO rubricas (id_grupo, id_periodo, categoria, porcentaje, color) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$input['id_grupo'], $input['id_periodo'] ?? null, $input['categoria'], $input['porcentaje'], $input['color'] ?? '#8b5cf6']);
        
        $id_rubrica = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT r.*, p.nombre_periodo FROM rubricas r LEFT JOIN periodos p ON r.id_periodo = p.id_periodo WHERE r.id_rubrica = ?");
        $stmt->execute([$id_rubrica]);
        
        echo json_encode(["success" => true, "data" => $stmt->fetch()]);
        exit;
    }
    
    // ACTUALIZAR UNA RÚBRICA
    if ($action === 'update') {
        $id_periodo = $input['id_periodo'] ?? null;
        if ($id_periodo === 'null' || $id_periodo === '') $id_periodo = null;

        $stmt = $pdo->prepare("UPDATE rubricas SET categoria = ?, porcentaje = ?, color = ?, id_periodo = ? WHERE id_rubrica = ? AND id_grupo = ?");
        $stmt->execute([$input['categoria'], $input['porcentaje'], $input['color'], $id_periodo, $input['id_rubrica'], $input['id_grupo']]);
        
        echo json_encode(["success" => true]);
        exit;
    }
    
    // DUPLICAR UNA RÚBRICA
    if ($action === 'duplicate') {
        $id_rubrica_origen = $input['id_rubrica'];
        $id_periodo_destino = $input['id_periodo'] ?? null;

        $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_rubrica = ?");
        $stmt->execute([$id_rubrica_origen]);
        $rub = $stmt->fetch();

        if ($rub) {
            $stmtInsert = $pdo->prepare("INSERT INTO rubricas (id_grupo, id_periodo, categoria, porcentaje, color) VALUES (?, ?, ?, ?, ?)");
            $stmtInsert->execute([$rub['id_grupo'], $id_periodo_destino, $rub['categoria'], $rub['porcentaje'], $rub['color']]);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Rúbrica no encontrada."]);
        }
        exit;
    }

    // OPERACIÓN MASIVA: COPIAR O MOVER RÚBRICAS
    if ($action === 'bulk_transfer') {
        $id_grupo = $input['id_grupo'];
        $source_period = $input['source_period'] ?? null;
        if ($source_period === 'null' || $source_period === '') $source_period = null;
        
        $target_period = $input['target_period'] ?? null;
        if ($target_period === 'null' || $target_period === '') $target_period = null;
        
        $op_type = $input['op_type'];

        $pdo->beginTransaction();

        if ($op_type === 'move') {
            if ($source_period) {
                $stmt = $pdo->prepare("UPDATE rubricas SET id_periodo = ? WHERE id_grupo = ? AND id_periodo = ?");
                $stmt->execute([$target_period, $id_grupo, $source_period]);
            } else {
                $stmt = $pdo->prepare("UPDATE rubricas SET id_periodo = ? WHERE id_grupo = ? AND id_periodo IS NULL");
                $stmt->execute([$target_period, $id_grupo]);
            }
        } else if ($op_type === 'copy') {
            if ($source_period) {
                $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? AND id_periodo = ?");
                $stmt->execute([$id_grupo, $source_period]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? AND id_periodo IS NULL");
                $stmt->execute([$id_grupo]);
            }
            $rubs = $stmt->fetchAll();
            $stmtIns = $pdo->prepare("INSERT INTO rubricas (id_grupo, id_periodo, categoria, porcentaje, color) VALUES (?, ?, ?, ?, ?)");
            foreach($rubs as $r) {
                $stmtIns->execute([$id_grupo, $target_period, $r['categoria'], $r['porcentaje'], $r['color']]);
            }
        }

        $pdo->commit();
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