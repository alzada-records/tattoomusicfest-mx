// Apps Script de la hoja "Tattoo Music Fest – Contacto" (Drive personal de Lorenzo).
// Recibe el formulario de Contacto de la página y agrega un renglón en la pestaña
// del tipo de solicitud. No manda correos a nadie.
//
// Se pega en la hoja: Extensiones > Apps Script, y se publica como
// Implementar > Nueva implementación > Aplicación web
//   (Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario).
// La URL que da Google va en CONTACTO_URL de js/contacto.js.

// Pestaña y columnas (en orden, después de Fecha, Nombre, Correo y Teléfono) de cada tipo.
const TIPOS = {
  aviso:       { hoja: "Avísame 2027",         campos: [] },
  boletos:     { hoja: "Boletos",              campos: ["ciudad", "boletos"] },
  concurso:    { hoja: "Concurso de tatuajes", campos: ["nombre_artistico", "estudio", "ciudad", "estilo", "portafolio"] },
  expo:        { hoja: "Stands de expo",       campos: ["negocio", "giro", "ciudad", "redes"] },
  alimentos:   { hoja: "Alimentos y bebidas",  campos: ["negocio", "tipo_comida", "necesita_luz", "redes"] },
  patrocinios: { hoja: "Marcas y patrocinios", campos: ["empresa", "cargo", "sitio_web", "tipo_colaboracion"] },
};

// Evita que un texto que empiece con = + - @ se tome como fórmula.
function limpiar(valor) {
  const texto = String(valor || "").trim().slice(0, 2000);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p["bot-field"]) return ContentService.createTextOutput("ok"); // trampa contra bots
  const tipo = TIPOS[p.tipo];
  if (!tipo) return ContentService.createTextOutput("tipo desconocido");

  const telefono = ((p.pais || "").replace(/^.*\s(\+\d+)$/, "$1") + " " + (p.telefono || "")).trim();
  const fila = [new Date(), limpiar(p.nombre), limpiar(p.correo), limpiar(telefono)]
    .concat(tipo.campos.map((c) => limpiar(p[c])))
    .concat([limpiar(p.mensaje), "Nuevo"]);

  SpreadsheetApp.getActive().getSheetByName(tipo.hoja).appendRow(fila);
  return ContentService.createTextOutput("ok");
}
