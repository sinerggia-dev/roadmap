// Testa a tela de carregamento entre o login e o app.
//
// O DEFEITO QUE ISTO FECHA: afterLogin() escondia a tela de login e só mostrava
// o #app depois de resolver o espaço no OneDrive. Nesse intervalo a tela ficava
// PRETA. E se qualquer coisa estourasse no meio, ficava preta para sempre, sem
// uma palavra — foi o que apareceu duas vezes como "tela branca".
//
// O que mais importa:
//  1. Nada do que indica carregamento pode morar dentro do #app, que está
//     escondido justamente durante a espera.
//  2. Todo caminho de saída tem de tirar a tela: sucesso, sem acesso, erro.
//  3. Erro vira mensagem com saída, nunca tela preta.
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

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. a tela de carregamento fica FORA do #app ---- */
// Esta é a raiz do defeito: o "Carregando…" era escrito em #statusText, que
// mora dentro do #app. Durante a espera, o #app está escondido.
const posApp = src.indexOf('<div id="app">');
["bootScreen", "bootPasso", "bootTempo", "bootErro", "bootRetryBtn", "bootLogoutBtn"].forEach(id => {
  const p = src.indexOf('id="' + id + '"');
  ok("#" + id + " existe e fica fora do #app", p > 0 && p < posApp, "posicao " + p);
});
// E a prova de que o problema era real: #statusText continua dentro do #app.
ok("o antigo #statusText realmente mora dentro do #app (por isso não servia)",
   src.indexOf('id="statusText"') > posApp);

/* ---- 2. todo caminho de saída tira a tela ---- */
const passos = ex("afterLoginPassos", "async function ");
ok("sem acesso: esconde a tela antes de mostrar o aviso",
   /bootEsconder\(\);\s*\n\s*showNoAccess\(\);/.test(passos));
ok("sucesso: esconde assim que o app aparece",
   /classList\.add\("visible"\);\s*\n\s*bootEsconder\(\);/.test(passos));
ok("trocar de conta esconde a tela", /bootEsconder\(\);\s*\n\s*doLogout\(\);/.test(src));
ok("sair pelo app também esconde", /if \(typeof bootEsconder === "function"\) bootEsconder\(\);/.test(src));

/* ---- 3. erro não vira tela preta ---- */
const after = ex("afterLogin", "async function ");
ok("a entrada inteira está dentro de um try",
   /try\{\s*\n\s*await afterLoginPassos\(\);\s*\n\s*\}catch\(e\)\{\s*\n\s*bootErro\(e\);/.test(after));
const erro = ex("bootErro");
ok("o erro aparece escrito na tela", /bootErroMsg"\)\.textContent = msg/.test(erro));
ok("como texto, nunca como HTML", /bootErroMsg[\s\S]{0,60}innerHTML/.test(erro) === false);
ok("o rodinha para de girar, para não parecer que ainda carrega",
   /bootSpinner"\)\.style\.display = "none"/.test(erro));
ok("e o relógio para junto", /clearInterval\(bootRelogio\)/.test(erro));
ok("oferece tentar de novo", /bootRetryBtn"\)\.addEventListener\("click", \(\) => \{ afterLogin\(\); \}\)/.test(src));
ok("e trocar de conta, para não prender quem entrou errado",
   /bootLogoutBtn"\)\.addEventListener/.test(src));

/* ---- 4. o relógio ---- */
const mostrar = ex("bootMostrar");
ok("conta o tempo da espera", /setInterval\(/.test(mostrar));
ok("mas só mostra depois de 4s, para não fazer a espera parecer maior",
   /seg >= 4 \? "\(" \+ seg \+ "s\)" : ""/.test(mostrar));
ok("não deixa dois relógios correndo juntos",
   /clearInterval\(bootRelogio\);\s*\n\s*bootRelogio = setInterval/.test(mostrar));
ok("esconder para o relógio", /clearInterval\(bootRelogio\)/.test(ex("bootEsconder")));
ok("e limpa o número, para a próxima entrada não começar com o tempo da anterior",
   /bootTempo"\)\.textContent = ""/.test(ex("bootEsconder")));

/* ---- 5. o texto do passo não apaga o contador ---- */
// Eles são irmãos dentro do mesmo <p>: escrever no <p> inteiro mataria o
// contador. Por isso o texto tem elemento próprio.
const passo = ex("bootPasso");
ok("o passo escreve no próprio elemento, não no parágrafo inteiro",
   /bootPasso"\)\.textContent = texto/.test(passo) && /bootStatusText/.test(passo) === false);

/* ---- 6. a pessoa vê em que passo está ---- */
ok("diz que está procurando o espaço", /bootMostrar\("Procurando o espa\u00e7o de notas/.test(src));
ok("depois, que está carregando as páginas", /bootPasso\("Carregando as p\u00e1ginas/.test(src));
ok("e diz qual página está abrindo, pelo nome",
   /setStatus\("Abrindo " \+ \(\(getPageMeta\(alvo\) \|\| \{\}\)\.title/.test(src));

/* ---- 7. aparece acima do resto, mas abaixo dos diálogos ---- */
ok("a tela cobre o fundo do app", /#bootScreen\{[\s\S]{0,200}z-index:120/.test(src));
ok("e o diálogo de erro ainda aparece por cima dela",
   /#dlgOverlay\{[\s\S]{0,160}z-index:500/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
