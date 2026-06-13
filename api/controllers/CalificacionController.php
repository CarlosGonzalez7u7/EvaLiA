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

    // 1. OBTENER TODOS LOS DATOS PARA LA CUADRÍCULA EXCEL
    if ($action === 'get_grid') {
        $id_grupo = $_GET['id_grupo'];
        $id_periodo = $_GET['id_periodo']; // Solo cargamos el periodo seleccionado
        
        // Obtener Alumnos
        $stmt = $pdo->prepare("SELECT id_alumno, nombre FROM alumnos WHERE id_grupo = ? ORDER BY orden ASC, nombre ASC");
        $stmt->execute([$id_grupo]);
        $alumnos = $stmt->fetchAll();

        // Obtener Grupo para saber tipo_rubrica
        $stmtG = $pdo->prepare("SELECT tipo_rubrica FROM grupos WHERE id_grupo = ?");
        $stmtG->execute([$id_grupo]);
        $grupo = $stmtG->fetch();

        // Obtener Rúbricas
        if ($grupo['tipo_rubrica'] === 'Por Periodo') {
            $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? AND id_periodo = ?");
            $stmt->execute([$id_grupo, $id_periodo]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? AND id_periodo IS NULL");
            $stmt->execute([$id_grupo]);
        }
        $rubricas = $stmt->fetchAll();

        // Obtener Actividades del Periodo
        $stmt = $pdo->prepare("SELECT * FROM actividades WHERE id_periodo = ?");
        $stmt->execute([$id_periodo]);
        $actividades = $stmt->fetchAll();

        // Obtener Calificaciones de esas actividades
        $stmt = $pdo->prepare("SELECT c.* FROM calificaciones c JOIN actividades a ON c.id_actividad = a.id_actividad WHERE a.id_periodo = ?");
        $stmt->execute([$id_periodo]);
        $calificaciones = $stmt->fetchAll();

        // Obtener TODAS las asistencias de este grupo
        $stmt = $pdo->prepare("SELECT asis.* FROM asistencias asis JOIN alumnos a ON asis.id_alumno = a.id_alumno WHERE a.id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $asistencias = $stmt->fetchAll();

        echo json_encode(["success" => true, "alumnos" => $alumnos, "rubricas" => $rubricas, "actividades" => $actividades, "calificaciones" => $calificaciones, "asistencias" => $asistencias]);
        exit;
    }

    // 2. CREAR UNA NUEVA COLUMNA (ACTIVIDAD/TAREA/EXAMEN)
    if ($action === 'create_actividad') {
        $stmt = $pdo->prepare("INSERT INTO actividades (id_rubrica, id_periodo, nombre_actividad, descripcion, enlace, fecha_entrega) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$input['id_rubrica'], $input['id_periodo'], $input['nombre_actividad'], $input['descripcion'] ?? null, $input['enlace'] ?? null, $input['fecha_entrega']]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 3. ACTUALIZAR UNA ACTIVIDAD
    if ($action === 'update_actividad') {
        $stmt = $pdo->prepare("UPDATE actividades SET id_rubrica = ?, nombre_actividad = ?, descripcion = ?, enlace = ?, fecha_entrega = ? WHERE id_actividad = ?");
        $stmt->execute([$input['id_rubrica'], $input['nombre_actividad'], $input['descripcion'] ?? null, $input['enlace'] ?? null, $input['fecha_entrega'], $input['id_actividad']]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 4. ELIMINAR UNA ACTIVIDAD
    if ($action === 'delete_actividad') {
        $stmt = $pdo->prepare("DELETE FROM actividades WHERE id_actividad = ?");
        $stmt->execute([$input['id_actividad']]);
        echo json_encode(["success" => true]);
        exit;
    }

    // 3. GUARDAR CALIFICACIÓN EN TIEMPO REAL (El Núcleo)
    if ($action === 'save_nota') {
        $stmt = $pdo->prepare("INSERT INTO calificaciones (id_alumno, id_actividad, puntaje) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE puntaje = VALUES(puntaje), fecha_captura = CURRENT_TIMESTAMP");
        $stmt->execute([$input['id_alumno'], $input['id_actividad'], $input['puntaje']]);
        echo json_encode(["success" => true]);
        exit;
    }

    // GESTIÓN MASIVA DE CALIFICACIONES EN BLOQUE (NUEVO)
    if ($action === 'save_notas_bulk') {
        $changes = $input['changes'] ?? [];
        $pdo->beginTransaction();
        try {
            foreach ($changes as $change) {
                $id_alumno = $change['id_alumno'];
                $id_actividad = $change['id_actividad'];
                $puntaje = floatval($change['puntaje']);

                $check = $pdo->prepare("SELECT id_calificacion FROM calificaciones WHERE id_alumno = ? AND id_actividad = ?");
                $check->execute([$id_alumno, $id_actividad]);
                
                if ($row = $check->fetch()) {
                    $pdo->prepare("UPDATE calificaciones SET puntaje = ? WHERE id_calificacion = ?")->execute([$puntaje, $row['id_calificacion']]);
                } else {
                    $pdo->prepare("INSERT INTO calificaciones (id_alumno, id_actividad, puntaje) VALUES (?, ?, ?)")->execute([$id_alumno, $id_actividad, $puntaje]);
                }
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