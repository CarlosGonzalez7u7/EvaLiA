-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 09-06-2026 a las 14:07:59
-- Versión del servidor: 11.8.6-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u160168264_michusalud`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades`
--

CREATE TABLE `actividades` (
  `id_actividad` int(11) NOT NULL,
  `id_rubrica` int(11) NOT NULL,
  `id_periodo` int(11) NOT NULL,
  `nombre_actividad` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `enlace` varchar(255) DEFAULT NULL,
  `fecha_entrega` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `actividades`
--

INSERT INTO `actividades` (`id_actividad`, `id_rubrica`, `id_periodo`, `nombre_actividad`, `descripcion`, `enlace`, `fecha_entrega`) VALUES
(1, 4, 4, 'Subir avances Word - Interfaz Btn', '<p>?&nbsp;<strong>Dise&ntilde;o visual de tu Botonera</strong><br><br>usando .</p>\n<ul>\n<li>Simula que es la pantalla de un celular.</li>\n<li>Usa colores de relleno y ajusta el tama&ntilde;o como si fuera un tel&eacute;fono.</li>\n<li>Barra superior del celular, donde van los&nbsp;&iacute;conos de bater&iacute;a, se&ntilde;al, WiFi o la hora.</li>\n<li>Fondo personalizado con&nbsp;colores llamativos o im&aacute;genes de fondo.</li>\n</ul>\n<p>en tu dise&ntilde;o.</p>\n<ul>\n<li>Cada bot&oacute;n debe tener:</li>\n<li>Una imagen(ejemplo: Un caballo, moto, etc.)</li>\n<li>El sonido que tendra (ejemplo: &ldquo;ruido de caballo&rdquo;, &ldquo;sonido de moto Yamaha R6&rdquo;).</li>\n</ul>\n<p><strong>Abajo del dise&ntilde;o crea una tabla y escribe una breve descripci&oacute;n de lo que hace cada bot&oacute;n.</strong></p>\n<ul>\n<li><strong>Ejemplo:</strong></li>\n<li>| Bot&oacute;n 1: | Sonido de caballo |</li>\n<li>| Bot&oacute;n 2: | Moto Yamaha R6 |&nbsp;</li>\n</ul>\n<p><strong>Dise&ntilde;os Sugeridos</strong></p>\n<ul>\n<li>Decoraci&oacute;n de los botones: bordes redondeados, sombras o &iacute;conos peque&ntilde;os (? ? ?).</li>\n<li>Nombre de la aplicaci&oacute;n: un t&iacute;tulo creativo en la parte superior, como &ldquo;Mi Botonera&rdquo; o &ldquo;SoundApp&rdquo;.</li>\n<li>&Aacute;rea de descripci&oacute;n: un espacio tipo &ldquo;notas&rdquo; debajo de los botones.</li>\n<li>Bot&oacute;n extra de navegaci&oacute;n: como &ldquo;Inicio&rdquo; o &ldquo;Salir&rdquo;, para simular que la app es m&aacute;s completa.</li>\n</ul>\n<p>? Extra (opcional)<br><br><strong>Si quieres adelantar</strong>:</p>\n<ul>\n<li>Busca tutoriales de .</li>\n<li>Investiga c&oacute;mo correr una aplicaci&oacute;n de App Inventor en tu tel&eacute;fono .</li>\n</ul>\n<p><br>? Recuerda: lo importante es que tu dise&ntilde;o se vea como una , pero puedes darle tu propio estilo creativo.</p>\n<p><br><em><u>El sitio web que les dejo, es una ayuda para que puedan obtener im&aacute;genes o iconos sin problemas.</u></em></p>\n<p><em>https://www.flaticon.es/?authuser=0</em></p>', 'https://classroom.google.com/c/ODQ5ODU0NzEwNzkw/a/ODQ5ODY4MTg1MjA2/details', '2026-03-04'),
(2, 1, 4, 'Exploración de App Inventor y Mini-Manual', '<p><strong>Buenas Tardes.</strong><br><br>A partir de hoy, todo el trabajo de desarrollo de aplicaciones y uso de computadora&nbsp; ser&aacute; en&nbsp;<strong>equipos de dos personas,&nbsp;</strong>elijan correctamente a su pareja de equipo, trabajaran con el todo el curso.<br><br>Su tarea durante esta hora de clase es entrar por primera vez a nuestro entorno de programaci&oacute;n, perderle el miedo a la plataforma y documentar lo que encuentren. La regla principal de hoy es:&nbsp;<strong>p&iacute;quenle a todo y exploren sin miedo a equivocarse.</strong><br><br><strong>Paso 1: Ingreso a la plataforma</strong></p>\n<ul>\n<li>Entren a:&nbsp;<strong><u><a href=\"http://appinventor.mit.edu/\" target=\"_blank\" rel=\"noopener\">http://appinventor.mit.edu/</a></u></strong></li>\n<li>Hagan clic en el bot&oacute;n naranja superior&nbsp;<strong>\"Create Apps!\"</strong>.Inicien sesi&oacute;n con su cuenta de correo de Google y acepten los t&eacute;rminos si se los pide.</li>\n</ul>\n<p><br><strong>Paso 2: Exploraci&oacute;n Libre</strong></p>\n<ul>\n<li>Den clic en&nbsp;<strong>\"Comenzar un proyecto nuevo\"</strong>&nbsp;o (Start new project).&nbsp;</li>\n<li>P&oacute;nganle el nombre que quieran (recuerden: no acepta espacios, si ponen espacios usen guiones bajos).&nbsp;</li>\n</ul>\n<p>Ejemplo:&nbsp;<strong>Sonidos_Master_PRO</strong><br><br><strong>Jueguen con la interfaz:</strong>&nbsp;</p>\n<ul>\n<li>Arrastren elementos de la izquierda hacia la pantalla del celular en el centro.&nbsp;</li>\n<li>Cambien textos, modifiquen colores en la barra de la derecha.</li>\n<li>Descubran c&oacute;mo cambiar de la vista \"Dise&ntilde;ador\" a la vista de \"Bloques\" (arriba a la derecha).</li>\n</ul>\n<p><br><strong>Paso 3: Su Entregable (El Mini-Manual en Word)</strong>&nbsp;<br>Abran un documento de Word y elaboren un mini-manual explicando c&oacute;mo es la interfaz de App Inventor seg&uacute;n lo que descubrieron hoy.</p>\n<ul>\n<li><strong>Requisitos m&iacute;nimos de entrega:</strong></li>\n<li>Debe incluir una portada con el nombre de los dos integrantes del equipo.</li>\n<li>Debe tener&nbsp;<strong>al menos 5 capturas de pantalla</strong>&nbsp;de diferentes secciones o acciones de la plataforma.</li>\n<li>Debajo de cada captura, deben explicar brevemente con sus propias palabras qu&eacute; encontraron ah&iacute; (Ejemplo:&nbsp;<em>\"En esta barra descubrimos c&oacute;mo cambiarle el color de fondo a la pantalla\"</em>,&nbsp;<em>\"En esta otra pesta&ntilde;a vimos que se conectan los bloques l&oacute;gicos\"</em>).</li>\n</ul>\n<p><strong>Nota de la pr&oacute;xima clase:</strong>&nbsp;<br>El pr&oacute;ximo lunes yo les ayudar&eacute; paso a paso a construir la interfaz oficial de nuestra primera aplicaci&oacute;n. Sin embargo, si hoy quieren intentar armar y dise&ntilde;ar algo por su cuenta, &iexcl;adelante, es totalmente v&aacute;lido!<br>?&nbsp;<strong>&iquest;C&oacute;mo tomar capturas de pantalla en la computadora?</strong></p>\n<ul>\n<li><strong>La forma r&aacute;pida (Recorte):</strong>&nbsp;Presionen al mismo tiempo las teclas Windows + Shift + S. La pantalla se oscurecer&aacute; un poco; seleccionen con el mouse lo que quieren capturar, vayan a Word y presionen Ctrl + V para pegar.</li>\n<li><strong>La forma cl&aacute;sica:</strong>&nbsp;Busquen en su teclado la tecla ImpPnt o PrtScn (suele estar arriba de las flechas). Presi&oacute;nenla una vez, vayan a Word y presionen Ctrl + V para pegar toda la pantalla.</li>\n</ul>\n<p><em>(Solo es necesario que un integrante del equipo suba el documento de Word a esta tarea, pero aseg&uacute;rense de que vengan ambos nombres adentro en la portada).</em></p>', 'https://classroom.google.com/c/ODQ5ODU0NzEwNzkw/a/ODUwMDM0ODQ5ODQz/details', '2026-03-05'),
(3, 7, 8, 'Modificar y Arreglar Documento con Atajos de Teclado.', '<p><strong>Misi&oacute;n Final: Acuerdo de Confidencialidad (Operaci&oacute;n F&eacute;nix)</strong>&nbsp;<br>Han entrado al Sistema de Validaci&oacute;n. Su prueba final consiste en ordenar un documento legal estricto. Si hacen trampa, el sistema borrar&aacute; su progreso. Si usan el mouse o intentan copiar formato externo, ser&aacute;n penalizados.<br><br>Deber&aacute;n entrar a la&nbsp;<strong>URL</strong>&nbsp;que les dejo aqu&iacute; abajito de esta actividad en Computadora no tel&eacute;fono:<br><strong><a href=\"https://carlosgonzalez7u7.github.io/Clases1ro/1_AtajosWord/validador.html\" target=\"_blank\" rel=\"noopener\">https://carlosgonzalez7u7.github.io/Clases1ro/1_AtajosWord/validador.html</a></strong><br><br>Nota: Cuando entres a la pagina , Recuerda poner la pantalla completa con las teclas&nbsp;<strong>FN + F11&nbsp;</strong>o<strong>&nbsp;</strong>solo<strong>&nbsp;</strong>la tecla<strong>&nbsp;F11&nbsp;</strong>de tu teclado para ponerlo en pantalla completa, para que el navegador (<strong>Google</strong>) no te interrumpa en este reto.<br><br><strong>Su Misi&oacute;n:<br>1. Seleccionar&nbsp;</strong>TODO el texto &nbsp;y luego&nbsp;<strong>Justif&iacute;calo</strong>.<br><strong>2.</strong>&nbsp;El t&iacute;tulo&nbsp;<strong>\"ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACI&Oacute;N\"</strong>&nbsp;debe estar&nbsp;<strong>Centrado</strong>&nbsp;, en&nbsp;<strong>Negrita y&nbsp;</strong>todo<strong>&nbsp;May&uacute;sculas</strong>.<br><strong>3. Corta</strong>&nbsp;la fecha que dice<strong>&nbsp;Fecha:&nbsp;24/Feb/2026&nbsp;</strong>y&nbsp;<strong>P&eacute;gala&nbsp;</strong>en la parte de arriba alineada a la Derecha abajo del Titulo.<br><strong>3.</strong>&nbsp;El nombre de la&nbsp;<strong>\"operaci&oacute;n f&eacute;nix\"</strong>&nbsp;debe estar en&nbsp;<strong>Cursiva&nbsp;</strong>y&nbsp;<strong>Subrayado</strong>.<br><strong>4.</strong>&nbsp;La l&iacute;nea que dice&nbsp;<strong>\"Firma del Agente: ___________\"</strong>&nbsp;debe estar&nbsp;<strong>Centrada&nbsp;</strong>la l&iacute;nea arriba y abajo&nbsp;<strong>Firma del Agente</strong>.<br><strong>5.</strong>&nbsp;Al terminar, presiona la tecla&nbsp;<strong>TAB&nbsp;</strong>hasta llegar al bot&oacute;n de evaluar y presiona&nbsp;<strong>Enter</strong>.&nbsp;<br><br><strong>El documento deber&aacute; quedar como el que les adjunto aqu&iacute; mismo.</strong><br><br>Si apruebas, el sistema generar&aacute; tu Certificado Oficial con Folio &uacute;nico, fecha, hora y tu nombre junto a tu resultado con el documento final que corregiste, por lo cual evita pedir o intentar falsificar este documento el sistema lo detectar&aacute;.&nbsp;Gu&aacute;rdalo como PDF y s&uacute;belo aqu&iacute;, con tu nombre y CertificadoAprobado.<br><br>Ejemplo guardado nombre Archivo:<br>JuanCarlosGonzalezO_CertificadoAprobado.pdf</p>', 'https://classroom.google.com/c/ODQ1ODEzODE0Mjk4/a/NzkzOTUyNDkwNTE0/details', '2026-03-04'),
(4, 13, 8, 'Examen Realizado en Quizizz', '', 'https://wayground.com/join/quiz/699560170766e8980d563926/start?studentShare=true', '2026-03-11'),
(5, 12, 8, 'Modificar y Arreglar Documento con Atajos de Teclado', '<p><strong>Misi&oacute;n Final: Acuerdo de Confidencialidad (Operaci&oacute;n F&eacute;nix)</strong>&nbsp;<br>Han entrado al Sistema de Validaci&oacute;n. Su prueba final consiste en ordenar un documento legal estricto. Si hacen trampa, el sistema borrar&aacute; su progreso. Si usan el mouse o intentan copiar formato externo, ser&aacute;n penalizados.<br><br>Deber&aacute;n entrar a la&nbsp;<strong>URL</strong>&nbsp;que les dejo aqu&iacute; abajito de esta actividad en Computadora no tel&eacute;fono:<br><strong><a href=\"https://carlosgonzalez7u7.github.io/Clases1ro/1_AtajosWord/validador.html\" target=\"_blank\" rel=\"noopener\">https://carlosgonzalez7u7.github.io/Clases1ro/1_AtajosWord/validador.html</a></strong><br><br>Nota: Cuando entres a la pagina , Recuerda poner la pantalla completa con las teclas&nbsp;<strong>FN + F11&nbsp;</strong>o<strong>&nbsp;</strong>solo<strong>&nbsp;</strong>la tecla<strong>&nbsp;F11&nbsp;</strong>de tu teclado para ponerlo en pantalla completa, para que el navegador (<strong>Google</strong>) no te interrumpa en este reto.<br><br><strong>Su Misi&oacute;n:<br>1. Seleccionar&nbsp;</strong>TODO el texto &nbsp;y luego&nbsp;<strong>Justif&iacute;calo</strong>.<br><strong>2.</strong>&nbsp;El t&iacute;tulo&nbsp;<strong>\"ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACI&Oacute;N\"</strong>&nbsp;debe estar&nbsp;<strong>Centrado</strong>&nbsp;, en&nbsp;<strong>Negrita y&nbsp;</strong>todo<strong>&nbsp;May&uacute;sculas</strong>.<br><strong>3. Corta</strong>&nbsp;la fecha que dice<strong>&nbsp;Fecha:&nbsp;24/Feb/2026&nbsp;</strong>y&nbsp;<strong>P&eacute;gala&nbsp;</strong>en la parte de arriba alineada a la Derecha abajo del Titulo.<br><strong>3.</strong>&nbsp;El nombre de la&nbsp;<strong>\"operaci&oacute;n f&eacute;nix\"</strong>&nbsp;debe estar en&nbsp;<strong>Cursiva&nbsp;</strong>y&nbsp;<strong>Subrayado</strong>.<br><strong>4.</strong>&nbsp;La l&iacute;nea que dice&nbsp;<strong>\"Firma del Agente: ___________\"</strong>&nbsp;debe estar&nbsp;<strong>Centrada&nbsp;</strong>la l&iacute;nea arriba y abajo&nbsp;<strong>Firma del Agente</strong>.<br><strong>5.</strong>&nbsp;Al terminar, presiona la tecla&nbsp;<strong>TAB&nbsp;</strong>hasta llegar al bot&oacute;n de evaluar y presiona&nbsp;<strong>Enter</strong>.&nbsp;<br><br><strong>El documento deber&aacute; quedar como el que les adjunto aqu&iacute; mismo.</strong><br><br>Si apruebas, el sistema generar&aacute; tu Certificado Oficial con Folio &uacute;nico, fecha, hora y tu nombre junto a tu resultado con el documento final que corregiste, por lo cual evita pedir o intentar falsificar este documento el sistema lo detectar&aacute;.&nbsp;Gu&aacute;rdalo como PDF y s&uacute;belo aqu&iacute;, con tu nombre y CertificadoAprobado.<br><br>Ejemplo guardado nombre Archivo:<br>JuanCarlosGonzalezO_CertificadoAprobado.pdf</p>', 'https://classroom.google.com/c/ODQ1ODEzODE0Mjk4/a/NzkzOTUyNDkwNTE0/details', '2026-03-04'),
(6, 12, 8, 'Investigación en Word', '<p>Deber&aacute;n hacer un trabajo en&nbsp;<strong>Word</strong>&nbsp;sobre&nbsp;<strong>los elementos de una computadora</strong>&nbsp;(como el monitor, el teclado, el mouse, la torre o CPU, etc.). Como apenas est&aacute;n aprendiendo a usar Word, les voy a explicar todo paso a paso, muy sencillo. No se preocupen si algo no sale perfecto, &iexcl;lo importante es intentarlo!<br><br><strong>&iquest;Qu&eacute; deben hacer?</strong><br><br>1.&nbsp;<strong>Abrir Word</strong>&nbsp;y crear un documento nuevo.<br><br>2.&nbsp;<strong>Hacer una portada bonita (la primera p&aacute;gina):</strong><br>&nbsp; &nbsp;- Escribe en grande:&nbsp;<strong>Elementos de una Computadora</strong><br>&nbsp; &nbsp;- Debajo escribe tu&nbsp;<strong>nombre completo</strong>, tu&nbsp;<strong>grado</strong>&nbsp;(1&deg;) y la&nbsp;<strong>fecha</strong>&nbsp;(por ejemplo: 10 de marzo de 2026).<br>&nbsp; &nbsp;- Centra todo el texto (usa el atajo para \"centrar\".<br>&nbsp; &nbsp;- Pon letras grandes (tama&ntilde;o 24 o 28) y coloridas si quieren.<br>&nbsp; &nbsp;- Agrega una imagen: Ve a la pesta&ntilde;a&nbsp;<strong>Insertar</strong>&nbsp;&rarr;&nbsp;<strong>Im&aacute;genes</strong>&nbsp;&rarr; busca en tu computadora o en Internet una foto de una computadora o partes de ella. Ponla grande en la portada. &iexcl;Quedar&aacute; muy bonito!<br><br>3.&nbsp;<strong>Hacer el &iacute;ndice (la segunda p&aacute;gina):</strong><br>&nbsp; &nbsp;- El &iacute;ndice es como una lista que dice qu&eacute; hay en cada p&aacute;gina.<br>&nbsp; &nbsp;- Por ahora, pueden hacer uno sencillo a mano (porque el autom&aacute;tico es un poquito m&aacute;s avanzado). &nbsp;<br>&nbsp; &nbsp; &nbsp;Ejemplo:<br>&nbsp; &nbsp; &nbsp;- Introducci&oacute;n ................ p&aacute;gina 3<br>&nbsp; &nbsp; &nbsp;- El monitor ................ p&aacute;gina 4<br>&nbsp; &nbsp; &nbsp;- El teclado ................ p&aacute;gina 5<br>&nbsp; &nbsp; &nbsp;etc.<br>&nbsp; &nbsp;- Si quieren probar el autom&aacute;tico (opcional, &iexcl;es genial!):<br>&nbsp; &nbsp; &nbsp;- En cada parte del trabajo, pon los t&iacute;tulos como **T&iacute;tulo 1** (en la pesta&ntilde;a **Inicio**, en \"Estilos\", elige \"T&iacute;tulo 1\").<br>&nbsp; &nbsp; &nbsp;- Luego ve a **Referencias** &rarr; **Tabla de contenido** &rarr; elige uno autom&aacute;tico. &iexcl;Word lo hace solito!<br><br>4.&nbsp;<strong>El contenido (las p&aacute;ginas siguientes):</strong><br>&nbsp; &nbsp;- Escribe sobre 4&ndash;6 elementos importantes de la computadora. Por ejemplo:<br>&nbsp; &nbsp; &nbsp;- Monitor (qu&eacute; es y para qu&eacute; sirve)<br>&nbsp; &nbsp; &nbsp;- Teclado<br>&nbsp; &nbsp; &nbsp;- Mouse<br>&nbsp; &nbsp; &nbsp;- CPU o torre<br>&nbsp; &nbsp; &nbsp;- Impresora (opcional)<br>&nbsp; &nbsp; &nbsp;- Software (como Windows o juegos)<br>&nbsp; &nbsp;- En cada parte:<br>&nbsp; &nbsp; &nbsp;- Pon un t&iacute;tulo grande (ej. **El Monitor**).<br>&nbsp; &nbsp; &nbsp;- Escribe 3&ndash;5 oraciones explicando qu&eacute; es y para qu&eacute; sirve (pueden copiar ideas de libros o internet, pero escr&iacute;banlo con sus palabras).<br>&nbsp; &nbsp; &nbsp;- Agreguen **im&aacute;genes**: Ve a **Insertar** &rarr; **Im&aacute;genes**. Busca fotos claras y pon una al lado del texto. Haz clic derecho en la imagen &rarr; elige \"Ajustar texto\" &rarr; \"Cuadrado\" para que quede bonito al lado.<br>&nbsp; &nbsp;- Traten de que el trabajo tenga unas 4&ndash;6 p&aacute;ginas en total (incluyendo portada e &iacute;ndice).<br><br>5.&nbsp;<strong>Consejos f&aacute;ciles para que se vea lindo:</strong><br>&nbsp; &nbsp;- Usa letra **Arial** o **Calibri**, tama&ntilde;o 14 o 16 para el texto normal.<br>&nbsp; &nbsp;- Deja espacio entre l&iacute;neas (en **Inicio** &rarr; p&aacute;rrafo &rarr; interlineado 1.5).<br>&nbsp; &nbsp;- Pon colores en los t&iacute;tulos (selecciona el texto &rarr; elige color).<br>&nbsp; &nbsp;- Guarda el archivo con tu nombre: Ejemplo: \"Elementos_Computadora_Juan_Perez.docx\"<br><br>S&uacute;banlo aqu&iacute; en Classroom.<br><br>Si no saben c&oacute;mo hacer algo (como centrar, poner imagen o cambiar tama&ntilde;o), preg&uacute;ntenme en clase o en los comentarios.<br><br>Estoy seguro de que van a hacer trabajos muy bonitos.<br><br>Saludos, &nbsp;<br>Profesor Carlos 😊</p>', 'https://classroom.google.com/c/ODQ1ODEzODE0Mjk4/a/ODUwOTA1OTA5NzIx/details', '2026-03-10'),
(7, 15, 8, 'Avances Investigación en Word 2', '<p>Terminaron en clase el documento que se dejo en la clase virtual, por lo cual cuenta y es como trabajo en clase el termino de esta 2da parte.</p>', 'https://classroom.google.com/c/ODQ1ODEzODE0Mjk4/a/ODUwOTA1OTA5NzIx/details', '2026-03-11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id_alumno` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `matricula` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `pin_acceso` varchar(10) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `qr_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id_alumno`, `id_grupo`, `nombre`, `matricula`, `password_hash`, `pin_acceso`, `orden`, `qr_token`) VALUES
(2, 1, 'ALONSO NEGRON CAMILA', '1_CAN', '$2y$10$NfLuksMzDLIJWmX3CowJQ..ATQDMLc1OogwEvjBuiLFIqxurcCoOK', '115553', 0, '3e5cd29b9e8b6fa2e0665a8ceeea36d4'),
(3, 1, 'ARELLANO GALINDO RICARDO ALBERTO', '2_RAAG', '$2y$10$XXxZ/kxBlu.Y4XR838JPfe6GU1hXCk5ISSUuSiCylMJEwkNA.phci', '572392', 0, 'e0cf1236e102438350a16d4dbafa9cc6'),
(4, 1, 'BEJAR PERFINO FATIMA SOFIA', '3_BPFS', '$2y$10$b5ZQfDQGiTd.Ni2p0G3ZTOZZxsfY.H7BocOVmF2mlK74dk.gKmJ/6', '906353', 0, '5cfdcd6e517f2db8f3f587bd7bf30158'),
(5, 1, 'CABALLERO TORRES SEBASTIAN', '4_STC', '$2y$10$BTGLReh4CB3XbiGDtrIIHeWMyjIg/j52bLGKXaEH8QzH8t8itOwOK', '458655', 0, '736e4be2c1cb436a4f5bcd5106d9732d'),
(6, 3, 'ALONSO ANGEL SOFIA', '1_SofiaAA', '$2y$10$rzaCoAk3VHclxx0pTW8qzOzxiHv3lthAdj6NDArbGsFCOhTMX90v2', '337126', 1, '1185ad6cd14a37e1bf45964e9736abfd'),
(7, 3, 'CAZAREZ ALVAREZ SANTIAGO MICHEL', '2_SantiagoMCA', '$2y$10$gNB34Ta6WHoSsc489YLdqOJ9dW5zBHT8PuMFtea7yxvNnUv523/9G', '297398', 2, '260c43f3209637c4757e23c2d36ba793'),
(8, 3, 'ROJAS BARRAGAN ZAYDA GARCIA', '3_ZaydaGRB', '$2y$10$TqaVKa9NOOT/yLF5YEWh9.JWlzxyM0DD/M2XZqLwDPFFHQ3et380.', '768892', 3, 'c2b420f5beb0a0dab4ff470267451f10'),
(9, 3, 'GUTIERREZ AGUILAR ITZEL GUADALUPE', '4_ItzelGGA', '$2y$10$A3k45FKiQ/Lz8Jdm6.CNI.6Ljq1mYcTtLeLswHtbqzmrlpJQp3Sqy', '673282', 4, 'aa58d7e91a7f6248b95a337e3ce4551f'),
(10, 3, 'JORGE NAVA JUAN PABLO', '5_JuanPJN', '$2y$10$nr6Fvc.NM9Y09hoN8sC1a.wIj3.WushojVfvRbzG5JWR44vdv7Tmm', '371258', 5, '9d7950b2ccc81e40b91a404e22b55d57'),
(11, 3, 'OLIVARES ROMERO VICTOR DIEGO', '6_VictorDOR', '$2y$10$edQuZbCavlLwiVqQz4AYkO/Ru.UhO8MZTl0m5Vum0CFphXyveDYn.', '445734', 6, 'b9e775ffeb396641e56bd1cd0a02be5b'),
(12, 3, 'PALAFOX LOPEZ KAMILA', '7_KamilaPL', '$2y$10$ogjq/aD1wPtAMieUeBCmZO.Xq/yEFSeNPh31nibs8FEtVSO0a3RIq', '257794', 7, 'acd3bf5f31139aa5bbe4a8bbb59233a0'),
(13, 3, 'REYES VALDOVINOS CRISTIAN ALEXIS', '8_AlexisCRV', '$2y$10$jxNQq2mvg7BofsBCfKSLJuMkleAj9c27TKxfIUOZeSp.6QoRmyA3e', '601526', 8, '02fb57542dcc04c50449f8a9bdca960c'),
(14, 3, 'SALINAS GUZMAN SURY RUBI', '9_RubiSSG', '$2y$10$DaPA2wL2pyftLRkGXQZgP.Kjoxf6OwXLciPzz0nDN8Hn2Azg1WdUG', '905027', 9, 'e3ea7c784fd51f475d1e81902c264df4'),
(15, 2, 'ARZATE MENDOZA ISAAC', '1_IsaacAM', '$2y$10$1LpmJSNZAUQRTk0KBEtW/OSey/ds5Owfz07L8.TOmMaOXTJdL3xey', '446869', 0, '963bc8529d52dbb26ef297f330bac731'),
(16, 2, 'BERBER ROSAS CESAR ARTURO', '2_CesarABR', '$2y$10$0t6LyZVChmNGb9xtInfg7Ocl44du6XWR/w9V7B8dkhvyqPq6hGaym', '577196', 0, '2963f63e9e1f37ae5488953130ceaeed'),
(17, 2, 'ESPINO GARNICA BRENDA PAOLA', '3_BrendaPEG', '$2y$10$jaSsBvFvyuIaKXWxpqMjku52cJrlI3Z2BJjctej96LmAD.Vz54E.6', '997556', 0, 'cf24b3e2919bdb3897b7ca227db477bf'),
(18, 2, 'KAROL JANET GARCIA PIZA', '4_KarolJGP', '$2y$10$ojfy7RbB.qwXZEMMhDRoCeB.KusaqzJ9NzjXYZ/EEItJGylBUI9F2', '294206', 0, 'b435cc62b9f30bf1ba90393f50af6a4d'),
(19, 2, 'GARCIA SIERRA VALERIA', '5_ValeriaGS', '$2y$10$dH7ApJKQgcfXFmtBIFIPjuJpiVR9UFDGPvhFXZoTQwrpNkKIhjAbm', '704307', 0, '80ce972c9c55a264b78a8b2c703224d7'),
(20, 2, 'LLAMAS ALCANTARA IKER SANTIAGO', '6_IkerSLLA', '$2y$10$z.XfsMFdpftBsdVj6TnjReey05A76xf9ExUJM6UC5iIno7G.z1z6e', '747669', 0, '25daa42858f62c19a0c2d4b747388008'),
(21, 2, 'OROZCO GALVAN DIEGO', '7_DiegoOG', '$2y$10$VA2jBSEl.Agu.pKTs36AyO58pAgzzx8df69ZywKFFaD4FQn3emSDK', '396079', 0, 'f4edf1abab76ae70f467dfc5334bf6cb'),
(22, 2, 'PINEDA DORANTES IVAN', '8_IvanPD', '$2y$10$hk3ndqq5jtCJJ54rb95Mvu2yJ1lP/bnM9VD3T5LLEx3np/524YZty', '356228', 0, 'cb8e5650662dd7c5f2f4ac25f40b5cfc'),
(23, 2, 'PLASCENCIA GARCIA PABLO FARID', '9_PabloFPG', '$2y$10$jBcx7r5hcsRTeZnFo1XPd.da1Mizqzq4zjJII3Jtj355Q7b3usVAW', '825765', 0, 'dbe14f363a64a047f4210955c7e34861'),
(24, 2, 'RODRIGUEZ OCHOA NATALIA', '10_NataliaRO', '$2y$10$lwqJrWoiX4t9srV.udHXru5sxrBLqv/2WggB/UBwj/SbB1PX9efKi', '240469', 0, '0841aace78be2d990c1d66a009417ebc'),
(25, 2, 'VENEGAS GARCIA TERESA YARENI', '11_TeresaYVG', '$2y$10$60ZsBM59uf1Ognwa5Jb1.On5xqCagLeIXW.HtMHcvzSdXEKypEfkm', '742897', 0, 'b39eb7ffff03b1a7390e0afbc8618984'),
(26, 2, 'VERGARA AGUILAR NAJAIVI NICOLE', '12_NajaiviNVA', '$2y$10$N781SWzMXOrCVw27tinW3.4IfbPvT4J8UBIzUJlSGxlu6p0kUrLGS', '373236', 0, '40a9ee78c94d1b8fe280e980b55e8412'),
(27, 2, 'PADILLA ARRIAGA VALERIA NICOLE', '13_ValeriaNPA', '$2y$10$EnTgkdfSShcx1R2/QDH57e5GkBLv0s0V3NWTHLrmwprXVV5W3TRZa', '943224', 0, '2eeaaf54d5aa7ddebb1fcc263966d624'),
(28, 2, 'LIZETH MONSERRAT', '14_LM', '$2y$10$nG/WPG8ioQl1xhFY2uNhhOzBDZP69N/.iE.g8fRpkuV5l6sjqY4Zu', '664066', 0, '2b0721bb6db347d41711a1723cb04a00'),
(29, 2, 'Moreno Duran Omar', '14_OmarMD', '$2y$10$y2b384dc2bxlw8luhrgTce/Qzj/eiew.dfcb7ls1PlswaiKDyt9HK', '447973', 0, 'ccd2a75c2195eaf2616b127459b42641');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id_asistencia` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('Asistencia','Falta','Retardo','Justificado') NOT NULL,
  `comentario` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asistencias`
--

INSERT INTO `asistencias` (`id_asistencia`, `id_alumno`, `fecha_hora`, `estado`, `comentario`) VALUES
(2, 2, '2026-03-04 02:49:53', 'Asistencia', NULL),
(3, 3, '2026-03-04 02:49:53', 'Asistencia', NULL),
(4, 4, '2026-03-04 02:49:54', 'Asistencia', NULL),
(5, 5, '2026-03-04 02:49:55', 'Falta', NULL),
(6, 6, '2026-03-02 22:08:06', 'Asistencia', NULL),
(7, 7, '2026-03-02 22:08:07', 'Asistencia', NULL),
(8, 8, '2026-03-02 22:08:08', 'Asistencia', NULL),
(9, 9, '2026-03-02 22:08:11', 'Asistencia', NULL),
(10, 10, '2026-03-02 22:08:12', 'Asistencia', NULL),
(11, 11, '2026-03-02 22:08:13', 'Asistencia', NULL),
(12, 12, '2026-03-02 22:08:14', 'Asistencia', NULL),
(13, 13, '2026-03-02 22:08:14', 'Asistencia', NULL),
(14, 14, '2026-03-02 22:08:16', 'Asistencia', NULL),
(15, 6, '2026-03-03 22:08:29', 'Asistencia', NULL),
(16, 7, '2026-03-03 22:08:30', 'Asistencia', NULL),
(17, 8, '2026-03-03 22:08:32', 'Asistencia', NULL),
(18, 9, '2026-03-03 22:08:34', 'Asistencia', NULL),
(19, 10, '2026-03-03 22:08:35', 'Asistencia', NULL),
(20, 11, '2026-03-03 22:08:36', 'Asistencia', NULL),
(21, 12, '2026-03-03 22:08:37', 'Asistencia', NULL),
(22, 13, '2026-03-03 22:08:38', 'Asistencia', NULL),
(23, 14, '2026-03-03 22:08:38', 'Asistencia', NULL),
(24, 6, '2026-03-04 22:08:53', 'Asistencia', NULL),
(25, 7, '2026-03-04 22:08:54', 'Asistencia', NULL),
(26, 8, '2026-03-04 22:08:55', 'Asistencia', NULL),
(27, 9, '2026-03-04 22:08:56', 'Asistencia', NULL),
(28, 10, '2026-03-04 22:08:57', 'Asistencia', NULL),
(29, 11, '2026-03-04 22:08:57', 'Asistencia', NULL),
(30, 12, '2026-03-04 22:08:58', 'Asistencia', NULL),
(31, 13, '2026-03-04 22:08:59', 'Asistencia', NULL),
(32, 14, '2026-03-04 22:09:00', 'Asistencia', NULL),
(33, 6, '2026-03-09 22:09:16', 'Asistencia', NULL),
(34, 7, '2026-03-09 22:09:17', 'Asistencia', NULL),
(35, 8, '2026-03-09 22:09:17', 'Asistencia', NULL),
(36, 9, '2026-03-09 22:09:19', 'Asistencia', NULL),
(38, 11, '2026-03-09 22:09:20', 'Asistencia', NULL),
(39, 12, '2026-03-09 22:09:21', 'Asistencia', NULL),
(40, 13, '2026-03-09 22:09:23', 'Asistencia', NULL),
(41, 14, '2026-03-09 22:09:24', 'Asistencia', NULL),
(43, 6, '2026-03-10 22:09:48', 'Asistencia', NULL),
(44, 7, '2026-03-10 22:09:49', 'Asistencia', NULL),
(45, 8, '2026-03-10 22:09:49', 'Asistencia', NULL),
(46, 9, '2026-03-10 22:09:50', 'Asistencia', NULL),
(47, 11, '2026-03-10 22:09:51', 'Asistencia', NULL),
(48, 12, '2026-03-10 22:09:52', 'Asistencia', NULL),
(49, 13, '2026-03-10 22:09:53', 'Asistencia', NULL),
(50, 14, '2026-03-10 22:09:53', 'Asistencia', NULL),
(51, 10, '2026-03-09 22:12:22', 'Asistencia', NULL),
(52, 6, '2026-03-11 22:12:25', 'Asistencia', NULL),
(53, 7, '2026-03-11 22:12:26', 'Asistencia', NULL),
(54, 8, '2026-03-11 22:12:26', 'Asistencia', NULL),
(55, 9, '2026-03-11 22:12:27', 'Asistencia', NULL),
(56, 10, '2026-03-11 22:12:28', 'Falta', 'noasistio'),
(57, 11, '2026-03-11 22:12:31', 'Asistencia', NULL),
(58, 12, '2026-03-11 22:12:32', 'Asistencia', NULL),
(59, 13, '2026-03-11 22:12:33', 'Asistencia', NULL),
(60, 14, '2026-03-11 22:12:33', 'Asistencia', NULL),
(65, 10, '2026-03-10 08:06:12', 'Falta', 'No asistio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id_calificacion` int(11) NOT NULL,
  `id_alumno` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL,
  `puntaje` decimal(5,2) NOT NULL,
  `fecha_captura` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id_calificacion`, `id_alumno`, `id_actividad`, `puntaje`, `fecha_captura`) VALUES
(1, 2, 2, 0.00, '2026-06-08 13:50:29'),
(3, 6, 3, 8.00, '2026-06-09 04:38:24'),
(4, 7, 3, 8.00, '2026-06-09 04:38:29'),
(6, 8, 3, 8.00, '2026-06-09 04:38:40'),
(8, 9, 3, 10.00, '2026-06-09 04:38:48'),
(10, 10, 3, 0.00, '2026-06-09 04:38:48'),
(11, 6, 4, 10.00, '2026-06-09 06:00:37'),
(12, 7, 4, 10.00, '2026-06-09 06:00:40'),
(17, 8, 4, 10.00, '2026-06-09 06:00:43'),
(19, 9, 4, 10.00, '2026-06-09 06:00:47'),
(21, 10, 4, 10.00, '2026-06-09 06:00:49'),
(23, 11, 4, 10.00, '2026-06-09 06:00:52'),
(25, 12, 4, 10.00, '2026-06-09 06:00:55'),
(27, 13, 4, 10.00, '2026-06-09 06:00:57'),
(29, 14, 4, 10.00, '2026-06-09 06:00:59'),
(31, 6, 5, 8.00, '2026-06-09 06:03:01'),
(32, 7, 5, 8.00, '2026-06-09 06:03:08'),
(34, 8, 5, 8.00, '2026-06-09 06:03:12'),
(36, 9, 5, 10.00, '2026-06-09 06:03:31'),
(38, 10, 5, 9.00, '2026-06-09 06:03:35'),
(43, 11, 5, 8.00, '2026-06-09 06:03:46'),
(45, 12, 5, 10.00, '2026-06-09 06:03:49'),
(47, 13, 5, 8.00, '2026-06-09 06:03:56'),
(48, 14, 5, 10.00, '2026-06-09 06:04:02'),
(50, 6, 6, 9.00, '2026-06-09 06:05:54'),
(51, 7, 6, 9.00, '2026-06-09 06:05:58'),
(53, 8, 6, 9.00, '2026-06-09 06:06:01'),
(55, 9, 6, 10.00, '2026-06-09 06:06:03'),
(57, 10, 6, 10.00, '2026-06-09 06:06:06'),
(59, 11, 6, 9.00, '2026-06-09 06:06:15'),
(60, 12, 6, 10.00, '2026-06-09 06:06:18'),
(62, 13, 6, 9.00, '2026-06-09 06:06:26'),
(63, 14, 6, 10.00, '2026-06-09 06:06:43'),
(65, 6, 7, 10.00, '2026-06-09 06:08:31'),
(66, 7, 7, 10.00, '2026-06-09 06:08:33'),
(68, 8, 7, 10.00, '2026-06-09 06:08:35'),
(70, 9, 7, 10.00, '2026-06-09 06:08:38'),
(72, 10, 7, 10.00, '2026-06-09 06:08:40'),
(74, 11, 7, 10.00, '2026-06-09 06:08:43'),
(76, 12, 7, 10.00, '2026-06-09 06:08:45'),
(78, 13, 7, 10.00, '2026-06-09 06:08:47'),
(80, 14, 7, 10.00, '2026-06-09 06:08:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `id_maestro` int(11) NOT NULL,
  `nombre_grupo` varchar(50) NOT NULL,
  `ciclo_escolar` varchar(20) NOT NULL,
  `tipo_periodo` varchar(50) NOT NULL DEFAULT 'Bimestre',
  `calificacion_minima` decimal(4,2) NOT NULL DEFAULT 6.00,
  `horario` text DEFAULT NULL,
  `minutos_alarma` int(11) DEFAULT 5,
  `sonido_alarma` varchar(255) DEFAULT 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `nivel_educativo` varchar(50) NOT NULL DEFAULT 'Secundaria',
  `modo_calificacion` varchar(50) NOT NULL DEFAULT 'Promedio',
  `tipo_rubrica` varchar(50) NOT NULL DEFAULT 'Global',
  `color_grupo` varchar(7) DEFAULT '#8b5cf6',
  `icono_grupo` varchar(50) DEFAULT 'fas fa-users',
  `avisos` text DEFAULT NULL,
  `tolerancia_minutos` int(11) DEFAULT 15
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id_grupo`, `id_maestro`, `nombre_grupo`, `ciclo_escolar`, `tipo_periodo`, `calificacion_minima`, `horario`, `minutos_alarma`, `sonido_alarma`, `activo`, `nivel_educativo`, `modo_calificacion`, `tipo_rubrica`, `color_grupo`, `icono_grupo`, `avisos`, `tolerancia_minutos`) VALUES
(1, 1, '3ro', '2026', 'Semestre', 6.00, '[]', 5, 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 1, 'Secundaria', 'Promedio', 'Global', '#076e0e', 'fas fa-laptop-code', NULL, 15),
(2, 1, '2do', '2026', 'Semestre', 6.00, '[{\"dia\":\"Lunes\",\"inicio\":\"09:25\",\"fin\":\"10:15\"},{\"dia\":\"Miercoles\",\"inicio\":\"12:20\",\"fin\":\"13:05\"},{\"dia\":\"Viernes\",\"inicio\":\"13:05\",\"fin\":\"13:55\"}]', 5, 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg', 1, 'Secundaria', 'Promedio', 'Global', '#8b5cf6', 'fas fa-book', NULL, 15),
(3, 1, '1ro', '2026', 'Semestre', 6.00, '[]', 5, 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg', 1, 'Secundaria', 'Promedio', 'Por Periodo', '#fa3200', 'fas fa-palette', '', 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
--

CREATE TABLE `periodos` (
  `id_periodo` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `nombre_periodo` varchar(50) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `periodos`
--

INSERT INTO `periodos` (`id_periodo`, `id_grupo`, `nombre_periodo`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
(4, 1, 'Semestre 1', NULL, NULL, 1),
(5, 1, 'Semestre 2', NULL, NULL, 0),
(6, 2, 'Semestre 1', NULL, NULL, 1),
(7, 2, 'Semestre 2', NULL, NULL, 0),
(8, 3, 'Semestre 1', '2026-03-04', '2026-03-11', 0),
(9, 3, 'Semestre 2', '2026-03-17', '2026-06-15', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rubricas`
--

CREATE TABLE `rubricas` (
  `id_rubrica` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `id_periodo` int(11) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#8b5cf6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rubricas`
--

INSERT INTO `rubricas` (`id_rubrica`, `id_grupo`, `id_periodo`, `categoria`, `porcentaje`, `color`) VALUES
(1, 1, NULL, 'Actividades Virtuales', 40.00, '#8b5cf6'),
(3, 1, NULL, 'Evaluación', 30.00, '#8b5cf6'),
(4, 1, NULL, 'Tareas y Prácticas', 20.00, '#8b5cf6'),
(5, 1, NULL, 'Asistencias', 10.00, '#8b5cf6'),
(7, 3, NULL, 'Actividades Virtuales', 30.00, '#ff0000'),
(8, 3, NULL, 'Proyecto', 40.00, '#ffbb00'),
(9, 3, NULL, 'Asistencias', 10.00, '#04ff00'),
(11, 3, NULL, 'Tareas y Practicas', 20.00, '#f0f410'),
(12, 3, 8, 'Actividades Virtuales', 40.00, '#ff0000'),
(13, 3, 8, 'Evaluación', 20.00, '#00fbff'),
(14, 3, 8, 'Asistencias', 20.00, '#04ff00'),
(15, 3, 8, 'Tareas y Practicas', 20.00, '#f0f410'),
(16, 3, 9, 'Actividades Virtuales', 40.00, '#ff0000'),
(17, 3, 9, 'Evaluación', 20.00, '#00fbff'),
(18, 3, 9, 'Asistencias', 20.00, '#04ff00'),
(19, 3, 9, 'Tareas y Practicas', 20.00, '#f0f410');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_maestro` int(11) NOT NULL,
  `firebase_uid` varchar(128) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_maestro`, `firebase_uid`, `nombre`, `email`, `fecha_registro`) VALUES
(1, 'enQzEfZeX6UFTu7Hk0cT8Ec9UWL2', 'Juan Carlos Gonzalez O. (Prof. Carlos Gonzalez)', 'juanchitooelmejor@gmail.com', '2026-06-08 11:27:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id_actividad`),
  ADD KEY `id_rubrica` (`id_rubrica`),
  ADD KEY `idx_actividades_periodo_rubrica` (`id_periodo`,`id_rubrica`);

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id_alumno`),
  ADD UNIQUE KEY `matricula` (`matricula`),
  ADD UNIQUE KEY `qr_token` (`qr_token`),
  ADD KEY `idx_alumnos_grupo` (`id_grupo`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `idx_asistencias_alumno_fecha` (`id_alumno`,`fecha_hora`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id_calificacion`),
  ADD UNIQUE KEY `unica_calificacion_alumno` (`id_alumno`,`id_actividad`),
  ADD KEY `id_actividad` (`id_actividad`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`),
  ADD KEY `idx_grupos_maestro` (`id_maestro`);

--
-- Indices de la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD PRIMARY KEY (`id_periodo`),
  ADD KEY `idx_periodos_grupo` (`id_grupo`);

--
-- Indices de la tabla `rubricas`
--
ALTER TABLE `rubricas`
  ADD PRIMARY KEY (`id_rubrica`),
  ADD KEY `idx_rubricas_grupo` (`id_grupo`),
  ADD KEY `fk_rub_per` (`id_periodo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_maestro`),
  ADD UNIQUE KEY `firebase_uid` (`firebase_uid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id_actividad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id_alumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id_calificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `periodos`
--
ALTER TABLE `periodos`
  MODIFY `id_periodo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `rubricas`
--
ALTER TABLE `rubricas`
  MODIFY `id_rubrica` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_maestro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`id_rubrica`) REFERENCES `rubricas` (`id_rubrica`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `actividades_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id_actividad`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_maestro`) REFERENCES `usuarios` (`id_maestro`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD CONSTRAINT `periodos_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rubricas`
--
ALTER TABLE `rubricas`
  ADD CONSTRAINT `fk_rub_per` FOREIGN KEY (`id_periodo`) REFERENCES `periodos` (`id_periodo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rubricas_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
