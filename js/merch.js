// Merch de Tattoo Music Fest desde la tienda de Alzada Streetwear (Shopify).
// Lee la colección pública y arma el carrusel. Si falla, solo queda el botón "Ver tienda".

// Todo va dentro de su propio bloque para no chocar con los otros scripts de la página.
(() => {
  const TIENDA = "https://alzadastreetwear.com";
  const COLECCION = "tattoo-music-fest-mx";

  const lista = document.getElementById("merch-lista");
  const flechas = document.querySelector(".merch-flechas");
  const MERCH_EN = document.documentElement.lang === "en";
  const precio = new Intl.NumberFormat(MERCH_EN ? "en-US" : "es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  function limpiarTitulo(t) {
    return t.replace(/\s{2,}/g, " ").trim();
  }

  // Pide a Shopify la imagen ya reducida.
  function imagenChica(url, ancho) {
    return url + (url.includes("?") ? "&" : "?") + "width=" + ancho;
  }

  function pintar(productos) {
    for (const p of productos) {
      const disponible = p.variants.some((v) => v.available);
      const foto = p.images[0] && p.images[0].src;
      const minimo = Math.min(...p.variants.map((v) => parseFloat(v.price)));

      const li = document.createElement("li");
      li.className = "merch-producto";
      const a = document.createElement("a");
      a.href = `${TIENDA}/products/${p.handle}`;
      a.target = "_blank";
      a.rel = "noopener";

      const marco = document.createElement("div");
      marco.className = "merch-foto";
      if (foto) {
        const img = document.createElement("img");
        img.src = imagenChica(foto, 600);
        img.srcset = `${imagenChica(foto, 400)} 400w, ${imagenChica(foto, 800)} 800w`;
        img.sizes = "(min-width: 900px) 260px, 70vw";
        img.alt = "";
        img.width = 600;
        img.height = 600;
        img.loading = "lazy";
        img.decoding = "async";
        marco.append(img);
      }
      if (!disponible) {
        const etiqueta = document.createElement("span");
        etiqueta.className = "merch-agotado";
        etiqueta.textContent = MERCH_EN ? "Sold out" : "Agotado";
        marco.append(etiqueta);
      }

      const nombre = document.createElement("span");
      nombre.className = "merch-nombre";
      nombre.textContent = limpiarTitulo(p.title);
      const costo = document.createElement("span");
      costo.className = "merch-precio";
      costo.textContent = precio.format(minimo);

      a.append(marco, nombre, costo);
      li.append(a);
      lista.append(li);
    }
  }

  function moverCarrusel(direccion) {
    const tarjeta = lista.querySelector(".merch-producto");
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : 300;
    const suave = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollBy({ left: direccion * paso * 2, behavior: suave ? "smooth" : "auto" });
  }

  async function iniciar() {
    try {
      const r = await fetch(`${TIENDA}/collections/${COLECCION}/products.json?limit=50`);
      if (!r.ok) throw new Error("Shopify respondió " + r.status);
      const { products } = await r.json();
      if (!products || !products.length) return;
      // Orden: primero las preventas, luego lo disponible y al final lo agotado.
      const peso = (p) => (/preventa/i.test(p.title) ? 2 : 0) + (p.variants.some((v) => v.available) ? 1 : 0);
      products.sort((a, b) => peso(b) - peso(a));
      pintar(products);
      flechas.hidden = false;
      flechas.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => moverCarrusel(Number(b.dataset.dir)))
      );
    } catch (e) {
      // Sin productos: se queda solo el botón "Ver tienda".
    }
  }

  iniciar();
})();
