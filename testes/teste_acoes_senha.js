// Testa a senha por ação: ligar e desligar onde ela é pedida.
//
// O QUE MAIS IMPORTA, em ordem:
//  1. ausente = exige. Quem nunca mexeu na lista não pode ver o app ficar aberto
//     sozinho no dia do deploy.
//  2. desligar uma ação NÃO pode desligar as outras.
//  3. todo ponto do app tem de declarar a que ação pertence — ponto sem chave
//     passa a pedir senha sempre, e nenhum interruptor o alcança.
const nodeCrypto = require("crypto");
globalThis.crypto = {
  subtle: { digest: async (a, d) => {
    const h = nodeCrypto.createHash("sha256").update(Buffer.from(d)).digest();
    return h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength);
  } },
  getRandomValues: (arr) => { nodeCrypto.randomFillSync(arr); return arr; },
};
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

globalThis.usersData = { usuarios: [] };
let perguntou = 0;
globalThis.askPassword = async () => { perguntou++; return "123456"; };
globalThis.alert = () => {};

eval([
  src.match(/^const TASK_PASSWORD_PADRAO = .*$/m)[0].replace("const ", "globalThis."),
  src.match(/^const ACOES_COM_SENHA = \[[\s\S]*?\];$/m)[0].replace("const ", "globalThis."),
  ex("hashDaSenha", "async function "), ex("senhaAcoesDefinida"),
  ex("senhaAcoesConfere", "async function "), ex("exigeSenhaPara"),
  ex("requestEditPassword", "async function "), ex("requestDeletePassword", "async function "),
  src.match(/^const TASK_EDIT_GRACE_MS = .*$/m)[0].replace("const ", "globalThis."),
  ex("isTaskWithinGracePeriod"), ex("guardTaskFieldEdit", "async function "),
  "globalThis.exigeSenhaPara = exigeSenhaPara;",
  "globalThis.requestEditPassword = requestEditPassword;",
  "globalThis.requestDeletePassword = requestDeletePassword;",
  "globalThis.guardTaskFieldEdit = guardTaskFieldEdit;",
].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);
const CHAVES = ACOES_COM_SENHA.map(a => a.key);

(async () => {
  /* ---- 1. ausente = exige ---- */
  ok("sem configuração, toda ação pede senha", CHAVES.every(k => exigeSenhaPara(k)));
  perguntou = 0;
  await requestEditPassword("layoutColunas");
  ok("e a senha é realmente pedida", perguntou === 1);

  /* ---- 2. desligar uma não desliga as outras ---- */
  globalThis.usersData.acoesComSenha = { layoutColunas: false };
  ok("a ação desligada passa direto", exigeSenhaPara("layoutColunas") === false);
  ok("as outras seis continuam exigindo",
     CHAVES.filter(k => k !== "layoutColunas").every(k => exigeSenhaPara(k)));
  perguntou = 0;
  ok("mover coluna não pergunta mais", (await requestEditPassword("layoutColunas")) === true && perguntou === 0);
  perguntou = 0;
  await requestDeletePassword(undefined, "excluirTarefa");
  ok("mas excluir tarefa ainda pergunta", perguntou === 1);

  // mover e esconder sao coisas diferentes: desligar uma nao solta a outra
  globalThis.usersData.acoesComSenha = { moverColunas: false };
  ok("arrastar coluna liberado não libera esconder coluna",
     exigeSenhaPara("moverColunas") === false && exigeSenhaPara("layoutColunas") === true);
  globalThis.usersData.acoesComSenha = { layoutColunas: false };
  ok("e o contrário também vale",
     exigeSenhaPara("layoutColunas") === false && exigeSenhaPara("moverColunas") === true);
  globalThis.usersData.acoesComSenha = { layoutColunas: false };

  /* ---- 3. a lista mista do "Restaurar tudo" ---- */
  // Ele mexe em colunas E na barra: só dispensa a senha se as duas dispensarem.
  const MISTO = ["layoutBarra", "layoutColunas", "moverColunas"];
  ok("uma das três ligada ainda exige", exigeSenhaPara(MISTO) === true);
  globalThis.usersData.acoesComSenha.layoutBarra = false;
  ok("duas desligadas e uma ligada: ainda exige", exigeSenhaPara(MISTO) === true);
  globalThis.usersData.acoesComSenha.moverColunas = false;
  ok("as três desligadas, aí sim dispensa", exigeSenhaPara(MISTO) === false);

  /* ---- 4. religar volta a pedir ---- */
  globalThis.usersData.acoesComSenha.layoutColunas = true;
  ok("religar volta a exigir", exigeSenhaPara("layoutColunas") === true);

  /* ---- 5. chamada sem ação nenhuma continua exigindo ---- */
  // Se um ponto novo esquecer a chave, o erro tem de ser para o lado seguro.
  ok("ponto sem chave pede senha", exigeSenhaPara(undefined) === true);
  ok("e string vazia também", exigeSenhaPara("") === true);
  ok("chave desconhecida pede senha", exigeSenhaPara("inventada") === true);

  /* ---- 6. o campo de tarefa usa editarTarefa por padrão ---- */
  globalThis.usersData.acoesComSenha = { editarTarefa: false };
  const velha = { createdAt: "2020-01-01T00:00:00.000Z" };   // fora do período de graça
  perguntou = 0;
  ok("campo de tarefa sem senha, quando desligado",
     (await guardTaskFieldEdit(velha)) === true && perguntou === 0);
  globalThis.usersData.acoesComSenha = {};
  perguntou = 0;
  await guardTaskFieldEdit(velha);
  ok("e volta a pedir quando ligado", perguntou === 1);
  // O período de graça continua mandando: tarefa recém-criada não pede nada.
  perguntou = 0;
  ok("tarefa recém-criada segue sem senha",
     (await guardTaskFieldEdit({ createdAt: new Date().toISOString() })) === true && perguntou === 0);

  /* ---- 7. todo ponto do app declara a que ação pertence ---- */
  const semChave = [];
  src.split("\n").forEach((linha, i) => {
    if (/async function (requestEditPassword|requestDeletePassword|guardTaskFieldEdit)/.test(linha)) return;
    if (/requestEditPassword\(\)/.test(linha)) semChave.push((i + 1) + " requestEditPassword");
    if (/requestDeletePassword\(\)/.test(linha)) semChave.push((i + 1) + " requestDeletePassword");
    if (/guardTaskFieldEdit\((task|noteModalTask)\)/.test(linha)) semChave.push((i + 1) + " guardTaskFieldEdit");
  });
  // `guardTaskFieldEdit` chama requestEditPassword internamente, com acao.
  ok("nenhum ponto do app ficou sem chave", semChave.length === 0, semChave);

  /* ---- 8. as sete chaves da lista existem no código ---- */
  const faltando = CHAVES.filter(k => (src.match(new RegExp('"' + k + '"', "g")) || []).length < 2);
  ok("toda ação da lista é usada em algum ponto", faltando.length === 0, faltando);
  // A lista cresce quando uma funcao nova precisa de senha. O que o teste protege
  // nao e o numero, e sim que TODA chave declarada seja usada em algum ponto do app
  // (logo abaixo) e que nenhum ponto fique sem chave.
  ok("há mais de um grupo, e todos com chave distinta",
     CHAVES.length >= 8 && new Set(CHAVES).size === CHAVES.length);
  ok("a coluna Documento entrou na lista", CHAVES.indexOf("documento") >= 0);
  ok("mover coluna é categoria própria", CHAVES.indexOf("moverColunas") >= 0);
  ok("e esconder/restaurar continua separada", CHAVES.indexOf("layoutColunas") >= 0);
  ok("cada uma tem rótulo em português",
     ACOES_COM_SENHA.every(a => a.label && a.label.length > 8));

  /* ---- 9. gravação da lista ---- */
  const corpo = ex("renderAcoesComSenha");
  ok("grava a cada clique, sem botão de salvar",
     /putJsonByPath\(USERS_FILENAME/.test(corpo) && corpo.indexOf("Salvar") < 0);
  ok("relê antes de gravar", /await loadUsers\(\)/.test(corpo));
  ok("se não gravar, desmarca de volta",
     /catch[\s\S]{0,160}cb\.checked = !cb\.checked/.test(corpo));

  let n = 0;
  console.log("");
  for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
  console.log("\n" + n + "/" + casos.length + " ok");
  process.exit(n === casos.length ? 0 : 1);
})();
