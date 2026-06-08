<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Proteger el endpoint
if (!isset($_SESSION['uid']) || $_SESSION['rol'] !== 'maestro') {
    echo json_encode(["success" => false, "message" => "Acceso no autorizado."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? ($_GET['action'] ?? null);

try {
    $db = new Database();
    $pdo = $db->connect();

    // Obtener ID interno del maestro
    $stmt = $pdo->prepare("SELECT id_maestro FROM usuarios WHERE firebase_uid = :uid");
    $stmt->execute([':uid' => $_SESSION['uid']]);
    $id_maestro = $stmt->fetchColumn();

    // --- LEER GRUPOS ---
    if ($action === 'list') {
        $stmt = $pdo->prepare("SELECT g.*, (SELECT COUNT(*) FROM periodos p WHERE p.id_grupo = g.id_grupo) as num_periodos FROM grupos g WHERE g.id_maestro = :id AND g.activo = 1 ORDER BY g.id_grupo DESC");
        $stmt->execute([':id' => $id_maestro]);
        $grupos = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "data" => $grupos]);
        exit;
    }

    // --- OBTENER UN GRUPO Y SUS PERIODOS ---
    if ($action === 'get') {
        $id_grupo = $_GET['id'] ?? 0;
        
        $stmt = $pdo->prepare("SELECT g.*, (SELECT COUNT(*) FROM periodos p WHERE p.id_grupo = g.id_grupo) as num_periodos FROM grupos g WHERE g.id_grupo = ? AND g.id_maestro = ?");
        $stmt->execute([$id_grupo, $id_maestro]);
        $grupo = $stmt->fetch();

        if (!$grupo) {
            echo json_encode(["success" => false, "message" => "Grupo no encontrado o sin permiso."]);
            exit;
        }

        $stmtPer = $pdo->prepare("SELECT * FROM periodos WHERE id_grupo = ?");
        $stmtPer->execute([$id_grupo]);
        $periodos = $stmtPer->fetchAll();

        echo json_encode(["success" => true, "grupo" => $grupo, "periodos" => $periodos]);
        exit;
    }

    // --- CREAR GRUPO Y SUS PERIODOS ---
    if ($action === 'create') {
        $pdo->beginTransaction(); // Iniciamos transacción segura

        // 1. Insertar el Grupo
        $insertGrp = $pdo->prepare("INSERT INTO grupos (id_maestro, nombre_grupo, ciclo_escolar, nivel_educativo, tipo_periodo, modo_calificacion, calificacion_minima, dias_clase, hora_inicio, hora_fin, tolerancia_minutos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insertGrp->execute([
            $id_maestro, 
            $input['nombre_grupo'], 
            $input['ciclo_escolar'], 
            $input['nivel_educativo'],
            $input['tipo_periodo'], 
            $input['modo_calificacion'],
            $input['calificacion_minima'],
            $input['dias_clase'] ?? 'Lunes,Martes,Miercoles,Jueves,Viernes',
            $input['hora_inicio'] ?? '08:00:00',
            $input['hora_fin'] ?? '09:00:00',
            $input['tolerancia_minutos'] ?? 15
        ]);
        
        $id_grupo = $pdo->lastInsertId();

        // 2. Auto-generar los Periodos
        $num_periodos = (int)($input['num_periodos'] ?? 1);

        $insertPer = $pdo->prepare("INSERT INTO periodos (id_grupo, nombre_periodo, activo) VALUES (?, ?, ?)");
        for ($i = 1; $i <= $num_periodos; $i++) {
            $activo = ($i === 1) ? 1 : 0; // Solo el periodo 1 empieza activo
            $insertPer->execute([$id_grupo, "{$input['tipo_periodo']} $i", $activo]);
        }

        $pdo->commit();

        // 3. Devolver el grupo recién creado al Frontend
        $stmt = $pdo->prepare("SELECT g.*, (SELECT COUNT(*) FROM periodos p WHERE p.id_grupo = g.id_grupo) as num_periodos FROM grupos g WHERE g.id_grupo = ?");
        $stmt->execute([$id_grupo]);
        $nuevo_grupo = $stmt->fetch();

        echo json_encode(["success" => true, "data" => $nuevo_grupo]);
        exit;
    }
    
    // --- ACTUALIZAR GRUPO ---
    if ($action === 'update') {
        $pdo->beginTransaction();
        $id_grupo = $input['id_grupo'];

        $stmt = $pdo->prepare("SELECT tipo_periodo, (SELECT COUNT(*) FROM periodos WHERE id_grupo = ?) as num_periodos FROM grupos WHERE id_grupo = ? AND id_maestro = ?");
        $stmt->execute([$id_grupo, $id_grupo, $id_maestro]);
        $oldData = $stmt->fetch();

        if (!$oldData) {
             echo json_encode(["success" => false, "message" => "Grupo no encontrado o sin permisos."]);
             exit;
        }

        $updGrp = $pdo->prepare("UPDATE grupos SET nombre_grupo = ?, ciclo_escolar = ?, nivel_educativo = ?, tipo_periodo = ?, modo_calificacion = ?, calificacion_minima = ?, dias_clase = ?, hora_inicio = ?, hora_fin = ?, tolerancia_minutos = ? WHERE id_grupo = ?");
        $updGrp->execute([
            $input['nombre_grupo'], 
            $input['ciclo_escolar'], 
            $input['nivel_educativo'],
            $input['tipo_periodo'], 
            $input['modo_calificacion'],
            $input['calificacion_minima'],
            $input['dias_clase'],
            $input['hora_inicio'],
            $input['hora_fin'],
            $input['tolerancia_minutos'],
            $id_grupo
        ]);

        // Si el maestro cambió el tipo de evaluación (ej. Trimestre a Bimestre) regeneramos los periodos
        $num_periodos_input = (int)($input['num_periodos'] ?? 1);
        if ($oldData['tipo_periodo'] !== $input['tipo_periodo'] || $oldData['num_periodos'] != $num_periodos_input) {
            $pdo->prepare("DELETE FROM periodos WHERE id_grupo = ?")->execute([$id_grupo]);
            

            $insertPer = $pdo->prepare("INSERT INTO periodos (id_grupo, nombre_periodo, activo) VALUES (?, ?, ?)");
            for ($i = 1; $i <= $num_periodos_input; $i++) {
                $activo = ($i === 1) ? 1 : 0;
                $insertPer->execute([$id_grupo, "{$input['tipo_periodo']} $i", $activo]);
            }
        }

        $pdo->commit();
        echo json_encode(["success" => true]);
        exit;
    }

    // --- DESHABILITAR (OCULTAR) GRUPO ---
    if ($action === 'deactivate') {
        $id_grupo = $input['id_grupo'];
        $pdo->prepare("UPDATE grupos SET activo = 0 WHERE id_grupo = ? AND id_maestro = ?")->execute([$id_grupo, $id_maestro]);
        echo json_encode(["success" => true]);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}