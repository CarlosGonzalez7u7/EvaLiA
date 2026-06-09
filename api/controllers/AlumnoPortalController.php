<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['id_alumno']) || $_SESSION['rol'] !== 'alumno') {
    echo json_encode(["success" => false, "message" => "Acceso no autorizado."]);
    exit;
}

$action = $_GET['action'] ?? null;

try {
    $db = new Database();
    $pdo = $db->connect();
    $id_alumno = $_SESSION['id_alumno'];
    $id_grupo = $_SESSION['id_grupo'];

    if ($action === 'dashboard') {
        // 1. Datos del Grupo
        $stmt = $pdo->prepare("SELECT * FROM grupos WHERE id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $grupo = $stmt->fetch();

        // 2. Periodos
        $stmt = $pdo->prepare("SELECT * FROM periodos WHERE id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $periodos = $stmt->fetchAll();

        // 3. Rúbricas
        $stmt = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $rubricas = $stmt->fetchAll();

        // 4. Actividades
        $stmt = $pdo->prepare("SELECT a.*, p.nombre_periodo, r.categoria, r.color, r.porcentaje FROM actividades a JOIN periodos p ON a.id_periodo = p.id_periodo JOIN rubricas r ON a.id_rubrica = r.id_rubrica WHERE a.id_periodo IN (SELECT id_periodo FROM periodos WHERE id_grupo = ?) ORDER BY a.fecha_entrega DESC");
        $stmt->execute([$id_grupo]);
        $actividades = $stmt->fetchAll();

        // 5. Calificaciones del Alumno
        $stmt = $pdo->prepare("SELECT c.*, a.nombre_actividad, a.id_periodo FROM calificaciones c JOIN actividades a ON c.id_actividad = a.id_actividad WHERE c.id_alumno = ?");
        $stmt->execute([$id_alumno]);
        $calificaciones = $stmt->fetchAll();

        // 6. Asistencias del Alumno
        $stmt = $pdo->prepare("SELECT * FROM asistencias WHERE id_alumno = ? ORDER BY fecha_hora DESC");
        $stmt->execute([$id_alumno]);
        $asistencias_alumno = $stmt->fetchAll();

        // 7. Max Asistencias del Grupo (para calcular la base de sus faltas)
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM asistencias WHERE id_alumno IN (SELECT id_alumno FROM alumnos WHERE id_grupo = ?) GROUP BY id_alumno ORDER BY total DESC LIMIT 1");
        $stmt->execute([$id_grupo]);
        $maxAsist = $stmt->fetch();
        $max_asistencias = $maxAsist ? (int)$maxAsist['total'] : 1;
        if ($max_asistencias === 0) $max_asistencias = 1;

        // 8. Calcular el Número de Lista del Alumno
        $stmt = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE id_grupo = ? ORDER BY orden ASC, nombre ASC");
        $stmt->execute([$id_grupo]);
        $all_alumnos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $numero_lista = array_search($id_alumno, $all_alumnos) + 1;

        echo json_encode([
            "success" => true,
            "alumno" => ["id_alumno" => $id_alumno, "nombre" => $_SESSION['nombre'], "numero_lista" => $numero_lista],
            "grupo" => $grupo,
            "periodos" => $periodos,
            "rubricas" => $rubricas,
            "actividades" => $actividades,
            "calificaciones" => $calificaciones,
            "asistencias" => $asistencias_alumno,
            "max_asistencias" => $max_asistencias
        ]);
        exit;
    }

    if ($action === 'logout') {
        session_destroy();
        echo json_encode(["success" => true]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}