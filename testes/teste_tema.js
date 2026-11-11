// Testa a troca de fundo: giro do botao, atributo no <html>, rotulo e
// persistencia. DOM e localStorage falsos, funcoes reais do index.html.
const fs = require("fs");
const src = fs.readFileSync((process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html")), "utf8");

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

// ---- stubs ----
const guardado = {};
globalThis.localStorage = {
  getItem: k => (k in guardado ? guardado[k] : null),
  setItem: (k, v) => { guardado[k] = String(v); },
};
const raiz = {
  attrs: {},
  getAttribute(n) { return n in this.attrs ? this.attrs[n] : null; },
  setAttribute(n, v) { this.attrs[n] = v; },
  removeAttribute(n) { delete this.attrs[n]; },
};
const botao = { innerHTML: "", title: "" };
globalThis.document = { documentElement: raiz, getElementById: id => (id === "temaBtn" ? botao : null) };
globalThis.escapeHtml = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---- codigo real ----
// `const` dentro de eval nao escapa do eval: passo para globalThis.
const TEMAS_SRC = require('./teste_tema_fix').blocoTemas();
eval([TEMAS_SRC, ex("temaAtual"), ex("aplicaTema")].join(String.fromCharCode(10)));
const TEMAS = globalThis.TEMAS;
eval([TEMAS_SRC, ex("temaAtual"), ex("aplicaTema")].join("\n"));

function gira() {   // mesmo corpo do listener
  const i = TEMAS.indexOf(temaAtual());
  aplicaTema(TEMAS[(i + 1) % TEMAS.length].id);
}

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

// ---------- 1. estado inicial: cinza, sem atributo ----------
aplicaTema(temaAtual().id);
ok("comeca no cinza", temaAtual().id === "grafite");
ok("padrao nao suja o <html> com atributo", raiz.getAttribute("data-tema") === null);
ok("rotulo mostra o fundo atual", botao.innerHTML.includes("Cinza"));
ok("title explica o clique", /clique para mudar/i.test(botao.title));

// ---------- 2. escolher direto, em vez de girar ----------
// O botao deixou de girar entre os fundos: agora abre um painel e cada fundo e
// escolhido direto. Girar entre cinco opcoes para achar a desejada seria pior
// que a versao de tres.
TEMAS.forEach(t => {
  aplicaTema(t.id);
  ok("escolher '" + t.nome + "' aplica esse fundo", temaAtual().id === t.id);
});
aplicaTema("grafite");
ok("o padrao continua sem sujar o <html>", raiz.getAttribute("data-tema") === null);
ok("e os outros marcam o atributo",
   (aplicaTema("sepia"), raiz.getAttribute("data-tema") === "sepia"));
aplicaTema("grafite");

// ---------- 3. atributo certo em cada fundo ----------
aplicaTema("claro");
ok("claro marca data-tema=claro", raiz.getAttribute("data-tema") === "claro");
ok("rotulo acompanha", botao.innerHTML.includes("Claro"));
aplicaTema("azul");
ok("azul marca data-tema=azul", raiz.getAttribute("data-tema") === "azul");
aplicaTema("grafite");
ok("voltar ao cinza remove o atributo", raiz.getAttribute("data-tema") === null);

// ---------- 4. persistencia ----------
aplicaTema("azul");
ok("gravou a escolha", guardado.roadmapTema === "azul");
aplicaTema("grafite");
ok("grava o padrao tambem (escolha explicita)", guardado.roadmapTema === "grafite");

// ---------- 5. id invalido nao quebra ----------
aplicaTema("roxo-neon");
ok("id desconhecido cai no padrao", temaAtual().id === "grafite" && raiz.getAttribute("data-tema") === null);

// ---------- 6. o script do <head> respeita o que foi gravado ----------
const cedo = src.match(/<script>\s*\/\*[\s\S]*?roadmapTema[\s\S]*?<\/script>/)[0];
const corpo = cedo.replace(/<\/?script>/g, "");
raiz.attrs = {}; guardado.roadmapTema = "claro";
eval(corpo);
ok("carga aplica o fundo gravado antes de pintar", raiz.getAttribute("data-tema") === "claro");
raiz.attrs = {}; guardado.roadmapTema = "grafite";
eval(corpo);
ok("carga no padrao nao poe atributo", raiz.getAttribute("data-tema") === null);
delete guardado.roadmapTema;
raiz.attrs = {};
eval(corpo);
ok("sem nada gravado fica no padrao", raiz.getAttribute("data-tema") === null);

// ---------- 7. localStorage bloqueado nao derruba a tela ----------
const real = globalThis.localStorage;
globalThis.localStorage = { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } };
let caiu = false;
try { aplicaTema("azul"); eval(corpo); } catch (e) { caiu = true; }
globalThis.localStorage = real;
ok("localStorage bloqueado nao lanca erro", !caiu);

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
