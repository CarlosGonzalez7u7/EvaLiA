// Funciones para Modales
window.mostrarAlerta = function (mensaje) {
  document.getElementById("alerta-mensaje").innerText = mensaje;
  document.getElementById("modal-alerta").classList.add("active");
};

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login-alumno");
  const btnScanQR = document.getElementById("btn-scan-qr");
  const btnStopScan = document.getElementById("btn-stop-scan");
  const readerDiv = document.getElementById("reader");

  let html5QrcodeScanner = null;

  // 1. INGRESO MANUAL (Matrícula + PIN)
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identificador = document.getElementById("identificador").value;
    const pin = document.getElementById("pin").value;

    await enviarPeticionLogin({
      action: "login_alumno",
      identificador: identificador,
      pin: pin,
    });
  });

  // 2. INGRESO MEDIANTE CÁMARA Y QR
  btnScanQR.addEventListener("click", () => {
    readerDiv.style.display = "block";
    btnScanQR.style.display = "none";
    btnStopScan.style.display = "flex";

    // Inicializar el escáner de cámara
    html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  });

  btnStopScan.addEventListener("click", () => {
    detenerEscaner();
  });

  // Cuando detecta un QR exitosamente
  async function onScanSuccess(decodedText, decodedResult) {
    detenerEscaner();

    // Enviar el token escaneado al servidor
    await enviarPeticionLogin({
      action: "login_alumno",
      qr_token: decodedText,
    });
  }

  function onScanFailure(error) {
    // Se ignoran los errores de lectura porque ocurren muchos frames por segundo hasta que enfoca
  }

  function detenerEscaner() {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear();
    }
    readerDiv.style.display = "none";
    btnScanQR.style.display = "flex";
    btnStopScan.style.display = "none";
  }

  // COMUNICACIÓN CON EL SERVIDOR PHP
  async function enviarPeticionLogin(datos) {
    try {
      const res = await fetch("/api/controllers/AuthController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (data.success) window.location.href = data.redirect;
      else mostrarAlerta(data.message);
    } catch (error) {
      mostrarAlerta("Ocurrió un error en el servidor o de conexión.");
    }
  }
});
