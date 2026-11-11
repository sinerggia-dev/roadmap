// Testa o painel de aparência: fundos e intensidade.
//
// O QUE MAIS IMPORTA:
//  1. CONTRASTE. Clarear o fundo de um tema escuro aproxima o texto claro do
//     fundo. Se o texto não andar na direção oposta, as pontas da escala ficam
//     ilegíveis — e quem mexeu no controle não tem como saber por quê.
//  2. Não acumular. O ajuste é relativo ao fundo base; medir sobre o valor já
//     ajustado faria o efeito crescer a cada movimento do controle.
//  3. Nunca gerar cor inválida.
const fs = require("fs");
const alvo = (process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html"));
const src = fs.readFileSync(alvo, "utf8");

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

eval([ex("hexParaRgb"), ex("rgbParaHex"), ex("misturarCor"),
      ex("luminancia"), ex("contrasteEntre"), ex("corDeTextoAjustada"),
      "globalThis.corDeTextoAjustada = corDeTextoAjustada;",
      src.match(/^const TEMA_PASSO = .*$/m)[0].replace("const ", "globalThis."),
      src.match(/^const TEMA_TOKENS_FUNDO = \[[\s\S]*?\];$/m)[0].replace("const ", "globalThis."),
      src.match(/^const TEMA_TOKENS_TEXTO = \[[\s\S]*?\];$/m)[0].replace("const ", "globalThis."),
      "globalThis.hexParaRgb = hexParaRgb; globalThis.misturarCor = misturarCor;"].join("\n"));

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

// Contraste WCAG, para medir de verdade em vez de confiar no olho.
function lum(hex) {
  const c = hexParaRgb(hex).map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* ---- 1. a mistura em si ---- */
ok("sem ajuste, a cor não muda", misturarCor("#232529", 0) === "#232529");
ok("positivo clareia", lum(misturarCor("#232529", 0.2)) > lum("#232529"));
ok("negativo escurece", lum(misturarCor("#f0f0f0", -0.2)) < lum("#f0f0f0"));
ok("preto clareado não passa de branco", hexParaRgb(misturarCor("#000000", 1)).join() === "255,255,255");
ok("branco escurecido não passa de preto", hexParaRgb(misturarCor("#ffffff", -1)).join() === "0,0,0");
ok("sempre devolve hex de 6 dígitos", /^#[0-9a-f]{6}$/.test(misturarCor("#0e1524", 0.045)));
ok("valor inválido devolve nulo, em vez de cor quebrada",
   misturarCor("", 0.1) === null && misturarCor("var(--x)", 0.1) === null &&
   misturarCor(undefined, 0.1) === null);
ok("espaço em volta não atrapalha (é como o getComputedStyle devolve)",
   misturarCor("  #232529  ", 0) === "#232529");

/* ---- 2. CONTRASTE nas pontas da escala ---- */
// Usa a logica REAL do app, nao uma copia: fundo deslocado, texto reajustado
// pela mesma funcao que roda no navegador.
function simular(bg, texto, n) {
  const bgNovo = misturarCor(bg, n * TEMA_PASSO);
  return { bg: bgNovo, texto: corDeTextoAjustada(texto, bg, bgNovo) };
}
const BASES = [
  ["Cinza",  "#121315", "#ecedee", "#a3a5ac"],
  ["Azul",   "#0e1524", "#e9edf6", "#a6b0c6"],
  ["Preto",  "#000000", "#f2f2f3", "#a8a8ae"],
  ["Claro",  "#f0f0f0", "#37352f", "#6b6a66"],
  ["Papel",  "#f1e8d5", "#3a3128", "#6a5e4c"],
];
BASES.forEach(([nome, bg, texto, textoFraco]) => {
  let pior = Infinity, piorN = 0, piorFraco = Infinity;
  for (let n = -4; n <= 4; n++) {
    const a = simular(bg, texto, n);
    const b = simular(bg, textoFraco, n);
    if (contraste(a.bg, a.texto) < pior) { pior = contraste(a.bg, a.texto); piorN = n; }
    piorFraco = Math.min(piorFraco, contraste(b.bg, b.texto));
  }
  // 4,5:1 é o mínimo da WCAG para texto normal.
  ok(nome + ": o texto principal nunca cai abaixo de 7:1",
     pior >= 7, "pior " + pior.toFixed(1) + ":1 no degrau " + piorN);
  ok(nome + ": o texto secundário nunca cai abaixo de 4,5:1",
     piorFraco >= 4.5, "pior " + piorFraco.toFixed(1) + ":1");
});

// A prova de que o reajuste e o que segura isso: sem ele, o pior caso piora.
// Tomado no tema claro com o texto secundario, que e onde ha menos folga.
function pior(com){
  let p = Infinity;
  for (let n = -4; n <= 4; n++){
    const bgNovo = misturarCor("#f0f0f0", n * TEMA_PASSO);
    const txt = com ? corDeTextoAjustada("#6b6a66", "#f0f0f0", bgNovo) : "#6b6a66";
    p = Math.min(p, contraste(bgNovo, txt));
  }
  return p;
}
ok("sem reajustar o texto, o contraste cai abaixo do minimo", pior(false) < 4.5,
   pior(false).toFixed(1));
ok("com o reajuste, ele se mantem", pior(true) >= 4.5, pior(true).toFixed(1));

// Quando o fundo se AFASTA do texto nao ha o que compensar: a cor fica igual.
ok("fundo que se afasta do texto nao mexe na cor dele",
   corDeTextoAjustada("#ecedee", "#121315", misturarCor("#121315", -0.18)) === "#ecedee");

/* ---- 3. não acumular ---- */
const apl = ex("aplicaIntensidade");
ok("zera os tokens antes de medir a base",
   /removeProperty\(t\)\)/.test(apl) &&
   apl.indexOf("removeProperty") < apl.indexOf("getComputedStyle"));
ok("o comentário explica por quê", /acumula/.test(apl));
ok("o texto e medido contra o fundo NOVO, nao deslocado as cegas",
   /corDeTextoAjustada\(atual, fundoBase, fundoNovo\)/.test(apl));
ok("intensidade 0 não escreve estilo nenhum", /if \(n\)\{/.test(apl));

/* ---- 4. persistência e a carga sem piscar ---- */
ok("guarda o número escolhido", /setItem\("roadmapTemaInt"/.test(apl));
ok("e o resultado pronto, para o <head> aplicar antes de desenhar",
   /setItem\("roadmapTemaCss"/.test(apl));
ok("o <head> aplica o ajuste salvo", /getItem\("roadmapTemaCss"\)/.test(src));
ok("e antes do corpo da página",
   src.indexOf('getItem("roadmapTemaCss")') < src.indexOf("<body>"));
ok("trocar de fundo recalcula a intensidade",
   /aplicaIntensidade\(intensidadeAtual\(\)\)/.test(ex("aplicaTema")));
ok("intensidade salva fora da faixa é contida",
   /Math\.max\(-4, Math\.min\(4,/.test(ex("intensidadeAtual")));

/* ---- 5. os fundos ---- */
const temas = src.match(/^const TEMAS = \[[\s\S]*?\];$/m)[0];
["grafite", "azul", "preto", "claro", "sepia"].forEach(id => {
  ok("fundo '" + id + "' está na lista", temas.indexOf('"' + id + '"') >= 0);
});
["preto", "sepia"].forEach(id => {
  ok("fundo '" + id + "' tem seu conjunto de cores no CSS",
     src.indexOf(':root[data-tema="' + id + '"]') >= 0);
});
ok("cada fundo tem uma amostra de cor, para escolher pelo olho",
   (temas.match(/amostra:/g) || []).length === 5);
ok("o fundo claro e o papel pedem desenho claro do navegador",
   /\[data-tema="sepia"\]\{[\s\S]{0,60}color-scheme:light/.test(src));
ok("o preto pede desenho escuro",
   /\[data-tema="preto"\]\{[\s\S]{0,60}color-scheme:dark/.test(src));

/* ---- 6. o painel ---- */
ok("abre e fecha pelo próprio botão", /p\.classList\.contains\("aberto"\) \) *\?|aberto"\)\) fecharPainelTema/.test(src));
ok("fecha ao clicar fora", /!p\.contains\(e\.target\) && e\.target !== btnTema/.test(src));
ok("fecha com Esc", /e\.key === "Escape"\) fecharPainelTema/.test(src));
ok("não sai pela borda da tela", /esq \+ largura > window\.innerWidth/.test(ex("abrirPainelTema")));
ok("tem botão de voltar ao padrão", /id="temaReset"/.test(src) && /aplicaIntensidade\(0\)/.test(src));
ok("o controle vai de -4 a +4", /min="-4" max="4"/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
