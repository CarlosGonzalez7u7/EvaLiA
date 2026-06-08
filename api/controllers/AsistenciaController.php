<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Establecer zona horaria si es necesario (ej. México)
date_default_timezone_set('America/Mexico_City');

if (!isset($_SESSION['uid']) || $_SESSION['rol'] !== 'maestro') {
    echo json_encode(["success" => false, "message" => "Acceso no autorizado."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? ($_GET['action'] ?? null);

try {
    $db = new Database();
    $pdo = $db->connect();

    // 1. REGISTRAR ASISTENCIA ESCANEADA
    if ($action === 'registrar') {
        $qr_token = trim($input['qr_token']);
        $id_grupo = $input['id_grupo'];

        // Buscar al alumno
        $stmt = $pdo->prepare("SELECT id_alumno, nombre FROM alumnos WHERE qr_token = ? AND id_grupo = ?");
        $stmt->execute([$qr_token, $id_grupo]);
        $alumno = $stmt->fetch();

        if (!$alumno) {
            echo json_encode(["success" => false, "message" => "Código QR inválido o el alumno no pertenece a este grupo."]);
            exit;
        }

        // Verificar si ya tiene asistencia hoy usando la hora del servidor
        $hoy = date('Y-m-d');
        $check = $pdo->prepare("SELECT id_asistencia FROM asistencias WHERE id_alumno = ? AND DATE(fecha_hora) = ?");
        $check->execute([$alumno['id_alumno'], $hoy]);
        if ($check->fetch()) {
             echo json_encode(["success" => false, "message" => "El alumno " . $alumno['nombre'] . " ya tiene asistencia registrada el día de hoy."]);
             exit;
        }

        // Obtener el horario del grupo para saber si es Asistencia o Retardo
        $stmtG = $pdo->prepare("SELECT hora_inicio, tolerancia_minutos FROM grupos WHERE id_grupo = ?");
        $stmtG->execute([$id_grupo]);
        $grupoConfig = $stmtG->fetch();

        $estado = 'Asistencia';
        $hora_actual = date('H:i:s');
        $hora_limite = date('H:i:s', strtotime($grupoConfig['hora_inicio'] . ' + ' . $grupoConfig['tolerancia_minutos'] . ' minutes'));
        if ($hora_actual > $hora_limite) {
            $estado = 'Retardo';
        }

        // Registrar Asistencia (Usando CURRENT_TIMESTAMP de la BD por seguridad)
        $insert = $pdo->prepare("INSERT INTO asistencias (id_alumno, fecha_hora, estado) VALUES (?, CURRENT_TIMESTAMP, ?)");
        $insert->execute([$alumno['id_alumno'], $estado]);

        // Obtener la hora registrada para mandarla de vuelta
        $fecha_hora = date('d/m/Y h:i A');

        echo json_encode(["success" => true, "nombre" => $alumno['nombre'], "fecha_hora" => $fecha_hora]);
        exit;
    }

    // 2. LISTAR ASISTENCIAS DEL DÍA
    if ($action === 'listar_hoy') {
        $id_grupo = $_GET['id_grupo'];
        $hoy = date('Y-m-d');

        $stmt = $pdo->prepare("
            SELECT a.nombre, asis.fecha_hora, asis.estado 
            FROM asistencias asis 
            JOIN alumnos a ON asis.id_alumno = a.id_alumno 
            WHERE a.id_grupo = ? AND DATE(asis.fecha_hora) = ? 
            ORDER BY asis.fecha_hora DESC
        ");
        $stmt->execute([$id_grupo, $hoy]);
        $asistencias = $stmt->fetchAll();

        // Formatear fechas para JS
        $asistenciasFormateadas = array_map(function($asis) {
            $asis['fecha_hora'] = date('h:i A', strtotime($asis['fecha_hora']));
            return $asis;
        }, $asistencias);

        echo json_encode(["success" => true, "data" => $asistenciasFormateadas]);
        exit;
    }

    // 2.5 OBTENER CUADRÍCULA EXCEL DE ASISTENCIAS
    if ($action === 'get_grid') {
        $id_grupo = $_GET['id_grupo'];
        
        $stmt = $pdo->prepare("SELECT id_alumno, nombre FROM alumnos WHERE id_grupo = ? ORDER BY nombre ASC");
        $stmt->execute([$id_grupo]);
        $alumnos = $stmt->fetchAll();

        $stmt = $pdo->prepare("SELECT DISTINCT DATE(fecha_hora) as fecha FROM asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno WHERE al.id_grupo = ? ORDER BY fecha ASC");
        $stmt->execute([$id_grupo]);
        $fechas = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->prepare("SELECT a.id_alumno, DATE(a.fecha_hora) as fecha, a.estado FROM asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno WHERE al.id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $asistencias = $stmt->fetchAll();

        echo json_encode(["success" => true, "alumnos" => $alumnos, "fechas" => $fechas, "asistencias" => $asistencias]);
        exit;
    }

    // 2.6 GUARDAR CELDA MANUAL DESDE EL EXCEL
    if ($action === 'save_cell') {
        $id_alumno = $input['id_alumno'];
        $fecha = $input['fecha'];
        $estado = $input['estado']; // 'Asistencia', 'Retardo', 'Falta', 'Eliminar'

        if ($estado === 'Eliminar') {
            $pdo->prepare("DELETE FROM asistencias WHERE id_alumno = ? AND DATE(fecha_hora) = ?")->execute([$id_alumno, $fecha]);
        } else {
            $check = $pdo->prepare("SELECT id_asistencia FROM asistencias WHERE id_alumno = ? AND DATE(fecha_hora) = ?");
            $check->execute([$id_alumno, $fecha]);
            if ($row = $check->fetch()) {
                $pdo->prepare("UPDATE asistencias SET estado = ? WHERE id_asistencia = ?")->execute([$estado, $row['id_asistencia']]);
            } else {
                $pdo->prepare("INSERT INTO asistencias (id_alumno, fecha_hora, estado) VALUES (?, ?, ?)")->execute([$id_alumno, $fecha . ' ' . date('H:i:s'), $estado]);
            }
        }
        echo json_encode(["success" => true]);
        exit;
    }

    // 3. AGREGAR ASISTENCIA MANUAL
    if ($action === 'add_manual') {
        $id_alumno = $input['id_alumno'];
        $fecha = $input['fecha']; // YYYY-MM-DD
        $hora = date('H:i:s'); // Usar hora actual del servidor
        $fecha_hora = $fecha . ' ' . $hora;
        
        $check = $pdo->prepare("SELECT id_asistencia FROM asistencias WHERE id_alumno = ? AND DATE(fecha_hora) = ?");
        $check->execute([$id_alumno, $fecha]);
        if ($check->fetch()) {
             echo json_encode(["success" => false, "message" => "El alumno ya tiene asistencia registrada en esta fecha."]);
             exit;
        }

        $insert = $pdo->prepare("INSERT INTO asistencias (id_alumno, fecha_hora, estado) VALUES (?, ?, 'Asistencia')");
        $insert->execute([$id_alumno, $fecha_hora]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 4. ELIMINAR ASISTENCIA
    if ($action === 'delete') {
        $id_asistencia = $input['id_asistencia'];
        $pdo->prepare("DELETE FROM asistencias WHERE id_asistencia = ?")->execute([$id_asistencia]);
        echo json_encode(["success" => true]);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}