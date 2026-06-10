let grupoDatos = null;
let periodosGlobal = [];
let actividadesGlobal = [];
let activeEditor = null; // Para controlar la instancia del editor de texto
let tinymceLoaded = false; // Para saber si el editor ya terminó de cargar
let asistenciasGlobal = []; // Para la memoria de asistencias
let currentAlumnoAsistencia = null; // ID del alumno seleccionado para asistencias

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idGrupo = urlParams.get("id");

  if (!idGrupo) {
    window.location.href = "panel_maestro.html";
    return;
  }

  if (document.getElementById("btn-volver"))
    document.getElementById("btn-volver").href = "panel_maestro.html";
  if (document.getElementById("btn-pase-lista"))
    document.getElementById("btn-pase-lista").style.display = "none";

  // Inyectar Barra de Navegación Integrada (Pestañas)
  inyectarPestanasNavegacion(idGrupo, "calificaciones");

  // 0. Cargar Claves del .env e inicializar el script del Editor (TinyMCE)
  try {
    // Usar la versión Open Source (gratuita) desde CDNJS para evitar errores de API Key o dominios inválidos
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js";
    script.referrerPolicy = "origin";
    script.onload = () => {
      tinymceLoaded = true; // Confirmar que se cargó con éxito
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }

  // 1. Cargar Grupo y Periodos
  try {
    const res = await fetch(
      `/api/controllers/GrupoController.php?action=get&id=${idGrupo}`,
    );
    const data = await res.json();
    grupoDatos = data.grupo;
    periodosGlobal = data.periodos;

    document.getElementById("lbl-nombre-grupo").innerText =
      grupoDatos.nombre_grupo;

    const selectPeriodo = document.getElementById("select-periodo");
    periodosGlobal.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id_periodo;
      option.textContent =
        p.nombre_periodo + (p.activo == 1 ? " (ACTIVO)" : "");
      if (p.activo == 1) option.selected = true;
      selectPeriodo.appendChild(option);
    });

    cargarHojaDeCalculo(
      idGrupo,
      selectPeriodo.value,
      grupoDatos.calificacion_minima,
    );
  } catch (error) {
    console.error("Error:", error);
  }

  // Si cambia de periodo, recarga la hoja
  document.getElementById("select-periodo").addEventListener("change", (e) => {
    cargarHojaDeCalculo(
      idGrupo,
      e.target.value,
      grupoDatos.calificacion_minima,
    );
  });

  // 2. Modal Nueva Actividad
  document
    .getElementById("btn-nueva-actividad")
    .addEventListener("click", () => {
      if (!tinymceLoaded) {
        mostrarAlerta(
          "El editor de texto aún se está conectando. Por favor, espera un segundo.",
        );
        return;
      }

      document.getElementById("modal-actividad-title").innerText =
        "Agregar Actividad";
      document.getElementById("id_actividad").value = "";
      // Ocultar botón de eliminar porque es actividad nueva
      document.getElementById("btn-eliminar-actividad-form").style.display =
        "none";
      document.getElementById("btn-abrir-enlace").style.display = "none";

      const form = document.getElementById("form-actividad");
      form.reset();

      // Mostrar el modal ANTES de inicializar TinyMCE para que no se bloquee
      document.getElementById("modal-actividad").classList.add("active");

      if (activeEditor) {
        tinymce.remove(activeEditor);
        activeEditor = null;
      }

      // Inicializar TinyMCE para el editor de texto enriquecido
      tinymce.init({
        selector: "textarea#descripcion_actividad",
        plugins: "lists link table code help wordcount",
        toolbar:
          "undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link | removeformat",
        skin: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "oxide-dark"
          : "oxide",
        content_css: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "default",
        setup: (editor) => {
          activeEditor = editor;
        },
      });
    });

  document
    .getElementById("btn-cerrar-modal-actividad")
    .addEventListener("click", () => cerrarModalActividad());

  document
    .getElementById("form-actividad")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const idActividad = document.getElementById("id_actividad").value;
      const payload = {
        action: idActividad ? "update_actividad" : "create_actividad",
        id_actividad: idActividad,
        id_rubrica: document.getElementById("id_rubrica").value,
        id_periodo: document.getElementById("select-periodo").value,
        nombre_actividad: document.getElementById("nombre_actividad").value,
        descripcion: activeEditor
          ? activeEditor.getContent()
          : document.getElementById("descripcion_actividad").value,
        enlace: document.getElementById("enlace_actividad").value,
        fecha_entrega: document.getElementById("fecha_entrega").value,
      };

      try {
        const res = await fetch("/api/controllers/CalificacionController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          cerrarModalActividad();
          cargarHojaDeCalculo(
            idGrupo,
            document.getElementById("select-periodo").value,
            grupoDatos.calificacion_minima,
          );
        } else {
          mostrarAlerta("Error al crear la actividad: " + data.message);
        }
      } catch (error) {
        mostrarAlerta("Error de conexión o del servidor. Revisa la consola.");
        console.error("Error en fetch:", error);
      }
    });

  // LÓGICA DE EXPORTACIÓN A EXCEL Y PDF
  document
    .getElementById("btn-export-excel")
    ?.addEventListener("click", async () => {
      if (typeof ExcelJS === "undefined") {
        mostrarAlerta(
          "El bloqueador de anuncios de tu navegador impidió cargar el motor de Excel. Desactívalo temporalmente en este sitio y recarga la página.",
        );
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Calificaciones");

      const nombrePeriodo =
        document.getElementById("select-periodo").options[
          document.getElementById("select-periodo").selectedIndex
        ].text;

      // 1. Cabeceras del archivo (Logo y Títulos)
      try {
        const logoRes = await fetch("../../assets/Logo.png");
        const logoBlob = await logoRes.blob();
        const logoBuffer = await logoBlob.arrayBuffer();
        const logoId = workbook.addImage({
          buffer: logoBuffer,
          extension: "png",
        });
        sheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 45, height: 45 },
        });
      } catch (e) {
        console.log("No se pudo cargar el logo");
      }

      sheet.getRow(1).height = 40;
      sheet.mergeCells("B1:E1");
      const titleCell = sheet.getCell("B1");
      titleCell.value = "Reporte de Calificaciones - EvaLiA";
      titleCell.font = { size: 16, bold: true, color: { argb: "FF8B5CF6" } };
      titleCell.alignment = { vertical: "middle", horizontal: "left" };

      sheet.mergeCells("B2:E2");
      sheet.getCell("B2").value =
        `Grupo: ${grupoDatos.nombre_grupo} | Ciclo: ${grupoDatos.ciclo_escolar}`;
      sheet.getCell("B2").font = { size: 12, bold: true };

      sheet.mergeCells("B3:E3");
      sheet.getCell("B3").value = `Periodo Seleccionado: ${nombrePeriodo}`;
      sheet.getCell("B3").font = {
        size: 11,
        italic: true,
        color: { argb: "FF666666" },
      };

      sheet.addRow([]); // Fila vacía para separar

      // Convertidor de color RGB (del HTML) a ARGB (Para Excel)
      const rgbToArgb = (rgb) => {
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues) return "FF8B5CF6"; // Morado por defecto
        const r = parseInt(rgbValues[0]).toString(16).padStart(2, "0");
        const g = parseInt(rgbValues[1]).toString(16).padStart(2, "0");
        const b = parseInt(rgbValues[2]).toString(16).padStart(2, "0");
        return `FF${r}${g}${b}`.toUpperCase();
      };

      const table = document.getElementById("tabla-calificaciones");
      const theadTr = table.querySelector("thead tr");
      const headerRow = sheet.addRow([]);

      // 2. Construir Columnas y Pintar Colores de las Rúbricas
      Array.from(theadTr.cells).forEach((th, index) => {
        let text = th.innerText
          .replace(/\n/g, " - ")
          .replace("Total (Calc)", "Total")
          .trim();
        const cell = headerRow.getCell(index + 1);
        cell.value = text;

        const span = th.querySelector("span");
        if (span && span.style.color) {
          const argb = rgbToArgb(span.style.color);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: argb },
          };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0F172A" },
          };
        }

        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (index === 0)
          sheet.getColumn(index + 1).width = 5; // N°
        else if (index === 1)
          sheet.getColumn(index + 1).width = 35; // Nombre
        else sheet.getColumn(index + 1).width = 20; // Calificaciones
      });
      headerRow.height = 35;

      // 3. Insertar Datos de los Alumnos, alinear y poner bordes
      const tbody = table.querySelector("tbody");
      Array.from(tbody.rows).forEach((tr) => {
        const row = sheet.addRow([]);
        Array.from(tr.cells).forEach((td, index) => {
          const cell = row.getCell(index + 1);

          let val = "";
          const input = td.querySelector("input");
          if (input) val = input.value;
          else
            val = td.innerText
              .replace(/\n/g, " ")
              .replace(" (Nota:", " - Nota:")
              .replace(")", "")
              .trim();

          if (val !== "" && !isNaN(val) && index !== 1)
            cell.value = parseFloat(val);
          else cell.value = val;

          cell.alignment = {
            vertical: "middle",
            horizontal: index === 1 ? "left" : "center",
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Colorear verde o rojo si aprobó o reprobó
          if (td.classList.contains("text-danger")) {
            cell.font = { color: { argb: "FFEF4444" }, bold: true };
          } else if (td.classList.contains("text-success")) {
            cell.font = { color: { argb: "FF10B981" }, bold: true };
          }
        });
      });

      // 4. Descargar Archivo Físico
      const buffer = await workbook.xlsx.writeBuffer();
      const safeName = grupoDatos.nombre_grupo
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      saveAs(new Blob([buffer]), `Calificaciones_${safeName}.xlsx`);
    });

  document.getElementById("btn-export-pdf")?.addEventListener("click", () => {
    window.print();
  });

  // --- NAVEGACIÓN ESTILO EXCEL PARA CALIFICACIONES ---
  document.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("grade-input")) {
      let currentTd = e.target.closest("td");
      let currentTr = currentTd.parentElement;
      let index = Array.from(currentTr.children).indexOf(currentTd);

      let targetInput = null;
      if (e.key === "ArrowUp") {
        let prevTr = currentTr.previousElementSibling;
        if (prevTr)
          targetInput = prevTr.children[index]?.querySelector("input");
      } else if (e.key === "ArrowDown") {
        let nextTr = currentTr.nextElementSibling;
        if (nextTr)
          targetInput = nextTr.children[index]?.querySelector("input");
      }

      if (targetInput) {
        e.preventDefault();
        targetInput.focus();
        targetInput.select();
      }
    }
  });
});

function cerrarModalActividad() {
  if (activeEditor) {
    tinymce.remove(activeEditor);
    activeEditor = null;
  }
  document.getElementById("modal-actividad").classList.remove("active");
}

window.mostrarAlerta = function (mensaje) {
  alert(mensaje); // Placeholder, as the alert modal is in other files.
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

// --- MOTOR DE LA HOJA DE CÁLCULO ---
async function cargarHojaDeCalculo(idGrupo, idPeriodo, minAprobatoria) {
  const res = await fetch(
    `/api/controllers/CalificacionController.php?action=get_grid&id_grupo=${idGrupo}&id_periodo=${idPeriodo}`,
  );
  const data = await res.json();

  actividadesGlobal = data.actividades; // Guardamos las actividades en memoria
  asistenciasGlobal = data.asistencias || []; // Guardamos las asistencias

  // Llenar selector de Rúbricas para el Modal
  const selectRub = document.getElementById("id_rubrica");
  selectRub.innerHTML = "";
  data.rubricas.forEach((r) => {
    // Filtrar para no mostrar rúbricas de Asistencia como actividades manuales
    if (!r.categoria.toLowerCase().includes("asistencia")) {
      const color = r.color || "#8b5cf6";
      selectRub.innerHTML += `<option value="${r.id_rubrica}" style="color: ${color}; font-weight: bold;">&#9632; ${r.categoria} (${r.porcentaje}%)</option>`;
    }
  });

  const tabla = document.getElementById("tabla-calificaciones");
  tabla.innerHTML = "";

  // Remover el scroll interno para mejorar la experiencia de usuario
  if (tabla.parentElement) {
    tabla.parentElement.style.maxHeight = "none";
    tabla.parentElement.style.overflowY = "visible";
  }

  // 1. DIBUJAR CABECERAS (THEAD)
  let thead = `<thead><tr><th style="width: 50px; text-align: center;">N°</th><th style="width: 250px;">Alumno</th>`;
  data.rubricas.forEach((rubrica) => {
    const color = rubrica.color || "#8b5cf6";

    // Si es rúbrica de asistencia, generamos una sola columna maestra
    if (rubrica.categoria.toLowerCase().includes("asistencia")) {
      thead += `
        <th style="white-space: normal; min-width: 120px; max-width: 150px; vertical-align: bottom;">
          <span style="color: ${color}; font-size: 0.8rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
          <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: var(--text-light); text-align: center;">
            <i class="fas fa-user-check" style="color: ${color}; margin-right: 5px;"></i>Total (Calc)
          </div>
        </th>`;
    } else {
      const actos = data.actividades.filter(
        (a) => a.id_rubrica === rubrica.id_rubrica,
      );
      if (actos.length === 0) {
        thead += `<th><span style="color: ${color}; font-size: 0.8rem; font-weight: 800;">${rubrica.categoria}</span><br><i>Sin act.</i></th>`;
      } else {
        actos.forEach((a) => {
          thead += `
            <th style="white-space: normal; min-width: 150px; max-width: 200px; vertical-align: bottom;">
              <span style="color: ${color}; font-size: 0.8rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
              <div onclick="editarActividad(${a.id_actividad})" style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); display: inline-block; transition: 0.2s; word-wrap: break-word; font-weight: normal; color: var(--text-light); width: 100%; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='${color}';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)';" title="Ver o Editar Actividad">
                <div style="font-weight: 600;"><i class="fas fa-tasks" style="color: ${color}; margin-right: 5px;"></i>${a.nombre_actividad}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-calendar-alt"></i> Entrega: ${a.fecha_entrega.split("-").reverse().join("/")}</div>
              </div>
            </th>`;
        });
      }
    }
  });
  thead += `<th class="cell-promedio" style="color: var(--primary);">Promedio Final</th></tr></thead>`;
  tabla.innerHTML += thead;

  // 2. DIBUJAR FILAS DE ALUMNOS (TBODY)
  let tbody = `<tbody>`;
  let nLista = 1;

  // Filtrar asistencias según el periodo seleccionado para un cálculo preciso
  const selectedPeriodoObj = periodosGlobal.find(
    (p) => p.id_periodo == idPeriodo,
  );
  let asistenciasFiltradas = asistenciasGlobal;
  if (
    selectedPeriodoObj &&
    selectedPeriodoObj.fecha_inicio &&
    selectedPeriodoObj.fecha_fin
  ) {
    const start = new Date(selectedPeriodoObj.fecha_inicio + "T00:00:00");
    const end = new Date(selectedPeriodoObj.fecha_fin + "T23:59:59");
    asistenciasFiltradas = asistenciasGlobal.filter((a) => {
      const d = new Date(a.fecha_hora);
      return d >= start && d <= end;
    });
  }

  // Calcular el máximo de asistencias (Total de clases impartidas = días únicos registrados en el grupo)
  let fechasUnicas = new Set(
    asistenciasFiltradas.map((a) =>
      a.fecha_hora ? a.fecha_hora.substring(0, 10) : "",
    ),
  );
  fechasUnicas.delete(""); // Remover inválidos si los hay
  let maxAsistencias = fechasUnicas.size;
  if (maxAsistencias === 0) maxAsistencias = 1;

  data.alumnos.forEach((alumno) => {
    tbody += `<tr><td style="text-align: center; color: var(--text-muted); font-weight: bold;">${nLista++}</td><th>${alumno.nombre}</th>`;

    let sumaFinal = 0; // Para el promedio total
    let porcentajeEvaluado = 0; // Para escalar equitativamente

    data.rubricas.forEach((rubrica) => {
      if (rubrica.categoria.toLowerCase().includes("asistencia")) {
        const asisAlumno = asistenciasFiltradas.filter(
          (a) => a.id_alumno == alumno.id_alumno,
        );

        let asisScore = 0;
        asisAlumno.forEach((a) => {
          if (a.estado === "Asistencia") asisScore += 1;
          else if (a.estado === "Retardo") asisScore += 0.5;
        });

        const scoreAsis = (asisScore / maxAsistencias) * 10;
        sumaFinal += scoreAsis * (rubrica.porcentaje / 100);
        porcentajeEvaluado += parseFloat(rubrica.porcentaje);

        tbody += `<td style="text-align: center; vertical-align: middle;">
            <button onclick="verAsistencias(${alumno.id_alumno}, '${alumno.nombre}')" style="background: transparent; border: none; border-bottom: 2px solid ${rubrica.color || "#8b5cf6"}; cursor: pointer; color: white; width: 100%; padding: 10px 0; font-family: 'Inter', sans-serif;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" title="Ver/Editar Asistencias">
               <strong>${asisScore}</strong> <span style="color: var(--text-muted); font-size: 0.8rem;">/ ${maxAsistencias}</span> <br><span style="color: var(--secondary); font-size: 0.8rem; font-weight: bold;">(Nota: ${scoreAsis.toFixed(1)})</span>
            </button>
        </td>`;
      } else {
        const actos = data.actividades.filter(
          (a) => a.id_rubrica === rubrica.id_rubrica,
        );
        let sumaRubrica = 0;
        let actsEvaluadas = 0;

        if (actos.length === 0) {
          tbody += `<td>-</td>`;
        } else {
          actos.forEach((a) => {
            // Buscar si tiene calificación guardada
            const calif = data.calificaciones.find(
              (c) =>
                c.id_alumno === alumno.id_alumno &&
                c.id_actividad === a.id_actividad,
            );
            const puntaje =
              calif && calif.puntaje !== null ? calif.puntaje : "";
            if (puntaje !== "") {
              sumaRubrica += parseFloat(puntaje);
              actsEvaluadas++;
            }

            tbody += `<td>
                        <input type="number" class="grade-input" style="border-bottom: 2px solid ${rubrica.color || "#8b5cf6"};" data-alumno="${alumno.id_alumno}" data-actividad="${a.id_actividad}" value="${puntaje}" min="0" max="10" step="0.1" onblur="guardarCalificacion(this, ${minAprobatoria})">
                    </td>`;
          });
          if (actsEvaluadas > 0) {
            // Calcular el peso de esta rúbrica: (Promedio de sus actividades) * Porcentaje / 100
            const promedioRubrica = sumaRubrica / actsEvaluadas;
            sumaFinal += promedioRubrica * (rubrica.porcentaje / 100);
            porcentajeEvaluado += parseFloat(rubrica.porcentaje);
          }
        }
      }
    });

    // Columna de Promedio Final
    let promedioReal =
      porcentajeEvaluado > 0 ? sumaFinal / (porcentajeEvaluado / 100) : 0;
    const colorClass =
      promedioReal >= minAprobatoria ? "text-success" : "text-danger";
    tbody += `<td class="cell-promedio ${colorClass}" id="promFinal-${alumno.id_alumno}">${promedioReal > 0 ? promedioReal.toFixed(1) : "0.0"}</td></tr>`;
  });
  tbody += `</tbody>`;
  tabla.innerHTML += tbody;
}

window.editarActividad = function (idActividad) {
  const act = actividadesGlobal.find((a) => a.id_actividad == idActividad);
  if (!act) return;

  document.getElementById("modal-actividad-title").innerText =
    "Editar Actividad";
  document.getElementById("id_actividad").value = act.id_actividad;
  document.getElementById("id_rubrica").value = act.id_rubrica;
  document.getElementById("nombre_actividad").value = act.nombre_actividad;
  document.getElementById("fecha_entrega").value = act.fecha_entrega;
  document.getElementById("enlace_actividad").value = act.enlace || "";

  const btnEnlace = document.getElementById("btn-abrir-enlace");
  if (act.enlace) {
    btnEnlace.href = act.enlace;
    btnEnlace.style.display = "flex";
  } else {
    btnEnlace.style.display = "none";
  }

  // Mostrar y configurar el botón de eliminar
  const btnEliminar = document.getElementById("btn-eliminar-actividad-form");
  btnEliminar.style.display = "flex";
  btnEliminar.onclick = () => eliminarActividad(act.id_actividad);

  if (!tinymceLoaded) {
    mostrarAlerta(
      "El editor de texto aún se está conectando. Por favor, espera un segundo.",
    );
    return;
  }

  document.getElementById("modal-actividad").classList.add("active");

  if (activeEditor) {
    tinymce.remove(activeEditor);
    activeEditor = null;
  }

  tinymce.init({
    selector: "textarea#descripcion_actividad",
    plugins: "lists link table code help wordcount",
    toolbar:
      "undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | link | removeformat",
    skin: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "oxide-dark"
      : "oxide",
    content_css: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "default",
    setup: (editor) => {
      activeEditor = editor;
      editor.on("init", () => {
        editor.setContent(act.descripcion || "");
      });
    },
  });
};

window.eliminarActividad = function (idActividad) {
  mostrarConfirmacion(
    "¿Estás seguro de que deseas eliminar esta actividad? Se borrarán las calificaciones asociadas.",
    async () => {
      try {
        const res = await fetch("/api/controllers/CalificacionController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete_actividad",
            id_actividad: idActividad,
          }),
        });
        const data = await res.json();
        if (data.success) {
          cerrarModalActividad();
          const idGrupo = new URLSearchParams(window.location.search).get("id");
          const idPeriodo = document.getElementById("select-periodo").value;
          cargarHojaDeCalculo(
            idGrupo,
            idPeriodo,
            grupoDatos.calificacion_minima,
          );
        } else {
          mostrarAlerta(data.message);
        }
      } catch (e) {
        console.error(e);
      }
    },
  );
};
// 4. FUNCIÓN SILENCIOSA QUE GUARDA EN TIEMPO REAL AL QUITAR EL CURSOR
window.guardarCalificacion = async function (inputElem, minAprobatoria) {
  let valor = inputElem.value;
  if (valor === "") valor = 0;

  const payload = {
    action: "save_nota",
    id_alumno: inputElem.getAttribute("data-alumno"),
    id_actividad: inputElem.getAttribute("data-actividad"),
    puntaje: parseFloat(valor),
  };

  try {
    const res = await fetch("/api/controllers/CalificacionController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      // Mostrar el "Toast" verde de guardado
      const toast = document.getElementById("toast-save");
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
      }, 2000);

      // Refrescar toda la tabla para recalcular todos los promedios al instante
      const idGrupo = new URLSearchParams(window.location.search).get("id");
      const idPeriodo = document.getElementById("select-periodo").value;
      cargarHojaDeCalculo(idGrupo, idPeriodo, minAprobatoria);
    }
  } catch (e) {
    console.error("Error al guardar:", e);
  }
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
