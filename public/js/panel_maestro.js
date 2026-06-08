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
      };

      try {
        const res = await fetch("/api/controllers/GrupoController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
        const response = await res.json();

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
window.abrirModalEdicion = function (
  id,
  nivel,
  nombre,
  ciclo,
  tipo,
  num_periodos,
  modo,
  min,
) {
  document.getElementById("id_grupo").value = id;
  document.getElementById("nivel_educativo").value = nivel;
  document.getElementById("nombre_grupo").value = nombre;
  document.getElementById("ciclo_escolar").value = ciclo;
  document.getElementById("tipo_periodo").value = tipo;
  document.getElementById("num_periodos").value = num_periodos || 1;
  document.getElementById("modo_calificacion").value = modo;
  document.getElementById("calificacion_minima").value = min;
  document.getElementById("dias_clase").value =
    grupo.dias_clase || "Lunes a Viernes";
  document.getElementById("hora_inicio").value = grupo.hora_inicio
    ? grupo.hora_inicio.substring(0, 5)
    : "08:00";
  document.getElementById("hora_fin").value = grupo.hora_fin
    ? grupo.hora_fin.substring(0, 5)
    : "09:00";
  document.getElementById("tolerancia_minutos").value =
    grupo.tolerancia_minutos || 15;

  document.getElementById("modal-title").innerText = "Editar Grupo";
  document.getElementById("btn-submit-grupo").innerText = "Guardar Cambios";

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
  card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div>
              <i class="fas fa-users card-icon" style="margin-bottom: 0;"></i>
              <span class="badge-active" style="margin-left: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-size: 0.7rem; vertical-align: top;">${grupo.nivel_educativo}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="abrirModalEdicion(${grupo.id_grupo}, '${grupo.nivel_educativo}', '${grupo.nombre_grupo}', '${grupo.ciclo_escolar}', '${grupo.tipo_periodo}', ${grupo.num_periodos || 1}, '${grupo.modo_calificacion}', ${grupo.calificacion_minima})" class="btn-icon" title="Editar Grupo"><i class="fas fa-edit"></i></button>
                <button onclick="deshabilitarGrupo(${grupo.id_grupo})" class="btn-icon" title="Ocultar Grupo" style="color: #ef4444;"><i class="fas fa-eye-slash"></i></button>
            </div>
        </div>
        <h3 style="margin-bottom: 10px;">${grupo.nombre_grupo}</h3>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-calendar-alt"></i> Ciclo: ${grupo.ciclo_escolar}</p>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-layer-group"></i> Divisiones: ${grupo.num_periodos || 1} ${grupo.tipo_periodo}s</p>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-clock"></i> Horario: ${grupo.hora_inicio ? grupo.hora_inicio.substring(0, 5) : ""} - ${grupo.hora_fin ? grupo.hora_fin.substring(0, 5) : ""} (${grupo.dias_clase})</p>
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
