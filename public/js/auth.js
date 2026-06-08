import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8LN1CJMMEj6DeI59CnI5H8LbZm0cj_Gg",
  authDomain: "evaliamx.firebaseapp.com",
  projectId: "evaliamx",
  storageBucket: "evaliamx.firebasestorage.app",
  messagingSenderId: "1045898912466",
  appId: "1:1045898912466:web:9ca65e3f2a3a8631c4430b",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btn-login-google");

  if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
      try {
        // 1. Abrir ventana emergente de Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 2. Preparar los datos que mandaremos al servidor PHP
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };

        // 3. Enviar los datos por Fetch
        const response = await fetch("/api/controllers/AuthController.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login_maestro",
            user: userData,
          }),
        });

        // Verificamos si la respuesta del servidor es correcta antes de intentar leer el JSON
        if (!response.ok) {
          const isHtml = response.headers
            .get("content-type")
            ?.includes("text/html");
          if (isHtml) {
            throw new Error(
              "El servidor respondió con HTML en lugar de JSON. " +
                "Esto significa que server.php NO se está ejecutando. " +
                "Por favor, detén el servidor y ejecútalo exactamente así desde la raíz: php -S localhost:8000 server.php",
            );
          }
          const text = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${text}`);
        }

        const data = await response.json();

        if (data.success) {
          // Si PHP validó todo y creó la sesión, redirigimos al maestro
          window.location.href = data.redirect;
        } else {
          alert("Error en el servidor: " + data.message);
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
      }
    });
  }
});
