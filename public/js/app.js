document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");

  // Esperamos 2.5 segundos para que los usuarios vean el logo animado
  // antes de revelar el contenido de la página.
  setTimeout(() => {
    // Agregamos la clase que sube el telón (la animación en CSS lo mueve)
    splashScreen.classList.add("curtain-up");

    // Habilitamos el scroll de la página de nuevo
    document.body.classList.remove("no-scroll");
  }, 3200); // Aumentamos el tiempo a 3.2s para apreciar el logo animado

  // --- Observer para las animaciones al hacer scroll ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-show");
        }
      });
    },
    { threshold: 0.15 },
  ); // Se dispara cuando el 15% del elemento es visible

  // Buscar todos los elementos ocultos y observarlos
  document.querySelectorAll(".scroll-hidden").forEach((el) => {
    observer.observe(el);
  });
});
