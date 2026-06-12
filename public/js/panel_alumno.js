// ================================================================
//  EvaLiA — Portal del Alumno v10
//  Mejoras: PDF profesional, tabla responsive, tutorial interactivo
// ================================================================

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

window.toggleAccordion = function (id, headerElem, event) {
  if (event && event.target.closest("button")) return;
  const content = document.getElementById(id);
  const icon = headerElem.querySelector("i.fa-chevron-down, i.fa-chevron-up");
  if (content.classList.contains("collapsed")) {
    content.classList.remove("collapsed");
    if (icon) icon.classList.replace("fa-chevron-down", "fa-chevron-up");
  } else {
    content.classList.add("collapsed");
    if (icon) icon.classList.replace("fa-chevron-up", "fa-chevron-down");
  }
};

window.solicitarNotificaciones = function () {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      document.getElementById("notif-banner").style.display = "none";
      new Notification("EvaLiA", {
        body: "Notificaciones activadas correctamente.",
      });
    } else {
      mostrarAlerta(
        "Debes habilitar las notificaciones desde el candadito en la barra de direcciones de tu navegador.",
      );
    }
  });
};

let rawData = null;
let rendimientoChartInstance = null;
let rubricasChartInstance = null;
let asistenciasChartInstance = null;

// ================================================================
//  TUTORIAL INTERACTIVO
// ================================================================
const tutorialSteps = [
  {
    target: "#nombre-alumno",
    title: "👋 ¡Bienvenido a tu Portal!",
    description:
      "Aquí aparece tu nombre. Cada vez que entres, este es tu espacio personal donde puedes ver todo tu desempeño académico.",
    position: "bottom",
    tab: "tab-dashboard",
  },
  {
    target: ".stat-card:nth-child(1), #promedio-general",
    title: "📊 Promedio General",
    description:
      "Este número es tu promedio ponderado del periodo seleccionado. Considera el peso de cada categoría (rúbrica) definida por tu maestro.",
    position: "bottom",
    tab: "tab-dashboard",
  },
  {
    target: "#tareas-entregadas",
    title: "✅ Actividades Entregadas",
    description:
      "Aquí ves cuántas actividades ya tienen calificación registrada del total. Si ves '4/4', significa que completaste todas.",
    position: "bottom",
    tab: "tab-dashboard",
  },
  {
    target: "#dashboard-charts-grid",
    title: "📈 Tus Gráficas de Rendimiento",
    description:
      "Aquí puedes ver visualmente cómo ha evolucionado tu promedio, tu desempeño en cada rúbrica y tu registro de asistencias.",
    position: "top",
    tab: "tab-dashboard",
  },
  {
    target: ".tabs-container",
    title: "🗂️ Pestañas de Navegación",
    description:
      "Usa estas pestañas para cambiar entre tu 'Dashboard' principal, tu 'Tabla de Calificaciones' detallada y tu 'Historial de Asistencias'.",
    position: "bottom",
    tab: "tab-dashboard",
  },
  {
    target: "#tab-calificaciones",
    title: "📋 Tabla de Calificaciones",
    description:
      "Esta es tu boleta digital. Cada columna es una actividad. Puedes hacer clic en el nombre de la actividad para ver detalles.",
    position: "top",
    tab: "tab-calificaciones",
  },
  {
    target: "[onclick*='exportarPDFPeriodo']",
    title: "📄 Exportar a PDF",
    description:
      "Con este botón puedes descargar un reporte profesional de tus calificaciones del periodo.",
    position: "left",
    tab: "tab-calificaciones",
  },
  {
    target: "#btn-logout",
    title: "🚪 Cerrar Sesión",
    description:
      "Cuando termines, usa este botón para salir de forma segura. ¡Eso es todo! Ya conoces tu portal.",
    position: "bottom",
    tab: "tab-calificaciones",
  },
];

let tutorialCurrentStep = 0;
let tutorialOverlay = null;
let tutorialSpotlight = null;
let tutorialCard = null;

function handleTutorialResize() {
  if (tutorialCurrentStep >= 0 && tutorialCurrentStep < tutorialSteps.length) {
    const step = tutorialSteps[tutorialCurrentStep];
    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      posicionarSpotlight(targetEl, step);
      renderTutorialCard(step, tutorialCurrentStep);
    }
  }
}

window.iniciarTutorial = function () {
  tutorialCurrentStep = 0;

  // Asegurarse de que la pestaña de dashboard esté activa para el tutorial
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((t) => t.classList.remove("active"));
  const tabDash = document.getElementById("tab-dashboard");
  if (tabDash) tabDash.classList.add("active");
  const btnDash = document.querySelector(".tab-btn[onclick*='tab-dashboard']");
  if (btnDash) btnDash.classList.add("active");

  // Expandir el primer acordeón si está colapsado
  const firstAccordion = document.querySelector(".accordion-content");
  if (firstAccordion && firstAccordion.classList.contains("collapsed")) {
    firstAccordion.classList.remove("collapsed");
  }

  buildTutorialDOM();
  window.mostrarPasoTutorial(0);
  window.addEventListener("resize", handleTutorialResize);
};

function buildTutorialDOM() {
  // Eliminar instancia anterior si existe
  const old = document.getElementById("tutorial-overlay");
  if (old) old.remove();

  const styles = document.createElement("style");
  styles.id = "tutorial-styles";
  const oldStyles = document.getElementById("tutorial-styles");
  if (oldStyles) oldStyles.remove();
  styles.textContent = `
    #tutorial-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 9000;
      pointer-events: none;
    }
    #tutorial-mask {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.72);
      transition: all 0.4s ease;
    }
    #tutorial-spotlight {
      position: absolute;
      border-radius: 12px;
      box-shadow:
        0 0 0 4px rgba(139, 92, 246, 0.8),
        0 0 0 9999px rgba(0,0,0,0.72);
      transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
      pointer-events: none;
      z-index: 9001;
      background: transparent;
    }
    #tutorial-card {
      position: absolute;
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      border: 1px solid rgba(139, 92, 246, 0.5);
      border-radius: 16px;
      padding: 24px;
      width: min(360px, 90vw);
      box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.2);
      z-index: 9002;
      pointer-events: all;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
      animation: tutCardIn 0.4s ease-out;
    }
    @keyframes tutCardIn {
      from { opacity: 0; transform: translateY(10px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)  scale(1); }
    }
    #tutorial-card .tut-step-badge {
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: white;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    #tutorial-card h3 {
      color: white;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    #tutorial-card p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .tut-progress {
      display: flex;
      gap: 5px;
      margin-bottom: 16px;
    }
    .tut-dot {
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.15);
      flex: 1;
      transition: background 0.3s;
    }
    .tut-dot.done {
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
    }
    .tut-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .tut-btn-next {
      flex: 1;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 11px 20px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .tut-btn-next:hover { opacity: 0.9; transform: translateY(-1px); }
    .tut-btn-skip {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 11px 16px;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: color 0.2s, border-color 0.2s;
    }
    .tut-btn-skip:hover { color: white; border-color: rgba(255,255,255,0.3); }
    .tut-pointer {
      position: absolute;
      width: 0;
      height: 0;
    }
    .tutorial-highlight-pulse {
      animation: tut-pulse 1.5s ease-in-out infinite !important;
    }
    @keyframes tut-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.8), 0 0 0 9999px rgba(0,0,0,0.72); }
      50% { box-shadow: 0 0 0 8px rgba(236, 72, 153, 0.6), 0 0 0 9999px rgba(0,0,0,0.72); }
    }
  `;
  document.head.appendChild(styles);

  const overlay = document.createElement("div");
  overlay.id = "tutorial-overlay";

  const spotlight = document.createElement("div");
  spotlight.id = "tutorial-spotlight";

  const card = document.createElement("div");
  card.id = "tutorial-card";

  overlay.appendChild(spotlight);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  tutorialOverlay = overlay;
  tutorialSpotlight = spotlight;
  tutorialCard = card;
}

// Debe estar en window porque se invoca desde innerHTML dinámico (onclick="mostrarPasoTutorial(...)")
window.mostrarPasoTutorial = function mostrarPasoTutorial(stepIndex) {
  if (stepIndex >= tutorialSteps.length) {
    window.cerrarTutorial();
    return;
  }

  tutorialCurrentStep = stepIndex;
  const step = tutorialSteps[stepIndex];

  if (step.tab) {
    const tabBtn = document.querySelector(`.tab-btn[onclick*="${step.tab}"]`);
    if (tabBtn) window.switchTabAlumno(step.tab, tabBtn);
  }

  let targetEl = document.querySelector(step.target);

  if (!targetEl && step.target.includes(",")) {
    const selectors = step.target.split(",");
    for (let sel of selectors) {
      targetEl = document.querySelector(sel.trim());
      if (targetEl) break;
    }
  }

  if (!targetEl) {
    window.mostrarPasoTutorial(stepIndex + 1);
    return;
  }

  // Scroll al elemento
  targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    posicionarSpotlight(targetEl, step);
    renderTutorialCard(step, stepIndex);
  }, 350);
};

function posicionarSpotlight(el, step) {
  const rect = el.getBoundingClientRect();
  const padding = 10;

  tutorialSpotlight.style.top = `${rect.top + window.scrollY - padding}px`;
  tutorialSpotlight.style.left = `${rect.left + window.scrollX - padding}px`;
  tutorialSpotlight.style.width = `${rect.width + padding * 2}px`;
  tutorialSpotlight.style.height = `${rect.height + padding * 2}px`;
}

function renderTutorialCard(step, stepIndex) {
  const isLast = stepIndex === tutorialSteps.length - 1;
  const targetEl = document.querySelector(step.target);
  const rect = targetEl
    ? targetEl.getBoundingClientRect()
    : { top: 100, left: 100, width: 200, height: 50 };

  // Barra de progreso
  let dotsHtml = "";
  for (let i = 0; i < tutorialSteps.length; i++) {
    dotsHtml += `<div class="tut-dot ${i <= stepIndex ? "done" : ""}"></div>`;
  }

  tutorialCard.innerHTML = `
    <div class="tut-step-badge">Paso ${stepIndex + 1} de ${tutorialSteps.length}</div>
    <h3>${step.title}</h3>
    <p>${step.description}</p>
    <div class="tut-progress">${dotsHtml}</div>
    <div class="tut-actions">
      <button class="tut-btn-skip" onclick="cerrarTutorial()"><i class="fas fa-times"></i> Cerrar</button>
      <button class="tut-btn-next" onclick="mostrarPasoTutorial(${stepIndex + 1})">
        ${isLast ? '<i class="fas fa-check"></i> ¡Entendido!' : 'Siguiente <i class="fas fa-arrow-right"></i>'}
      </button>
    </div>
  `;

  // Posicionar la card relativa al spotlight
  const cardWidth = Math.min(360, window.innerWidth * 0.9);
  const cardGap = 20;
  const vpHeight = window.innerHeight;
  const vpWidth = window.innerWidth;

  let top, left;
  const pos = step.position;

  // Vertical
  if (pos === "bottom") {
    top = rect.bottom + window.scrollY + cardGap;
  } else if (pos === "top") {
    top = rect.top + window.scrollY - cardGap - 220; // aproximado
  } else {
    top = rect.top + window.scrollY + rect.height / 2 - 120;
  }

  // Horizontal
  if (pos === "left") {
    left = rect.left + window.scrollX - cardWidth - cardGap;
    if (left < 10 + window.scrollX)
      left = rect.right + window.scrollX + cardGap; // fallback right
  } else {
    left = rect.left + window.scrollX + rect.width / 2 - cardWidth / 2;
  }

  // Constrain to document bounds
  const docWidth = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
  left = Math.max(12, Math.min(left, docWidth - cardWidth - 12));

  if (top < window.scrollY + 10) top = window.scrollY + 10;

  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
  );
  if (top > docHeight - 150) top = docHeight - 200; // simple fallback if offscreen

  tutorialCard.style.top = `${top}px`;
  tutorialCard.style.left = `${left}px`;
  tutorialCard.style.width = `${cardWidth}px`;

  // Re-animate
  tutorialCard.style.animation = "none";
  tutorialCard.offsetHeight; // reflow
  tutorialCard.style.animation = "tutCardIn 0.4s ease-out";
}

window.cerrarTutorial = function () {
  const overlay = document.getElementById("tutorial-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.3s";
    setTimeout(() => overlay.remove(), 300);
  }
  window.removeEventListener("resize", handleTutorialResize);
};

// ================================================================
//  PDF PROFESIONAL
// ================================================================
window.exportarPDFPeriodo = function (idPeriodo, event) {
  if (event) event.stopPropagation();
  if (!rawData) return;

  const periodoObj = rawData.periodos.find((p) => p.id_periodo == idPeriodo);
  if (!periodoObj) return;

  const grupo = rawData.grupo || {};
  const rubricas = rawData.rubricas || [];
  const actividades = rawData.actividades || [];
  const calificaciones = rawData.calificaciones || [];
  const asistencias = rawData.asistencias || [];
  const fechas_grupo = rawData.fechas_grupo || [];
  const alumno = rawData.alumno || {};

  // Filtrar datos del periodo
  const actividadesPeriodo = actividades.filter(
    (a) => a.id_periodo == idPeriodo,
  );
  const rubricasPeriodo = rubricas.filter((r) =>
    grupo.tipo_rubrica === "Por Periodo"
      ? r.id_periodo == idPeriodo
      : r.id_periodo == null,
  );

  // Calcular asistencias del periodo
  let asisPeriodo = asistencias;
  let fechasGrupoPeriodo = fechas_grupo;
  if (periodoObj.fecha_inicio && periodoObj.fecha_fin) {
    const start = new Date(periodoObj.fecha_inicio + "T00:00:00");
    const end = new Date(periodoObj.fecha_fin + "T23:59:59");
    asisPeriodo = asistencias.filter((a) => {
      const d = new Date(a.fecha_hora);
      return d >= start && d <= end;
    });
    fechasGrupoPeriodo = fechas_grupo.filter((f) => {
      const d = new Date(f + "T00:00:00");
      return d >= start && d <= end;
    });
  }
  const maxAsisPeriodo = fechasGrupoPeriodo.length || 1;
  let asisScore = 0;
  asisPeriodo.forEach((a) => {
    if (a.estado === "Asistencia") asisScore += 1;
    else if (a.estado === "Retardo") asisScore += 0.5;
  });
  const porcentajeAsistencia = Math.min(
    Math.round((asisScore / maxAsisPeriodo) * 100),
    100,
  );

  // Calcular promedio ponderado del periodo
  let sumaPeriodo = 0;
  let porcentajeEvaluado = 0;

  const rubricasConDatos = rubricasPeriodo.map((rubrica) => {
    const isAsistencia = rubrica.categoria.toLowerCase().includes("asistencia");
    let notaRubrica = null;
    let actividadesRub = [];

    if (isAsistencia) {
      const scoreAsis = (asisScore / maxAsisPeriodo) * 10;
      notaRubrica = Math.min(scoreAsis, 10);
      sumaPeriodo += notaRubrica * (rubrica.porcentaje / 100);
      porcentajeEvaluado += parseFloat(rubrica.porcentaje);
    } else {
      actividadesRub = actividadesPeriodo.filter(
        (a) => a.id_rubrica == rubrica.id_rubrica,
      );
      let sumaRub = 0;
      let evalRub = 0;
      actividadesRub.forEach((acto) => {
        const calif = calificaciones.find(
          (c) =>
            c.id_actividad == acto.id_actividad &&
            (!("id_alumno" in c) || c.id_alumno == alumno.id_alumno),
        );
        const nota =
          calif && calif.puntaje !== null && calif.puntaje !== ""
            ? parseFloat(calif.puntaje)
            : null;
        if (nota !== null) {
          sumaRub += nota;
          evalRub++;
        }
      });
      if (evalRub > 0) {
        notaRubrica = sumaRub / evalRub;
        sumaPeriodo += notaRubrica * (rubrica.porcentaje / 100);
        porcentajeEvaluado += parseFloat(rubrica.porcentaje);
      }
    }
    return { ...rubrica, notaRubrica, actividadesRub, isAsistencia };
  });

  const promedioReal =
    porcentajeEvaluado > 0 ? sumaPeriodo / (porcentajeEvaluado / 100) : 0;
  const aprobado = promedioReal >= (grupo.calificacion_minima || 6);
  const fechaReporte = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Construir filas de actividades por rúbrica
  let rubricasHtml = "";
  rubricasConDatos.forEach((rubrica) => {
    const colorRubrica = rubrica.color || "#8b5cf6";
    const notaDisplay =
      rubrica.notaRubrica !== null ? rubrica.notaRubrica.toFixed(1) : "—";
    const notaColor =
      rubrica.notaRubrica !== null &&
      rubrica.notaRubrica >= (grupo.calificacion_minima || 6)
        ? "#10b981"
        : rubrica.notaRubrica !== null
          ? "#ef4444"
          : "#888";

    if (rubrica.isAsistencia) {
      rubricasHtml += `
        <tr style="background: #f8f9fa;">
          <td colspan="3" style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;">
            <span style="display:inline-block; width: 10px; height: 10px; background: ${colorRubrica}; border-radius: 50%; margin-right: 8px;"></span>
            <strong>${rubrica.categoria}</strong>
            <span style="color: #6b7280; font-size: 0.85em; margin-left: 8px;">(${rubrica.porcentaje}% del periodo)</span>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; color: ${notaColor};">${notaDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 8px 14px 12px 30px; border-bottom: 2px solid ${colorRubrica}20; color: #6b7280; font-size: 0.88em;" colspan="2">
            Asistencias: ${asisScore} / ${maxAsisPeriodo} clases
          </td>
          <td style="padding: 8px 14px 12px 14px; border-bottom: 2px solid ${colorRubrica}20; text-align: center; color: #6b7280; font-size: 0.88em;">
            ${porcentajeAsistencia}%
          </td>
          <td style="border-bottom: 2px solid ${colorRubrica}20;"></td>
        </tr>
      `;
    } else {
      rubricasHtml += `
        <tr style="background: #f8f9fa;">
          <td colspan="3" style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;">
            <span style="display:inline-block; width: 10px; height: 10px; background: ${colorRubrica}; border-radius: 50%; margin-right: 8px;"></span>
            <strong>${rubrica.categoria}</strong>
            <span style="color: #6b7280; font-size: 0.85em; margin-left: 8px;">(${rubrica.porcentaje}% del periodo)</span>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; color: ${notaColor};">${notaDisplay}</td>
        </tr>
      `;
      rubrica.actividadesRub.forEach((acto) => {
        const calif = calificaciones.find(
          (c) => c.id_actividad == acto.id_actividad,
        );
        const nota =
          calif && calif.puntaje !== null && calif.puntaje !== ""
            ? parseFloat(calif.puntaje)
            : null;
        const notaActDisplay = nota !== null ? nota.toFixed(1) : "—";
        const notaActColor =
          nota !== null && nota >= (grupo.calificacion_minima || 6)
            ? "#10b981"
            : nota !== null && nota > 0
              ? "#ef4444"
              : "#9ca3af";
        const entrega = acto.fecha_entrega
          ? acto.fecha_entrega.split("-").reverse().join("/")
          : "—";
        rubricasHtml += `
          <tr>
            <td style="padding: 8px 14px 8px 30px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.9em;">
              <i style="color: ${colorRubrica}; margin-right: 6px;">●</i> ${acto.nombre_actividad}
            </td>
            <td style="padding: 8px 14px; border-bottom: 1px solid #f3f4f6; color: #9ca3af; font-size: 0.85em; text-align: center;">${entrega}</td>
            <td style="padding: 8px 14px; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 0.85em; color: #6b7280;">${nota !== null && nota > 0 ? "Calificado" : nota === 0 ? "No Entregó" : "Pendiente"}</td>
            <td style="padding: 8px 14px; border-bottom: 1px solid #f3f4f6; text-align: center; font-weight: 700; color: ${notaActColor}; font-size: 1em;">${notaActDisplay}</td>
          </tr>
        `;
      });
      // Separador entre rúbricas
      rubricasHtml += `<tr><td colspan="4" style="height: 6px; background: ${colorRubrica}15; border-bottom: 2px solid ${colorRubrica}30;"></td></tr>`;
    }
  });

  // Asistencias detalladas para el PDF
  let asistenciasRows = "";
  if (asisPeriodo.length === 0) {
    asistenciasRows = `<tr><td colspan="3" style="text-align: center; color: #9ca3af; padding: 16px;">Sin registros de asistencia en este periodo.</td></tr>`;
  } else {
    asisPeriodo
      .slice()
      .reverse()
      .forEach((a) => {
        const colorAs =
          a.estado === "Asistencia"
            ? "#10b981"
            : a.estado === "Retardo"
              ? "#f59e0b"
              : "#ef4444";
        const iconAs =
          a.estado === "Asistencia" ? "✓" : a.estado === "Retardo" ? "◔" : "✗";
        const fecha = a.fecha_hora
          .substring(0, 10)
          .split("-")
          .reverse()
          .join("/");
        asistenciasRows += `
        <tr>
          <td style="padding: 7px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.88em;">${fecha}</td>
          <td style="padding: 7px 12px; border-bottom: 1px solid #f3f4f6; color: ${colorAs}; font-weight: 700; font-size: 0.88em;">${iconAs} ${a.estado}</td>
          <td style="padding: 7px 12px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 0.85em;">${a.comentario || "—"}</td>
        </tr>
      `;
      });
  }

  const htmlPDF = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte EvaLiA — ${alumno.nombre} — ${periodoObj.nombre_periodo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #ffffff;
      color: #111827;
      font-size: 13px;
      line-height: 1.5;
    }
    .page { max-width: 800px; margin: 0 auto; padding: 32px 36px; }

    /* ---- ENCABEZADO ---- */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 3px solid #8b5cf6;
      margin-bottom: 24px;
    }
    .header-brand { display: flex; align-items: center; gap: 12px; }
    .brand-dot {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 1.2rem;
    }
    .brand-name { font-size: 1.5rem; font-weight: 800; color: #1e1b4b; }
    .brand-sub  { font-size: 0.78rem; color: #6b7280; margin-top: 1px; }
    .header-meta { text-align: right; }
    .header-meta .badge-periodo {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white; padding: 5px 14px; border-radius: 20px;
      font-size: 0.8rem; font-weight: 700; letter-spacing: 0.3px;
      display: inline-block; margin-bottom: 5px;
    }
    .header-meta .date { color: #9ca3af; font-size: 0.78rem; }

    /* ---- ALUMNO INFO ---- */
    .alumno-card {
      background: linear-gradient(135deg, #f5f3ff, #fdf2f8);
      border: 1px solid #e9d5ff;
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .alumno-name { font-size: 1.25rem; font-weight: 700; color: #1e1b4b; }
    .alumno-sub  { color: #7c3aed; font-size: 0.88rem; font-weight: 600; margin-top: 2px; }
    .alumno-detail { color: #6b7280; font-size: 0.82rem; margin-top: 4px; }

    /* ---- RESUMEN STATS ---- */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px 12px;
      text-align: center;
    }
    .stat-box .val { font-size: 1.6rem; font-weight: 800; margin-bottom: 3px; }
    .stat-box .lbl { font-size: 0.72rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .val-promedio { color: ${aprobado ? "#10b981" : "#ef4444"}; }
    .val-asistencia { color: #8b5cf6; }
    .val-estado { color: ${aprobado ? "#10b981" : "#ef4444"}; }

    /* ---- SECCIÓN ---- */
    .section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    /* ---- TABLA ---- */
    .pdf-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .pdf-table thead tr {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }
    .pdf-table thead th {
      padding: 11px 14px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: left;
      letter-spacing: 0.3px;
    }
    .pdf-table thead th:last-child { text-align: center; }
    .pdf-table tr:last-child td { border-bottom: none; }

    /* ---- FILA PROMEDIO FINAL ---- */
    .row-promedio {
      background: ${aprobado ? "#f0fdf4" : "#fef2f2"};
      border-top: 2px solid ${aprobado ? "#10b981" : "#ef4444"};
    }
    .row-promedio td {
      padding: 14px 18px !important;
      font-size: 1rem;
      font-weight: 700;
    }
    .row-promedio .promedio-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: ${aprobado ? "#10b981" : "#ef4444"};
      text-align: center;
    }
    .estado-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      background: ${aprobado ? "#d1fae5" : "#fee2e2"};
      color: ${aprobado ? "#059669" : "#dc2626"};
      margin-left: 10px;
      vertical-align: middle;
    }

    /* ---- TABLA ASISTENCIA ---- */
    .asis-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .asis-table thead tr { background: #374151; color: white; }
    .asis-table thead th { padding: 10px 12px; font-size: 0.78rem; font-weight: 600; }

    /* ---- FOOTER ---- */
    .pdf-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #9ca3af;
      font-size: 0.75rem;
    }
    .pdf-footer .brand-tiny { font-weight: 700; color: #8b5cf6; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
      @page { margin: 1cm; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Encabezado -->
  <div class="header">
    <div class="header-brand">
      <div class="brand-dot">E</div>
      <div>
        <div class="brand-name">EvaLiA</div>
        <div class="brand-sub">Evaluación en Línea para Alumnos</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="badge-periodo">${periodoObj.nombre_periodo}</div>
      <div class="date">Generado el ${fechaReporte}</div>
    </div>
  </div>

  <!-- Información del Alumno -->
  <div class="alumno-card">
    <div>
      <div class="alumno-name">${alumno.nombre}</div>
      <div class="alumno-sub">${grupo.nombre_grupo}</div>
      <div class="alumno-detail">Ciclo Escolar: <strong>${grupo.ciclo_escolar || "—"}</strong></div>
    </div>
    <div style="text-align: right;">
      <div class="alumno-detail">N° de Lista: <strong>${alumno.numero_lista || "—"}</strong></div>
      <div class="alumno-detail">Cal. Mínima Aprobatoria: <strong>${grupo.calificacion_minima || "6.0"}</strong></div>
    </div>
  </div>

  <!-- Estadísticas Resumen -->
  <div class="section-title">Resumen del Periodo</div>
  <div class="stats-row">
    <div class="stat-box">
      <div class="val val-promedio">${promedioReal.toFixed(1)}</div>
      <div class="lbl">Promedio del Periodo</div>
    </div>
    <div class="stat-box">
      <div class="val val-asistencia">${porcentajeAsistencia}%</div>
      <div class="lbl">Asistencia al Periodo</div>
    </div>
    <div class="stat-box">
      <div class="val" style="color: #374151;">${asisScore} / ${maxAsisPeriodo}</div>
      <div class="lbl">Asistencias Registradas</div>
    </div>
    <div class="stat-box">
      <div class="val val-estado">${aprobado ? "✓ Aprobado" : "✗ En Riesgo"}</div>
      <div class="lbl">Estado Actual</div>
    </div>
  </div>

  <!-- Tabla de Calificaciones -->
  <div class="section-title">Desglose de Calificaciones por Categoría</div>
  <table class="pdf-table">
    <thead>
      <tr>
        <th style="width: 40%;">Actividad / Rúbrica</th>
        <th style="width: 20%; text-align: center;">Fecha de Entrega</th>
        <th style="width: 20%; text-align: center;">Estado</th>
        <th style="width: 20%; text-align: center;">Nota</th>
      </tr>
    </thead>
    <tbody>
      ${rubricasHtml}
      <tr class="row-promedio">
        <td colspan="3">
          Promedio Ponderado del Periodo
          <span class="estado-badge">${aprobado ? "Aprobado" : "En Riesgo"}</span>
        </td>
        <td class="promedio-val">${promedioReal.toFixed(1)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Tabla de Asistencias -->
  <div class="section-title">Historial de Asistencia del Periodo</div>
  <table class="asis-table">
    <thead>
      <tr>
        <th style="width: 25%;">Fecha</th>
        <th style="width: 25%;">Estado</th>
        <th style="width: 50%;">Comentario / Justificación</th>
      </tr>
    </thead>
    <tbody>
      ${asistenciasRows}
    </tbody>
  </table>

  <!-- Footer -->
  <div class="pdf-footer">
    <div>Reporte generado por <span class="brand-tiny">EvaLiA</span> — Sistema de Evaluación Académica</div>
    <div>${grupo.nombre_grupo} · ${periodoObj.nombre_periodo} · ${fechaReporte}</div>
  </div>

</div>
<script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const nombreArchivo = `EvaLiA_${(rawData.alumno.nombre || "alumno").replace(/\s+/g, "_")}_${periodoObj.nombre_periodo.replace(/\s+/g, "_")}.html`;

  const blob = new Blob([htmlPDF], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Limpiar la URL temporal después de un momento
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// ================================================================
//  CARGA INICIAL
// ================================================================
document.addEventListener("DOMContentLoaded", async () => {
  if (
    "Notification" in window &&
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    document.getElementById("notif-banner").style.display = "flex";
  }

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
      `${data.grupo.nombre_grupo} — ${data.grupo.ciclo_escolar}`;

    if (data.grupo.avisos) {
      const muro = document.getElementById("muro-avisos");
      const anunciosContainer = document.getElementById("anuncios-content");
      const avisoTexto = data.grupo.avisos;

      if (muro && anunciosContainer && avisoTexto && avisoTexto.trim() !== "") {
        // Mostrar la nueva pestaña de Avisos
        document.getElementById("btn-tab-avisos").style.display = "inline-flex";
        // Sanitizar el HTML del aviso para evitar problemas de seguridad (XSS)
        const sanitizedHtml = DOMPurify.sanitize(avisoTexto);

        // Crear el contenedor para el texto corto
        const shortTextDiv = document.createElement("div");
        shortTextDiv.className = "anuncio-corto";
        shortTextDiv.innerHTML = sanitizedHtml;

        // Crear el botón "Ver más"
        const readMoreBtn = document.createElement("button");
        readMoreBtn.className = "btn-ver-mas";
        readMoreBtn.innerHTML =
          'Leer anuncio completo <i class="fas fa-angle-double-right"></i>';

        // Asignar el evento para abrir el modal con el contenido completo
        readMoreBtn.onclick = () => {
          document.getElementById("anuncio-completo-body").innerHTML =
            sanitizedHtml;
          document
            .getElementById("modal-anuncio-completo")
            .classList.add("active");
        };

        // Limpiar el contenedor y agregar los nuevos elementos
        anunciosContainer.innerHTML = "";
        anunciosContainer.appendChild(shortTextDiv);
        anunciosContainer.appendChild(readMoreBtn);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        // Crear una versión de texto plano para la notificación
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = data.grupo.avisos;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        new Notification("Aviso de tu maestro", { body: plainText });
      }
    }

    // Configurar el botón de Contactar Maestro si tenemos el email del maestro
    if (data.maestro && data.maestro.email) {
      const btnContact = document.getElementById("btn-contacto-maestro");
      btnContact.href = `mailto:${data.maestro.email}?subject=Duda/Consulta%20-%20EvaLiA`;
      document.getElementById("btn-contacto-maestro-container").style.display =
        "block";
    }

    renderDashboard();

    // Sonido de bienvenida (Estilo Windows 7)
    const welcomeSound = new Audio(
      "https://www.myinstants.com/media/sounds/windows-7-startup-sound.mp3",
    );
    welcomeSound.volume = 0.5;
    welcomeSound
      .play()
      .catch((e) => console.log("Auto-play blocked by browser."));
  } catch (error) {
    console.error("Error al cargar portal:", error);
  }

  document.getElementById("btn-logout").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/controllers/AlumnoPortalController.php?action=logout");
    window.location.href = "../../index.html";
  });

  // Lógica para cerrar el modal de anuncio
  document
    .getElementById("btn-cerrar-anuncio")
    ?.addEventListener("click", () => {
      document
        .getElementById("modal-anuncio-completo")
        .classList.remove("active");
    });

  // También cerrar el modal si se hace clic fuera del contenido
  document
    .getElementById("modal-anuncio-completo")
    ?.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        document
          .getElementById("modal-anuncio-completo")
          .classList.remove("active");
      }
    });
});

// ================================================================
//  RENDER DASHBOARD
// ================================================================
function renderDashboard() {
  if (!rawData) return;
  const grupo = rawData.grupo || {};
  const periodos = rawData.periodos || [];
  const rubricas = rawData.rubricas || [];
  const actividades = rawData.actividades || [];
  const calificaciones = rawData.calificaciones || [];
  const asistencias = rawData.asistencias || [];
  const fechas_grupo = rawData.fechas_grupo || [];
  let max_asistencias = rawData.max_asistencias || 1;

  if (!document.getElementById("student-mobile-styles")) {
    const style = document.createElement("style");
    style.id = "student-mobile-styles";
    style.innerHTML = `
        .mobile-only { display: none; }
        .mobile-activity-card {
            background: rgba(30, 27, 75, 0.5);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .mobile-activity-card:active {
            transform: scale(0.98);
            background: rgba(30, 27, 75, 0.8);
        }
        .mobile-activity-card .rubric-badge {
            font-size: 0.72rem;
            padding: 4px 10px;
            border-radius: 20px;
            color: white;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
            .mobile-only { display: block; }
            .desktop-only { display: none !important; }
        }
    `;
    document.head.appendChild(style);
  }

  let currentFiltro = window.currentFiltroPeriodo;
  if (currentFiltro === undefined) {
    const pActivo = periodos.find((p) => p.activo == 1);
    window.currentFiltroPeriodo = pActivo
      ? pActivo.id_periodo.toString()
      : "all";
    currentFiltro = window.currentFiltroPeriodo;
  }

  // Setup global select period
  const selectFiltro = document.getElementById("filtro-periodo-select");
  if (selectFiltro && selectFiltro.options.length === 1) {
    // Only 'all' initially
    periodos.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id_periodo;
      opt.innerHTML = `📅 ${p.nombre_periodo} ${p.activo == 1 ? "(ACTIVO)" : ""}`;
      selectFiltro.appendChild(opt);
    });
    selectFiltro.value = currentFiltro;
    selectFiltro.addEventListener("change", (e) => {
      window.currentFiltroPeriodo = e.target.value;
      renderDashboard();
    });
  } else if (selectFiltro) {
    selectFiltro.value = currentFiltro;
  }

  const containerCalif = document.getElementById("contenedor-calificaciones");
  const containerAsis = document.getElementById("contenedor-asistencias");
  containerCalif.innerHTML = "";
  containerAsis.innerHTML = "";

  let sumaTotalGlobal = 0;
  let evalCountGlobal = 0;
  let tareasTotalesDelCiclo = 0;
  let periodosContados = 0;
  let chartLabels = [];
  let chartData = [];
  let asisGlobalScore = 0;
  let maxAsisGlobal = 0;

  let periodosARenderizar = periodos;
  if (currentFiltro !== "all") {
    periodosARenderizar = periodos.filter((p) => p.id_periodo == currentFiltro);
  }

  // 1. Pre-calcular entregas reales para solucionar el bug de tareas pendientes
  periodosARenderizar.forEach((periodo) => {
    const actividadesDelPeriodo = actividades.filter(
      (a) => a.id_periodo == periodo.id_periodo,
    );
    tareasTotalesDelCiclo += actividadesDelPeriodo.length;
    actividadesDelPeriodo.forEach((acto) => {
      const calif = calificaciones.find(
        (c) =>
          c.id_actividad == acto.id_actividad &&
          (!("id_alumno" in c) || c.id_alumno == rawData.alumno.id_alumno),
      );
      if (
        calif &&
        calif.puntaje !== null &&
        calif.puntaje !== "" &&
        parseFloat(calif.puntaje) > 0
      )
        evalCountGlobal++;
    });
  });

  // 2. Calcular Asistencias de forma segura (evita sumar doble si estamos en Global y no hay fechas)
  let asisConsideradas = asistencias;
  let fechasConsideradas = fechas_grupo;

  if (currentFiltro !== "all") {
    const pSeleccionado = periodosARenderizar[0];
    if (
      pSeleccionado &&
      pSeleccionado.fecha_inicio &&
      pSeleccionado.fecha_fin
    ) {
      const start = new Date(pSeleccionado.fecha_inicio + "T00:00:00");
      const end = new Date(pSeleccionado.fecha_fin + "T23:59:59");
      asisConsideradas = asistencias.filter((a) => {
        const d = new Date(a.fecha_hora);
        return d >= start && d <= end;
      });
      fechasConsideradas = fechas_grupo.filter((f) => {
        const d = new Date(f + "T00:00:00");
        return d >= start && d <= end;
      });
    }
  }

  maxAsisGlobal = fechasConsideradas.length || 1;
  asisConsideradas.forEach((a) => {
    if (a.estado === "Asistencia") asisGlobalScore += 1;
    else if (a.estado === "Retardo") asisGlobalScore += 0.5;
  });

  // 3. Renderizar TODAS las asistencias en el tab "Historial de Asistencias" (ignora el filtro)
  periodos.forEach((periodo) => {
    const isActive = periodo.activo == 1;
    const badgeActivo = isActive
      ? `<span class="badge-active" style="background: var(--secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: white; margin-left: 10px;">ACTIVO</span>`
      : "";

    const isExpanded = isActive || currentFiltro === "all";

    let htmlAsis = `<div class="accordion-header" onclick="toggleAccordion('asis-${periodo.id_periodo}', this, event)">
                      <div style="display: flex; align-items: center; gap: 10px;"><h4 style="color: var(--primary); margin: 0; font-size: 1.2rem;">${periodo.nombre_periodo}</h4> ${badgeActivo}</div>
                      <i class="fas fa-chevron-${isExpanded ? "up" : "down"}" style="color: var(--text-muted);"></i>
                    </div>`;
    htmlAsis += `<div id="asis-${periodo.id_periodo}" class="accordion-content ${isExpanded ? "" : "collapsed"}">
                 <div class="desktop-only table-container" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 10px; overflow-x: auto;">
                 <table class="table responsive-table" style="margin: 0; min-width: 500px;">
                 <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                   <tr><th>Fecha</th><th>Estado</th><th>Comentario / Justificación</th></tr>
                 </thead><tbody>`;

    let asisPeriodo = asistencias;
    if (periodo.fecha_inicio && periodo.fecha_fin) {
      const start = new Date(periodo.fecha_inicio + "T00:00:00");
      const end = new Date(periodo.fecha_fin + "T23:59:59");
      asisPeriodo = asistencias.filter((a) => {
        const d = new Date(a.fecha_hora);
        return d >= start && d <= end;
      });
    }

    if (asisPeriodo.length === 0) {
      htmlAsis += `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">Sin registros en este periodo.</td></tr>`;
    } else {
      asisPeriodo.forEach((a) => {
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
        htmlAsis += `<tr>
          <td data-label="Fecha">${a.fecha_hora.substring(0, 10).split("-").reverse().join("/")}</td>
          <td data-label="Estado" style="color: ${color}; font-weight: bold;"><i class="fas ${icon}"></i> ${a.estado}</td>
          <td data-label="Comentario" style="color: var(--text-light); font-size: 0.9rem;">${a.comentario ? "📝 " + a.comentario : "—"}</td>
        </tr>`;
      });
    }
    htmlAsis += `</tbody></table></div>`;

    // --- MOBILE CARDS (ASISTENCIA) ---
    htmlAsis += `<div class="mobile-only" style="padding: 10px 0;">`;
    let asisPeriodoDesc = [...asisPeriodo].sort(
      (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora),
    );
    if (asisPeriodoDesc.length === 0) {
      htmlAsis += `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Sin registros en este periodo.</p>`;
    } else {
      asisPeriodoDesc.forEach((a) => {
        let color = "white",
          icon = "";
        if (a.estado === "Asistencia") {
          color = "#10b981";
          icon = "fa-check-circle";
        } else if (a.estado === "Falta") {
          color = "#ef4444";
          icon = "fa-times-circle";
        } else if (a.estado === "Retardo") {
          color = "#f59e0b";
          icon = "fa-clock";
        }

        htmlAsis += `
            <div class="mobile-activity-card" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h5 style="color: var(--text-light); margin-bottom:6px; font-size: 0.95rem;"><i class="fas fa-calendar-day" style="color: var(--primary);"></i> ${a.fecha_hora.substring(0, 10).split("-").reverse().join("/")}</h5>
                    <span style="font-size:0.85rem; color: var(--text-muted);">${a.comentario ? "📝 " + a.comentario : "Sin justificación / comentarios"}</span>
                </div>
                <div style="color: ${color}; font-weight: 800; font-size: 1rem; text-align:right;">
                    <i class="fas ${icon}" style="margin-bottom: 4px; font-size: 1.2rem;"></i><br>${a.estado}
                </div>
            </div>`;
      });
    }
    htmlAsis += `</div></div>`;
    containerAsis.innerHTML += htmlAsis;
  });

  periodosARenderizar.forEach((periodo) => {
    const isActive = periodo.activo == 1;
    const badgeActivo = isActive
      ? `<span class="badge-active" style="background: var(--secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; color: white; margin-left: 10px;">ACTIVO</span>`
      : "";

    const actividadesDelPeriodo = actividades.filter(
      (a) => a.id_periodo == periodo.id_periodo,
    );
    const tieneCalificaciones = actividadesDelPeriodo.some((a) => {
      const calif = calificaciones.find(
        (c) =>
          c.id_actividad == a.id_actividad &&
          (!("id_alumno" in c) || c.id_alumno == rawData.alumno.id_alumno),
      );
      return calif && calif.puntaje !== "" && calif.puntaje !== null;
    });

    const btnExportar = `<button type="button" onclick="exportarPDFPeriodo(${periodo.id_periodo}, event)" class="btn btn-cancel" style="padding: 6px 12px; font-size: 0.85rem; border-color: #ef4444; color: #ef4444; background: transparent;" title="Exportar a PDF"><i class="fas fa-file-pdf"></i><span class="hide-mobile" style="margin-left: 5px;">PDF</span></button>`;

    const isExpanded = currentFiltro !== "all" || isActive;

    let htmlCalif = `<div class="accordion-header" onclick="toggleAccordion('calif-${periodo.id_periodo}', this, event)">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <h4 style="color: var(--primary); margin: 0; font-size: 1.2rem;">${periodo.nombre_periodo}</h4>
                        ${badgeActivo}
                      </div>
                      <div style="display: flex; align-items: center; gap: 15px;">
                        ${btnExportar}
                        <i class="fas fa-chevron-${isExpanded ? "up" : "down"}" style="color: var(--text-muted);"></i>
                      </div>
                    </div>`;

    htmlCalif += `<div id="calif-${periodo.id_periodo}" class="accordion-content ${isExpanded ? "" : "collapsed"}">
                  <div class="desktop-only excel-container" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 10px; overflow: auto; max-width: 100%;">
                  <table class="table responsive-table" style="margin: 0; min-width: max-content;">`;

    const rubricasPeriodo = rubricas.filter((r) =>
      grupo.tipo_rubrica === "Por Periodo"
        ? r.id_periodo == periodo.id_periodo
        : r.id_periodo == null,
    );

    let sumaPeriodo = 0;
    let porcentajeEvaluadoPeriodo = 0;
    let theadHtml = `<thead><tr>
      <th style="width: 46px; min-width: 46px; text-align: center; position: sticky; left: 0; z-index: 12; background: #0f172a;">N°</th>
      <th style="min-width: 200px; max-width: 260px; position: sticky; left: 46px; z-index: 12; background: #0f172a; border-right: 1px solid rgba(255,255,255,0.1);">Alumno</th>`;
    let tbodyHtml = `<tr>
      <td data-label="N°" style="text-align: center; color: var(--text-muted); font-weight: bold; position: sticky; left: 0; z-index: 5; background: #1e1b4b;">${rawData.alumno.numero_lista || "—"}</td>
      <th data-label="Alumno" style="font-weight: 600; position: sticky; left: 46px; z-index: 5; background: #1e1b4b; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">${rawData.alumno.nombre}</th>`;

    let asisPeriodo = asistencias;
    let fechasGrupoPeriodo = fechas_grupo;
    if (periodo.fecha_inicio && periodo.fecha_fin) {
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
    let maxAsisPeriodo = fechasGrupoPeriodo.length || 1;
    let asisScore = 0;

    asisPeriodo.forEach((a) => {
      if (a.estado === "Asistencia") asisScore += 1;
      else if (a.estado === "Retardo") asisScore += 0.5;
    });

    rubricasPeriodo.forEach((rubrica) => {
      const color = rubrica.color || "#8b5cf6";
      if (rubrica.categoria.toLowerCase().includes("asistencia")) {
        const scoreAsis = (asisScore / maxAsisPeriodo) * 10;
        sumaPeriodo +=
          (scoreAsis > 10 ? 10 : scoreAsis) * (rubrica.porcentaje / 100);
        porcentajeEvaluadoPeriodo += parseFloat(rubrica.porcentaje);
        theadHtml += `<th style="min-width: 130px; max-width: 160px; vertical-align: bottom; white-space: normal;">
          <span style="color: ${color}; font-size: 0.78rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
          <div style="background: rgba(255,255,255,0.05); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: var(--text-light); text-align: center; font-weight: normal; font-size: 0.85rem;">
            <i class="fas fa-user-check" style="color: ${color};"></i> Total
          </div>
        </th>`;
        tbodyHtml += `<td data-label="${rubrica.categoria} (Total)" style="text-align: center; vertical-align: middle; border-bottom: 2px solid ${color};">
          <strong>${asisScore}</strong> <span style="color: var(--text-muted); font-size: 0.8rem;">/ ${maxAsisPeriodo}</span>
          <span style="color: var(--secondary); font-size: 0.8rem; font-weight: bold; display: block; margin-top: 2px;">${((asisScore / maxAsisPeriodo) * 10).toFixed(1)}/10</span>
        </td>`;
      } else {
        const actosRub = actividades.filter(
          (a) =>
            a.id_rubrica == rubrica.id_rubrica &&
            a.id_periodo == periodo.id_periodo,
        );
        if (actosRub.length === 0) {
          theadHtml += `<th style="min-width: 120px; white-space: normal; vertical-align: bottom;">
            <span style="color: ${color}; font-size: 0.78rem; font-weight: 800;">${rubrica.categoria}</span><br>
            <em style="font-size: 0.8rem; color: var(--text-muted);">Sin actividades</em>
          </th>`;
          tbodyHtml += `<td data-label="${rubrica.categoria}" style="text-align: center; color: var(--text-muted);">—</td>`;
        } else {
          let sumaRub = 0;
          let evalRub = 0;
          actosRub.forEach((acto) => {
            const calif = calificaciones.find(
              (c) =>
                c.id_actividad == acto.id_actividad &&
                (!("id_alumno" in c) ||
                  c.id_alumno == rawData.alumno.id_alumno),
            );
            let nota = calif && calif.puntaje !== null ? calif.puntaje : "";
            if (nota !== "") {
              sumaRub += parseFloat(nota);
              evalRub++;
            }

            theadHtml += `<th style="min-width: 150px; max-width: 200px; vertical-align: bottom; white-space: normal;">
              <span style="color: ${color}; font-size: 0.78rem; font-weight: 800; display: block; margin-bottom: 5px;">${rubrica.categoria}</span>
              <div onclick="abrirDetalleActividad(${acto.id_actividad})"
                   style="cursor: pointer; background: rgba(255,255,255,0.05); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: var(--text-light); font-weight: normal; font-size: 0.85rem; word-break: break-word;"
                   title="Ver detalles">
                <div style="font-weight: 600; margin-bottom: 3px;"><i class="fas fa-tasks" style="color: ${color}; margin-right: 4px;"></i>${acto.nombre_actividad}</div>
                <div style="font-size: 0.73rem; color: var(--text-muted);"><i class="fas fa-calendar-alt"></i> ${acto.fecha_entrega ? acto.fecha_entrega.split("-").reverse().join("/") : "—"}</div>
              </div>
            </th>`;

            const notaDisplay = nota !== "" ? parseFloat(nota).toFixed(1) : "—";
            const isDanger =
              nota !== "" && nota < grupo.calificacion_minima
                ? "text-danger"
                : "";
            const isSuccess =
              nota !== "" && nota >= grupo.calificacion_minima
                ? "text-success"
                : "";
            tbodyHtml += `<td data-label="${acto.nombre_actividad}" onclick="abrirDetalleActividad(${acto.id_actividad})"
                              style="cursor: pointer; text-align: center; vertical-align: middle; border-bottom: 2px solid ${color};"
                              class="${isDanger} ${isSuccess}"
                              title="Ver detalles de actividad">
              <span style="font-size: 1.1rem; font-weight: bold;">${notaDisplay}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted);"> / 10</span>
            </td>`;
          });
          if (evalRub > 0) {
            sumaPeriodo += (sumaRub / evalRub) * (rubrica.porcentaje / 100);
            porcentajeEvaluadoPeriodo += parseFloat(rubrica.porcentaje);
          }
        }
      }
    });

    const promedioRealPeriodo =
      porcentajeEvaluadoPeriodo > 0
        ? sumaPeriodo / (porcentajeEvaluadoPeriodo / 100)
        : 0;

    theadHtml += `<th style="min-width: 130px; color: var(--primary); text-align: center; position: sticky; right: 0; z-index: 12; background: #0f172a; border-left: 1px solid rgba(255,255,255,0.1);">Promedio</th></tr></thead>`;
    const colorClass =
      promedioRealPeriodo >= grupo.calificacion_minima
        ? "text-success"
        : "text-danger";
    tbodyHtml += `<td data-label="Promedio Final" class="cell-promedio ${colorClass}" style="font-size: 1.3rem; font-weight: 800; position: sticky; right: 0; z-index: 5; background: rgba(15,23,42,0.97); border-left: 1px solid rgba(255,255,255,0.1);">${promedioRealPeriodo > 0 ? promedioRealPeriodo.toFixed(1) : "0.0"}</td></tr></tbody>`;

    htmlCalif += theadHtml + tbodyHtml + `</table></div>`;

    // --- MOBILE CARDS (CALIFICACIONES) ---
    htmlCalif += `<div class="mobile-only" style="padding: 10px 0;">`;
    let actividadesMobiles = actividadesDelPeriodo.map((acto) => {
      const rubrica = rubricasPeriodo.find(
        (r) => r.id_rubrica == acto.id_rubrica,
      );
      const calif = calificaciones.find(
        (c) =>
          c.id_actividad == acto.id_actividad &&
          (!("id_alumno" in c) || c.id_alumno == rawData.alumno.id_alumno),
      );
      return { ...acto, rubrica, calif };
    });
    actividadesMobiles.sort(
      (a, b) =>
        (b.fecha_entrega ? new Date(b.fecha_entrega) : new Date(0)) -
        (a.fecha_entrega ? new Date(a.fecha_entrega) : new Date(0)),
    );

    if (actividadesMobiles.length === 0) {
      htmlCalif += `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Sin actividades en este periodo.</p>`;
    } else {
      actividadesMobiles.forEach((acto) => {
        const rubColor = acto.rubrica ? acto.rubrica.color : "#8b5cf6";
        const rubCat = acto.rubrica ? acto.rubrica.categoria : "General";
        const nota =
          acto.calif && acto.calif.puntaje !== null && acto.calif.puntaje !== ""
            ? acto.calif.puntaje
            : "";
        const notaDisplay = nota !== "" ? parseFloat(nota).toFixed(1) : "—";
        const isDanger =
          nota !== "" && parseFloat(nota) < grupo.calificacion_minima
            ? "color: #ef4444;"
            : nota !== ""
              ? "color: #10b981;"
              : "color: var(--text-light);";
        const fechaStr = acto.fecha_entrega
          ? acto.fecha_entrega.split("-").reverse().join("/")
          : "Sin fecha";

        htmlCalif += `
        <div class="mobile-activity-card" onclick="abrirDetalleActividad(${acto.id_actividad})" style="cursor:pointer;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
             <span class="rubric-badge" style="background: ${rubColor}">${rubCat}</span>
             <span style="color: var(--text-muted); font-size: 0.8rem;"><i class="fas fa-calendar-alt"></i> ${fechaStr}</span>
          </div>
          <h4 style="margin-bottom: 12px; color: var(--text-light); font-size: 1.05rem; line-height: 1.3;">${acto.nombre_actividad}</h4>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
             <span style="font-size: 0.85rem; color: var(--text-muted);">Calificación:</span>
             <strong style="font-size: 1.15rem; ${isDanger}">${notaDisplay}<span style="font-size: 0.8rem; color: var(--text-muted);"> / 10</span></strong>
          </div>
        </div>`;
      });
    }

    htmlCalif += `
        <div class="mobile-activity-card" style="background: rgba(15, 23, 42, 0.9); border-color: var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.9rem; color: var(--text-light);"><i class="fas fa-user-check" style="color: var(--primary);"></i> Asistencias</span>
                <strong style="font-size: 1rem; color: var(--text-light);">${asisScore} / ${maxAsisPeriodo}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; color: var(--text-light);"><i class="fas fa-graduation-cap" style="color: var(--secondary);"></i> Promedio Parcial</span>
                <strong style="font-size: 1.25rem; color: ${promedioRealPeriodo >= grupo.calificacion_minima ? "#10b981" : "#ef4444"};">${promedioRealPeriodo > 0 ? promedioRealPeriodo.toFixed(1) : "0.0"}</strong>
            </div>
        </div>
    </div></div>`;

    containerCalif.innerHTML += htmlCalif;

    const periodoYaIniciado = tieneCalificaciones || asisScore > 0 || !isActive;
    if (periodoYaIniciado) {
      sumaTotalGlobal += promedioRealPeriodo;
      periodosContados++;
    }
    chartLabels.push(periodo.nombre_periodo);
    chartData.push(promedioRealPeriodo.toFixed(1));
  });

  // Construir datos de Rúbricas para la nueva gráfica
  let rubricasMap = {};
  periodosARenderizar.forEach((periodo) => {
    const rubricasPeriodo = rubricas.filter((r) =>
      grupo.tipo_rubrica === "Por Periodo"
        ? r.id_periodo == periodo.id_periodo
        : r.id_periodo == null,
    );

    let fechasGrupoPeriodo = fechas_grupo;
    if (periodo.fecha_inicio && periodo.fecha_fin) {
      const start = new Date(periodo.fecha_inicio + "T00:00:00");
      const end = new Date(periodo.fecha_fin + "T23:59:59");
      fechasGrupoPeriodo = fechas_grupo.filter((f) => {
        const d = new Date(f + "T00:00:00");
        return d >= start && d <= end;
      });
    }
    let maxAsisPeriodo = fechasGrupoPeriodo.length || 1;
    let asisScore = 0;

    const asisPeriodo = asistencias.filter((a) => {
      if (!periodo.fecha_inicio || !periodo.fecha_fin) return true;
      const d = new Date(a.fecha_hora);
      return (
        d >= new Date(periodo.fecha_inicio + "T00:00:00") &&
        d <= new Date(periodo.fecha_fin + "T23:59:59")
      );
    });
    asisPeriodo.forEach((a) => {
      if (a.estado === "Asistencia") asisScore += 1;
      else if (a.estado === "Retardo") asisScore += 0.5;
    });

    rubricasPeriodo.forEach((r) => {
      if (!rubricasMap[r.categoria])
        rubricasMap[r.categoria] = {
          sum: 0,
          count: 0,
          color: r.color || "#8b5cf6",
        };

      if (r.categoria.toLowerCase().includes("asistencia")) {
        let val = (asisScore / maxAsisPeriodo) * 10;
        rubricasMap[r.categoria].sum += val > 10 ? 10 : val;
        rubricasMap[r.categoria].count++;
      } else {
        const actos = actividades.filter(
          (a) =>
            a.id_rubrica == r.id_rubrica && a.id_periodo == periodo.id_periodo,
        );
        actos.forEach((acto) => {
          const calif = calificaciones.find(
            (c) =>
              c.id_actividad == acto.id_actividad &&
              (!("id_alumno" in c) || c.id_alumno == rawData.alumno.id_alumno),
          );
          if (calif && calif.puntaje !== null && calif.puntaje !== "") {
            rubricasMap[r.categoria].sum += parseFloat(calif.puntaje);
            rubricasMap[r.categoria].count++;
          }
        });
      }
    });
  });

  const rubLabels = [];
  const rubData = [];
  const rubColors = [];
  for (const [cat, data] of Object.entries(rubricasMap)) {
    if (data.count > 0) {
      rubLabels.push(cat.length > 15 ? cat.substring(0, 15) + "..." : cat);
      rubData.push((data.sum / data.count).toFixed(1));
      rubColors.push(data.color);
    }
  }

  // Gráfica
  if (rendimientoChartInstance) rendimientoChartInstance.destroy();
  const rChartEl = document.getElementById("rendimientoChart");
  if (rChartEl) {
    rendimientoChartInstance = new Chart(rChartEl, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Promedio Obtenido",
            data: chartData,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#ec4899",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#94a3b8" } },
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          x: {
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });
  }

  // Gráfica de Barras (Rúbricas)
  if (rubricasChartInstance) rubricasChartInstance.destroy();
  const ctxRub = document.getElementById("rubricasChart");
  if (ctxRub) {
    rubricasChartInstance = new Chart(ctxRub, {
      type: "bar",
      data: {
        labels: rubLabels,
        datasets: [
          {
            label: "Promedio (0-10)",
            data: rubData,
            backgroundColor: rubColors,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        },
      },
    });
  }

  // Gráfica Doughnut (Asistencias)
  if (asistenciasChartInstance) asistenciasChartInstance.destroy();
  const ctxAsis = document.getElementById("asistenciasChart");
  if (ctxAsis) {
    let faltasTotal = maxAsisGlobal - asisGlobalScore;
    if (faltasTotal < 0) faltasTotal = 0;
    asistenciasChartInstance = new Chart(ctxAsis, {
      type: "doughnut",
      data: {
        labels: ["Asistencias", "Faltas/Retardos"],
        datasets: [
          {
            data: [asisGlobalScore, faltasTotal],
            backgroundColor: ["#10b981", "#ef4444"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "75%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", padding: 20 },
          },
        },
      },
    });
  }

  const finalGrade =
    periodosContados > 0 ? sumaTotalGlobal / periodosContados : 0;
  document.getElementById("promedio-general").innerText = finalGrade.toFixed(1);
  document.getElementById("promedio-general").style.color =
    finalGrade >= (rawData.grupo.calificacion_minima || 6)
      ? "#10b981"
      : "#ef4444";
  document.getElementById("estado-final").innerText =
    finalGrade >= (rawData.grupo.calificacion_minima || 6)
      ? "Aprobado"
      : "En Riesgo";
  document.getElementById("estado-final").className =
    finalGrade >= (rawData.grupo.calificacion_minima || 6)
      ? "status-aprobado"
      : "status-reprobado";

  if (maxAsisGlobal === 0) maxAsisGlobal = 1;
  document.getElementById("porcentaje-asistencia").innerText =
    `${Math.min(Math.round((asisGlobalScore / maxAsisGlobal) * 100), 100)}%`;
  document.getElementById("tareas-entregadas").innerText =
    `${evalCountGlobal}/${tareasTotalesDelCiclo}`;
}

window.exportarPDFAsistenciasGlobal = function () {
  if (!rawData) return;
  const { alumno, grupo, asistencias } = rawData;

  let asisDesc = [...asistencias].sort(
    (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora),
  );
  const fechaReporte = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let asisScore = 0;
  asisDesc.forEach((a) => {
    if (a.estado === "Asistencia") asisScore += 1;
    else if (a.estado === "Retardo") asisScore += 0.5;
  });

  const maxAsis = rawData.fechas_grupo ? rawData.fechas_grupo.length : 1;
  const porcentaje = Math.min(
    Math.round((asisScore / (maxAsis || 1)) * 100),
    100,
  );

  let rowsHtml = "";
  if (asisDesc.length === 0) {
    rowsHtml = `<tr><td colspan="3" style="text-align: center; color: #9ca3af; padding: 16px;">Sin registros de asistencia.</td></tr>`;
  } else {
    asisDesc.forEach((a) => {
      const colorAs =
        a.estado === "Asistencia"
          ? "#10b981"
          : a.estado === "Retardo"
            ? "#f59e0b"
            : "#ef4444";
      const iconAs =
        a.estado === "Asistencia" ? "✓" : a.estado === "Retardo" ? "◔" : "✗";
      const fecha = a.fecha_hora
        .substring(0, 10)
        .split("-")
        .reverse()
        .join("/");
      rowsHtml += `
        <tr>
          <td style="padding: 9px 14px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.9em;">${fecha}</td>
          <td style="padding: 9px 14px; border-bottom: 1px solid #f3f4f6; color: ${colorAs}; font-weight: 700; font-size: 0.9em;">${iconAs} ${a.estado}</td>
          <td style="padding: 9px 14px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 0.88em;">${a.comentario || "—"}</td>
        </tr>
      `;
    });
  }

  const htmlPDF = `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Historial de Asistencia — ${alumno.nombre}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
      body { font-family: 'Inter', sans-serif; background: #fff; color: #111827; padding: 40px; font-size: 13px; }
      .header { border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
      .title { font-size: 1.8rem; font-weight: 800; color: #1e1b4b; margin-bottom: 5px; }
      .subtitle { color: #6b7280; font-size: 0.9rem; }
      .stats { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 15px; margin-bottom: 25px; display: flex; justify-content: space-around; }
      .stat-item { text-align: center; }
      .stat-val { font-size: 1.4rem; font-weight: 800; color: #8b5cf6; }
      .stat-lbl { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
      table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      th { background: #374151; color: white; padding: 12px 14px; text-align: left; font-weight: 600; }
      .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 0.75rem; color: #9ca3af; text-align: space-between; display: flex; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="title">Historial de Asistencia</div>
        <div class="subtitle">${alumno.nombre} · ${grupo.nombre_grupo} · Ciclo: ${grupo.ciclo_escolar}</div>
      </div>
      <div style="text-align: right; color: #9ca3af; font-size: 0.8rem;">
        Generado el ${fechaReporte}
      </div>
    </div>
    <div class="stats">
      <div class="stat-item"><div class="stat-val">${asisScore} / ${maxAsis}</div><div class="stat-lbl">Asistencias Registradas</div></div>
      <div class="stat-item"><div class="stat-val">${porcentaje}%</div><div class="stat-lbl">Porcentaje de Asistencia</div></div>
    </div>
    <table>
      <thead><tr><th style="width: 25%;">Fecha</th><th style="width: 25%;">Estado</th><th style="width: 50%;">Comentarios</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="footer">
      <div>EvaLiA — Reporte Oficial</div>
      <div>${alumno.nombre}</div>
    </div>
    <script>window.onload = () => { window.print(); };</script>
  </body>
  </html>`;

  const blob = new Blob([htmlPDF], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Asistencias_${alumno.nombre.replace(/\s+/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// ================================================================
//  DETALLE DE ACTIVIDAD
// ================================================================
window.abrirDetalleActividad = function (idActividad) {
  if (!rawData || !rawData.actividades) return;
  const actividad = rawData.actividades.find(
    (a) => a.id_actividad == idActividad,
  );
  if (!actividad) return;

  document.getElementById("detalle-nombre").innerText =
    actividad.nombre_actividad;
  if (actividad.fecha_entrega) {
    const parts = actividad.fecha_entrega.split("-");
    document.getElementById("detalle-fecha").innerText =
      parts.length === 3
        ? `${parts[2]}/${parts[1]}/${parts[0]}`
        : actividad.fecha_entrega;
  } else {
    document.getElementById("detalle-fecha").innerText = "Sin fecha asignada";
  }
  document.getElementById("detalle-descripcion").innerHTML =
    actividad.descripcion ||
    "<em>Sin instrucciones detalladas proporcionadas por el profesor.</em>";

  const enlaceContainer = document.getElementById("detalle-enlace-container");
  const enlaceBtn = document.getElementById("detalle-enlace");
  if (actividad.enlace && actividad.enlace.trim() !== "") {
    enlaceBtn.href = actividad.enlace;
    enlaceContainer.style.display = "block";
  } else {
    enlaceContainer.style.display = "none";
  }
  document.getElementById("modal-detalle-actividad").classList.add("active");
};
