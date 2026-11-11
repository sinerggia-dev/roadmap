// Testa o backup: o que entra, o que não entra, e o que acontece quando uma
// página não pode ser lida.
//
// O QUE MAIS IMPORTA: uma página ilegível não pode derrubar o backup das outras.
// Backup que falha inteiro por causa de um arquivo é backup que não existe.
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

// ---- stubs do OneDrive ----
globalThis.INDEX_FILENAME = "_indice.json";
globalThis.USERS_FILENAME = "_usuarios.json";
globalThis.currentUserEmail = "natanael.silva@sinerggia.com.br";
let paginaQuebrada = null;
const DISCO = {
  "_indice.json": { pages: [
    { id: "p1", title: "ROADMAP", kind: "tarefas" },
    { id: "p2", title: "Calendário", kind: "calendario" },
    { id: "p3", title: "Bloco", kind: "notas" },
  ]},
  "_usuarios.json": { usuarios: [{ email: "ivanilda@sinerggia.com.br", role: "Editor" }] },
  "pagina_p1.json": { tasks: [{ id: "t1" }, { id: "t2" }, { id: "t3" }] },
  "pagina_p2.json": { events: [{ id: "e1" }, { id: "e2" }] },
  "pagina_p3.json": { blocks: [{ id: "b1" }] },
};
globalThis.getJsonByPath = async (nome) => {
  if (nome === paginaQuebrada) throw new Error("status 500");
  return DISCO[nome] || null;
};
let anexosNoDrive = [
  { nome: "Treinamentos.xlsx", tamanho: 24576, modificado: "2026-09-01T10:00:00Z", endereco: "https://x/1" },
  { nome: "Screenshot_8.png", tamanho: 102400, modificado: "2026-09-16T16:10:00Z", endereco: "https://x/2" },
];
globalThis.listaDeAnexos = async () => anexosNoDrive;

eval([ex("montarBackup", "async function "), ex("contaDoBackup"),
      "globalThis.montarBackup = montarBackup; globalThis.contaDoBackup = contaDoBackup;"].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

(async () => {
  /* ---- 1. leva tudo o que o app grava ---- */
  const p = await montarBackup(null);
  ok("leva o índice", p.indice && p.indice.pages.length === 3);
  ok("leva os usuários", p.usuarios && p.usuarios.usuarios.length === 1);
  ok("leva uma entrada por página", Object.keys(p.paginas).length === 3);
  ok("leva as tarefas", p.paginas.p1.tasks.length === 3);
  ok("leva os eventos do calendário", p.paginas.p2.events.length === 2);
  ok("leva os blocos de nota", p.paginas.p3.blocks.length === 1);

  /* ---- 2. identificação do arquivo ---- */
  ok("diz o formato e a versão", p.formato === "roadmap-backup" && p.versao === 1);
  ok("diz quando foi gerado", /^\d{4}-\d{2}-\d{2}T/.test(p.gerado_em));
  ok("diz por quem", p.gerado_por === globalThis.currentUserEmail);

  /* ---- 3. anexos: a lista entra, os arquivos não ---- */
  ok("lista os anexos", p.anexos.itens.length === 2);
  ok("com nome e endereço de cada um",
     p.anexos.itens[0].nome === "Treinamentos.xlsx" && !!p.anexos.itens[0].endereco);
  ok("e avisa que os arquivos não estão aqui", /não estão neste backup/.test(p.anexos.observacao));
  const texto = JSON.stringify(p);
  ok("nenhum conteúdo binário foi embutido",
     texto.indexOf("base64") < 0 && texto.length < 20000);

  /* ---- 4. uma página ilegível não derruba o resto ---- */
  paginaQuebrada = "pagina_p2.json";
  const q = await montarBackup(null);
  ok("as outras páginas continuam no backup",
     q.paginas.p1.tasks.length === 3 && q.paginas.p3.blocks.length === 1);
  ok("a página com problema fica registrada, não omitida",
     q.paginas.p2 && /status 500/.test(q.paginas.p2._erro_ao_ler));
  paginaQuebrada = null;

  /* ---- 5. a contagem que vai para a tela ---- */
  const n = contaDoBackup(p);
  ok("conta páginas, tarefas, blocos e eventos",
     n.paginas === 3 && n.tarefas === 3 && n.blocos === 1 && n.eventos === 2);
  ok("e conta os anexos listados", n.anexos === 2);

  /* ---- 6. avisos de andamento, que é backup demorado ---- */
  const passos = [];
  await montarBackup((t) => passos.push(t));
  ok("avisa o andamento durante a leitura", passos.length >= 4, passos.length);
  ok("diz em qual página está", passos.some(t => /página 2 de 3/.test(t)), passos);

  /* ---- 7. bordas ---- */
  DISCO["_indice.json"] = { pages: [] };
  const vazio = await montarBackup(null);
  ok("espaço sem páginas gera backup válido mesmo assim",
     vazio.formato === "roadmap-backup" && Object.keys(vazio.paginas).length === 0);
  anexosNoDrive = [];
  const semAnexo = await montarBackup(null);
  ok("sem anexos não quebra", semAnexo.anexos.itens.length === 0);

  /* ---- 8. lê do OneDrive, não do cache da sessão ---- */
  ok("usa getJsonByPath, não pageContentCache",
     ex("montarBackup", "async function ").indexOf("pageContentCache") < 0 &&
     /getJsonByPath\("pagina_"/.test(src));
  ok("e a listagem de arquivos ignora o cache do navegador",
     /listaDeUmaPasta[\s\S]{0,400}cache: "no-store"/.test(src));
  // Um backup que listasse so os Anexos pareceria completo e nao seria: os
  // documentos do Office e os audios de reuniao ficariam de fora, justamente
  // num momento de emergencia, que e quando esse arquivo e aberto.
  ok("lista as tres pastas, nao so os anexos",
     /return \[ATTACH_FOLDER, DOCS_FOLDER, AUDIO_FOLDER\]/.test(src));
  ok("uma pasta que ainda nao existe nao derruba as outras",
     /if \(!res\.ok\) return \[\];/.test(src) && /catch\(e\)\{ return \[\]; \}/.test(src));

  /* ---- 9. o download solta a memória depois ---- */
  ok("revoga a URL do arquivo depois do download", /revokeObjectURL/.test(src));
  ok("o nome do arquivo tem a data", /roadmap-backup-" \+ formatDateISO/.test(src));

  let n2 = 0;
  console.log("");
  for (const [d, c] of casos) { if (c) n2++; console.log((c ? "ok    " : "FALHA ") + d); }
  console.log("\n" + n2 + "/" + casos.length + " ok");
  process.exit(n2 === casos.length ? 0 : 1);
})();
