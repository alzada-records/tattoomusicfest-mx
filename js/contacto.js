// Formulario de Contacto de Tattoo Music Fest: muestra las preguntas según el asunto.
// - "Avísame cuando anuncien la edición 2027" inscribe el correo en Mailchimp
//   (la misma lista de Ladrones y Alzada), para mandar el anuncio por correo.
// - Los demás asuntos se guardan en la hoja "Tattoo Music Fest – Contacto" del Drive
//   personal de Lorenzo (ver herramientas/apps-script-contacto.gs). No mandan correos a nadie.
(() => {
  // URL de la aplicación web de Apps Script de la hoja.
  // Lista de Mailchimp (misma audiencia de los tres sitios).
  const MAILCHIMP_URL = "https://alzada.us19.list-manage.com/subscribe/post-json?u=32d94c0e4051438d818e68013&id=4bd0645e6c&f_id=00b59be3f0";

  const CONTACTO_URL = "https://script.google.com/macros/s/AKfycbyR6ZErc4ilV9jYF7j-zZqSspImykP5K5wNri9neFR1oSv-JMIC__OtbKTbXYzJ24miBA/exec";

  const form = document.getElementById("form-contacto");
  if (!form) return;

  const tipo = form.querySelector("#tipo");
  const grupos = form.querySelectorAll(".campos-tipo");
  const mensaje = form.querySelector(".form-mensaje");
  const gracias = document.getElementById("contacto-gracias");
  const telefono = form.querySelector("#c-telefono");
  const marcaTelefono = form.querySelector('label[for="c-telefono"] .obligatorio');

  // Solo el grupo del asunto elegido está activo; los demás quedan ocultos y deshabilitados.
  function mostrarTipo() {
    grupos.forEach((g) => {
      const activo = g.dataset.tipo === tipo.value;
      g.hidden = !activo;
      g.disabled = !activo;
    });
    // Para el aviso solo pedimos nombre y correo.
    const aviso = tipo.value === "aviso";
    telefono.required = !aviso;
    marcaTelefono.hidden = aviso;
  }

  // Inscribe en Mailchimp por JSONP (Mailchimp no acepta fetch desde otro sitio).
  function inscribir() {
    return new Promise((resolver, rechazar) => {
      const callback = "mc" + Date.now();
      const datos = new URLSearchParams({ FNAME: form.nombre.value.trim(), EMAIL: form.correo.value.trim(), c: callback });
      const script = document.createElement("script");
      const limpiar = () => { clearTimeout(tiempo); delete window[callback]; script.remove(); };
      const tiempo = setTimeout(() => { limpiar(); rechazar(new Error("sin respuesta")); }, 10000);
      window[callback] = (r) => {
        limpiar();
        // "Ya está suscrito" también cuenta como listo.
        if (r.result === "success" || /already subscribed|ya est/i.test(String(r.msg || ""))) resolver();
        else rechazar(new Error(r.msg));
      };
      script.onerror = () => { limpiar(); rechazar(new Error("red")); };
      script.src = MAILCHIMP_URL + "&" + datos.toString();
      document.body.append(script);
    });
  }

  // Botones que eligen el asunto (por ejemplo "Inscríbete" del encabezado).
  document.querySelectorAll("[data-asunto]").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      tipo.value = enlace.dataset.asunto;
      mostrarTipo();
    });
  });

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
      if (tipo.value === "aviso") {
        await inscribir();
      } else {
        // Apps Script no deja leer su respuesta desde otro sitio ("no-cors"); si no hay error de red, llegó.
        await fetch(CONTACTO_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(form)) });
      }
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
