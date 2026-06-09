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

  // 1. Obtener Grupo y Periodos
  try {
    const res = await fetch(
      `/api/controllers/GrupoController.php?action=get&id=${idGrupo}`,
    );
    const data = await res.json();

    if (data.success) {
      document.getElementById("lbl-nombre-grupo").innerText =
        data.grupo.nombre_grupo;

      // Renderizar Periodos
      const listaPeriodos = document.getElementById("lista-periodos");
      let periodoActivoName = "Ninguno";
      data.periodos.forEach((p) => {
        const isActivo = p.activo == 1;
        if (isActivo) {
          periodoActivoName = p.nombre_periodo;
        }
        listaPeriodos.innerHTML += `
                    <li style="flex-direction: column; align-items: stretch;">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
                          <span style="color: var(--text-light);"><i class="fas fa-calendar-day"></i> ${p.nombre_periodo}</span>
                          ${isActivo ? '<span class="badge-active">ACTIVO</span>' : ""}
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 3px; display: block;">Fecha Inicio</small>
                                <input type="date" class="form-control" style="padding: 6px; font-size: 0.85rem;" value="${p.fecha_inicio || ""}" onchange="guardarFechaPeriodo(${p.id_periodo}, 'inicio', this.value)">
                            </div>
                            <div style="flex: 1;">
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 3px; display: block;">Fecha Fin</small>
                                <input type="date" class="form-control" style="padding: 6px; font-size: 0.85rem;" value="${p.fecha_fin || ""}" onchange="guardarFechaPeriodo(${p.id_periodo}, 'fin', this.value)">
                            </div>
                        </div>
                    </li>
                `;
      });

      const lblActivo = document.getElementById("lbl-periodo-activo");
      if (lblActivo) {
        lblActivo.innerHTML = `<i class="fas fa-calendar-check"></i> Evaluando: ${periodoActivoName}`;
      }

      // Botón para avanzar al siguiente periodo
      const btnSiguiente = document.getElementById("btn-siguiente-periodo");
      if (btnSiguiente) {
        btnSiguiente.onclick = () => {
          mostrarConfirmacion(
            "¿Deseas cerrar este periodo y avanzar al siguiente? Las calificaciones se seguirán guardando pero en la nueva pestaña.",
            async () => {
              const resP = await fetch(
                "/api/controllers/PeriodoController.php",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "next_period",
                    id_grupo: idGrupo,
                  }),
                },
              );
              const dataP = await resP.json();
              if (dataP.success) {
                window.location.reload();
              } else {
                mostrarAlerta(dataP.message);
              }
            },
          );
        };
      }
    } else {
      mostrarAlerta(data.message);
      window.location.href = "panel_maestro.html";
    }
  } catch (error) {
    console.error("Error al cargar grupo:", error);
  }

  // 2. Cargar Rúbricas existentes
  cargarRubricas(idGrupo);

  // Lógica del Tutorial de Rúbricas
  const modalAyuda = document.getElementById("modal-ayuda-rubrica");
  document
    .getElementById("btn-ayuda-rubrica")
    .addEventListener("click", () => modalAyuda.classList.add("active"));
  document
    .getElementById("btn-cerrar-ayuda-r")
    .addEventListener("click", () => modalAyuda.classList.remove("active"));
  document
    .getElementById("btn-entendido-r")
    .addEventListener("click", () => modalAyuda.classList.remove("active"));

  // 3. Crear Nueva Rúbrica
  document
    .getElementById("form-rubrica")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const criterio = document.getElementById("criterio").value;
      const porcentaje = parseFloat(
        document.getElementById("porcentaje").value,
      );
      const color = document.getElementById("color").value;

      // Validar que no sobrepase el 100%
      if (totalPorcentajeActual + porcentaje > 100) {
        document.getElementById("msg-error").style.display = "block";
        return;
      }
      document.getElementById("msg-error").style.display = "none";

      const res = await fetch("/api/controllers/RubricaController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id_grupo: idGrupo,
          categoria: criterio,
          porcentaje: porcentaje,
          color: color,
        }),
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById("form-rubrica").reset();
        renderRubricaCard(data.data);
      } else {
        mostrarAlerta("Error al agregar rúbrica: " + data.message);
      }
    });

  // 4. Editar Rúbrica
  document
    .getElementById("form-editar-rubrica")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
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
          id_periodo: null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        document
          .getElementById("modal-editar-rubrica")
          .classList.remove("active");
        document.getElementById("lista-rubricas").innerHTML = "";
        totalPorcentajeActual = 0;
        cargarRubricas(idGrupo);
      }
    });
});

let totalPorcentajeActual = 0;

async function cargarRubricas(idGrupo) {
  const res = await fetch(
    `/api/controllers/RubricaController.php?action=list&id_grupo=${idGrupo}`,
  );
  const data = await res.json();

  if (data.success) {
    data.data.forEach((rubrica) => renderRubricaCard(rubrica));
  }
}

// Función Global para guardar las fechas de los periodos
window.guardarFechaPeriodo = async function (idPeriodo, tipo, fecha) {
  try {
    const res = await fetch("/api/controllers/PeriodoController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_dates",
        id_periodo: idPeriodo,
        tipo: tipo,
        fecha: fecha,
      }),
    });
    const data = await res.json();
    if (data.success) {
      const toast = document.getElementById("toast-save");
      if (toast) {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateY(20px)";
        }, 2000);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

// Función Global para Abrir el Modal de Edición
window.abrirModalEdicionRubrica = function (id, categoria, porcentaje, color) {
  document.getElementById("edit_id_rubrica").value = id;
  document.getElementById("edit_criterio").value = categoria;
  document.getElementById("edit_porcentaje").value = porcentaje;
  document.getElementById("edit_porcentaje_viejo").value = porcentaje;
  document.getElementById("edit_color").value = color || "#8b5cf6";
  document.getElementById("modal-editar-rubrica").classList.add("active");
};

window.duplicarRubrica = async function (idRubrica) {
  const idGrupo = new URLSearchParams(window.location.search).get("id");
  const res = await fetch("/api/controllers/RubricaController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "duplicate",
      id_rubrica: idRubrica,
      id_periodo: null,
    }),
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById("lista-rubricas").innerHTML = ""; // Limpiar lista
    totalPorcentajeActual = 0; // Reiniciar cuenta
    cargarRubricas(idGrupo); // Recargar lista
  }
};

// Función Global para Eliminar Rúbrica
window.eliminarRubrica = async function (idRubrica) {
  mostrarConfirmacion(
    "¿Estás seguro de que deseas eliminar este criterio de evaluación?",
    async () => {
      try {
        const res = await fetch("/api/controllers/RubricaController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_rubrica: idRubrica }),
        });
        const data = await res.json();

        if (data.success) {
          document.getElementById("lista-rubricas").innerHTML = ""; // Limpiar lista
          totalPorcentajeActual = 0; // Reiniciar cuenta
          cargarRubricas(new URLSearchParams(window.location.search).get("id")); // Recargar lista
        }
      } catch (error) {
        console.error("Error al eliminar rúbrica:", error);
      }
    },
  );
};

function renderRubricaCard(rubrica) {
  const lista = document.getElementById("lista-rubricas");
  const li = document.createElement("li");
  li.innerHTML = `
        <span style="color: var(--text-light);"><span style="display:inline-block; width: 12px; height: 12px; background: ${rubrica.color || "#8b5cf6"}; border-radius: 50%; margin-right: 8px;"></span>${rubrica.categoria}</span>
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="color: var(--secondary); font-weight: bold;">${rubrica.porcentaje}%</span>
            <button onclick="duplicarRubrica(${rubrica.id_rubrica})" class="btn-icon" style="color: #10b981; font-size: 1rem;" title="Duplicar criterio"><i class="fas fa-copy"></i></button>
            <button onclick="abrirModalEdicionRubrica(${rubrica.id_rubrica}, '${rubrica.categoria}', ${rubrica.porcentaje}, '${rubrica.color}', null)" class="btn-icon" style="color: var(--primary); font-size: 1rem;" title="Editar criterio"><i class="fas fa-edit"></i></button>
            <button onclick="eliminarRubrica(${rubrica.id_rubrica})" class="btn-icon" style="color: #ef4444; font-size: 1rem;" title="Eliminar criterio"><i class="fas fa-trash"></i></button>
        </div>
    `;
  lista.appendChild(li);

  // Actualizar Progreso
  totalPorcentajeActual += parseFloat(rubrica.porcentaje);
  const progress = document.getElementById("progress-bar");
  const lblTotal = document.getElementById("lbl-total");

  progress.style.width = `${totalPorcentajeActual}%`;
  lblTotal.innerText = `${totalPorcentajeActual}% / 100%`;

  if (totalPorcentajeActual === 100)
    progress.className = "progress-bar success";
  else if (totalPorcentajeActual > 100)
    progress.className = "progress-bar error";
  else progress.className = "progress-bar";
}
