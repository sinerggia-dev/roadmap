// Testa o que acontece quando a leitura de uma página FALHA.
//
// O RISCO, que é de perda de dados e não de aparência:
//
//   1. `getJsonByPath` engolia erro de JSON e devolvia `null` — o MESMO valor
//      que significa "o arquivo não existe". Arquivo truncado virava página
//      vazia.
//   2. `openPage` tratava qualquer falha como página nova e mostrava vazio.
//   3. Esse vazio ficava no cache. A primeira edição disparava
//      `scheduleSavePage`, que GRAVAVA O VAZIO POR CIMA do arquivo real.
//
// Uma falha de leitura passageira virava perda permanente. A trava do item 3 é
// o que este teste existe para proteger.
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

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. parar de confundir "não existe" com "não consegui ler" ---- */
const ler = ex("getJsonByPath", "async function ");
ok("404 continua sendo página nova, que é legítimo",
   /if \(res\.status === 404\) return null;/.test(ler));
ok("resposta vazia passa a estourar, em vez de virar página vazia",
   /if \(!text\) throw new Error/.test(ler));
ok("JSON ilegível passa a estourar",
   /catch\(e\)\{[\s\S]{0,420}throw new Error\([\s\S]{0,80}corrompido/.test(ler));
// Este é o ponto exato que causava o estrago.
ok("e NÃO existe mais um catch que devolve null calado",
   /catch\(e\)\{ return null; \}/.test(ler) === false);
ok("a mensagem diz qual arquivo e o tamanho, para dar para investigar",
   /\+ filename \+/.test(ler) && /text\.length/.test(ler));

/* ---- 2. a página entra em estado de falha, em vez de parecer vazia ---- */
const abrir = ex("openPage", "async function ");
ok("a falha é registrada com o motivo",
   /paginasComFalha\[id\] = \(e && e\.message\) \? e\.message : String\(e\)/.test(abrir));
ok("e some quando a leitura dá certo", /delete paginasComFalha\[id\]/.test(abrir));
ok("a tela é avisada a cada abertura", /pintaFalhaDaPagina\(id\)/.test(abrir));

const pinta = ex("pintaFalhaDaPagina");
ok("o aviso diz que o conteúdo mostrado NÃO é o da página",
   /n\\u00e3o \\u00e9 o conte\\u00fado dela/.test(pinta));
ok("avisa que nada será gravado", /nada ser\\u00e1 gravado/.test(pinta));
ok("mostra o motivo técnico, selecionável", /cod\.textContent = motivo/.test(pinta));
ok("e oferece tentar de novo, limpando o cache ruim",
   /delete pageContentCache\[id\]/.test(pinta) && /openPage\(id\)/.test(pinta));

/* ---- 3. A TRAVA: página não lida não pode ser gravada ---- */
// Sem isto, todo o resto é cosmético — o dado some do mesmo jeito.
const salvar = ex("doSavePage", "async function ");
const agendar = ex("scheduleSavePage");
ok("o salvamento recusa página que falhou ao carregar",
   /if \(paginasComFalha\[pageId\]\) return;/.test(salvar));
ok("e o agendamento também, antes mesmo de marcar como editando",
   /if \(paginasComFalha\[pageId\]\)\{/.test(agendar));
ok("a recusa acontece ANTES de qualquer escrita",
   salvar.indexOf("paginasComFalha") < salvar.indexOf("putJsonByPath"));
ok("o agendamento avisa na tela em vez de ficar calado",
   /foi carregada/.test(agendar));
ok("e o código explica que gravar apagaria o arquivo",
   /apagaria o arquivo/.test(salvar));

/* ---- 4. a ordem importa dentro do openPage ---- */
// O delete tem que vir DEPOIS da leitura dar certo; se viesse antes, uma
// falha deixaria a página destravada e gravável.
ok("a marca de falha só é retirada após a leitura ter dado certo",
   abrir.indexOf("migrateTaskStatuses") < abrir.indexOf("delete paginasComFalha"));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
