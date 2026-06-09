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

// Lógica de Sonido de Alarma
let audioPreview = null;
window.verificarSonidoCustom = function () {
  const val = document.getElementById("sonido_alarma").value;
  const customInput = document.getElementById("sonido_custom");
  if (customInput) {
    customInput.style.display = val === "custom" ? "block" : "none";
  }
};

// Mostrar/ocultar selector de periodos al cambiar el tipo de rúbrica
document.addEventListener("change", (e) => {
  if (e.target.id === "tipo_rubrica") {
    const isPerPeriod = e.target.value === "Por Periodo";
    document.getElementById("container-select-periodo-rubrica").style.display =
      isPerPeriod ? "block" : "none";
    if (document.getElementById("id_grupo").value) {
      window.cargarRubricasModal(document.getElementById("id_grupo").value);
    }
  }
});

let gruposData = [];

document.addEventListener("DOMContentLoaded", async () => {
  document
    .getElementById("filtro-estado-grupo")
    ?.addEventListener("change", () => {
      document.getElementById("grupos-container").innerHTML = "";
      cargarGrupos();
    });

  document.getElementById("btn-play-sound")?.addEventListener("click", () => {
    if (audioPreview) {
      audioPreview.pause();
      audioPreview.currentTime = 0;
    }
    const selectVal = document.getElementById("sonido_alarma").value;
    const url =
      selectVal === "custom"
        ? document.getElementById("sonido_custom").value
        : selectVal;
    if (url) {
      audioPreview = new Audio(url);
      audioPreview
        .play()
        .catch((e) =>
          mostrarAlerta(
            "No se pudo reproducir. Verifica que la URL sea válida.",
          ),
        );
    }
  });

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

    document.getElementById("btn-tab-rubricas").style.display = "none";
    document.getElementById("btn-tab-periodos").style.display = "none";

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

      const rawSnd = document.getElementById("sonido_alarma")
        ? document.getElementById("sonido_alarma").value
        : "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
      const finalSound =
        rawSnd === "custom"
          ? document.getElementById("sonido_custom").value
          : rawSnd;

      const datos = {
        action: idGrupo ? "update" : "create",
        id_grupo: idGrupo,
        nivel_educativo: document.getElementById("nivel_educativo").value,
        nombre_grupo: document.getElementById("nombre_grupo").value,
        ciclo_escolar: document.getElementById("ciclo_escolar").value,
        tipo_periodo: document.getElementById("tipo_periodo").value,
        num_periodos: document.getElementById("num_periodos").value,
        modo_calificacion: document.getElementById("modo_calificacion").value,
        tipo_rubrica: document.getElementById("tipo_rubrica").value,
        color_grupo: document.getElementById("color_grupo").value,
        icono_grupo: document.getElementById("icono_grupo").value,
        avisos: document.getElementById("avisos_grupo").value,
        calificacion_minima: document.getElementById("calificacion_minima")
          .value,
        horario: JSON.stringify(horarioArray),
        tolerancia_minutos: document.getElementById("tolerancia_minutos").value,
        minutos_alarma: document.getElementById("minutos_alarma")
          ? document.getElementById("minutos_alarma").value
          : 5,
        sonido_alarma: finalSound,
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

  // Editar Rúbrica Modal
  document
    .getElementById("form-editar-rubrica")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idGrupo = document.getElementById("id_grupo").value;
      const idRubricaEdit = document.getElementById("edit_id_rubrica").value;
      const categoriaEdit = document.getElementById("edit_criterio").value;
      const porcentajeNuevo = parseFloat(
        document.getElementById("edit_porcentaje").value,
      );
      const porcentajeViejo = parseFloat(
        document.getElementById("edit_porcentaje_viejo").value,
      );
      const colorNuevo = document.getElementById("edit_color").value;

      // Validar si el cambio no excede el 100% total
      if (totalPorcentajeActual - porcentajeViejo + porcentajeNuevo > 100) {
        document.getElementById("edit-msg-error").style.display = "block";
        return;
      }
      document.getElementById("edit-msg-error").style.display = "none";

      const res = await fetch("/api/controllers/RubricaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id_grupo: idGrupo,
          id_rubrica: idRubricaEdit,
          categoria: categoriaEdit,
          porcentaje: porcentajeNuevo,
          color: colorNuevo,
          id_periodo: document.getElementById("edit_id_periodo").value,
        }),
      });
      const data = await res.json();

      if (data.success) {
        document
          .getElementById("modal-editar-rubrica")
          .classList.remove("active");
        window.cargarRubricasModal(idGrupo);
      } else {
        mostrarAlerta("Error al editar rúbrica: " + data.message);
      }
    });

  // Modal Transferir Rúbricas Masivamente
  document
    .getElementById("form-transferir-rubricas")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idGrupo = document.getElementById("id_grupo").value;
      const tipoRubrica = document.getElementById("tipo_rubrica").value;
      const sourcePeriod =
        tipoRubrica === "Por Periodo"
          ? document.getElementById("select-periodo-rubrica").value
          : null;
      const targetPeriod = document.getElementById(
        "transfer_target_period",
      ).value;
      const opType = document.getElementById("transfer_op_type").value;

      const res = await fetch("/api/controllers/RubricaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_transfer",
          id_grupo: idGrupo,
          source_period: sourcePeriod,
          target_period: targetPeriod,
          op_type: opType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        document
          .getElementById("modal-transferir-rubricas")
          .classList.remove("active");
        window.cargarRubricasModal(idGrupo);
      } else {
        mostrarAlerta("Error: " + data.message);
      }
    });
});

// Función para pedir grupos al servidor
async function cargarGrupos() {
  const estado = document.getElementById("filtro-estado-grupo")
    ? document.getElementById("filtro-estado-grupo").value
    : 1;
  const res = await fetch(
    `/api/controllers/GrupoController.php?action=list&estado=${estado}`,
  );
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
  document.getElementById("tipo_rubrica").value =
    grupo.tipo_rubrica || "Global";
  document.getElementById("color_grupo").value = grupo.color_grupo || "#8b5cf6";
  document.getElementById("icono_grupo").value =
    grupo.icono_grupo || "fas fa-users";
  document.getElementById("avisos_grupo").value = grupo.avisos || "";

  // Activar o desactivar el contenedor de periodos visualmente
  document.getElementById("container-select-periodo-rubrica").style.display =
    grupo.tipo_rubrica === "Por Periodo" ? "block" : "none";

  document.getElementById("calificacion_minima").value =
    grupo.calificacion_minima;
  document.getElementById("tolerancia_minutos").value =
    grupo.tolerancia_minutos || 15;
  if (document.getElementById("minutos_alarma")) {
    document.getElementById("minutos_alarma").value = grupo.minutos_alarma || 5;
  }
  if (document.getElementById("sonido_alarma")) {
    const sel = document.getElementById("sonido_alarma");
    const opt = Array.from(sel.options).map((o) => o.value);
    const customInput = document.getElementById("sonido_custom");
    if (grupo.sonido_alarma && !opt.includes(grupo.sonido_alarma)) {
      sel.value = "custom";
      customInput.value = grupo.sonido_alarma;
      customInput.style.display = "block";
    } else {
      sel.value =
        grupo.sonido_alarma ||
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
      customInput.style.display = "none";
    }
  }

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

  document.getElementById("btn-tab-rubricas").style.display = "block";
  document.getElementById("btn-tab-periodos").style.display = "block";

  cargarPeriodosModal(id).then(() => {
    window.cargarRubricasModal(id); // Primero cargamos los periodos, luego las rúbricas
  });

  document.getElementById("modal-title").innerText = "Editar Grupo";
  document.getElementById("btn-submit-grupo").innerText = "Guardar Cambios";

  document.querySelector(".tab-btn").click(); // Volver al primer tab
  document.getElementById("modal-grupo").classList.add("active");
};

window.toggleEstadoGrupo = async function (id, estadoActual) {
  const nuevoEstado = estadoActual == 1 ? 0 : 1;
  const mensaje =
    estadoActual == 1
      ? "¿Estás seguro de que deseas ocultar este grupo? No se borrarán los datos, pero desaparecerá del panel principal."
      : "¿Deseas restaurar este grupo para que vuelva a aparecer en tu panel principal?";

  mostrarConfirmacion(mensaje, async () => {
    const res = await fetch("/api/controllers/GrupoController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_status",
        id_grupo: id,
        estado: nuevoEstado,
      }),
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById(`grupo-card-${id}`).remove(); // Quita la tarjeta visualmente al instante
    } else {
      mostrarAlerta("Error al cambiar estado del grupo.");
    }
  });
};

// Función de Renderizado (Pinta la UI mágicamente)
function renderGrupoCard(grupo, isNew = false) {
  const container = document.getElementById("grupos-container");
  const card = document.createElement("div");
  card.className = "card scroll-show";
  card.id = `grupo-card-${grupo.id_grupo}`;

  const color = grupo.color_grupo || "#8b5cf6";
  const icono = grupo.icono_grupo || "fas fa-users";
  const btnToggleIcon = grupo.activo == 1 ? "fa-eye-slash" : "fa-eye";
  const btnToggleColor = grupo.activo == 1 ? "#ef4444" : "#10b981";
  const btnToggleTitle =
    grupo.activo == 1 ? "Ocultar Grupo" : "Restaurar Grupo";

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
              <i class="${icono} card-icon" style="margin-bottom: 0; color: ${color};"></i>
              <span class="badge-active" style="margin-left: 10px; background: ${color}40; border: 1px solid ${color}; color: white; font-size: 0.7rem; vertical-align: top;">${grupo.nivel_educativo}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="abrirModalEdicion(${grupo.id_grupo})" class="btn-icon" title="Configurar Grupo"><i class="fas fa-cog"></i></button>
                <button onclick="toggleEstadoGrupo(${grupo.id_grupo}, ${grupo.activo})" class="btn-icon" title="${btnToggleTitle}" style="color: ${btnToggleColor};"><i class="fas ${btnToggleIcon}"></i></button>
            </div>
        </div>
        <h3 style="margin-bottom: 10px;">${grupo.nombre_grupo}</h3>
        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
          <p style="font-size: 0.9rem;"><i class="fas fa-user-graduate" style="color: var(--text-muted);"></i> <strong style="color: white;">${grupo.num_alumnos || 0}</strong> Alumnos</p>
          <p style="font-size: 0.9rem;"><i class="fas fa-chart-line" style="color: var(--text-muted);"></i> Promedio: <strong style="color: ${grupo.promedio_general >= grupo.calificacion_minima ? "#10b981" : "#ef4444"};">${grupo.promedio_general || "0.0"}</strong></p>
        </div>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-calendar-alt"></i> Ciclo: ${grupo.ciclo_escolar}</p>
        <p style="margin-bottom: 5px; font-size: 0.9rem;"><i class="fas fa-layer-group"></i> Divisiones: ${grupo.num_periodos || 1} ${grupo.tipo_periodo}s</p>
        <p style="margin-bottom: 5px; font-size: 0.85rem;"><i class="fas fa-clock"></i> ${horarioText}</p>
        <div style="margin-top: 20px;">
            <a href="grupo_alumnos.html?id=${grupo.id_grupo}" class="btn" style="width: 100%; justify-content: center; font-size: 0.95rem; padding: 12px; background: linear-gradient(45deg, ${color}, var(--secondary)); border: none; box-shadow: 0 4px 15px ${color}40; color: white;" title="Abrir Panel de la Clase">
                <i class="fas fa-chalkboard"></i> <strong style="margin-left: 5px;">Entrar a la Clase</strong>
            </a>
        </div>
    `;
  // Si es nuevo, ponerlo al principio. Si no, al final.
  if (isNew) container.prepend(card);
  else container.appendChild(card);
}

// ==============================================
// LÓGICA DE RÚBRICAS Y PERIODOS EN EL MODAL
// ==============================================

let totalPorcentajeActual = 0;

window.cargarRubricasModal = async function (idGrupo) {
  const tipoRubrica = document.getElementById("tipo_rubrica").value;
  const idPeriodo = document.getElementById("select-periodo-rubrica").value;
  let url = `/api/controllers/RubricaController.php?action=list&id_grupo=${idGrupo}`;

  if (tipoRubrica === "Por Periodo" && idPeriodo) {
    url += `&id_periodo=${idPeriodo}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  totalPorcentajeActual = 0;
  document.getElementById("lista-rubricas-modal").innerHTML = "";
  if (data.success) {
    data.data.forEach((r) => renderRubricaEnModal(r));
  }
};

function renderRubricaEnModal(rubrica) {
  const lista = document.getElementById("lista-rubricas-modal");
  const li = document.createElement("li");
  li.style.cssText =
    "background: rgba(15, 23, 42, 0.6); padding: 10px 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255, 255, 255, 0.05);";

  const scopeTag = rubrica.nombre_periodo
    ? `<span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; margin-left: 8px; color: var(--text-muted);">${rubrica.nombre_periodo}</span>`
    : `<span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; margin-left: 8px; color: var(--text-muted);">Global</span>`;

  li.innerHTML = `
      <div style="display: flex; align-items: center;">
          <span style="display:inline-block; width: 12px; height: 12px; background: ${rubrica.color || "#8b5cf6"}; border-radius: 50%; margin-right: 8px;"></span>
          <span style="color: var(--text-light);">${rubrica.categoria}</span>
          ${scopeTag}
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--secondary); font-weight: bold; margin-right: 5px;">${rubrica.porcentaje}%</span>
          <button type="button" onclick="duplicarRubricaModal(${rubrica.id_rubrica})" class="btn-icon" style="color: #10b981; font-size: 1rem;" title="Duplicar"><i class="fas fa-copy"></i></button>
          <button type="button" onclick="abrirModalEdicionRubrica(${rubrica.id_rubrica}, '${rubrica.categoria}', ${rubrica.porcentaje}, '${rubrica.color}', ${rubrica.id_periodo || "null"})" class="btn-icon" style="color: var(--primary); font-size: 1rem;" title="Editar"><i class="fas fa-edit"></i></button>
          <button type="button" onclick="eliminarRubricaModal(${rubrica.id_rubrica})" class="btn-icon" style="color: #ef4444; font-size: 1rem;" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
  `;
  lista.appendChild(li);

  totalPorcentajeActual += parseFloat(rubrica.porcentaje);
  actualizarProgresoRubricas();
}

window.duplicarRubricaModal = async function (idRubrica) {
  const idGrupo = document.getElementById("id_grupo").value;
  const tipoRubrica = document.getElementById("tipo_rubrica").value;
  const idPeriodo =
    tipoRubrica === "Por Periodo"
      ? document.getElementById("select-periodo-rubrica").value
      : null;

  const res = await fetch("/api/controllers/RubricaController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "duplicate",
      id_rubrica: idRubrica,
      id_periodo: idPeriodo,
    }),
  });
  const data = await res.json();
  if (data.success) {
    window.cargarRubricasModal(idGrupo);
  } else {
    mostrarAlerta("Error al duplicar rúbrica: " + data.message);
  }
};

window.abrirModalTransferirRubricas = function () {
  const idGrupo = document.getElementById("id_grupo").value;
  if (!idGrupo) {
    mostrarAlerta(
      "Debes guardar el grupo al menos una vez antes de realizar esta acción.",
    );
    return;
  }

  const targetSelect = document.getElementById("transfer_target_period");
  targetSelect.innerHTML =
    '<option value="null">Global (Todos los periodos)</option>';
  const selectPeriodoRub = document.getElementById("select-periodo-rubrica");
  Array.from(selectPeriodoRub.options).forEach((opt) => {
    targetSelect.innerHTML += `<option value="${opt.value}">${opt.text}</option>`;
  });

  document.getElementById("modal-transferir-rubricas").classList.add("active");
};

window.abrirModalEdicionRubrica = function (
  id,
  categoria,
  porcentaje,
  color,
  id_periodo,
) {
  document.getElementById("edit_id_rubrica").value = id;
  document.getElementById("edit_criterio").value = categoria;
  document.getElementById("edit_porcentaje").value = porcentaje;
  document.getElementById("edit_porcentaje_viejo").value = porcentaje;
  document.getElementById("edit_color").value = color || "#8b5cf6";
  document.getElementById("edit_id_periodo").value = id_periodo || "null";

  document.getElementById("container-edit-periodo").style.display =
    document.getElementById("tipo_rubrica").value === "Global"
      ? "none"
      : "block";

  document.getElementById("edit-msg-error").style.display = "none";
  document.getElementById("modal-editar-rubrica").classList.add("active");
};

function actualizarProgresoRubricas() {
  const progress = document.getElementById("progress-bar-rubricas");
  const lblTotal = document.getElementById("lbl-total-rubricas");
  progress.style.width = `${totalPorcentajeActual}%`;
  lblTotal.innerText = `${totalPorcentajeActual}% / 100%`;
  progress.style.background =
    totalPorcentajeActual > 100 ? "#ef4444" : "var(--secondary)";
}

window.eliminarRubricaModal = async function (idRubrica) {
  mostrarConfirmacion("¿Eliminar este criterio de evaluación?", async () => {
    const res = await fetch("/api/controllers/RubricaController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id_rubrica: idRubrica }),
    });
    const data = await res.json();
    if (data.success) {
      window.cargarRubricasModal(document.getElementById("id_grupo").value);
    }
  });
};

async function cargarPeriodosModal(idGrupo) {
  const res = await fetch(
    `/api/controllers/GrupoController.php?action=get&id=${idGrupo}`,
  );
  const data = await res.json();
  if (data.success) {
    const listaPeriodos = document.getElementById("lista-periodos-modal");
    const selectPeriodoRub = document.getElementById("select-periodo-rubrica");
    const editPeriodo = document.getElementById("edit_id_periodo");
    listaPeriodos.innerHTML = "";
    selectPeriodoRub.innerHTML = "";
    if (editPeriodo) {
      editPeriodo.innerHTML = "";
      const optG = document.createElement("option");
      optG.value = "null";
      optG.textContent = "Global (Todos los periodos)";
      editPeriodo.appendChild(optG);
    }
    let periodoActivoName = "Ninguno";

    data.periodos.forEach((p) => {
      const isActivo = p.activo == 1;
      if (isActivo) periodoActivoName = p.nombre_periodo;
      const opt1 = document.createElement("option");
      opt1.value = p.id_periodo;
      opt1.textContent = p.nombre_periodo;
      selectPeriodoRub.appendChild(opt1);
      if (editPeriodo) {
        const opt2 = document.createElement("option");
        opt2.value = p.id_periodo;
        opt2.textContent = p.nombre_periodo;
        editPeriodo.appendChild(opt2);
      }
      listaPeriodos.innerHTML += `
              <li style="background: rgba(15, 23, 42, 0.6); padding: 10px 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; align-items: stretch;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="color: var(--text-light);"><i class="fas fa-calendar-day"></i> ${p.nombre_periodo}</span>
                      ${isActivo ? '<span class="badge-active" style="background: var(--secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: white;">ACTIVO</span>' : ""}
                  </div>
                  <div style="display: flex; gap: 10px;">
                      <div style="flex: 1;">
                          <small style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 3px; display: block;">Inicio</small>
                          <input type="date" class="form-control" style="padding: 6px; font-size: 0.85rem;" value="${p.fecha_inicio || ""}" onchange="guardarFechaPeriodo(${p.id_periodo}, 'inicio', this.value)">
                      </div>
                      <div style="flex: 1;">
                          <small style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 3px; display: block;">Fin</small>
                          <input type="date" class="form-control" style="padding: 6px; font-size: 0.85rem;" value="${p.fecha_fin || ""}" onchange="guardarFechaPeriodo(${p.id_periodo}, 'fin', this.value)">
                      </div>
                  </div>
              </li>
          `;
    });
    document.getElementById("lbl-periodo-activo-modal").innerHTML =
      `<i class="fas fa-calendar-check"></i> Evaluando: ${periodoActivoName}`;
  }
}

window.guardarFechaPeriodo = async function (idPeriodo, tipo, fecha) {
  try {
    await fetch("/api/controllers/PeriodoController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_dates",
        id_periodo: idPeriodo,
        tipo: tipo,
        fecha: fecha,
      }),
    });
  } catch (e) {}
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-add-rubrica")
    ?.addEventListener("click", async () => {
      const idGrupo = document.getElementById("id_grupo").value;
      const criterio = document.getElementById("nueva_rubrica_criterio").value;
      const porcentaje = parseFloat(
        document.getElementById("nueva_rubrica_porcentaje").value,
      );
      const color = document.getElementById("nueva_rubrica_color").value;

      if (!criterio || isNaN(porcentaje)) {
        mostrarAlerta("Ingresa un criterio y porcentaje válido.");
        return;
      }
      if (totalPorcentajeActual + porcentaje > 100) {
        document.getElementById("msg-error-rubrica").style.display = "block";
        return;
      }
      document.getElementById("msg-error-rubrica").style.display = "none";

      const tipoRubrica = document.getElementById("tipo_rubrica").value;
      const idPeriodo =
        tipoRubrica === "Por Periodo"
          ? document.getElementById("select-periodo-rubrica").value
          : null;

      const res = await fetch("/api/controllers/RubricaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id_grupo: idGrupo,
          id_periodo: idPeriodo,
          categoria: criterio,
          porcentaje: porcentaje,
          color: color,
        }),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById("nueva_rubrica_criterio").value = "";
        document.getElementById("nueva_rubrica_porcentaje").value = "";
        renderRubricaEnModal(data.data);
      } else {
        mostrarAlerta("Error: " + data.message);
      }
    });

  document
    .getElementById("btn-siguiente-periodo-modal")
    ?.addEventListener("click", () => {
      const idGrupo = document.getElementById("id_grupo").value;
      mostrarConfirmacion(
        "¿Deseas cerrar este periodo y avanzar al siguiente? Las calificaciones se seguirán guardando pero en la nueva pestaña.",
        async () => {
          const res = await fetch("/api/controllers/PeriodoController.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "next_period", id_grupo: idGrupo }),
          });
          const data = await res.json();
          if (data.success) {
            cargarPeriodosModal(idGrupo);
          } else {
            mostrarAlerta(data.message);
          }
        },
      );
    });
});
