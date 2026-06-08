window.mostrarAlerta = function (mensaje) {
  document.getElementById("alerta-mensaje").innerText = mensaje;
  document.getElementById("modal-alerta").classList.add("active");
};

let grupoDatos = null;
let alarmPlayed = false;
let fechasAgregadasManualmente = [];

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idGrupo = urlParams.get("id");
  if (!idGrupo) {
    window.location.href = "panel_maestro.html";
    return;
  }

  try {
    const res = await fetch(
      `/api/controllers/GrupoController.php?action=get&id=${idGrupo}`,
    );
    const data = await res.json();
    if (data.success) {
      grupoDatos = data.grupo;
      document.getElementById("lbl-nombre-grupo").innerText =
        grupoDatos.nombre_grupo;

      // Detectar hora fin para hoy
      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
      ];
      const diaHoyStr = diasSemana[new Date().getDay()];
      if (grupoDatos.horario) {
        try {
          const hArr = JSON.parse(grupoDatos.horario);
          const hHoy = hArr.find((h) => h.dia === diaHoyStr);
          if (hHoy) grupoDatos.hora_fin_hoy = hHoy.fin;
        } catch (e) {}
      }
      iniciarAlarma();
    } else {
      mostrarAlerta(data.message);
      window.location.href = "panel_maestro.html";
    }
  } catch (error) {
    console.error("Error al cargar grupo:", error);
  }

  // Inyectar Barra de Navegación Integrada (Pestañas)
  inyectarPestanasNavegacion(idGrupo, "asistencias");

  // Lógica de Tabs (Cambio de Vista)
  const btnEscaner = document.getElementById("btn-modo-escaner");
  const btnTabla = document.getElementById("btn-modo-tabla");
  const vistaEscaner = document.getElementById("vista-escaner");
  const vistaTabla = document.getElementById("vista-tabla");

  btnEscaner.addEventListener("click", () => {
    vistaEscaner.style.display = "grid";
    vistaTabla.style.display = "none";
    btnEscaner.className = "btn btn-maestro";
    btnTabla.className = "btn btn-cancel";
    btnTabla.style.color = "white";
  });

  btnTabla.addEventListener("click", () => {
    // Apagar escáner si estaba prendido
    document.getElementById("btn-detener-escaner").click();

    vistaEscaner.style.display = "none";
    vistaTabla.style.display = "block";
    btnTabla.className = "btn btn-maestro";
    btnEscaner.className = "btn btn-cancel";
    btnEscaner.style.color = "white";
    cargarTablaExcel(idGrupo);
  });

  cargarAsistenciasHoy(idGrupo);

  // Lógica del Escáner QR
  const btnIniciar = document.getElementById("btn-iniciar-escaner");
  const btnDetener = document.getElementById("btn-detener-escaner");
  const readerDiv = document.getElementById("reader");
  let html5QrcodeScanner = null;
  let escaneando = false;

  btnIniciar.addEventListener("click", () => {
    readerDiv.style.display = "block";
    btnIniciar.style.display = "none";
    btnDetener.style.display = "flex";
    html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  });

  btnDetener.addEventListener("click", () => {
    if (html5QrcodeScanner) html5QrcodeScanner.clear();
    readerDiv.style.display = "none";
    btnIniciar.style.display = "flex";
    btnDetener.style.display = "none";
  });

  async function onScanSuccess(decodedText, decodedResult) {
    if (escaneando) return; // Evitar múltiples peticiones a la vez
    escaneando = true;

    document.getElementById("toast-asistencia").style.display = "none";

    try {
      const res = await fetch("/api/controllers/AsistenciaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "registrar",
          id_grupo: idGrupo,
          qr_token: decodedText,
        }),
      });
      const data = await res.json();

      const toast = document.getElementById("toast-asistencia");
      document.getElementById("lbl-alumno-asistencia").innerText = data.success
        ? data.nombre
        : "Aviso del Sistema";
      document.getElementById("lbl-hora-asistencia").innerText = data.success
        ? data.fecha_hora
        : data.message;
      toast.style.background = data.success ? "var(--secondary)" : "#ef4444";
      toast.style.display = "block";

      if (data.success) cargarAsistenciasHoy(idGrupo);
    } catch (error) {
      console.error("Error al registrar:", error);
    }

    // Permitir escanear de nuevo después de 2.5 segundos (evita dobles lecturas)
    setTimeout(() => {
      escaneando = false;
    }, 2500);
  }

  function onScanFailure(error) {
    /* Ignorar fallos de lectura, son normales frame por frame */
  }

  async function cargarAsistenciasHoy(id) {
    try {
      const res = await fetch(
        `/api/controllers/AsistenciaController.php?action=listar_hoy&id_grupo=${id}`,
      );
      const data = await res.json();
      const tbody = document.getElementById("lista-asistencias-hoy");

      if (data.success) {
        tbody.innerHTML = "";
        if (data.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-muted); padding: 30px;">Aún no hay asistencias registradas hoy.</td></tr>`;
          return;
        }
        data.data.forEach((asis) => {
          tbody.innerHTML += `<tr><td style="font-weight: 600;">${asis.nombre}</td><td style="text-align: right; color: var(--text-muted); font-size: 0.9rem;">${asis.fecha_hora}</td></tr>`;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
});

// --- LÓGICA DE ALARMA ---
function iniciarAlarma() {
  setInterval(() => {
    if (!grupoDatos || !grupoDatos.hora_fin_hoy) return;
    const now = new Date();
    const end = new Date();
    const [h, m] = grupoDatos.hora_fin_hoy.split(":");
    end.setHours(h, m, 0, 0);

    const diffMs = end - now;

    const minutosAlarma = grupoDatos.minutos_alarma || 5;
    const msAlarma = minutosAlarma * 60 * 1000;

    if (diffMs > 0 && diffMs <= msAlarma && !alarmPlayed) {
      alarmPlayed = true;

      const urlSonido =
        grupoDatos.sonido_alarma ||
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
      const audio = new Audio(urlSonido);
      audio
        .play()
        .catch((e) => console.log("Audio play blocked by browser", e));
      mostrarAlerta(
        `¡Atención! Faltan menos de ${minutosAlarma} minutos para que termine la clase (${grupoDatos.hora_fin_hoy.substring(0, 5)}).`,
      );
    }
  }, 10000); // Revisar cada 10 segundos para mayor precisión
}

window.agregarColumnaAsistencia = function () {
  const fecha = document.getElementById("fecha-manual-excel").value;
  if (!fecha) {
    mostrarAlerta("Por favor selecciona una fecha.");
    return;
  }
  if (!fechasAgregadasManualmente.includes(fecha)) {
    fechasAgregadasManualmente.push(fecha);
    cargarTablaExcel(new URLSearchParams(window.location.search).get("id"));
  }
};

// --- LÓGICA DE LA TABLA EXCEL ---
async function cargarTablaExcel(idGrupo) {
  const res = await fetch(
    `/api/controllers/AsistenciaController.php?action=get_grid&id_grupo=${idGrupo}`,
  );
  const data = await res.json();

  const tabla = document.getElementById("tabla-asistencias-excel");
  let thead = `<thead><tr><th>N°</th><th>Alumno</th>`;

  let allFechas = Array.from(
    new Set([...data.fechas, ...fechasAgregadasManualmente]),
  );
  allFechas.sort();

  allFechas.forEach((fecha) => {
    thead += `<th>${fecha.split("-").reverse().join("/")}</th>`;
  });
  thead += `</tr></thead>`;
  tabla.innerHTML = thead;

  let tbody = `<tbody>`;
  let nLista = 1;
  data.alumnos.forEach((al) => {
    tbody += `<tr><td>${nLista++}</td><th>${al.nombre}</th>`;
    allFechas.forEach((fecha) => {
      const asis = data.asistencias.find(
        (a) => a.id_alumno == al.id_alumno && a.fecha === fecha,
      );
      let symbol = "-";
      let cssClass = "st-nul";
      let estadoTxt = "Eliminar";

      if (asis) {
        if (asis.estado === "Asistencia") {
          symbol = "1";
          cssClass = "st-asi";
          estadoTxt = "Asistencia";
        } else if (asis.estado === "Falta") {
          symbol = "0";
          cssClass = "st-fal";
          estadoTxt = "Falta";
        } else if (asis.estado === "Retardo") {
          symbol = "/";
          cssClass = "st-ret";
          estadoTxt = "Retardo";
        }
      }

      tbody += `<td class="cell-asistencia ${cssClass}" title="Clic para cambiar estado" onclick="cambiarEstadoAsistencia(${al.id_alumno}, '${fecha}', '${estadoTxt}')">${symbol}</td>`;
    });
    tbody += `</tr>`;
  });
  tbody += `</tbody>`;
  tabla.innerHTML += tbody;
}

window.cambiarEstadoAsistencia = async function (
  idAlumno,
  fecha,
  estadoActual,
) {
  // Ciclo rápido: Asistencia -> Retardo -> Falta -> Eliminar -> Asistencia...
  let nuevoEstado = "Asistencia";
  if (estadoActual === "Asistencia") nuevoEstado = "Retardo";
  else if (estadoActual === "Retardo") nuevoEstado = "Falta";
  else if (estadoActual === "Falta") nuevoEstado = "Eliminar";

  await fetch("/api/controllers/AsistenciaController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "save_cell",
      id_alumno: idAlumno,
      fecha: fecha,
      estado: nuevoEstado,
    }),
  });

  cargarTablaExcel(new URLSearchParams(window.location.search).get("id"));
};

function inyectarPestanasNavegacion(idGrupo, vistaActiva) {
  const header = document.querySelector(".header-panel");
  if (!header) return;
  const navHtml = `
    <div class="tabs-container" style="width: 100%; margin-top: 20px; padding-bottom: 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; gap: 15px; overflow-x: auto;">
      <a href="grupo_alumnos.html?id=${idGrupo}" class="tab-btn ${vistaActiva === "alumnos" ? "active" : ""}" style="text-decoration: none; display: flex; align-items: center; gap: 8px;"><i class="fas fa-users"></i> Directorio y Alumnos</a>
      <a href="calificaciones.html?id=${idGrupo}" class="tab-btn ${vistaActiva === "calificaciones" ? "active" : ""}" style="text-decoration: none; display: flex; align-items: center; gap: 8px;"><i class="fas fa-table"></i> Tabla de Calificaciones</a>
      <a href="pase_lista.html?id=${idGrupo}" class="tab-btn ${vistaActiva === "asistencias" ? "active" : ""}" style="text-decoration: none; display: flex; align-items: center; gap: 8px;"><i class="fas fa-clipboard-list"></i> Asistencias (Pase de Lista)</a>
    </div>
  `;
  header.insertAdjacentHTML("afterend", navHtml);
}
