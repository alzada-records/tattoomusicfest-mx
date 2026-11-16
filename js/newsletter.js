// Formulario "Únete a la lista": manda los datos a Mailchimp sin salir de la página.
// Mailchimp acepta envíos por JSONP en /subscribe/post-json (con un parámetro "c" de callback).
// Si algo falla, el formulario se envía normal y Mailchimp abre su propia página en otra pestaña.

// Textos en el idioma de la página (<html lang="es"> o "en").
// Todo va dentro de su propio bloque para no chocar con los otros scripts de la página.
(() => {
  const EN = document.documentElement.lang === "en";
  const T = EN
    ? {
        nombre: "Enter your name.",
        correo: "Check your email address.",
        casilla: "Check the box to get news.",
        enviando: "Sending…",
        listo: "You're in! Check your inbox to confirm your subscription.",
        yaEsta: "That email is already on the list.",
        muchos: "Too many attempts with that email. Try again later.",
        error: "We couldn't subscribe you. Check your info and try again.",
      }
    : {
        nombre: "Escribe tu nombre.",
        correo: "Revisa tu correo.",
        casilla: "Marca la casilla para recibir noticias.",
        enviando: "Enviando…",
        listo: "¡Listo! Revisa tu correo para confirmar tu suscripción.",
        yaEsta: "Ese correo ya está en la lista.",
        muchos: "Demasiados intentos con ese correo. Prueba más tarde.",
        error: "No se pudo suscribir. Revisa tus datos e inténtalo de nuevo.",
      };

  document.querySelectorAll(".form-lista").forEach((form) => {
    const mensaje = form.querySelector(".form-mensaje");
    const boton = form.querySelector('button[type="submit"]');
    const acepto = form.querySelector('input[name="acepto"]');

    function avisar(texto, tipo) {
      mensaje.textContent = texto;
      mensaje.dataset.tipo = tipo;
    }

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const correo = form.EMAIL.value.trim();
      if (!form.FNAME.value.trim()) return avisar(T.nombre, "error"), form.FNAME.focus();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return avisar(T.correo, "error"), form.EMAIL.focus();
      if (acepto && !acepto.checked) return avisar(T.casilla, "error"), acepto.focus();

      const datos = new URLSearchParams(new FormData(form));
      datos.delete("acepto");
      const callback = "mc" + Date.now();
      const url = form.action.replace("/subscribe/post?", "/subscribe/post-json?") + "&" + datos.toString() + "&c=" + callback;

      boton.disabled = true;
      avisar(T.enviando, "info");

      const script = document.createElement("script");
      const limpiar = () => { delete window[callback]; script.remove(); boton.disabled = false; };
      const respaldo = setTimeout(() => { limpiar(); form.submit(); }, 10000);

      window[callback] = (respuesta) => {
        clearTimeout(respaldo);
        limpiar();
        if (respuesta.result === "success") {
          form.reset();
          avisar(T.listo, "ok");
        } else {
          const texto = String(respuesta.msg || "");
          if (/already subscribed|ya est/i.test(texto)) avisar(T.yaEsta, "ok");
          else if (/too many/i.test(texto)) avisar(T.muchos, "error");
          else avisar(T.error, "error");
        }
      };
      script.onerror = () => { clearTimeout(respaldo); limpiar(); form.submit(); };
      script.src = url;
      document.body.append(script);
    });
  });
})();
