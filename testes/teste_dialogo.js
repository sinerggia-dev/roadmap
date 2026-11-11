// Testa a janela de aviso e confirmação que substituiu o confirm()/alert() do
// navegador.
//
// O QUE MAIS IMPORTA, de longe:
//   TODA chamada a perguntar() tem que ser esperada com await.
//   perguntar() devolve uma Promise. Sem await, `!perguntar(...)` é sempre
//   false — ou seja, o código segue adiante como se a pessoa tivesse clicado
//   em Confirmar. Um "Excluir página?" que apaga sem perguntar.
const fs = require("fs");
const caminho = process.env.ALVO ||
  (process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html"));
const src = fs.readFileSync(caminho, "utf8");

function ex(n, prefixo) {
  const marca = (prefixo || "function ") + n + "(";
  const i = src.indexOf(marca);
  if (i < 0) throw new Error("nao achei " + n);
  let d = 0, f = -1;
  for (let j = src.indexOf("{", i); j < src.length; j++) {
    if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (!d) { f = j + 1; break; } }
  }
  return src.slice(i, f);
}

// Só o JS, sem comentários: a palavra "alert" aparece nos comentários que
// explicam por que ela não é mais usada.
const js = src.slice(src.lastIndexOf("<script>"), src.lastIndexOf("</script>"))
              .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. o await, que é o que separa "perguntar" de "fingir que perguntou" ---- */
const semAwait = [];
js.split("\n").forEach((l, i) => {
  if (/\bfunction perguntar\(/.test(l) || /dlgNaFila/.test(l)) return;
  if (/(?<!await )\bperguntar\(/.test(l)) semAwait.push((i + 1) + ": " + l.trim().slice(0, 70));
});
ok("toda pergunta é esperada com await", semAwait.length === 0, semAwait.join(" | "));

const chamadas = (js.match(/await perguntar\(/g) || []).length;
ok("e há perguntas de verdade no app (não passou por estar vazio)", chamadas >= 9, chamadas + " chamadas");

// Cada uma tem de estar dentro de `if (!(await perguntar(...)))` ou equivalente:
// chamar e ignorar o resultado seria o mesmo que não perguntar.
const ignoradas = [];
js.split("\n").forEach((l, i) => {
  if (!/await perguntar\(/.test(l)) return;
  if (!/!\(await perguntar\(|= await perguntar\(|return await perguntar\(/.test(l)) {
    ignoradas.push((i + 1) + ": " + l.trim().slice(0, 70));
  }
});
ok("e o resultado da pergunta é sempre usado", ignoradas.length === 0, ignoradas.join(" | "));

/* ---- 2. o do navegador saiu de cena ---- */
ok("nenhum confirm() do navegador sobrou", /(?<![\w.])confirm\(/.test(js) === false);
ok("nenhum alert() do navegador sobrou", /(?<![\w.])alert\(/.test(js) === false);

/* ---- 3. a janela ---- */
const mostrar = ex("dlgMostrar");
ok("a mensagem entra como texto, nunca como HTML",
   /dlgTexto"\)\.textContent =/.test(mostrar) && /dlgTexto[\s\S]{0,60}innerHTML/.test(mostrar) === false);
ok("Esc cancela", /"Escape"[\s\S]{0,90}dlgFechar\(false\)/.test(mostrar));
ok("Enter confirma", /"Enter"[\s\S]{0,90}dlgFechar\(true\)/.test(mostrar));
ok("escuta na captura, para o Esc não fechar a janela de baixo junto",
   /addEventListener\("keydown", aoTeclar, true\)/.test(mostrar));
ok("e para de escutar ao fechar, sem deixar ouvinte solto",
   /removeEventListener\("keydown", aoTeclar, true\)/.test(mostrar));
ok("o foco vai para o botão principal, para o Enter funcionar", /btnOk\.focus\(\)/.test(mostrar));
ok("ação destrutiva fica em vermelho", /o\.perigo \? "perigo" : "principal"/.test(mostrar));
ok("aviso simples não mostra Cancelar", /btnCancelar\.hidden = !o\.pergunta/.test(mostrar));
ok("dá para trocar o texto dos botões", /o\.ok \|\|/.test(mostrar) && /o\.cancelar \|\|/.test(mostrar));

const fora = src.slice(src.indexOf('document.getElementById("dlgOverlay").addEventListener'));
ok("clicar fora cancela, nunca confirma",
   /dlgOverlay" && dlgFechar\) dlgFechar\(false\)/.test(fora));

/* ---- 4. a fila: dois avisos seguidos não podem se atropelar ---- */
const fila = ex("dlgNaFila");
ok("o segundo aviso espera o primeiro fechar", /dlgFila\.then\(\(\) => dlgMostrar/.test(fila));
ok("um aviso cancelado não trava a fila para sempre", /dlgFila = proxima\.catch\(/.test(fila));

/* ---- 5. as ações destrutivas pedem confirmação em vermelho ---- */
const destrutivas = ["Excluir p\u00e1gina", "Excluir nota", "Apagar resumo",
                     "Descartar grava\u00e7\u00e3o", "Tirar \u00e1udio", "Tirar documento",
                     "Remover anexo", "Remover acesso", "Substituir resumos"];
const faltando = destrutivas.filter(t => src.indexOf('titulo: "' + t + '"') < 0);
ok("toda ação destrutiva tem título próprio", faltando.length === 0, faltando.join(", "));
const semPerigo = destrutivas.filter(t => {
  const i = src.indexOf('titulo: "' + t + '"');
  return i < 0 || src.slice(i, i + 160).indexOf("perigo: true") < 0;
});
ok("e todas marcadas como perigosas (botão vermelho)", semPerigo.length === 0, semPerigo.join(", "));

/* ---- 6. acessibilidade mínima ---- */
ok("a janela se anuncia como diálogo", /id="dlgModal" role="dialog" aria-modal="true"/.test(src));
ok("e é ligada ao próprio título", /aria-labelledby="dlgTitulo"/.test(src));
ok("fica acima de tudo, inclusive do gravador",
   /#dlgOverlay\{[\s\S]{0,160}z-index:500/.test(src));
ok("a mensagem respeita as quebras de linha", /#dlgTexto\{[\s\S]{0,160}white-space:pre-wrap/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
