// Lógica del Panel del Maestro

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

window.switchTab = function (tabId, btnElem) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  btnElem.classList.add("active");
};

window.toggleDay = function (day) {
  const isChecked = document.getElementById(`chk_${day}`).checked;
  const start = document.getElementById(`inicio_${day}`);
  const end = document.getElementById(`fin_${day}`);
  start.disabled = !isChecked;
  end.disabled = !isChecked;
  if (isChecked && !start.value) start.value = "08:00";
  if (isChecked && !end.value) end.value = "09:00";
};

let gruposData = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Obtener Sesión del Maestro
  try {
    const res = await fetch(
      "/api/controllers/MaestroController.php?action=profile",
    );
    const session = await res.json();

    if (!session.success) {
      window.location.href = "login_maestro.html"; // Si no hay sesión, lo expulsamos
      return;
    }
    document.getElementById("nombre-maestro").innerText = session.nombre;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
  }

  // 2. Cargar Grupos existentes
  cargarGrupos();

  // 3. Funcionalidad de Cerrar Sesión
  document.getElementById("btn-logout").addEventListener("click", async (e) => {
    e.preventDefault();
    // Matamos la sesión segura de PHP
    await fetch("/api/controllers/MaestroController.php?action=logout");
    // Opcional: Podrías desloguear de Firebase aquí importando auth y signOut
    window.location.href = "../../index.html";
  });

  // 4. Lógica del Modal
  const modal = document.getElementById("modal-grupo");
  document.getElementById("btn-abrir-modal").addEventListener("click", () => {
    document.getElementById("id_grupo").value = "";
    document.getElementById("form-grupo").reset();
    document.getElementById("modal-title").innerText = "Configurar Nuevo Grupo";
    document.getElementById("btn-submit-grupo").innerText =
      "Crear Grupo y Periodos";

    // Limpiar Horarios
    const diasSemana = [
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    diasSemana.forEach((dia) => {
      const idDia = dia.toLowerCase();
      const chk = document.getElementById(`chk_${idDia}`);
      if (chk) {
        chk.checked = false;
        window.toggleDay(idDia);
        document.getElementById(`inicio_${idDia}`).value = "";
        document.getElementById(`fin_${idDia}`).value = "";
      }
    });

    document.querySelector(".tab-btn").click(); // Volver al primer tab
    modal.classList.add("active");
  });
  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", () => modal.classList.remove("active"));

  // Lógica del Tutorial del Panel
  const modalAyuda = document.getElementById("modal-ayuda-panel");
  document
    .getElementById("btn-ayuda-panel")
    .addEventListener("click", () => modalAyuda.classList.add("active"));
  document
    .getElementById("btn-cerrar-ayuda")
    .addEventListener("click", () => modalAyuda.classList.remove("active"));
  document
    .getElementById("btn-entendido-panel")
    .addEventListener("click", () => modalAyuda.classList.remove("active"));

  // 5. Interceptar el Formulario para crear o editar un Grupo
  document
    .getElementById("form-grupo")
    .addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitamos que la página se recargue

      const idGrupo = document.getElementById("id_grupo").value;

      // Recopilar Horarios
      const horarioArray = [];
      const diasSemana = [
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
      ];
      diasSemana.forEach((dia) => {
        const idDia = dia.toLowerCase();
        if (document.getElementById(`chk_${idDia}`).checked) {
          horarioArray.push({
            dia: dia,
            inicio: document.getElementById(`inicio_${idDia}`).value,
            fin: document.getElementById(`fin_${idDia}`).value,
          });
        }
      });

      const datos = {
        action: idGrupo ? "update" : "create",
        id_grupo: idGrupo,
        nivel_educativo: document.getElementById("nivel_educativo").value,
        nombre_grupo: document.getElementById("nombre_grupo").value,
        ciclo_escolar: document.getElementById("ciclo_escolar").value,
        tipo_periodo: document.getElementById("tipo_periodo").value,
        num_periodos: document.getElementById("num_periodos").value,
        modo_calificacion: document.getElementById("modo_calificacion").value,
        calificacion_minima: document.getElementById("calificacion_minima")
          .value,
        horario: JSON.stringify(horarioArray),
        tolerancia_minutos: document.getElementById("tolerancia_minutos").value,
        minutos_alarma: document.getElementById("minutos_alarma").value,
        sonido_alarma: document.getElementById("sonido_alarma").value,
      };

      try {
        const res = await fetch("/api/controllers/GrupoController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });

        const rawText = await res.text();
        let response;
        try {
          response = JSON.parse(rawText);
        } catch (e) {
          console.error("Error crítico de PHP:", rawText);
          mostrarAlerta(
            "Error interno del servidor. Abre la consola (F12) para ver los detalles.",
          );
          return;
        }

        if (response.success) {
          modal.classList.remove("active");
          document.getElementById("form-grupo").reset();

          if (idGrupo) {
            document.getElementById("grupos-container").innerHTML = ""; // Limpiamos la pantalla
            cargarGrupos(); // Recargamos para ver los cambios
          } else {
            renderGrupoCard(response.data, true); // Insertar sin recargar
          }
        } else {
          mostrarAlerta("Error al crear grupo: " + response.message);
        }
      } catch (error) {
        console.error("Error en petición:", error);
      }
    });
});

// Función para pedir grupos al servidor
async function cargarGrupos() {
  const res = await fetch("/api/controllers/GrupoController.php?action=list");
  const response = await res.json();
  if (response.success) {
    gruposData = response.data; // Guardamos en memoria global
    response.data.forEach((grupo) => renderGrupoCard(grupo, false));
  } else {
    // Si hay error en base de datos, mostramos el motivo exacto (Ej: falta la columna 'activo')
    if (response.message.includes("activo")) {
      mostrarAlerta(
        "ERROR DE CONFIGURACIÓN: Te falta la columna 'activo' en tu Base de Datos. Por favor ejecuta en MySQL: ALTER TABLE grupos ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;",
      );
    } else {
      mostrarAlerta(response.message);
    }
    console.error("Error al cargar grupos:", response.message);
  }
}

// Funciones globales para los botones de las tarjetas
window.abrirModalEdicion = function (id) {
  const grupo = gruposData.find((g) => g.id_grupo == id);
  if (!grupo) return;

  document.getElementById("id_grupo").value = grupo.id_grupo;
  document.getElementById("nivel_educativo").value = grupo.nivel_educativo;
  document.getElementById("nombre_grupo").value = grupo.nombre_grupo;
  document.getElementById("ciclo_escolar").value = grupo.ciclo_escolar;
  document.getElementById("tipo_periodo").value = grupo.tipo_periodo;
  document.getElementById("num_periodos").value = grupo.num_periodos || 1;
  document.getElementById("modo_calificacion").value = grupo.modo_calificacion;
  document.getElementById("calificacion_minima").value =
    grupo.calificacion_minima;
  document.getElementById("tolerancia_minutos").value =
    grupo.tolerancia_minutos || 15;
  document.getElementById("minutos_alarma").value = grupo.minutos_alarma || 5;
  document.getElementById("sonido_alarma").value =
    grupo.sonido_alarma ||
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  diasSemana.forEach((dia) => {
    const idDia = dia.toLowerCase();
    const chk = document.getElementById(`chk_${idDia}`);
    if (chk) {
      chk.checked = false;
      window.toggleDay(idDia);
      document.getElementById(`inicio_${idDia}`).value = "";
      document.getElementById(`fin_${idDia}`).value = "";
    }
  });

  if (grupo.horario) {
    try {
      const parsed = JSON.parse(grupo.horario);
      parsed.forEach((h) => {
        const idDia = h.dia.toLowerCase();
        const chk = document.getElementById(`chk_${idDia}`);
        if (chk) {
          chk.checked = true;
          document.getElementById(`inicio_${idDia}`).value = h.inicio;
          document.getElementById(`fin_${idDia}`).value = h.fin;
          window.toggleDay(idDia);
        }
      });
    } catch (e) {}
  }

  document.getElementById("modal-title").innerText = "Editar Grupo";
  document.getElementById("btn-submit-grupo").innerText = "Guardar Cambios";

  document.querySelector(".tab-btn").click(); // Volver al primer tab
  document.getElementById("modal-grupo").classList.add("active");
};

window.deshabilitarGrupo = async function (id) {
  mostrarConfirmacion(
    "¿Estás seguro de que deseas ocultar este grupo? No se borrarán los datos de tus alumnos, pero el grupo desaparecerá de este panel.",
    async () => {
      const res = await fetch("/api/controllers/GrupoController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", id_grupo: id }),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById(`grupo-card-${id}`).remove(); // Quita la tarjeta visualmente al instante
      } else {
        mostrarAlerta("Error al ocultar grupo.");
      }
    },
  );
};

// Función de Renderizado (Pinta la UI mágicamente)
function renderGrupoCard(grupo, isNew = false) {
  const container = document.getElementById("grupos-container");
  const card = document.createElement("div");
  card.className = "card scroll-show";
  card.id = `grupo-card-${grupo.id_grupo}`;

  let horarioText = "No definido";
  if (grupo.horario) {
    try {
      const hArr = JSON.parse(grupo.horario);
      if (hArr.length > 0) {
        horarioText = hArr
          .map(
            (h) =>
              `${h.dia.substring(0, 2)}: ${h.inicio.substring(0, 5)}-${h.fin.substring(0, 5)}`,
          )
          .join(", ");
      }
    } catch (e) {}
  }

  card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div>
              <i class="fas fa-users card-icon" style="margin-bottom: 0;"></i>
              <span class="badge-active" style="margin-left: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-size: 0.7rem; vertical-align: top;">${grupo.nivel_educativo}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="abrirModalEdicion(${grupo.id_grupo})" class="btn-icon" title="Editar Grupo"><i class="fas fa-edit"></i></button>
                <button onclick="deshabilitarGrupo(${grupo.id_grupo})" class="btn-icon" title="Ocultar Grupo" style="color: #ef4444;"><i class="fas fa-eye-slash"></i></button>
            </div>
        </div>
        <h3 style="margin-bottom: 10px;">${grupo.nombre_grupo}</h3>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-calendar-alt"></i> Ciclo: ${grupo.ciclo_escolar}</p>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-layer-group"></i> Divisiones: ${grupo.num_periodos || 1} ${grupo.tipo_periodo}s</p>
        <p style="margin-bottom: 5px; font-size: 0.85rem;"><i class="fas fa-clock"></i> ${horarioText}</p>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <a href="grupo_alumnos.html?id=${grupo.id_grupo}" class="btn" style="flex: 1; justify-content: center; font-size: 0.95rem; padding: 10px; background: linear-gradient(45deg, var(--primary), var(--secondary)); border: none; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); color: white;" title="Ver alumnos y calificaciones">
                <i class="fas fa-chalkboard"></i> <strong style="margin-left: 5px;">Entrar a Clase</strong>
            </a>
            <a href="pase_lista.html?id=${grupo.id_grupo}" class="btn btn-alumno" style="flex: 1; justify-content: center; font-size: 0.9rem; padding: 10px;" title="Gestión de Asistencias">
                <i class="fas fa-clipboard-list"></i> Asistencias
            </a>
            <a href="config_grupo.html?id=${grupo.id_grupo}" class="btn btn-cancel" style="padding: 10px; display: flex; align-items: center; justify-content: center; color: white;" title="Configurar Rúbricas">
                <i class="fas fa-cog"></i>
            </a>
        </div>
    `;
  // Si es nuevo, ponerlo al principio. Si no, al final.
  if (isNew) container.prepend(card);
  else container.appendChild(card);
}
