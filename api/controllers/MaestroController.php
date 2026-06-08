<?php
session_start();
header('Content-Type: application/json');

$action = $_GET['action'] ?? null;

// 1. Obtener los datos del maestro logueado
if ($action === 'profile') {
    if (isset($_SESSION['rol']) && $_SESSION['rol'] === 'maestro') {
        echo json_encode([
            "success" => true,
            "nombre" => $_SESSION['nombre'],
            "email" => $_SESSION['email']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "No hay sesión activa"]);
    }
    exit;
}

// 2. Cerrar sesión
if ($action === 'logout') {
    session_destroy();
    echo json_encode(["success" => true]);
}