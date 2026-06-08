<?php
// backend/config/database.php

class Database {
    private $pdo;

    public function connect() {
        if ($this->pdo === null) {

            $envPath = __DIR__ . '/../../.env';
            
            if (!file_exists($envPath)) {
                die("Error: Archivo de configuración no encontrado.");
            }

            // Leemos el .env manualmente para evitar problemas con # y el formato de la llave de Firebase
            $envData = [];
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue; // Ignorar los comentarios
                list($name, $value) = explode('=', $line, 2);
                $envData[trim($name)] = trim($value, " \t\n\r\0\x0B\"");
            }

            $host = $envData['DB_HOST'];
            $db   = $envData['DB_NAME'];
            $user = $envData['DB_USER'];
            $pass = $envData['DB_PASS'];
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                $this->pdo = new PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                // En producción, nunca imprimas el $e->getMessage() para no revelar datos
                die("Error de conexión a la base de datos.");
            }
        }
        return $this->pdo;
    }
}