// Testa a senha das ações protegidas agora que o administrador pode trocá-la.
//
// O QUE MAIS IMPORTA: a conferência tem de ler o estado atual a cada chamada. Se
// alguém capturar o valor numa constante, trocar a senha não teria efeito até
// recarregar — e pior, a senha velha continuaria valendo sem ninguém ver.
// Node v14 aqui nao tem crypto.webcrypto: monto o mesmo SHA-256 por baixo, para
// o teste exercitar a funcao de verdade e nao uma imitacao dela.
const nodeCrypto = require("crypto");
globalThis.crypto = {
  subtle: {
    digest: async (alg, dados) => {
      const h = nodeCrypto.createHash("sha256").update(Buffer.from(dados)).digest();
      return h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength);
    },
  },
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
eval([
  src.match(/^const TASK_PASSWORD_PADRAO = .*$/m)[0].replace("const ", "globalThis."),
  ex("hashDaSenha", "async function "),
  ex("senhaAcoesDefinida"),
  ex("senhaAcoesConfere", "async function "),
  "globalThis.hashDaSenha = hashDaSenha; globalThis.senhaAcoesDefinida = senhaAcoesDefinida;",
  "globalThis.senhaAcoesConfere = senhaAcoesConfere;",
].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

(async () => {
  /* ---- 1. sem senha própria, vale a de fábrica ---- */
  ok("ninguém definiu nada ainda", senhaAcoesDefinida() === false);
  ok("a senha de fábrica funciona", await senhaAcoesConfere("123456"));
  ok("e outra qualquer não", (await senhaAcoesConfere("000000")) === false);

  /* ---- 2. o dono define a dele ---- */
  const sal = "a1b2c3d4e5f6";
  globalThis.usersData.senhaAcoes = { sal, hash: await hashDaSenha("Sinerggia@2026", sal) };
  ok("agora há senha própria", senhaAcoesDefinida() === true);
  ok("a senha nova funciona", await senhaAcoesConfere("Sinerggia@2026"));
  ok("A SENHA DE FÁBRICA PARA DE VALER", (await senhaAcoesConfere("123456")) === false);
  ok("senha parecida não passa", (await senhaAcoesConfere("sinerggia@2026")) === false);
  ok("senha vazia não passa", (await senhaAcoesConfere("")) === false);

  /* ---- 3. trocar de novo tem efeito na hora ---- */
  // É o caso que quebraria em silêncio se alguém capturasse o valor numa constante.
  const sal2 = "ffeeddccbbaa";
  globalThis.usersData.senhaAcoes = { sal: sal2, hash: await hashDaSenha("outra-senha", sal2) };
  ok("a senha mais nova funciona", await senhaAcoesConfere("outra-senha"));
  ok("e a anterior para de valer", (await senhaAcoesConfere("Sinerggia@2026")) === false);

  /* ---- 4. o sal faz diferença ---- */
  const h1 = await hashDaSenha("igual", "sal-um");
  const h2 = await hashDaSenha("igual", "sal-dois");
  ok("mesma senha com sal diferente dá hash diferente", h1 !== h2);
  ok("o hash tem cara de SHA-256", /^[0-9a-f]{64}$/.test(h1));
  ok("a senha não aparece no hash", h1.indexOf("igual") < 0);

  /* ---- 5. cadastro quebrado não libera ---- */
  globalThis.usersData.senhaAcoes = { sal: "x", hash: "" };
  ok("hash vazio cai na de fábrica, não libera tudo",
     senhaAcoesDefinida() === false && (await senhaAcoesConfere("qualquer")) === false);
  globalThis.usersData.senhaAcoes = null;
  ok("sem o campo, volta para a de fábrica", await senhaAcoesConfere("123456"));

  /* ---- 6. sem crypto, recusa em vez de liberar ---- */
  globalThis.usersData.senhaAcoes = { sal: "s", hash: "h" };
  const guardado = globalThis.crypto;
  globalThis.crypto = { subtle: { digest: () => { throw new Error("sem contexto seguro"); } } };
  ok("falha do crypto RECUSA, não libera", (await senhaAcoesConfere("h")) === false);
  globalThis.crypto = guardado;

  /* ---- 7. a senha não fica mais no código ---- */
  ok("a senha deixou de ser constante do código", !/const TASK_PASSWORD = /.test(src));
  ok("o que sobrou é só o valor de fábrica, nomeado como tal",
     /const TASK_PASSWORD_PADRAO = "123456"/.test(src));
  ok("todos os pontos de senha passam pela conferência",
     (src.match(/senhaAcoesConfere\(pass\)/g) || []).length === 2);

  /* ---- 8. gravação: hash e sal, nunca o texto ---- */
  const corpoSalvar = ex("salvarSenhaAcoes", "async function ");
  ok("grava hash e sal", /senhaAcoes = \{ sal: sal, hash: hash/.test(corpoSalvar));
  ok("NÃO grava a senha em texto",
     !/senhaAcoes[\s\S]{0,120}(senha|texto|nova):\s*nova/.test(corpoSalvar));
  ok("limpa os campos depois de salvar", /senhaAcoesNova"\)\.value = ""/.test(corpoSalvar));
  ok("exige as duas iguais", /nova !== repete/.test(corpoSalvar));
  ok("exige tamanho mínimo", /length < 4/.test(corpoSalvar));
  ok("relê os usuários antes de gravar, para não perder edição de outra aba",
     /await loadUsers\(\);[\s\S]{0,200}putJsonByPath\(USERS_FILENAME/.test(corpoSalvar));
  ok("o sal é aleatório, não fixo", /getRandomValues/.test(corpoSalvar));

  let n = 0;
  console.log("");
  for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
  console.log("\n" + n + "/" + casos.length + " ok");
  process.exit(n === casos.length ? 0 : 1);
})();
