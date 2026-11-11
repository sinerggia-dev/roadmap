// Testa que a tarefa recem-criada nasce visivel no modo agrupado:
// grupo dela primeiro, aberto a forca, e sem estragar o que estava recolhido.
// DOM falso; renderTableGrouped e o codigo real do index.html.
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

// ---- DOM falso ----
function novoEl(tag) {
  return {
    tagName: (tag || "div").toUpperCase(), className: "", textContent: "", type: "",
    children: [], dataset: {}, classList: { add() {}, toggle() {} }, style: {},
    checked: false, indeterminate: false, disabled: false, title: "", colSpan: 0,
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(ev, fn) { if (ev === "click") this.onclick = fn; },
    querySelector() { return null; },
  };
}
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = {
  createElement: novoEl,
  getElementById: () => novoEl("button"),
};

// ---- dependencias reais e simples ----
globalThis.normalizeCompany = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim();
globalThis.stripAccents = (t) => String(t).normalize("NFD").replace(/[^\x00-\x7F]/g, "");
globalThis.companyKey = (v) => globalThis.stripAccents(globalThis.normalizeCompany(v)).toLowerCase();
globalThis.visibleColumnOrder = () => ["a", "b", "c"];
globalThis.selectedTaskIds = new Set();
globalThis.anyTaskFilterActive = () => globalThis.__comFiltro === true;
globalThis.renderTasks = () => {};
globalThis.salvarGruposFechados = () => {};
// linha de tarefa: so o que o teste precisa distinguir
globalThis.renderTaskRow = (t) => {
  const tr = novoEl("tr");
  tr.dataset.id = t.id;
  tr._tarefa = t;
  return tr;
};

eval([
  src.match(/^let gruposFechados = new Set\(\);$/m)[0].replace("let ", "globalThis."),
  src.match(/^let taskGroupSort = .*$/m)[0].replace("let ", "globalThis."),
  src.match(/^let ultimasChavesDeGrupo = .*$/m)[0].replace("let ", "globalThis."),
  src.match(/^let tarefaNovaId = null;$/m)[0].replace("let ", "globalThis."),
  ex("renderTableGrouped"),
].join(String.fromCharCode(10)));

// ---- cenario ----
const T = (id, company) => ({ id, company, status: "Pendente", title: id });
const base = [
  T("n1", "Novatec"), T("n2", "Novatec"),
  T("s1", "Sankhya"),
  T("q1", "Qdelícia"),
];

function roda(tarefas) {
  const tbody = novoEl("tbody");
  renderTableGrouped(tbody, tarefas, []);
  // Le a estrutura pintada: cabecalho de grupo -> nome, e as linhas dentro.
  const saida = [];
  tbody.children.forEach(tr => {
    if (tr.className === "task-group-row") {
      const td = tr.children[tr.children.length - 1];
      const btn = td.children[0];
      saida.push({ grupo: btn.children[1].textContent, caret: btn.children[0].textContent, itens: [], _btn: btn });
    } else if (saida.length) {
      saida[saida.length - 1].itens.push(tr.dataset.id);
    }
  });
  return saida;
}

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);
const ABERTO = "\u25bc", FECHADO = "\u25b6";
// A chave do grupo vazio e companyKey("Sem empresa"). O fallback do codigo
// nunca dispara, porque o nome do grupo vazio ja e "Sem empresa".
const CHAVE_SEM = "sem empresa";

// ---------- 1. sem tarefa nova: "Sem empresa" por ultimo ----------
globalThis.tarefaNovaId = null;
globalThis.gruposFechados = new Set();
let r = roda(base.concat([T("x1", "")]));
console.log("1 sem fixacao:", r.map(g => g.grupo).join(" | "));
ok("ordem alfabetica normal", r.map(g => g.grupo).slice(0, 3).join(",") === "Novatec,Qdelícia,Sankhya");
ok("Sem empresa por ultimo", r[r.length - 1].grupo === "Sem empresa");

// ---------- 2. tarefa nova sem empresa: grupo dela primeiro ----------
globalThis.tarefaNovaId = "nova";
r = roda([T("nova", "")].concat(base));
console.log("2 com fixacao:", r.map(g => g.grupo).join(" | "));
ok("grupo da tarefa nova vem primeiro", r[0].grupo === "Sem empresa");
ok("a tarefa nova e a primeira linha do grupo", r[0].itens[0] === "nova");
ok("grupo da tarefa nova aberto", r[0].caret === ABERTO);
ok("os outros grupos seguem alfabeticos", r.slice(1).map(g => g.grupo).join(",") === "Novatec,Qdelícia,Sankhya");

// ---------- 3. abre a forca mesmo estando recolhido ----------
globalThis.gruposFechados = new Set([CHAVE_SEM, "novatec"]);
globalThis.tarefaNovaId = "nova";
r = roda([T("nova", "")].concat(base));
console.log("3 recolhido antes:", r.map(g => g.grupo + g.caret).join(" | "));
ok("grupo fixado ignora o recolhido", r[0].caret === ABERTO && r[0].itens.length === 1);
ok("outro grupo recolhido continua recolhido", r.find(g => g.grupo === "Novatec").caret === FECHADO);
ok("recolhido nao mostra linhas", r.find(g => g.grupo === "Novatec").itens.length === 0);
ok("gruposFechados nao foi alterado", globalThis.gruposFechados.has(CHAVE_SEM));

// ---------- 4. fechar o grupo fixado solta a fixacao ----------
globalThis.gruposFechados = new Set();
globalThis.tarefaNovaId = "nova";
r = roda([T("nova", "")].concat(base));
r[0]._btn.onclick();                     // usuario clica no cabecalho para fechar
ok("clique solta a fixacao", globalThis.tarefaNovaId === null);
ok("clique recolheu o grupo", globalThis.gruposFechados.has(CHAVE_SEM));
r = roda([T("nova", "")].concat(base));
console.log("4 depois do clique:", r.map(g => g.grupo + g.caret).join(" | "));
ok("agora o grupo fecha de verdade", r.find(g => g.grupo === "Sem empresa").caret === FECHADO);
ok("e volta para o fim da lista", r[r.length - 1].grupo === "Sem empresa");

// ---------- 5. tarefa nova que ja tem empresa ----------
globalThis.gruposFechados = new Set(["sankhya"]);
globalThis.tarefaNovaId = "nova";
r = roda([T("nova", "Sankhya")].concat(base));
console.log("5 nova com empresa:", r.map(g => g.grupo + g.caret).join(" | "));
ok("grupo da empresa dela vem primeiro", r[0].grupo === "Sankhya" && r[0].caret === ABERTO);
ok("as duas tarefas do grupo aparecem", r[0].itens.length === 2 && r[0].itens[0] === "nova");

// ---------- 6. com filtro ativo tudo abre, e a fixacao nao estraga a ordem ----------
globalThis.__comFiltro = true;
globalThis.gruposFechados = new Set(["novatec", "sankhya"]);
globalThis.tarefaNovaId = "nova";
r = roda([T("nova", "")].concat(base));
console.log("6 com filtro:", r.map(g => g.grupo + g.caret).join(" | "));
ok("filtro ativo abre todos", r.every(g => g.caret === ABERTO));
ok("fixado continua primeiro", r[0].grupo === "Sem empresa");
globalThis.__comFiltro = false;

// ---------- 7. id fixado que nao existe mais (tarefa apagada) ----------
globalThis.gruposFechados = new Set();
globalThis.tarefaNovaId = "fantasma";
r = roda(base);
console.log("7 id fantasma:", r.map(g => g.grupo).join(" | "));
ok("id inexistente nao fixa nada", r.map(g => g.grupo).join(",") === "Novatec,Qdelícia,Sankhya");

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
