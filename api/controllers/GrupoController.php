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
        $estado = $_GET['estado'] ?? 1;
        $stmt = $pdo->prepare("
            SELECT g.*, 
            (SELECT COUNT(*) FROM periodos p WHERE p.id_grupo = g.id_grupo) as num_periodos,
            (SELECT COUNT(*) FROM alumnos a WHERE a.id_grupo = g.id_grupo) as num_alumnos
            FROM grupos g 
            WHERE g.id_maestro = :id AND g.activo = :estado 
            ORDER BY g.id_grupo DESC
        ");
        $stmt->execute([':id' => $id_maestro, ':estado' => $estado]);
        $grupos = $stmt->fetchAll();
        
        foreach ($grupos as &$g) {
            $stmtAvg = $pdo->prepare("SELECT AVG(c.puntaje) as prom FROM calificaciones c JOIN actividades a ON c.id_actividad = a.id_actividad JOIN periodos p ON a.id_periodo = p.id_periodo WHERE p.id_grupo = ?");
            $stmtAvg->execute([$g['id_grupo']]);
            $avg = $stmtAvg->fetchColumn();
            $g['promedio_general'] = $avg ? round($avg, 1) : '0.0';
        }

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
        $insertGrp = $pdo->prepare("INSERT INTO grupos (id_maestro, nombre_grupo, ciclo_escolar, nivel_educativo, tipo_periodo, modo_calificacion, tipo_rubrica, color_grupo, icono_grupo, avisos, calificacion_minima, horario, tolerancia_minutos, minutos_alarma, sonido_alarma) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insertGrp->execute([
            $id_maestro, 
            $input['nombre_grupo'], 
            $input['ciclo_escolar'], 
            $input['nivel_educativo'],
            $input['tipo_periodo'], 
            $input['modo_calificacion'],
            $input['tipo_rubrica'] ?? 'Global',
            $input['color_grupo'] ?? '#8b5cf6',
            $input['icono_grupo'] ?? 'fas fa-users',
            $input['avisos'] ?? null,
            $input['calificacion_minima'],
            $input['horario'] ?? null,
            $input['tolerancia_minutos'] ?? 15,
            $input['minutos_alarma'] ?? 5,
            $input['sonido_alarma'] ?? 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
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

        $updGrp = $pdo->prepare("UPDATE grupos SET nombre_grupo = ?, ciclo_escolar = ?, nivel_educativo = ?, tipo_periodo = ?, modo_calificacion = ?, tipo_rubrica = ?, color_grupo = ?, icono_grupo = ?, avisos = ?, calificacion_minima = ?, horario = ?, tolerancia_minutos = ?, minutos_alarma = ?, sonido_alarma = ? WHERE id_grupo = ?");
        $updGrp->execute([
            $input['nombre_grupo'], 
            $input['ciclo_escolar'], 
            $input['nivel_educativo'],
            $input['tipo_periodo'], 
            $input['modo_calificacion'],
            $input['tipo_rubrica'],
            $input['color_grupo'],
            $input['icono_grupo'],
            $input['avisos'] ?? null,
            $input['calificacion_minima'],
            $input['horario'] ?? null,
            $input['tolerancia_minutos'] ?? 15,
            $input['minutos_alarma'] ?? 5,
            $input['sonido_alarma'] ?? 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
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

    // --- CAMBIAR ESTADO (OCULTAR/MOSTRAR) GRUPO ---
    if ($action === 'toggle_status') {
        $id_grupo = $input['id_grupo'];
        $estado = $input['estado'];
        $pdo->prepare("UPDATE grupos SET activo = ? WHERE id_grupo = ? AND id_maestro = ?")->execute([$estado, $id_grupo, $id_maestro]);
        echo json_encode(["success" => true]);
        exit;
    }
    
    // --- CLONAR / PROMOVER GRUPO AL SIGUIENTE CICLO ---
    if ($action === 'clone') {
        $id_grupo_origen = $input['id_grupo'];
        $nuevo_nombre = $input['nuevo_nombre'];
        $nuevo_ciclo = $input['nuevo_ciclo'];

        $pdo->beginTransaction();

        // 1. Obtener datos del grupo original
        $stmt = $pdo->prepare("SELECT * FROM grupos WHERE id_grupo = ? AND id_maestro = ?");
        $stmt->execute([$id_grupo_origen, $id_maestro]);
        $oldGrupo = $stmt->fetch();
        if (!$oldGrupo) { echo json_encode(["success"=>false, "message"=>"Grupo no encontrado."]); exit; }

        // 2. Insertar nuevo grupo calcado
        $insertGrp = $pdo->prepare("INSERT INTO grupos (id_maestro, nombre_grupo, ciclo_escolar, nivel_educativo, tipo_periodo, modo_calificacion, tipo_rubrica, color_grupo, icono_grupo, avisos, calificacion_minima, horario, tolerancia_minutos, minutos_alarma, sonido_alarma) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insertGrp->execute([$id_maestro, $nuevo_nombre, $nuevo_ciclo, $oldGrupo['nivel_educativo'], $oldGrupo['tipo_periodo'], $oldGrupo['modo_calificacion'], $oldGrupo['tipo_rubrica'], $oldGrupo['color_grupo'], $oldGrupo['icono_grupo'], $oldGrupo['avisos'], $oldGrupo['calificacion_minima'], $oldGrupo['horario'], $oldGrupo['tolerancia_minutos'], $oldGrupo['minutos_alarma'], $oldGrupo['sonido_alarma']]);
        $nuevo_id_grupo = $pdo->lastInsertId();

        // 3. Crear el primer Periodo
        $pdo->prepare("INSERT INTO periodos (id_grupo, nombre_periodo, activo) VALUES (?, ?, 1)")->execute([$nuevo_id_grupo, $oldGrupo['tipo_periodo'] . " 1"]);

        // 4. Copiar Rúbricas (Solo las Globales)
        $stmtRub = $pdo->prepare("SELECT * FROM rubricas WHERE id_grupo = ? AND id_periodo IS NULL");
        $stmtRub->execute([$id_grupo_origen]);
        $rubricas = $stmtRub->fetchAll();
        $insRub = $pdo->prepare("INSERT INTO rubricas (id_grupo, categoria, porcentaje, color) VALUES (?, ?, ?, ?)");
        foreach($rubricas as $rub) $insRub->execute([$nuevo_id_grupo, $rub['categoria'], $rub['porcentaje'], $rub['color']]);

        // 5. Copiar Alumnos (Nuevo QR token, mismo PIN y Matrícula)
        $stmtAl = $pdo->prepare("SELECT * FROM alumnos WHERE id_grupo = ?");
        $stmtAl->execute([$id_grupo_origen]);
        $alumnos = $stmtAl->fetchAll();
        $insAl = $pdo->prepare("INSERT INTO alumnos (id_grupo, nombre, matricula, password_hash, pin_acceso, orden, qr_token) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach($alumnos as $al) {
            do {
                $qr_token = bin2hex(random_bytes(16));
                $checkQr = $pdo->prepare("SELECT id_alumno FROM alumnos WHERE qr_token = ?");
                $checkQr->execute([$qr_token]);
            } while ($checkQr->fetch());
            $insAl->execute([$nuevo_id_grupo, $al['nombre'], $al['matricula'], $al['password_hash'], $al['pin_acceso'], $al['orden'], $qr_token]);
        }

        // 6. Ocultar el grupo anterior para no estorbar
        $pdo->prepare("UPDATE grupos SET activo = 0 WHERE id_grupo = ?")->execute([$id_grupo_origen]);

        $pdo->commit();
        echo json_encode(["success" => true]);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}