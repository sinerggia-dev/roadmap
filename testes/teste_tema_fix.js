// Extrai TEMAS sem regex (evita camada de escape) e devolve para globalThis,
// porque `const` dentro de eval nao escapa do eval.
const fs = require("fs");
const src = fs.readFileSync((process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html")), "utf8");

function blocoTemas() {
  const i = src.indexOf("const TEMAS = ");
  const f = src.indexOf("];", i) + 2;
  return src.slice(i, f).replace("const ", "globalThis.");
}
module.exports = { blocoTemas };
