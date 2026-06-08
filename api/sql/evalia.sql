-- 1. Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS EvaLiA CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE EvaLiA;

-- 2. Tabla de Usuarios (Profesores)
CREATE TABLE usuarios (
    id_maestro INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Grupos
-- Incluye la configuración del tipo de periodo y la nota mínima aprobatoria
CREATE TABLE grupos (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    id_maestro INT NOT NULL,
    nombre_grupo VARCHAR(50) NOT NULL, 
    ciclo_escolar VARCHAR(20) NOT NULL, 
    nivel_educativo VARCHAR(50) NOT NULL DEFAULT 'Secundaria',
    tipo_periodo VARCHAR(50) NOT NULL DEFAULT 'Bimestre',
    modo_calificacion VARCHAR(50) NOT NULL DEFAULT 'Promedio',
    calificacion_minima DECIMAL(4,2) NOT NULL DEFAULT 6.00, -- Configurable por el maestro
    dias_clase VARCHAR(100) DEFAULT 'Lunes,Martes,Miercoles,Jueves,Viernes',
    hora_inicio TIME DEFAULT '08:00:00',
    hora_fin TIME DEFAULT '09:00:00',
    tolerancia_minutos INT DEFAULT 15,
    activo BOOLEAN NOT NULL DEFAULT TRUE, -- Para ocultar o mostrar grupos en el panel
    FOREIGN KEY (id_maestro) REFERENCES usuarios(id_maestro) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Periodos Académicos
-- Almacena los bloques específicos (ej. "Primer Bimestre", "Segundo Bimestre") según el grupo
CREATE TABLE periodos (
    id_periodo INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    nombre_periodo VARCHAR(50) NOT NULL, -- Ej. "Bloque 1", "Bimestre I"
    activo BOOLEAN NOT NULL DEFAULT TRUE, -- Para determinar qué periodo se está evaluando actualmente
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Alumnos
-- Ahora incluye campos de credenciales para su propio inicio de sesión seguro
CREATE TABLE alumnos (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE, -- Se usará como su NOMBRE DE USUARIO para el login
    password_hash VARCHAR(255) NOT NULL,  -- El PIN o contraseña autogenerada y cifrada con password_hash() de PHP
    pin_acceso VARCHAR(10),
    qr_token VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla de Rúbricas de Evaluación
CREATE TABLE rubricas (
    id_rubrica INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    categoria VARCHAR(50) NOT NULL, 
    porcentaje DECIMAL(5,2) NOT NULL, 
    color VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Tabla de Actividades
-- Vinculada tanto a la rúbrica como al periodo específico para poder segmentar las notas
CREATE TABLE actividades (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    id_rubrica INT NOT NULL,
    id_periodo INT NOT NULL,
    nombre_actividad VARCHAR(100) NOT NULL, 
    descripcion TEXT NULL,                  
    enlace VARCHAR(255) NULL,
    fecha_entrega DATE NOT NULL,
    FOREIGN KEY (id_rubrica) REFERENCES rubricas(id_rubrica) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_periodo) REFERENCES periodos(id_periodo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Tabla de Calificaciones
CREATE TABLE calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_actividad INT NOT NULL,
    puntaje DECIMAL(5,2) NOT NULL, 
    fecha_captura TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unica_calificacion_alumno (id_alumno, id_actividad)
) ENGINE=InnoDB;

-- 9. Tabla de Asistencias
CREATE TABLE asistencias (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    fecha_hora DATETIME NOT NULL, 
    estado ENUM('Asistencia', 'Falta', 'Retardo', 'Justificado') NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Índices de optimización para consultas rápidas en tiempo real
CREATE INDEX idx_grupos_maestro ON grupos(id_maestro);
CREATE INDEX idx_periodos_grupo ON periodos(id_grupo);
CREATE INDEX idx_alumnos_grupo ON alumnos(id_grupo);
CREATE INDEX idx_rubricas_grupo ON rubricas(id_grupo);
CREATE INDEX idx_actividades_periodo_rubrica ON actividades(id_periodo, id_rubrica);
CREATE INDEX idx_asistencias_alumno_fecha ON asistencias(id_alumno, fecha_hora);