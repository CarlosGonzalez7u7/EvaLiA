<?php
// Iniciar sesión en PHP (Crucial para mantener al maestro logueado)
session_start();

// Definir que devolveremos JSON
header('Content-Type: application/json');

// Conectar a la base de datos
require_once __DIR__ . '/../config/database.php';

// Leer los datos JSON que envía el fetch()
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!isset($input['action'])) {
    echo json_encode(["success" => false, "message" => "Acción no especificada."]);
    exit;
}

// ==========================================
// 1. INICIO DE SESIÓN PARA MAESTROS
// ==========================================
if ($input['action'] === 'login_maestro') {
    $user = $input['user'] ?? null;

    if ($user && isset($user['uid']) && isset($user['email'])) {
        
        try {
            $db = new Database();
            $pdo = $db->connect();

            // 1. Buscar si el maestro ya existe
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE firebase_uid = :uid");
            $stmt->execute([':uid' => $user['uid']]);
            $maestro = $stmt->fetch();

            // 2. Si no existe, lo registramos automáticamente (Nuevo maestro)
            if (!$maestro) {
                $insert = $pdo->prepare("INSERT INTO usuarios (firebase_uid, nombre, email) VALUES (:uid, :nombre, :email)");
                $insert->execute([
                    ':uid' => $user['uid'],
                    ':nombre' => $user['displayName'] ?? 'Profesor',
                    ':email' => $user['email']
                ]);
            }

            // 3. Crear variables de sesión seguras
            $_SESSION['rol']    = 'maestro';
            $_SESSION['uid']    = $user['uid'];
            $_SESSION['email']  = $user['email'];
            $_SESSION['nombre'] = $user['displayName'];
            
            echo json_encode([
                "success"  => true, 
                "message"  => "Sesión iniciada y validada en BD.",
                "redirect" => "/views/maestro/panel_maestro.html"
            ]);
            exit;
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
            exit;
        }
    }
    
    echo json_encode(["success" => false, "message" => "Faltan datos de Google."]);
    exit;
}

// ==========================================
// 2. INICIO DE SESIÓN PARA ALUMNOS
// ==========================================
if ($input['action'] === 'login_alumno') {
    try {
        $db = new Database();
        $pdo = $db->connect();
        $alumno = null;

        // A) Intento de Login mediante Código QR
        if (isset($input['qr_token'])) {
            $stmt = $pdo->prepare("SELECT * FROM alumnos WHERE qr_token = :token");
            $stmt->execute([':token' => $input['qr_token']]);
            $alumno = $stmt->fetch();
        } 
        // B) Intento de Login manual (Matrícula/Nombre + PIN)
        else if (isset($input['identificador']) && isset($input['pin'])) {
            // Buscamos a los alumnos que tengan esa matrícula o ese nombre exacto
            $stmt = $pdo->prepare("SELECT a.* FROM alumnos a JOIN grupos g ON a.id_grupo = g.id_grupo WHERE a.matricula = ? OR a.nombre = ? ORDER BY g.activo DESC, g.id_grupo DESC");
            $stmt->execute([trim($input['identificador']), trim($input['identificador'])]);
            $posibles_alumnos = $stmt->fetchAll();
            
            foreach ($posibles_alumnos as $a) {
                if (password_verify(trim($input['pin']), $a['password_hash'])) {
                    $alumno = $a;
                    break;
                }
            }
        }

        if ($alumno) {
            $_SESSION['rol']       = 'alumno';
            $_SESSION['id_alumno'] = $alumno['id_alumno'];
            $_SESSION['id_grupo']  = $alumno['id_grupo'];
            $_SESSION['nombre']    = $alumno['nombre'];
            
            echo json_encode(["success" => true, "redirect" => "/views/alumno/panel_alumno.html"]);
            exit;
        } else {
            echo json_encode(["success" => false, "message" => "Credenciales incorrectas o código QR inválido."]);
            exit;
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
        exit;
    }
}

echo json_encode(["success" => false, "message" => "Acción inválida."]);