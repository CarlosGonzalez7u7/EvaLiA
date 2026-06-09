-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: evalia
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '50d17b74-b469-11f0-b954-14cb196a05bb:1-2961';

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id_actividad` int NOT NULL AUTO_INCREMENT,
  `id_rubrica` int NOT NULL,
  `id_periodo` int NOT NULL,
  `nombre_actividad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `enlace` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_entrega` date NOT NULL,
  PRIMARY KEY (`id_actividad`),
  KEY `id_rubrica` (`id_rubrica`),
  KEY `idx_actividades_periodo_rubrica` (`id_periodo`,`id_rubrica`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`id_rubrica`) REFERENCES `rubricas` (`id_rubrica`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `actividades_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES (1,4,4,'Subir avances Word - Interfaz Btn','<p>?&nbsp;<strong>Dise&ntilde;o visual de tu Botonera</strong><br><br>usando .</p>\n<ul>\n<li>Simula que es la pantalla de un celular.</li>\n<li>Usa colores de relleno y ajusta el tama&ntilde;o como si fuera un tel&eacute;fono.</li>\n<li>Barra superior del celular, donde van los&nbsp;&iacute;conos de bater&iacute;a, se&ntilde;al, WiFi o la hora.</li>\n<li>Fondo personalizado con&nbsp;colores llamativos o im&aacute;genes de fondo.</li>\n</ul>\n<p>en tu dise&ntilde;o.</p>\n<ul>\n<li>Cada bot&oacute;n debe tener:</li>\n<li>Una imagen(ejemplo: Un caballo, moto, etc.)</li>\n<li>El sonido que tendra (ejemplo: &ldquo;ruido de caballo&rdquo;, &ldquo;sonido de moto Yamaha R6&rdquo;).</li>\n</ul>\n<p><strong>Abajo del dise&ntilde;o crea una tabla y escribe una breve descripci&oacute;n de lo que hace cada bot&oacute;n.</strong></p>\n<ul>\n<li><strong>Ejemplo:</strong></li>\n<li>| Bot&oacute;n 1: | Sonido de caballo |</li>\n<li>| Bot&oacute;n 2: | Moto Yamaha R6 |&nbsp;</li>\n</ul>\n<p><strong>Dise&ntilde;os Sugeridos</strong></p>\n<ul>\n<li>Decoraci&oacute;n de los botones: bordes redondeados, sombras o &iacute;conos peque&ntilde;os (? ? ?).</li>\n<li>Nombre de la aplicaci&oacute;n: un t&iacute;tulo creativo en la parte superior, como &ldquo;Mi Botonera&rdquo; o &ldquo;SoundApp&rdquo;.</li>\n<li>&Aacute;rea de descripci&oacute;n: un espacio tipo &ldquo;notas&rdquo; debajo de los botones.</li>\n<li>Bot&oacute;n extra de navegaci&oacute;n: como &ldquo;Inicio&rdquo; o &ldquo;Salir&rdquo;, para simular que la app es m&aacute;s completa.</li>\n</ul>\n<p>? Extra (opcional)<br><br><strong>Si quieres adelantar</strong>:</p>\n<ul>\n<li>Busca tutoriales de .</li>\n<li>Investiga c&oacute;mo correr una aplicaci&oacute;n de App Inventor en tu tel&eacute;fono .</li>\n</ul>\n<p><br>? Recuerda: lo importante es que tu dise&ntilde;o se vea como una , pero puedes darle tu propio estilo creativo.</p>\n<p><br><em><u>El sitio web que les dejo, es una ayuda para que puedan obtener im&aacute;genes o iconos sin problemas.</u></em></p>\n<p><em>https://www.flaticon.es/?authuser=0</em></p>','https://classroom.google.com/c/ODQ5ODU0NzEwNzkw/a/ODQ5ODY4MTg1MjA2/details','2026-03-04'),(2,1,4,'Exploración de App Inventor y Mini-Manual','<p><strong>Buenas Tardes.</strong><br><br>A partir de hoy, todo el trabajo de desarrollo de aplicaciones y uso de computadora&nbsp; ser&aacute; en&nbsp;<strong>equipos de dos personas,&nbsp;</strong>elijan correctamente a su pareja de equipo, trabajaran con el todo el curso.<br><br>Su tarea durante esta hora de clase es entrar por primera vez a nuestro entorno de programaci&oacute;n, perderle el miedo a la plataforma y documentar lo que encuentren. La regla principal de hoy es:&nbsp;<strong>p&iacute;quenle a todo y exploren sin miedo a equivocarse.</strong><br><br><strong>Paso 1: Ingreso a la plataforma</strong></p>\n<ul>\n<li>Entren a:&nbsp;<strong><u><a href=\"http://appinventor.mit.edu/\" target=\"_blank\" rel=\"noopener\">http://appinventor.mit.edu/</a></u></strong></li>\n<li>Hagan clic en el bot&oacute;n naranja superior&nbsp;<strong>\"Create Apps!\"</strong>.Inicien sesi&oacute;n con su cuenta de correo de Google y acepten los t&eacute;rminos si se los pide.</li>\n</ul>\n<p><br><strong>Paso 2: Exploraci&oacute;n Libre</strong></p>\n<ul>\n<li>Den clic en&nbsp;<strong>\"Comenzar un proyecto nuevo\"</strong>&nbsp;o (Start new project).&nbsp;</li>\n<li>P&oacute;nganle el nombre que quieran (recuerden: no acepta espacios, si ponen espacios usen guiones bajos).&nbsp;</li>\n</ul>\n<p>Ejemplo:&nbsp;<strong>Sonidos_Master_PRO</strong><br><br><strong>Jueguen con la interfaz:</strong>&nbsp;</p>\n<ul>\n<li>Arrastren elementos de la izquierda hacia la pantalla del celular en el centro.&nbsp;</li>\n<li>Cambien textos, modifiquen colores en la barra de la derecha.</li>\n<li>Descubran c&oacute;mo cambiar de la vista \"Dise&ntilde;ador\" a la vista de \"Bloques\" (arriba a la derecha).</li>\n</ul>\n<p><br><strong>Paso 3: Su Entregable (El Mini-Manual en Word)</strong>&nbsp;<br>Abran un documento de Word y elaboren un mini-manual explicando c&oacute;mo es la interfaz de App Inventor seg&uacute;n lo que descubrieron hoy.</p>\n<ul>\n<li><strong>Requisitos m&iacute;nimos de entrega:</strong></li>\n<li>Debe incluir una portada con el nombre de los dos integrantes del equipo.</li>\n<li>Debe tener&nbsp;<strong>al menos 5 capturas de pantalla</strong>&nbsp;de diferentes secciones o acciones de la plataforma.</li>\n<li>Debajo de cada captura, deben explicar brevemente con sus propias palabras qu&eacute; encontraron ah&iacute; (Ejemplo:&nbsp;<em>\"En esta barra descubrimos c&oacute;mo cambiarle el color de fondo a la pantalla\"</em>,&nbsp;<em>\"En esta otra pesta&ntilde;a vimos que se conectan los bloques l&oacute;gicos\"</em>).</li>\n</ul>\n<p><strong>Nota de la pr&oacute;xima clase:</strong>&nbsp;<br>El pr&oacute;ximo lunes yo les ayudar&eacute; paso a paso a construir la interfaz oficial de nuestra primera aplicaci&oacute;n. Sin embargo, si hoy quieren intentar armar y dise&ntilde;ar algo por su cuenta, &iexcl;adelante, es totalmente v&aacute;lido!<br>?&nbsp;<strong>&iquest;C&oacute;mo tomar capturas de pantalla en la computadora?</strong></p>\n<ul>\n<li><strong>La forma r&aacute;pida (Recorte):</strong>&nbsp;Presionen al mismo tiempo las teclas Windows + Shift + S. La pantalla se oscurecer&aacute; un poco; seleccionen con el mouse lo que quieren capturar, vayan a Word y presionen Ctrl + V para pegar.</li>\n<li><strong>La forma cl&aacute;sica:</strong>&nbsp;Busquen en su teclado la tecla ImpPnt o PrtScn (suele estar arriba de las flechas). Presi&oacute;nenla una vez, vayan a Word y presionen Ctrl + V para pegar toda la pantalla.</li>\n</ul>\n<p><em>(Solo es necesario que un integrante del equipo suba el documento de Word a esta tarea, pero aseg&uacute;rense de que vengan ambos nombres adentro en la portada).</em></p>','https://classroom.google.com/c/ODQ5ODU0NzEwNzkw/a/ODUwMDM0ODQ5ODQz/details','2026-03-05');
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id_alumno` int NOT NULL AUTO_INCREMENT,
  `id_grupo` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricula` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pin_acceso` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int DEFAULT '0',
  `qr_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `qr_token` (`qr_token`),
  KEY `idx_alumnos_grupo` (`id_grupo`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (2,1,'ALONSO NEGRON CAMILA','1_CAN','$2y$10$NfLuksMzDLIJWmX3CowJQ..ATQDMLc1OogwEvjBuiLFIqxurcCoOK','115553',0,'3e5cd29b9e8b6fa2e0665a8ceeea36d4'),(3,1,'ARELLANO GALINDO RICARDO ALBERTO','2_RAAG','$2y$10$XXxZ/kxBlu.Y4XR838JPfe6GU1hXCk5ISSUuSiCylMJEwkNA.phci','572392',0,'e0cf1236e102438350a16d4dbafa9cc6'),(4,1,'BEJAR PERFINO FATIMA SOFIA','3_BPFS','$2y$10$b5ZQfDQGiTd.Ni2p0G3ZTOZZxsfY.H7BocOVmF2mlK74dk.gKmJ/6','906353',0,'5cfdcd6e517f2db8f3f587bd7bf30158'),(5,1,'CABALLERO TORRES SEBASTIAN','4_STC','$2y$10$BTGLReh4CB3XbiGDtrIIHeWMyjIg/j52bLGKXaEH8QzH8t8itOwOK','458655',0,'736e4be2c1cb436a4f5bcd5106d9732d'),(6,3,'ALONSO ANGEL SOFIA','1_SofiaAA','$2y$10$rzaCoAk3VHclxx0pTW8qzOzxiHv3lthAdj6NDArbGsFCOhTMX90v2','337126',1,'1185ad6cd14a37e1bf45964e9736abfd'),(7,3,'CAZAREZ ALVAREZ SANTIAGO MICHEL','2_SantiagoMCA','$2y$10$gNB34Ta6WHoSsc489YLdqOJ9dW5zBHT8PuMFtea7yxvNnUv523/9G','297398',2,'260c43f3209637c4757e23c2d36ba793'),(8,3,'ROJAS BARRAGAN ZAYDA GARCIA','3_ZaydaGRB','$2y$10$TqaVKa9NOOT/yLF5YEWh9.JWlzxyM0DD/M2XZqLwDPFFHQ3et380.','768892',3,'c2b420f5beb0a0dab4ff470267451f10'),(9,3,'GUTIERREZ AGUILAR ITZEL GUADALUPE','4_ItzelGGA','$2y$10$A3k45FKiQ/Lz8Jdm6.CNI.6Ljq1mYcTtLeLswHtbqzmrlpJQp3Sqy','673282',4,'aa58d7e91a7f6248b95a337e3ce4551f'),(10,3,'JORGE NAVA JUAN PABLO','5_JuanPJN','$2y$10$nr6Fvc.NM9Y09hoN8sC1a.wIj3.WushojVfvRbzG5JWR44vdv7Tmm','371258',5,'9d7950b2ccc81e40b91a404e22b55d57'),(11,3,'OLIVARES ROMERO VICTOR DIEGO','6_VictorDOR','$2y$10$edQuZbCavlLwiVqQz4AYkO/Ru.UhO8MZTl0m5Vum0CFphXyveDYn.','445734',6,'b9e775ffeb396641e56bd1cd0a02be5b'),(12,3,'PALAFOX LOPEZ KAMILA','7_KamilaPL','$2y$10$ogjq/aD1wPtAMieUeBCmZO.Xq/yEFSeNPh31nibs8FEtVSO0a3RIq','257794',7,'acd3bf5f31139aa5bbe4a8bbb59233a0'),(13,3,'REYES VALDOVINOS CRISTIAN ALEXIS','8_AlexisCRV','$2y$10$jxNQq2mvg7BofsBCfKSLJuMkleAj9c27TKxfIUOZeSp.6QoRmyA3e','601526',8,'02fb57542dcc04c50449f8a9bdca960c'),(14,3,'SALINAS GUZMAN SURY RUBI','9_RubiSSG','$2y$10$DaPA2wL2pyftLRkGXQZgP.Kjoxf6OwXLciPzz0nDN8Hn2Azg1WdUG','905027',9,'e3ea7c784fd51f475d1e81902c264df4'),(15,2,'ARZATE MENDOZA ISAAC','1_IsaacAM','$2y$10$1LpmJSNZAUQRTk0KBEtW/OSey/ds5Owfz07L8.TOmMaOXTJdL3xey','446869',0,'963bc8529d52dbb26ef297f330bac731'),(16,2,'BERBER ROSAS CESAR ARTURO','2_CesarABR','$2y$10$0t6LyZVChmNGb9xtInfg7Ocl44du6XWR/w9V7B8dkhvyqPq6hGaym','577196',0,'2963f63e9e1f37ae5488953130ceaeed'),(17,2,'ESPINO GARNICA BRENDA PAOLA','3_BrendaPEG','$2y$10$jaSsBvFvyuIaKXWxpqMjku52cJrlI3Z2BJjctej96LmAD.Vz54E.6','997556',0,'cf24b3e2919bdb3897b7ca227db477bf'),(18,2,'KAROL JANET GARCIA PIZA','4_KarolJGP','$2y$10$ojfy7RbB.qwXZEMMhDRoCeB.KusaqzJ9NzjXYZ/EEItJGylBUI9F2','294206',0,'b435cc62b9f30bf1ba90393f50af6a4d'),(19,2,'GARCIA SIERRA VALERIA','5_ValeriaGS','$2y$10$dH7ApJKQgcfXFmtBIFIPjuJpiVR9UFDGPvhFXZoTQwrpNkKIhjAbm','704307',0,'80ce972c9c55a264b78a8b2c703224d7'),(20,2,'LLAMAS ALCANTARA IKER SANTIAGO','6_IkerSLLA','$2y$10$z.XfsMFdpftBsdVj6TnjReey05A76xf9ExUJM6UC5iIno7G.z1z6e','747669',0,'25daa42858f62c19a0c2d4b747388008'),(21,2,'OROZCO GALVAN DIEGO','7_DiegoOG','$2y$10$VA2jBSEl.Agu.pKTs36AyO58pAgzzx8df69ZywKFFaD4FQn3emSDK','396079',0,'f4edf1abab76ae70f467dfc5334bf6cb'),(22,2,'PINEDA DORANTES IVAN','8_IvanPD','$2y$10$hk3ndqq5jtCJJ54rb95Mvu2yJ1lP/bnM9VD3T5LLEx3np/524YZty','356228',0,'cb8e5650662dd7c5f2f4ac25f40b5cfc'),(23,2,'PLASCENCIA GARCIA PABLO FARID','9_PabloFPG','$2y$10$jBcx7r5hcsRTeZnFo1XPd.da1Mizqzq4zjJII3Jtj355Q7b3usVAW','825765',0,'dbe14f363a64a047f4210955c7e34861'),(24,2,'RODRIGUEZ OCHOA NATALIA','10_NataliaRO','$2y$10$lwqJrWoiX4t9srV.udHXru5sxrBLqv/2WggB/UBwj/SbB1PX9efKi','240469',0,'0841aace78be2d990c1d66a009417ebc'),(25,2,'VENEGAS GARCIA TERESA YARENI','11_TeresaYVG','$2y$10$60ZsBM59uf1Ognwa5Jb1.On5xqCagLeIXW.HtMHcvzSdXEKypEfkm','742897',0,'b39eb7ffff03b1a7390e0afbc8618984'),(26,2,'VERGARA AGUILAR NAJAIVI NICOLE','12_NajaiviNVA','$2y$10$N781SWzMXOrCVw27tinW3.4IfbPvT4J8UBIzUJlSGxlu6p0kUrLGS','373236',0,'40a9ee78c94d1b8fe280e980b55e8412'),(27,2,'PADILLA ARRIAGA VALERIA NICOLE','13_ValeriaNPA','$2y$10$EnTgkdfSShcx1R2/QDH57e5GkBLv0s0V3NWTHLrmwprXVV5W3TRZa','943224',0,'2eeaaf54d5aa7ddebb1fcc263966d624'),(28,2,'LIZETH MONSERRAT','14_LM','$2y$10$nG/WPG8ioQl1xhFY2uNhhOzBDZP69N/.iE.g8fRpkuV5l6sjqY4Zu','664066',0,'2b0721bb6db347d41711a1723cb04a00'),(29,2,'Moreno Duran Omar','14_OmarMD','$2y$10$y2b384dc2bxlw8luhrgTce/Qzj/eiew.dfcb7ls1PlswaiKDyt9HK','447973',0,'ccd2a75c2195eaf2616b127459b42641');
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('Asistencia','Falta','Retardo','Justificado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_asistencia`),
  KEY `idx_asistencias_alumno_fecha` (`id_alumno`,`fecha_hora`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (2,2,'2026-03-04 02:49:53','Asistencia',NULL),(3,3,'2026-03-04 02:49:53','Asistencia',NULL),(4,4,'2026-03-04 02:49:54','Asistencia',NULL),(5,5,'2026-03-04 02:49:55','Falta',NULL);
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones`
--

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id_calificacion` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int NOT NULL,
  `id_actividad` int NOT NULL,
  `puntaje` decimal(5,2) NOT NULL,
  `fecha_captura` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE KEY `unica_calificacion_alumno` (`id_alumno`,`id_actividad`),
  KEY `id_actividad` (`id_actividad`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones`
--

LOCK TABLES `calificaciones` WRITE;
/*!40000 ALTER TABLE `calificaciones` DISABLE KEYS */;
INSERT INTO `calificaciones` VALUES (1,2,2,0.00,'2026-06-08 07:50:29');
/*!40000 ALTER TABLE `calificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `id_maestro` int NOT NULL,
  `nombre_grupo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciclo_escolar` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_periodo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bimestre',
  `calificacion_minima` decimal(4,2) NOT NULL DEFAULT '6.00',
  `horario` text COLLATE utf8mb4_unicode_ci,
  `minutos_alarma` int DEFAULT '5',
  `sonido_alarma` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `nivel_educativo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Secundaria',
  `modo_calificacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Promedio',
  `tipo_rubrica` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Global',
  `color_grupo` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#8b5cf6',
  `icono_grupo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'fas fa-users',
  `tolerancia_minutos` int DEFAULT '15',
  PRIMARY KEY (`id_grupo`),
  KEY `idx_grupos_maestro` (`id_maestro`),
  CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_maestro`) REFERENCES `usuarios` (`id_maestro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,1,'3ro','2026','Semestre',6.00,'[]',5,'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',1,'Secundaria','Promedio','Global','#076e0e','fas fa-laptop-code',15),(2,1,'2do','2026','Semestre',6.00,'[{\"dia\":\"Lunes\",\"inicio\":\"09:25\",\"fin\":\"10:15\"},{\"dia\":\"Miercoles\",\"inicio\":\"12:20\",\"fin\":\"13:05\"},{\"dia\":\"Viernes\",\"inicio\":\"13:05\",\"fin\":\"13:55\"}]',5,'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',1,'Secundaria','Promedio','Global','#8b5cf6','fas fa-book',15),(3,1,'1ro','2026','Semestre',6.00,'[]',5,'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',1,'Secundaria','Promedio','Global','#fa3200','fas fa-palette',15);
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos`
--

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos` (
  `id_periodo` int NOT NULL AUTO_INCREMENT,
  `id_grupo` int NOT NULL,
  `nombre_periodo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_periodo`),
  KEY `idx_periodos_grupo` (`id_grupo`),
  CONSTRAINT `periodos_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos`
--

LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES (4,1,'Semestre 1',NULL,NULL,1),(5,1,'Semestre 2',NULL,NULL,0),(6,2,'Semestre 1',NULL,NULL,1),(7,2,'Semestre 2',NULL,NULL,0),(8,3,'Semestre 1',NULL,NULL,1),(9,3,'Semestre 2',NULL,NULL,0);
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rubricas`
--

DROP TABLE IF EXISTS `rubricas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rubricas` (
  `id_rubrica` int NOT NULL AUTO_INCREMENT,
  `id_grupo` int NOT NULL,
  `id_periodo` int DEFAULT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#8b5cf6',
  PRIMARY KEY (`id_rubrica`),
  KEY `idx_rubricas_grupo` (`id_grupo`),
  KEY `fk_rub_per` (`id_periodo`),
  CONSTRAINT `fk_rub_per` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rubricas_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rubricas`
--

LOCK TABLES `rubricas` WRITE;
/*!40000 ALTER TABLE `rubricas` DISABLE KEYS */;
INSERT INTO `rubricas` VALUES (1,1,NULL,'Actividades Virtuales',40.00,'#8b5cf6'),(3,1,NULL,'Evaluación',30.00,'#8b5cf6'),(4,1,NULL,'Tareas y Prácticas',20.00,'#8b5cf6'),(5,1,NULL,'Asistencias',10.00,'#8b5cf6'),(6,3,NULL,'Tareas y Practicas',20.00,'#079de9'),(7,3,NULL,'Actividades Virtuales',30.00,'#ff0000'),(8,3,NULL,'Proyecto',40.00,'#ffbb00'),(9,3,NULL,'Asistencias',10.00,'#04ff00');
/*!40000 ALTER TABLE `rubricas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_maestro` int NOT NULL AUTO_INCREMENT,
  `firebase_uid` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_maestro`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'enQzEfZeX6UFTu7Hk0cT8Ec9UWL2','Juan Carlos Gonzalez O. (Prof. Carlos Gonzalez)','juanchitooelmejor@gmail.com','2026-06-08 05:27:00');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08 20:46:58
