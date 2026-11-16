// Menú móvil: abre y cierra la lista de páginas en pantallas chicas.
const boton = document.querySelector(".menu-boton");
const menu = document.getElementById("menu");

if (boton && menu) {
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    menu.classList.toggle("abierto", !abierto);
  });

  // Cerrar con la tecla Escape
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      boton.setAttribute("aria-expanded", "false");
      menu.classList.remove("abierto");
      boton.focus();
    }
  });
}
