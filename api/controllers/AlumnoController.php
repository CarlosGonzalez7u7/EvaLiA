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

    // LEER ALUMNOS DEL GRUPO
    if ($action === 'list') {
        $id_grupo = $_GET['id_grupo'] ?? 0;
        $stmt = $pdo->prepare("SELECT id_alumno, matricula, nombre, qr_token, pin_acceso, puntos_extra, historial_puntos FROM alumnos WHERE id_grupo = ? ORDER BY orden ASC, nombre ASC");
        $stmt->execute([$id_grupo]);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        exit;
    }

    // CREAR UN ALUMNO Y SU CREDENCIAL
    if ($action === 'create') {
        $id_grupo = $input['id_grupo'];
        $nombre = trim($input['nombre']);
        $matricula = trim($input['matricula']);

        // Generar PIN de 6 dígitos aleatorio que sea ÚNICO en todo el sistema
        do {
            $pin = sprintf("%06d", mt_rand(100000, 999999));
            $checkPin = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE pin_acceso = ?");
            $checkPin->execute([$pin]);
        } while ($checkPin->fetch());

        $password_hash = password_hash($pin, PASSWORD_DEFAULT);

        // Generar token único para el QR garantizado
        do {
            $qr_token = bin2hex(random_bytes(16));
            $checkQr = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE qr_token = ?");
            $checkQr->execute([$qr_token]);
        } while ($checkQr->fetch());

        // Validar que la matrícula no se repita en este grupo
        $check = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE matricula = ? AND id_grupo = ?");
        $check->execute([$matricula, $id_grupo]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "message" => "La matrícula '$matricula' ya está registrada en el sistema."]);
            exit;
        }

        // Obtener el último orden para ponerlo al final
        $stmtOrder = $pdo->prepare("SELECT MAX(orden) FROM alumnos WHERE id_grupo = ?");
        $stmtOrder->execute([$id_grupo]);
        $maxOrder = $stmtOrder->fetchColumn();
        $nuevo_orden = $maxOrder ? $maxOrder + 1 : 1;

        $stmt = $pdo->prepare("INSERT INTO alumnos (id_grupo, nombre, matricula, password_hash, pin_acceso, orden, qr_token) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_grupo, $nombre, $matricula, $password_hash, $pin, $nuevo_orden, $qr_token]);
        
        $id_alumno = $pdo->lastInsertId();

        echo json_encode([
            "success" => true, 
            "data" => [
                "id_alumno" => $id_alumno,
                "nombre" => $nombre,
                "matricula" => $matricula,
                "qr_token" => $qr_token,
                "pin" => $pin // Se devuelve al Frontend una sola vez para que el maestro lo anote/imprima
            ]
        ]);
        exit;
    }

    // ACTUALIZAR ALUMNO
    if ($action === 'update') {
        $id_alumno = $input['id_alumno'];
        $nombre = trim($input['nombre']);
        $matricula = trim($input['matricula']);
        $id_grupo = $input['id_grupo'];

        // Validar que la matrícula no se repita en otro alumno del mismo grupo
        $check = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE matricula = ? AND id_alumno != ? AND id_grupo = ?");
        $check->execute([$matricula, $id_alumno, $id_grupo]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "message" => "La matrícula '$matricula' ya está registrada en el sistema."]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE alumnos SET nombre = ?, matricula = ? WHERE id_alumno = ?");
        $stmt->execute([$nombre, $matricula, $id_alumno]);
        echo json_encode(["success" => true]);
        exit;
    }

    // REGENERAR CÓDIGO QR
    if ($action === 'regenerate_qr') {
        $id_alumno = $input['id_alumno'];
        
        do {
            $qr_token = bin2hex(random_bytes(16));
            $checkQr = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE qr_token = ?");
            $checkQr->execute([$qr_token]);
        } while ($checkQr->fetch());

        $stmt = $pdo->prepare("UPDATE alumnos SET qr_token = ? WHERE id_alumno = ?");
        $stmt->execute([$qr_token, $id_alumno]);
        echo json_encode(["success" => true]);
        exit;
    }

    // BORRAR ALUMNO
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM alumnos WHERE id_alumno = ?");
        $stmt->execute([$input['id_alumno']]);
        echo json_encode(["success" => true]);
        exit;
    }
    
    // REORDENAR ALUMNOS
    if ($action === 'reorder') {
        $ordenes = $input['ordenes'] ?? [];
        
        if (!empty($ordenes)) {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE alumnos SET orden = ? WHERE id_alumno = ? AND id_grupo = ?");
            foreach ($ordenes as $index => $id_alumno) {
                $stmt->execute([$index + 1, $id_alumno, $input['id_grupo']]);
            }
            $pdo->commit();
        }
        echo json_encode(["success" => true]);
        exit;
    }

    // GESTIÓN DE PUNTOS EXTRAS
    if ($action === 'manage_points') {
        $id_alumno = $input['id_alumno'];
        $operacion = $input['operacion']; // 'add', 'subtract', 'transfer'
        $cantidad = floatval($input['cantidad']);
        $motivo = trim($input['motivo']);
        
        $fecha = date('d/m/Y H:i');

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("SELECT puntos_extra, historial_puntos FROM alumnos WHERE id_alumno = ? FOR UPDATE");
            $stmt->execute([$id_alumno]);
            $origen = $stmt->fetch();

            if (!$origen) throw new Exception("Alumno no encontrado.");

            $puntos_actuales = floatval($origen['puntos_extra']);
            $historial = json_decode($origen['historial_puntos'], true) ?: [];

            if ($operacion === 'subtract' || $operacion === 'transfer') {
                if ($puntos_actuales < $cantidad) throw new Exception("El alumno no tiene suficientes puntos extras para esta operación.");
                $puntos_actuales -= $cantidad;
            } else if ($operacion === 'add') {
                $puntos_actuales += $cantidad;
            }

            $historial[] = ["tipo" => $operacion, "cantidad" => $cantidad, "motivo" => $motivo, "fecha" => $fecha];
            $update = $pdo->prepare("UPDATE alumnos SET puntos_extra = ?, historial_puntos = ? WHERE id_alumno = ?");
            $update->execute([$puntos_actuales, json_encode($historial), $id_alumno]);

            if ($operacion === 'transfer') {
                $id_destino = $input['id_destino'];
                $stmtD = $pdo->prepare("SELECT nombre, puntos_extra, historial_puntos FROM alumnos WHERE id_alumno = ? FOR UPDATE");
                $stmtD->execute([$id_destino]);
                $destino = $stmtD->fetch();

                if (!$destino) throw new Exception("Alumno destino no encontrado.");

                $puntos_dest = floatval($destino['puntos_extra']) + $cantidad;
                $historial_dest = json_decode($destino['historial_puntos'], true) ?: [];
                $historial_dest[] = ["tipo" => "add", "cantidad" => $cantidad, "motivo" => "Transferencia recibida de un compañero: " . $motivo, "fecha" => $fecha];

                $updateD = $pdo->prepare("UPDATE alumnos SET puntos_extra = ?, historial_puntos = ? WHERE id_alumno = ?");
                $updateD->execute([$puntos_dest, json_encode($historial_dest), $id_destino]);
            }
            $pdo->commit();
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}