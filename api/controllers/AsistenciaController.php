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
        $stmtG = $pdo->prepare("SELECT horario, tolerancia_minutos FROM grupos WHERE id_grupo = ?");
        $stmtG->execute([$id_grupo]);
        $grupoConfig = $stmtG->fetch();

        $estado = 'Asistencia';
        $dias_semana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        $dia_hoy = $dias_semana[date('w')]; 

        $hora_inicio_hoy = null;
        if (!empty($grupoConfig['horario'])) {
            $horarios = json_decode($grupoConfig['horario'], true);
            if (is_array($horarios)) {
                foreach ($horarios as $h) { if ($h['dia'] === $dia_hoy) { $hora_inicio_hoy = $h['inicio']; break; } }
            }
        }

        if ($hora_inicio_hoy) {
            $hora_actual = date('H:i:s');
            $hora_limite = date('H:i:s', strtotime($hora_inicio_hoy . ' + ' . $grupoConfig['tolerancia_minutos'] . ' minutes'));
            if ($hora_actual > $hora_limite) $estado = 'Retardo';
        }

        $comentario = $input['comentario'] ?? null;
        if (empty(trim($comentario))) $comentario = null;

        // Registrar Asistencia (Usando la hora de PHP con zona horaria correcta)
        $ahora = date('Y-m-d H:i:s');
        $insert = $pdo->prepare("INSERT INTO asistencias (id_alumno, fecha_hora, estado, comentario) VALUES (?, ?, ?, ?)");
        $insert->execute([$alumno['id_alumno'], $ahora, $estado, $comentario]);

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
        
        $stmt = $pdo->prepare("SELECT id_alumno, nombre FROM alumnos WHERE id_grupo = ? ORDER BY orden ASC, nombre ASC");
        $stmt->execute([$id_grupo]);
        $alumnos = $stmt->fetchAll();

        $stmt = $pdo->prepare("SELECT DISTINCT DATE(fecha_hora) as fecha FROM asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno WHERE al.id_grupo = ? ORDER BY fecha ASC");
        $stmt->execute([$id_grupo]);
        $fechas = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->prepare("SELECT a.id_alumno, DATE(a.fecha_hora) as fecha, a.estado, a.comentario FROM asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno WHERE al.id_grupo = ?");
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

    // 2.7 AGREGAR COMENTARIO A UNA CELDA MANUAL
    if ($action === 'add_comment') {
        $id_alumno = $input['id_alumno'];
        $fecha = $input['fecha'];
        $comentario = $input['comentario'];
        
        $pdo->prepare("UPDATE asistencias SET comentario = ? WHERE id_alumno = ? AND DATE(fecha_hora) = ?")->execute([$comentario, $id_alumno, $fecha]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 2.8 MODIFICAR FECHA COMPLETA DE ASISTENCIA
    if ($action === 'edit_date') {
        $id_grupo = $input['id_grupo'];
        $old_date = $input['old_date'];
        $new_date = $input['new_date'];

        $stmt = $pdo->prepare("UPDATE asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno SET a.fecha_hora = CONCAT(?, ' ', TIME(a.fecha_hora)) WHERE al.id_grupo = ? AND DATE(a.fecha_hora) = ?");
        $stmt->execute([$new_date, $id_grupo, $old_date]);
        
        echo json_encode(["success" => true]);
        exit;
    }

    // 2.9 ELIMINAR FECHA COMPLETA DE ASISTENCIA
    if ($action === 'delete_date') {
        $id_grupo = $input['id_grupo'];
        $date = $input['date'];

        $stmt = $pdo->prepare("DELETE a FROM asistencias a JOIN alumnos al ON a.id_alumno = al.id_alumno WHERE al.id_grupo = ? AND DATE(a.fecha_hora) = ?");
        $stmt->execute([$id_grupo, $date]);
        
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