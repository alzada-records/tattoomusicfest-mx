// Formulario de Contacto de Tattoo Music Fest: muestra las preguntas según el asunto
// y lo guarda en la hoja "Tattoo Music Fest – Contacto" del Drive personal de Lorenzo
// (ver herramientas/apps-script-contacto.gs). No manda correos a nadie.
(() => {
  // URL de la aplicación web de Apps Script de la hoja.
  const CONTACTO_URL = "https://script.google.com/macros/s/AKfycbyR6ZErc4ilV9jYF7j-zZqSspImykP5K5wNri9neFR1oSv-JMIC__OtbKTbXYzJ24miBA/exec";

  const form = document.getElementById("form-contacto");
  if (!form) return;

  const tipo = form.querySelector("#tipo");
  const grupos = form.querySelectorAll(".campos-tipo");
  const mensaje = form.querySelector(".form-mensaje");
  const gracias = document.getElementById("contacto-gracias");

  // Solo el grupo del asunto elegido está activo; los demás quedan ocultos y deshabilitados.
  function mostrarTipo() {
    grupos.forEach((g) => {
      const activo = g.dataset.tipo === tipo.value;
      g.hidden = !activo;
      g.disabled = !activo;
    });
  }

  // Desde un link: /?tipo=expo#contacto
  const elegido = new URLSearchParams(location.search).get("tipo");
  if (elegido && tipo.querySelector(`option[value="${CSS.escape(elegido)}"]`)) tipo.value = elegido;
  mostrarTipo();
  tipo.addEventListener("change", mostrarTipo);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensaje.removeAttribute("data-tipo");
    if (!form.checkValidity()) {
      mensaje.textContent = "Llena los campos obligatorios.";
      mensaje.dataset.tipo = "error";
      form.reportValidity();
      return;
    }

    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    mensaje.textContent = "Enviando…";

    try {
      if (!CONTACTO_URL) throw new Error("Falta CONTACTO_URL");
      // Apps Script no deja leer su respuesta desde otro sitio ("no-cors"); si no hay error de red, llegó.
      await fetch(CONTACTO_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(form)) });
      gracias.querySelector("p").textContent = tipo.options[tipo.selectedIndex].dataset.gracias;
      form.hidden = true;
      gracias.hidden = false;
      gracias.focus();
    } catch (e) {
      mensaje.textContent = "No se pudo enviar tu mensaje. Inténtalo de nuevo.";
      mensaje.dataset.tipo = "error";
      boton.disabled = false;
    }
  });
})();
