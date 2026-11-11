// Testa a busca depois da otimização: o resultado tem de ser o MESMO, só rápido.
// O risco de cache é devolver resultado velho; o risco da regex é achar menos
// que o DOM achava. Os dois estão cobertos aqui.
const fs = require("fs");
const src = fs.readFileSync((process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html")), "utf8");

function ex(n) {
  const i = src.indexOf("function " + n + "(");
  if (i < 0) throw new Error("nao achei " + n);
  let d = 0, f = -1;
  for (let j = src.indexOf("{", i); j < src.length; j++) {
    if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (!d) { f = j + 1; break; } }
  }
  return src.slice(i, f);
}

globalThis.stripAccents = (t) => String(t).normalize("NFD").replace(/[^\x00-\x7F]/g, "");
globalThis.taskAssignees = (t) => (t.assignees || []);
globalThis.assigneesLabel = (t) => (t.assignees || []).map(e => e.split("@")[0]).join(", ");
globalThis.attachName = (t) => t.anexo || "";
globalThis.formatDateBR = (iso) => iso ? iso.split("-").reverse().join("/") : "";

eval([
  src.match(/^const cacheBusca = new WeakMap\(\);$/m)[0].replace("const ", "globalThis."),
  ex("normalizeForSearch"), ex("notaParaBusca"), ex("taskSearchHaystack"),
  "globalThis.taskSearchHaystack = taskSearchHaystack;",
  "globalThis.notaParaBusca = notaParaBusca;",
].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

const tarefa = () => ({
  title: "CLAUDE - App - Controle de caixas - Desenvolver PB-JP",
  company: "Qdelícia", status: "Pendente", priority: "Média",
  links: "https://exemplo.com/x", assignees: ["natanael.silva@sinerggia.com.br"],
  note: "<div>Tema:</div><div>Gestão&nbsp;Estratégica</div><div>Participantes:</div>" +
        "<div>Maria Cristina</div><div>maria@empresa.com.br</div>",
  anexo: "IT_LOG-002_CONTRATO.pdf", items: 17, dueDate: "2026-09-15", horario: "15:30",
});

/* ---- 1. acha o que achava antes ---- */
const t = tarefa();
const hay = taskSearchHaystack(t);
[["app", "título"], ["qdelicia", "empresa"], ["pendente", "status"],
 ["natanael", "responsável"], ["maria", "nome dentro da nota"],
 ["maria@empresa.com.br", "e-mail dentro da nota"], ["estrategica", "palavra com acento na nota"],
 ["it_log", "nome do anexo"], ["15/09/2026", "vencimento em pt-BR"],
 ["15:30", "horário"], ["17", "número do registro"]].forEach(([termo, onde]) => {
  ok("acha pelo " + onde, hay.indexOf(termo.toLowerCase()) >= 0, termo);
});
ok("não arrasta tag de HTML para dentro da busca",
   hay.indexOf("<div>") < 0 && hay.indexOf("div") < 0);
ok("o &nbsp; vira espaço, e não a palavra colada",
   hay.indexOf("gestao estrategica") >= 0);

/* ---- 2. o cache não pode devolver resultado velho ---- */
const t2 = tarefa();
taskSearchHaystack(t2);                      // esquenta
t2.title = "Outro assunto completamente diferente";
const depois = taskSearchHaystack(t2);
ok("mudar o título invalida o cache", depois.indexOf("outro assunto") >= 0);
ok("e o texto antigo some", depois.indexOf("controle de caixas") < 0);

t2.note = "<div>Rosivaldo Pereira</div>";
ok("mudar a NOTA invalida o cache",
   taskSearchHaystack(t2).indexOf("rosivaldo") >= 0);
t2.assignees = ["ivanilda.hozana@sinerggia.com.br"];
ok("mudar o responsável invalida o cache",
   taskSearchHaystack(t2).indexOf("ivanilda") >= 0);
t2.status = "Concluído";
ok("mudar o status invalida o cache",
   taskSearchHaystack(t2).indexOf("concluido") >= 0);
t2.dueDate = "2026-12-25";
ok("mudar o vencimento invalida o cache",
   taskSearchHaystack(t2).indexOf("25/12/2026") >= 0);

/* ---- 3. sem mudança, devolve a mesma coisa (é esse o ganho) ---- */
const t3 = tarefa();
const a = taskSearchHaystack(t3);
const b = taskSearchHaystack(t3);
ok("duas chamadas seguidas dão o mesmo texto", a === b);

/* ---- 4. o cache não escreve na tarefa: o JSON gravado não pode inchar ---- */
const t4 = tarefa();
const antes = Object.keys(t4).slice().sort().join(",");
taskSearchHaystack(t4);
ok("não acrescenta campo na tarefa", Object.keys(t4).sort().join(",") === antes);
ok("usa WeakMap, não campo no objeto", /const cacheBusca = new WeakMap\(\)/.test(src));

/* ---- 5. bordas ---- */
ok("tarefa sem nota não quebra", typeof taskSearchHaystack({ title: "x" }) === "string");
ok("nota vazia não quebra", notaParaBusca("") === "" && notaParaBusca(null) === "");
ok("nota sem tag nenhuma passa inteira", notaParaBusca("texto puro") === "texto puro");

/* ---- 6. a espera antes de redesenhar ---- */
ok("o texto é guardado na hora", /taskSearchText = e\.target\.value;[\s\S]{0,120}setTimeout\(renderTasks/.test(src));
ok("e só o desenho espera", /clearTimeout\(esperaBusca\)[\s\S]{0,80}setTimeout\(renderTasks, 160\)/.test(src));
ok("a espera é cancelada a cada tecla", /clearTimeout\(esperaBusca\)/.test(src));

/* ---- 7. a exibição continua usando o leitor fiel ---- */
ok("noteHtmlToText continua existindo para exibir", /function noteHtmlToText/.test(src));
ok("e ainda é quem monta o texto da nota na tela",
   /noteHtmlToText\(/.test(src.slice(src.indexOf("function buildNoteCell"))));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
