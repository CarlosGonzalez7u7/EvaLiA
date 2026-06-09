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

  // Inyectar Barra de Navegación Integrada (Pestañas)
  inyectarPestanasNavegacion(idGrupo, "alumnos");

  // 2. Cargar Lista de Alumnos
  cargarAlumnos(idGrupo);

  // 3. Modal Registrar Alumno
  document
    .getElementById("btn-abrir-modal-alumno")
    .addEventListener("click", () => {
      document.getElementById("modal-alumno-title").innerText =
        "Registrar Alumno";
      document.getElementById("btn-submit-alumno").innerHTML =
        '<i class="fas fa-save"></i> Guardar y Generar QR';
      document.getElementById("id_alumno").value = "";
      document.getElementById("form-alumno").reset();
      document.getElementById("btn-regenerar-qr").style.display = "none";
      document.getElementById("modal-alumno").classList.add("active");
    });

  // 4. Guardar o Editar Alumno
  document
    .getElementById("form-alumno")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const id_alumno = document.getElementById("id_alumno").value;
      const matricula = document.getElementById("matricula").value;
      const nombre = document.getElementById("nombre").value;

      const payload = {
        action: id_alumno ? "update" : "create",
        id_grupo: idGrupo,
        matricula,
        nombre,
      };
      if (id_alumno) payload.id_alumno = id_alumno;

      const res = await fetch("/api/controllers/AlumnoController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById("modal-alumno").classList.remove("active");
        cargarAlumnos(idGrupo);
        if (!id_alumno) {
          mostrarCredencial(data.data); // Desplegamos su QR al crearlo
        } else {
          mostrarAlerta("Alumno actualizado correctamente.");
        }
      } else {
        mostrarAlerta(data.message);
      }
    });

  // Botón Regenerar QR
  document.getElementById("btn-regenerar-qr").addEventListener("click", () => {
    const id_alumno = document.getElementById("id_alumno").value;
    if (!id_alumno) return;
    mostrarConfirmacion(
      "¿Estás seguro de que deseas regenerar el código QR? El código anterior dejará de funcionar para este alumno.",
      async () => {
        try {
          const res = await fetch("/api/controllers/AlumnoController.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "regenerate_qr", id_alumno }),
          });
          const data = await res.json();
          if (data.success) {
            document.getElementById("modal-alumno").classList.remove("active");
            mostrarAlerta(
              "QR regenerado correctamente. Puedes imprimirlo nuevamente desde la lista de clase.",
            );
            cargarAlumnos(idGrupo);
          } else {
            mostrarAlerta(data.message);
          }
        } catch (e) {
          console.error(e);
        }
      },
    );
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
        card.style.textAlign = "center";
        card.innerHTML = `
          <img src="../../assets/Logo.png" style="width: 50px; margin-bottom: 10px;" />
          <h3 style="color: black; margin-bottom: 5px;">${alumno.nombre}</h3>
          <p style="color: #666; font-size: 0.9rem">Matrícula: <strong>${alumno.matricula}</strong></p>
          <div class="qr-wrapper" id="qr-all-${alumno.id_alumno}" style="margin: 15px auto; padding: 15px; background: white; display: inline-block; border-radius: 10px; border: 2px solid #f1f1f1;"></div>
          <p style="color: #666; font-size: 0.8rem; margin-top: 10px">PIN de Acceso a EvaLiA:</p>
          <div class="pin-box" style="color: var(--secondary); background: #f8fafc; border: 1px solid #ccc; padding: 10px; margin-top: 15px; border-radius: 8px; font-size: 1.5rem; font-weight: 800; letter-spacing: 5px;">${alumno.pin_acceso || "N/A"}</div>
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
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Aún no hay alumnos registrados en este grupo.</td></tr>`;
      return;
    }
    data.data.forEach((alumno) => renderFilaAlumno(alumno));
  } else {
    // Ocultar el mensaje de "Cargando" y mostrar el error real
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 30px;">Error al cargar: ${data.message}</td></tr>`;
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
  tr.id = `alumno-row-${alumno.id_alumno}`;
  tr.innerHTML = `
    <td style="text-align: center;">
        <button onclick="moverAlumno(${alumno.id_alumno}, -1)" class="btn-icon" style="font-size: 1rem;" title="Subir"><i class="fas fa-arrow-up"></i></button>
        <button onclick="moverAlumno(${alumno.id_alumno}, 1)" class="btn-icon" style="font-size: 1rem;" title="Bajar"><i class="fas fa-arrow-down"></i></button>
    </td>
    <td style="text-align: center; font-weight: bold; color: var(--text-muted);">${nLista++}</td>
    <td style="color: var(--secondary); font-family: monospace; font-size: 1.1rem;">${alumno.matricula}</td>
    <td style="font-weight: 600;">${alumno.nombre}</td>
    <td style="text-align: center;">
        <button onclick="verCredencial(${alumno.id_alumno})" class="btn-icon" style="color: var(--primary);" title="Ver Credencial"><i class="fas fa-qrcode"></i></button>
    </td>
    <td style="text-align: center;">
        <button onclick="editarAlumno(${alumno.id_alumno}, '${alumno.matricula}', '${alumno.nombre}')" class="btn-icon" style="color: var(--primary);" title="Editar Alumno"><i class="fas fa-edit"></i></button>
        <button onclick="eliminarAlumno(${alumno.id_alumno})" class="btn-icon" style="color: #ef4444;" title="Eliminar alumno"><i class="fas fa-trash"></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

window.moverAlumno = async function (idAlumno, direccion) {
  const index = alumnosData.findIndex((a) => a.id_alumno == idAlumno);
  if (index === -1) return;

  const nuevoIndex = index + direccion;
  if (nuevoIndex < 0 || nuevoIndex >= alumnosData.length) return; // Fuera de límites

  // Intercambiar en el array local
  const temp = alumnosData[index];
  alumnosData[index] = alumnosData[nuevoIndex];
  alumnosData[nuevoIndex] = temp;

  // Recolectar el nuevo orden de IDs
  const nuevoOrden = alumnosData.map((a) => a.id_alumno);

  // Enviar al servidor
  const idGrupo = new URLSearchParams(window.location.search).get("id");
  await fetch("/api/controllers/AlumnoController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "reorder",
      id_grupo: idGrupo,
      ordenes: nuevoOrden,
    }),
  });

  // Recargar para repintar números de lista correctamente
  cargarAlumnos(idGrupo);
};

// Función global para Editar Alumno
window.editarAlumno = function (id_alumno, matricula, nombre) {
  document.getElementById("modal-alumno-title").innerText = "Editar Alumno";
  document.getElementById("btn-submit-alumno").innerHTML =
    '<i class="fas fa-save"></i> Guardar Cambios';
  document.getElementById("id_alumno").value = id_alumno;
  document.getElementById("matricula").value = matricula;
  document.getElementById("nombre").value = nombre;
  document.getElementById("btn-regenerar-qr").style.display = "flex";
  document.getElementById("modal-alumno").classList.add("active");
};

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
