window.mostrarAlerta = function (mensaje) {
  document.getElementById("alerta-mensaje").innerText = mensaje;
  document.getElementById("modal-alerta").classList.add("active");
};

window.switchTabAlumno = function (tabId, btnElem) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  btnElem.classList.add("active");
};

let rawData = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Obtener datos del portal
  try {
    const res = await fetch(
      "/api/controllers/AlumnoPortalController.php?action=dashboard",
    );
    const data = await res.json();

    if (!data.success) {
      window.location.href = "login_alumno.html";
      return;
    }

    rawData = data;

    document.getElementById("nombre-alumno").innerText = data.alumno.nombre;
    document.getElementById("info-grupo").innerText =
      `${data.grupo.nombre_grupo} - ${data.grupo.ciclo_escolar}`;

    if (data.grupo.avisos) {
      document.getElementById("muro-avisos").style.display = "block";
      document.getElementById("texto-avisos").innerText = data.grupo.avisos;
    }

    const selectPeriodo = document.getElementById("select-periodo");
    data.periodos.forEach((p) => {
      selectPeriodo.innerHTML += `<option value="${p.id_periodo}">${p.nombre_periodo} ${p.activo == 1 ? "(ACTIVO)" : ""}</option>`;
    });

    // 2. Renderizar Dashboard
    renderDashboard("all");

    selectPeriodo.addEventListener("change", (e) => {
      renderDashboard(e.target.value);
    });
  } catch (error) {
    console.error("Error al cargar portal:", error);
  }

  document.getElementById("btn-logout").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/controllers/AlumnoPortalController.php?action=logout");
    window.location.href = "../../index.html";
  });
});

function renderDashboard(idPeriodo) {
  if (!rawData) return;
  const {
    grupo,
    periodos,
    rubricas,
    actividades,
    calificaciones,
    asistencias,
    max_asistencias,
    fechas_grupo,
  } = rawData;
  const isGlobal = idPeriodo === "all";

  let actosFiltrados = isGlobal
    ? actividades
    : actividades.filter((a) => a.id_periodo == idPeriodo);
  let sumaTotalPonderada = 0;
  let evalCount = 0;

  const periodosAProcesar = isGlobal
    ? periodos
    : periodos.filter((p) => p.id_periodo == idPeriodo);

  let theadHtml = `<thead><tr><th style="width: 50px; text-align: center;">N°</th><th style="width: 250px;">Alumno</th>`;
  let tbodyHtml = `<tr><td style="text-align: center; color: var(--text-muted); font-weight: bold;">${rawData.alumno.numero_lista || "-"}</td><th>${rawData.alumno.nombre}</th>`;

  periodosAProcesar.forEach((periodo) => {
    const rubricasPeriodo = rubricas.filter(
      (r) => r.id_periodo == periodo.id_periodo || r.id_periodo == null,
    );
    let sumaPeriodo = 0;

    rubricasPeriodo.forEach((rubrica) => {
      const color = rubrica.color || "#8b5cf6";
      if (rubrica.categoria.toLowerCase().includes("asistencia")) {
        let asisPeriodo = asistencias;
        let fechasGrupoPeriodo = fechas_grupo;
        if (!isGlobal && periodo.fecha_inicio && periodo.fecha_fin) {
          const start = new Date(periodo.fecha_inicio + "T00:00:00");
          const end = new Date(periodo.fecha_fin + "T23:59:59");
          asisPeriodo = asistencias.filter((a) => {
            const d = new Date(a.fecha_hora);
            return d >= start && d <= end;
          });
          fechasGrupoPeriodo = fechas_grupo.filter((f) => {
            const d = new Date(f + "T00:00:00");
            return d >= start && d <= end;
          });
        }
        let max_asis_periodo = fechasGrupoPeriodo.length;
        if (max_asis_periodo === 0) max_asis_periodo = 1;

        let asisScore = 0;
        asisPeriodo.forEach((a) => {
          if (a.estado === "Asistencia") asisScore += 1;
          else if (a.estado === "Retardo") asisScore += 0.5;
        });

        const scoreAsis = (asisScore / max_asis_periodo) * 10;
        sumaPeriodo +=
          (scoreAsis > 10 ? 10 : scoreAsis) * (rubrica.porcentaje / 100);

        if (isGlobal || periodo.id_periodo == idPeriodo) {
          theadHtml += `
              <th style="white-space: normal; min-width: 120px; max-width: 150px; vertical-align: bottom;">
                <span style="color: ${color}; font-size: 0.8rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
                <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: var(--text-light); text-align: center;">
                  <i class="fas fa-user-check" style="color: ${color}; margin-right: 5px;"></i>Total (Calc)
                </div>
              </th>`;

          tbodyHtml += `<td style="text-align: center; vertical-align: middle; border-bottom: 2px solid ${color};">
                   <strong>${asisScore}</strong> <span style="color: var(--text-muted); font-size: 0.8rem;">/ ${max_asis_periodo}</span> <br><span style="color: var(--secondary); font-size: 0.8rem; font-weight: bold;">(Nota: ${scoreAsis.toFixed(1)})</span>
            </td>`;
        }
      } else {
        const actosRub = actosFiltrados.filter(
          (a) =>
            a.id_rubrica == rubrica.id_rubrica &&
            a.id_periodo == periodo.id_periodo,
        );
        if (actosRub.length === 0) {
          theadHtml += `<th><span style="color: ${color}; font-size: 0.8rem; font-weight: 800;">${rubrica.categoria}</span><br><i>Sin act.</i></th>`;
          tbodyHtml += `<td>-</td>`;
        } else {
          let sumaRub = 0;
          actosRub.forEach((acto) => {
            const calif = calificaciones.find(
              (c) => c.id_actividad == acto.id_actividad,
            );
            let nota = calif ? parseFloat(calif.puntaje) : "";
            if (nota !== "") sumaRub += nota;

            if (isGlobal || acto.id_periodo == idPeriodo) {
              theadHtml += `
                <th style="white-space: normal; min-width: 150px; max-width: 200px; vertical-align: bottom;">
                  <span style="color: ${color}; font-size: 0.8rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
                  <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); display: inline-block; word-wrap: break-word; font-weight: normal; color: var(--text-light); width: 100%; text-align: left;">
                    <div style="font-weight: 600;"><i class="fas fa-tasks" style="color: ${color}; margin-right: 5px;"></i>${acto.nombre_actividad}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-calendar-alt"></i> Entrega: ${acto.fecha_entrega.split("-").reverse().join("/")}</div>
                  </div>
                </th>`;

              const notaDisplay = nota !== "" ? nota.toFixed(1) : "-";
              const isDanger =
                nota !== "" && nota < grupo.calificacion_minima
                  ? "text-danger"
                  : "";
              const isSuccess =
                nota !== "" && nota >= grupo.calificacion_minima
                  ? "text-success"
                  : "";

              tbodyHtml += `<td style="text-align: center; vertical-align: middle; border-bottom: 2px solid ${color};" class="${isDanger} ${isSuccess}">
                  <span style="font-size: 1.1rem;">${notaDisplay}</span>
              </td>`;

              if (calif) evalCount++;
            }
          });
          sumaPeriodo +=
            (sumaRub / actosRub.length) * (rubrica.porcentaje / 100);
        }
      }
    });
    sumaTotalPonderada += sumaPeriodo;
  });

  theadHtml += `<th class="cell-promedio" style="color: var(--primary);">Promedio Final</th></tr></thead>`;
  const colorClass =
    sumaTotalPonderada >= grupo.calificacion_minima
      ? "text-success"
      : "text-danger";
  tbodyHtml += `<td class="cell-promedio ${colorClass}">${sumaTotalPonderada > 0 ? sumaTotalPonderada.toFixed(1) : "0.0"}</td></tr>`;

  document.getElementById("tabla-calificaciones-alumno").innerHTML =
    theadHtml + `<tbody>${tbodyHtml}</tbody>`;

  const finalGrade = isGlobal
    ? sumaTotalPonderada / (periodosAProcesar.length || 1)
    : sumaTotalPonderada;
  document.getElementById("promedio-general").innerText = finalGrade.toFixed(1);
  document.getElementById("promedio-general").style.color =
    finalGrade >= grupo.calificacion_minima ? "#10b981" : "#ef4444";
  document.getElementById("estado-final").innerText =
    finalGrade >= grupo.calificacion_minima ? "Aprobado" : "En Riesgo";
  document.getElementById("estado-final").className =
    finalGrade >= grupo.calificacion_minima
      ? "status-aprobado"
      : "status-reprobado";
  document.getElementById("porcentaje-asistencia").innerText =
    `${Math.min(Math.round((asistencias.length / max_asistencias) * 100), 100)}%`;
  document.getElementById("tareas-entregadas").innerText =
    `${evalCount}/${actosFiltrados.length}`;

  // Pintar Asistencias con Comentarios filtradas por periodo
  let asistenciasFiltradas = asistencias;
  if (!isGlobal) {
    const per = periodos.find((p) => p.id_periodo == idPeriodo);
    if (per && per.fecha_inicio && per.fecha_fin) {
      const start = new Date(per.fecha_inicio + "T00:00:00");
      const end = new Date(per.fecha_fin + "T23:59:59");
      asistenciasFiltradas = asistencias.filter((a) => {
        const d = new Date(a.fecha_hora);
        return d >= start && d <= end;
      });
    }
  }

  const listaAsis = document.getElementById("lista-asistencias");
  listaAsis.innerHTML =
    asistenciasFiltradas.length === 0
      ? '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Sin registros en este periodo.</td></tr>'
      : "";
  asistenciasFiltradas.forEach((a) => {
    let color = "white",
      icon = "";
    if (a.estado === "Asistencia") {
      color = "#10b981";
      icon = "fa-check";
    } else if (a.estado === "Falta") {
      color = "#ef4444";
      icon = "fa-times";
    } else if (a.estado === "Retardo") {
      color = "#f59e0b";
      icon = "fa-clock";
    }
    listaAsis.innerHTML += `<tr><td style="color: var(--text-muted);">${a.fecha_hora.substring(0, 10).split("-").reverse().join("/")}</td>
        <td style="color: ${color}; font-weight: bold;"><i class="fas ${icon}"></i> ${a.estado}</td>
        <td style="color: var(--text-light); font-size: 0.9rem;">${a.comentario ? `📝 ${a.comentario}` : "-"}</td></tr>`;
  });
}
