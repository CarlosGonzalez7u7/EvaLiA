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
        $stmt = $pdo->prepare("SELECT id_alumno, matricula, nombre, qr_token, pin_acceso FROM alumnos WHERE id_grupo = ? ORDER BY nombre ASC");
        $stmt->execute([$id_grupo]);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        exit;
    }

    // CREAR UN ALUMNO Y SU CREDENCIAL
    if ($action === 'create') {
        $id_grupo = $input['id_grupo'];
        $nombre = trim($input['nombre']);
        $matricula = trim($input['matricula']);

        // Generar PIN de 6 dígitos aleatorio
        $pin = sprintf("%06d", mt_rand(100000, 999999));
        $password_hash = password_hash($pin, PASSWORD_DEFAULT);

        // Generar token único para el QR
        $qr_token = bin2hex(random_bytes(16));

        // Validar que la matrícula no se repita
        $check = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE matricula = ?");
        $check->execute([$matricula]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "message" => "La matrícula '$matricula' ya está registrada en el sistema."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO alumnos (id_grupo, nombre, matricula, password_hash, pin_acceso, qr_token) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id_grupo, $nombre, $matricula, $password_hash, $pin, $qr_token]);
        
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

        // Validar que la matrícula no se repita en otro alumno
        $check = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE matricula = ? AND id_alumno != ?");
        $check->execute([$matricula, $id_alumno]);
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
        $qr_token = bin2hex(random_bytes(16));

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

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}