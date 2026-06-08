// Funciones globales para Modales Bonitos
window.mostrarAlerta = function (mensaje) {
  document.getElementById("alerta-mensaje").innerText = mensaje;
  document.getElementById("modal-alerta").classList.add("active");
};

window.mostrarConfirmacion = function (mensaje, callback) {
  document.getElementById("confirmacion-mensaje").innerText = mensaje;
  const modal = document.getElementById("modal-confirmacion");
  modal.classList.add("active");
  const btnConfirm = document.getElementById("btn-confirmar-accion");
  const newBtnConfirm = btnConfirm.cloneNode(true);
  btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
  newBtnConfirm.addEventListener("click", () => {
    modal.classList.remove("active");
    callback();
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idGrupo = urlParams.get("id");

  if (!idGrupo) {
    window.location.href = "panel_maestro.html";
    return;
  }

  // 1. Obtener Nombre del Grupo
  try {
    const res = await fetch(
      `/api/controllers/GrupoController.php?action=get&id=${idGrupo}`,
    );
    const data = await res.json();
    if (data.success) {
      document.getElementById("lbl-nombre-grupo").innerText =
        data.grupo.nombre_grupo;
    } else {
      mostrarAlerta(data.message);
      window.location.href = "panel_maestro.html";
    }
  } catch (error) {
    console.error("Error al cargar grupo:", error);
  }

  // Habilitar el botón hacia la Hoja de Calificaciones
  const btnCalificaciones = document.getElementById("btn-ir-calificaciones");
  btnCalificaciones.style.display = "flex";
  btnCalificaciones.addEventListener(
    "click",
    () => (window.location.href = `calificaciones.html?id=${idGrupo}`),
  );

  // 2. Cargar Lista de Alumnos
  cargarAlumnos(idGrupo);

  // 3. Modal Registrar Alumno
  document
    .getElementById("btn-abrir-modal-alumno")
    .addEventListener("click", () => {
      document.getElementById("form-alumno").reset();
      document.getElementById("modal-alumno").classList.add("active");
    });

  // 4. Guardar Alumno
  document
    .getElementById("form-alumno")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const matricula = document.getElementById("matricula").value;
      const nombre = document.getElementById("nombre").value;

      const res = await fetch("/api/controllers/AlumnoController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id_grupo: idGrupo,
          matricula,
          nombre,
        }),
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById("modal-alumno").classList.remove("active");
        cargarAlumnos(idGrupo);
        mostrarCredencial(data.data); // Desplegamos su QR
      } else {
        mostrarAlerta(data.message);
      }
    });

  // 5. Botón Imprimir Todos
  document
    .getElementById("btn-imprimir-todos")
    .addEventListener("click", () => {
      if (alumnosData.length === 0) {
        mostrarAlerta("No hay alumnos registrados para imprimir.");
        return;
      }

      document.body.className = "print-multiple";
      const container = document.getElementById("print-all-container");
      container.innerHTML = "";
      container.style.display = "grid";

      alumnosData.forEach((alumno) => {
        const card = document.createElement("div");
        card.className = "credencial-card";
        card.style.pageBreakInside = "avoid";
        card.style.border = "1px solid #ccc";
        card.style.boxShadow = "none";
        card.style.margin = "0";
        card.innerHTML = `
          <h3 style="color: black; margin-bottom: 5px;">${alumno.nombre}</h3>
          <p style="color: #666; font-size: 0.9rem">Matrícula: <strong>${alumno.matricula}</strong></p>
          <div class="qr-wrapper" id="qr-all-${alumno.id_alumno}" style="margin: 10px auto; padding: 10px; border: 2px solid #eee;"></div>
          <p style="color: #666; font-size: 0.8rem; margin-top: 5px">PIN de Acceso:</p>
          <div class="pin-box" style="color: black; border: 1px solid #ccc; padding: 5px; margin-top: 5px;">${alumno.pin_acceso || "N/A"}</div>
      `;
        container.appendChild(card);

        new QRCode(document.getElementById(`qr-all-${alumno.id_alumno}`), {
          text: alumno.qr_token,
          width: 100,
          height: 100,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      });

      setTimeout(() => {
        window.print();
        container.style.display = "none";
        document.body.className = "";
      }, 500);
    });
});

let nLista = 1;
let alumnosData = []; // Guardamos los datos para usarlos al imprimir o ver QR

async function cargarAlumnos(idGrupo) {
  const res = await fetch(
    `/api/controllers/AlumnoController.php?action=list&id_grupo=${idGrupo}`,
  );
  const data = await res.json();
  const tbody = document.getElementById("lista-alumnos");

  if (data.success) {
    alumnosData = data.data; // Llenar la memoria
    tbody.innerHTML = "";
    nLista = 1;
    if (data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Aún no hay alumnos registrados en este grupo.</td></tr>`;
      return;
    }
    data.data.forEach((alumno) => renderFilaAlumno(alumno));
  } else {
    // Ocultar el mensaje de "Cargando" y mostrar el error real
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 30px;">Error al cargar: ${data.message}</td></tr>`;
    if (data.message.includes("pin_acceso")) {
      mostrarAlerta(
        "ERROR DE CONFIGURACIÓN: Falta la columna 'pin_acceso' en tu tabla de alumnos. Por favor ejecuta esto en MySQL Workbench:\n\nALTER TABLE alumnos ADD COLUMN pin_acceso VARCHAR(10) AFTER password_hash;",
      );
    } else {
      mostrarAlerta(data.message);
    }
  }
}

function renderFilaAlumno(alumno) {
  const tbody = document.getElementById("lista-alumnos");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td style="text-align: center; font-weight: bold; color: var(--text-muted);">${nLista++}</td>
    <td style="color: var(--secondary); font-family: monospace; font-size: 1.1rem;">${alumno.matricula}</td>
    <td style="font-weight: 600;">${alumno.nombre}</td>
    <td style="text-align: center;">
        <button onclick="verCredencial(${alumno.id_alumno})" class="btn-icon" style="color: var(--primary);" title="Ver Credencial"><i class="fas fa-qrcode"></i></button>
    </td>
    <td style="text-align: center;">
        <button onclick="eliminarAlumno(${alumno.id_alumno})" class="btn-icon" style="color: #ef4444;" title="Eliminar alumno"><i class="fas fa-trash"></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

// Mostrar nuevamente la credencial de un alumno específico
window.verCredencial = function (idAlumno) {
  const alumno = alumnosData.find((a) => a.id_alumno == idAlumno);
  if (alumno) {
    mostrarCredencial({
      nombre: alumno.nombre,
      matricula: alumno.matricula,
      qr_token: alumno.qr_token,
      pin: alumno.pin_acceso || "N/A",
    });
  }
};

// Genera la credencial visual al momento de registrarlo
function mostrarCredencial(alumno) {
  document.body.className = "print-single"; // Avisarle a CSS que imprimiremos solo una
  document.getElementById("cred_nombre").innerText = alumno.nombre;
  document.getElementById("cred_matricula").innerText = alumno.matricula;
  document.getElementById("cred_pin").innerText = alumno.pin;

  const qrContainer = document.getElementById("qrcode-container");
  qrContainer.innerHTML = ""; // Limpiar qr anterior por si acaso

  new QRCode(qrContainer, {
    text: alumno.qr_token,
    width: 150,
    height: 150,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  document.getElementById("modal-credencial").classList.add("active");
}

window.eliminarAlumno = async function (idAlumno) {
  mostrarConfirmacion(
    "¿Estás seguro de que deseas eliminar a este alumno? Se borrarán todas sus calificaciones.",
    async () => {
      try {
        const res = await fetch("/api/controllers/AlumnoController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_alumno: idAlumno }),
        });
        const data = await res.json();
        if (data.success)
          cargarAlumnos(new URLSearchParams(window.location.search).get("id"));
        else mostrarAlerta(data.message);
      } catch (error) {
        console.error("Error al eliminar alumno:", error);
      }
    },
  );
};
