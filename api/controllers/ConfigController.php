<?php
header('Content-Type: application/json');

$envPath = __DIR__ . '/../../.env';
$envData = [];

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue; // Ignorar comentarios
        list($name, $value) = explode('=', $line, 2);
        if (isset($name) && isset($value)) {
            $envData[trim($name)] = trim($value, " \t\n\r\0\x0B\"");
        }
    }
}

echo json_encode([
    "success" => true,
    "tinymce_key" => $envData['TINYMCE_API_KEY'] ?? 'no-api-key'
]);