<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Log para debug en consola de VS Code
error_log("Petición recibida: " . $uri);

// 1. Peticiones a la API (Backend PHP)
if (strpos($uri, '/api/') === 0 || strpos($uri, '/backend/') === 0) {
    $apiPath = __DIR__ . $uri;
    
    // Si la carpeta física es backend pero la ruta dice api
    if (!file_exists($apiPath) && strpos($uri, '/api/') === 0) {
        $apiPath = __DIR__ . str_replace('/api/', '/backend/', $uri);
    }

    if (file_exists($apiPath)) {
        require_once $apiPath;
        return true;
    }
    http_response_code(404);
    echo json_encode(["error" => "Archivo PHP no encontrado en: " . $apiPath]);
    return true;
}

// 2. Si se entra a la raíz, mostramos el index principal
if ($uri === '/' || $uri === '/index.html') {
    require_once __DIR__ . '/public/index.html';
    return true;
}

// 3. Servir archivos estáticos (CSS, JS, imágenes, HTML) desde la carpeta public/
$publicPath = __DIR__ . '/public' . $uri;

// Por si el navegador pide directamente algo con /public/ en la URL
if (strpos($uri, '/public/') === 0) {
    $publicPath = __DIR__ . $uri;
}

if (file_exists($publicPath) && is_file($publicPath)) {
    $ext = pathinfo($publicPath, PATHINFO_EXTENSION);
    $mimeTypes = ['css' => 'text/css', 'js' => 'application/javascript', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'svg' => 'image/svg+xml', 'html' => 'text/html'];
    if (array_key_exists($ext, $mimeTypes)) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($publicPath);
    return true;
}

return false;