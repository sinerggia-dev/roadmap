// Testa a trava que impede gravar vazio por cima de página cheia.
//
// O CASO REAL: a página CLIENTES tinha 163 atividades e 6,58 MB. O app gravou
// {"tasks":[]} — 12 bytes — por cima, sem estranhar nada. Deu para recuperar
// pelo histórico do OneDrive, mas por sorte, não por projeto.
//
// A trava anterior cobre a causa conhecida (leitura que falhou). Esta cobre a
// CLASSE: seja qual for o motivo, trocar conteúdo cheio por vazio é drástico
// demais para acontecer calado. Não é preciso prever a próxima causa para
// impedir o próximo estrago.
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

eval(ex("contagemDeItens") + "\nglobalThis.contagemDeItens = contagemDeItens;");

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. a contagem, que é a referência de tudo ---- */
ok("conta as atividades", contagemDeItens({ tasks: [1, 2, 3] }) === 3);
ok("conta os eventos do calendário", contagemDeItens({ events: [1, 2] }) === 2);
ok("soma os tipos quando há mais de um", contagemDeItens({ tasks: [1], events: [1, 1] }) === 3);
ok("página vazia conta zero", contagemDeItens({ tasks: [] }) === 0);
ok("conteúdo ausente conta zero", contagemDeItens(null) === 0 && contagemDeItens({}) === 0);

// Página de notas nasce com um bloco vazio. Se ele contasse, a trava nunca
// dispararia numa página de notas — que também pode ser apagada por engano.
ok("bloco vazio não conta como conteúdo",
   contagemDeItens({ blocks: [{ content: "" }, { content: "   " }] }) === 0);
ok("mas bloco com texto conta",
   contagemDeItens({ blocks: [{ content: "oi" }, { content: "" }] }) === 1);
ok("bloco nulo não quebra a conta",
   contagemDeItens({ blocks: [null, { content: "x" }] }) === 1);

/* ---- 2. a trava ---- */
const salvar = ex("doSavePage", "async function ");
ok("compara o que havia com o que vai ser gravado",
   /const antes = contagemCarregada\[pageId\]/.test(salvar) &&
   /const agora = contagemDeItens\(content\)/.test(salvar));
ok("barra quando ia de algo para zero",
   /if \(antes > 0 && agora === 0/.test(salvar));
ok("e barra ANTES de qualquer escrita",
   salvar.indexOf("agora === 0") < salvar.indexOf("putJsonByPath"));
ok("avisa na tela em vez de ficar calado",
   /a p\\u00e1gina ficaria vazia/.test(salvar) && /pintaQuedaBrusca\(pageId\)/.test(salvar));

// Sem isto, uma página que legitimamente ficou vazia travaria para sempre: a
// referência precisa acompanhar o que foi de fato gravado.
ok("depois de gravar, a referência passa a ser o novo total",
   /contagemCarregada\[pageId\] = agora;/.test(salvar));
ok("e ela é definida ao ler a página",
   /contagemCarregada\[id\] = contagemDeItens\(pageContentCache\[id\]\)/.test(ex("openPage", "async function ")));

/* ---- 3. por que zero, e não "caiu muito" ---- */
// Um limite percentual pegaria exclusões legítimas em massa e viraria ruído —
// e aviso que aparece à toa é aviso que se aprende a ignorar.
ok("o critério é só o zero, sem porcentagem arbitrária",
   /agora === 0/.test(salvar) && /0\.[0-9]|% /.test(salvar) === false);
ok("o código explica a escolha", /falso\s*\n?\s*(positivo|.*positivo)/.test(salvar));

/* ---- 4. a saída: nunca prender a pessoa ---- */
const pinta = ex("pintaQuedaBrusca");
ok("diz quantos itens havia", /quedaBrusca\[id\]\.de/.test(pinta));
ok("tranquiliza: o arquivo continua intacto", /continua intacto/.test(pinta));
ok("ensina a desfazer sem perder nada", /Ctrl\+F5/.test(pinta));
ok("deixa esvaziar de propósito, com confirmação",
   /Esvaziar mesmo assim/.test(pinta) && /await perguntar\(/.test(pinta));
ok("e ao confirmar, zera a referência para não travar de novo",
   /contagemCarregada\[id\] = 0/.test(pinta));
ok("oferece recarregar e descartar o que está na tela",
   /delete pageContentCache\[id\]/.test(pinta) && /openPage\(id\)/.test(pinta));
ok("o aviso fica na tela em vez de abrir janela sozinha",
   /salvamento roda por temporizador/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
