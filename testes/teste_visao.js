// Testa a visibilidade da barra, o menu da engrenagem e a coluna Horário.
//
// O QUE MAIS IMPORTA: a guarda contra o beco. Escondendo Tabela E Kanban a pessoa
// ficaria presa na visão em que estivesse, e a saída seria pela Administração.
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
function exLinha(re) {
  const m = src.match(re);
  if (!m) throw new Error("nao achei " + re);
  return m[0];
}
function exBloco(de, ate) {
  const i = src.indexOf(de), f = src.indexOf(ate, i);
  if (i < 0 || f < 0) throw new Error("nao achei o bloco " + de);
  return src.slice(i, f);
}

// ---- DOM falso ----
const elementos = {};
function novoEl(id) {
  const el = {
    id, hidden: false, innerHTML: "", checked: false, type: "",
    filhos: [],
    appendChild(c) { this.filhos.push(c); return c; },
    createTextNode() {},
    addEventListener() {},
    querySelector(sel) {
      const k = (sel.match(/data-tkey="([^"]+)"/) || [])[1];
      return k ? (elementos["tk:" + k] || null) : null;
    },
  };
  elementos[id] = el;
  return el;
}
const barra = novoEl("taskToolbarRow");
["tableView","kanbanView","group","status","dueState","company","assignee","due","search","clear","export","print"]
  .forEach(k => { elementos["tk:" + k] = { hidden: false, dataset: { tkey: k } }; });

globalThis.document = {
  getElementById: (id) => elementos[id] || null,
  createElement: () => {
    const e = { className: "", type: "", checked: false, filhos: [],
      appendChild(c) { this.filhos.push(c); }, addEventListener(ev, fn) { this.on = fn; } };
    return e;
  },
  createTextNode: (t) => ({ texto: t }),
};
let guardado = {};
globalThis.localStorage = {
  getItem: (k) => (k in guardado ? guardado[k] : null),
  setItem: (k, v) => { guardado[k] = v; },
};
let avisos = [];
globalThis.setStatus = (m) => avisos.push(m);
globalThis.renderTasks = () => { redesenhos++; };
let redesenhos = 0;
globalThis.renderTaskFilterTabs = () => {};
globalThis.taskFilter = "Todas"; globalThis.taskDueStateFilter = "Todos";
globalThis.taskCompanyFilter = "Todas"; globalThis.taskAssigneeFilter = "Todos";
globalThis.taskDueFromFilter = ""; globalThis.taskDueToFilter = ""; globalThis.taskSearchText = "";
globalThis.requestEditPassword = async () => true;
globalThis.taskColVisibility = {};
globalThis.saveTaskColVisibility = () => {};

// ---- codigo real ----
eval([
  exLinha(/^const DEFAULT_TOOLBAR_ORDER = .*$/m).replace("const ", "globalThis."),
  exBloco("const TOOLBAR_LABELS = {", "let toolbarVisibility = {};").replace("const TOOLBAR_LABELS", "globalThis.TOOLBAR_LABELS"),
  "globalThis.toolbarVisibility = {};",
  ex("saveToolbarVisibility"),
  exLinha(/^function toolbarVisivel\(k\).*$/m),
  ex("applyToolbarVisibility"),
  exLinha(/^const TASK_COLUMNS_DEF = \[[\s\S]*?\];$/m).replace("const ", "globalThis."),
  ex("limparFiltroDaBarra"),
  ex("listaVisibilidade"),
  ex("renderTaskViewMenu"),
  "globalThis.toolbarVisivel = toolbarVisivel;",
  "globalThis.applyToolbarVisibility = applyToolbarVisibility;",
  "globalThis.renderTaskViewMenu = renderTaskViewMenu;",
  "globalThis.limparFiltroDaBarra = limparFiltroDaBarra;",
].join("\n"));

novoEl("tvmBarra"); novoEl("tvmColunas");

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);
const escondido = (k) => elementos["tk:" + k].hidden;

(async () => {
  // ---------- 1. tudo visivel por padrao ----------
  applyToolbarVisibility();
  ok("nada escondido quando ninguem mexeu",
     DEFAULT_TOOLBAR_ORDER.every(k => !escondido(k)));

  // ---------- 2. esconder o Kanban, que foi o exemplo do usuario ----------
  toolbarVisibility.kanbanView = false;
  applyToolbarVisibility();
  ok("Kanban some", escondido("kanbanView"));
  ok("e mais nada some junto",
     DEFAULT_TOOLBAR_ORDER.filter(k => k !== "kanbanView").every(k => !escondido(k)));

  // ---------- 3. trazer de volta ----------
  toolbarVisibility.kanbanView = true;
  applyToolbarVisibility();
  ok("Kanban volta", !escondido("kanbanView"));

  // ---------- 4. a guarda do beco ----------
  renderTaskViewMenu();
  const caixas = elementos.tvmBarra.filhos.map(l => l.filhos[0]);
  const idx = (k) => DEFAULT_TOOLBAR_ORDER.indexOf(k);

  // esconde a Tabela: permitido, o Kanban ainda esta la
  const cbTabela = caixas[idx("tableView")];
  cbTabela.checked = false; await cbTabela.on();
  applyToolbarVisibility();
  ok("dá para esconder a Tabela enquanto o Kanban está visível", escondido("tableView"));

  // agora tentar esconder o Kanban tambem: tem de ser barrado
  avisos = [];
  const cbKanban = caixas[idx("kanbanView")];
  cbKanban.checked = false; await cbKanban.on();
  applyToolbarVisibility();
  ok("NÃO deixa esconder o último botão de visão", !escondido("kanbanView"));
  ok("a caixa volta a ficar marcada", cbKanban.checked === true);
  ok("e explica o porquê", avisos.some(m => /visão/i.test(m)), avisos);

  // ---------- 5. um filtro qualquer nao tem essa trava ----------
  const cbExport = caixas[idx("export")];
  cbExport.checked = false; await cbExport.on();
  applyToolbarVisibility();
  ok("filtro comum pode ser escondido sem trava", escondido("export"));

  // ---------- 6. o que foi escondido fica guardado ----------
  ok("a escolha vai para o localStorage",
     JSON.parse(guardado.np_task_toolbar_visibility_v1 || "{}").export === false);

  // ---------- 7. a lista do menu cobre a barra inteira ----------
  ok("uma caixa por botão da barra", caixas.length === DEFAULT_TOOLBAR_ORDER.length);
  ok("todas com nome em português",
     elementos.tvmBarra.filhos.every(l => l.filhos[1] && /\S/.test(l.filhos[1].texto)));

  // ---------- 8. as colunas entram no mesmo menu ----------
  const colunas = elementos.tvmColunas.filhos;
  ok("uma caixa por coluna", colunas.length === TASK_COLUMNS_DEF.length);
  ok("a coluna Horário está na lista",
     TASK_COLUMNS_DEF.some(c => c.key === "horario" && c.label === "Horário"));

  // ---------- 9. a engrenagem nao pode ser escondida ----------
  ok("a engrenagem não tem data-tkey", src.indexOf('id="taskViewMenuWrap"') >= 0 &&
     !/id="taskViewMenuWrap"[^>]*data-tkey/.test(src));
  ok("e não entra na lista de esconder", DEFAULT_TOOLBAR_ORDER.indexOf("taskViewMenu") < 0);

  // ---------- 10. a coluna Horário está ligada de ponta a ponta ----------
  ok("tem construtor de célula", /horario: \(task\) => buildHorarioCell/.test(src));
  ok("tem largura padrão", /horario: 100/.test(src));
  ok("grava no blur, como o vencimento",
     /input\.addEventListener\("blur"[\s\S]{0,400}task\.horario = novo/.test(src));
  ok("pede a senha antes de gravar",
     /task\.horario[\s\S]{0,200}|guardTaskFieldEdit/.test(ex("buildHorarioCell")) &&
     ex("buildHorarioCell").indexOf("guardTaskFieldEdit") >= 0);
  ok("a busca acha pelo horário", /task\.horario \|\| "",/.test(src));
  ok("a exportação leva a coluna", /"Horário": t\.horario/.test(src));

  // ---------- 11. a regra de CSS que de fato esconde ----------
  // `hidden` sozinho perde para `.view-toggle-btn{display:inline-flex}`: regra de autor
  // vence a do navegador. Foi por isso que o Kanban continuou na tela.
  ok("existe regra que esconde de verdade",
     /#taskToolbarRow > \[hidden\]\{display:none !important/.test(src));

  // ---------- 12. esconder um filtro zera o filtro ----------
  globalThis.taskSearchText = "algum texto";
  ok("busca escondida zera a busca",
     limparFiltroDaBarra("search") === true && globalThis.taskSearchText === "");
  globalThis.taskCompanyFilter = "Sankhya";
  ok("empresa escondida zera o filtro de empresa",
     limparFiltroDaBarra("company") === true && globalThis.taskCompanyFilter === "Todas");
  globalThis.taskDueFromFilter = "2026-01-01"; globalThis.taskDueToFilter = "2026-02-01";
  limparFiltroDaBarra("due");
  ok("período escondido zera as duas datas",
     globalThis.taskDueFromFilter === "" && globalThis.taskDueToFilter === "");
  globalThis.taskFilter = "Concluído";
  ok("status escondido volta para Todas",
     limparFiltroDaBarra("status") === true && globalThis.taskFilter === "Todas");
  ok("botão que não é filtro não tem o que limpar",
     limparFiltroDaBarra("export") === false && limparFiltroDaBarra("tableView") === false);

  // ---------- 13. cor do responsavel acompanha o tema ----------
  // Era hex fixo aplicado por style.color: no branco dava 1,8:1 e 2,2:1.
  ok("a cor da pessoa é token, não hex",
     /natanael: "var\(--pessoa-natanael\)"/.test(src) &&
     /ivanilda: "var\(--pessoa-ivanilda\)"/.test(src));
  ok("nenhum hex de pessoa sobrou no JS",
     !/natanael: "#/.test(src) && !/ivanilda: "#/.test(src));
  // Nao vale fixar o numero de fundos: ele cresce. O que importa e que NENHUM
  // fundo fique sem os dois tokens — o que deixaria a pessoa sem cor nele.
  const fundos = (src.match(/^  :root(\[data-tema="[a-z]+"\])?\{$/gm) || []).length;
  ok("todo fundo define as duas cores de pessoa",
     (src.match(/--pessoa-natanael:/g) || []).length === fundos &&
     (src.match(/--pessoa-ivanilda:/g) || []).length === fundos,
     fundos + " fundos");

  // ---------- 14. o icone do calendario nao pode sumir ----------
  // O campo tem fundo claro nos tres temas; sem isto ele herda color-scheme:dark e o
  // navegador desenha o quadradinho branco sobre amarelo.
  ok("o campo de vencimento declara color-scheme:light",
     /\.task-due\{[^}]*color-scheme:light/.test(src));

  let n = 0;
  console.log("");
  for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
  console.log("\n" + n + "/" + casos.length + " ok");
  process.exit(n === casos.length ? 0 : 1);
})();
