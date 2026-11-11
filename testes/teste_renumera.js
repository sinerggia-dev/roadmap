// Testa a renumeracao unica da coluna ITENS pela data e hora de criacao,
// com a bagunca real da tela: numeros repetidos, saltos e buracos.
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
eval([src.match(/^const REG_VERSAO = \d+;$/m)[0].replace("const ", "globalThis."),
      ex("ordemRegistro"), ex("renumeraRegistros"),
      ex("numeroRegistroMax"), ex("proximoNumeroRegistro"), ex("numeraRegistrosPendentes"),
     ].join(String.fromCharCode(10)));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

// t(id, itemsAntigo, vencimento, criacao)
const t = (id, items, dueDate, createdAt) => ({ id, items, dueDate, createdAt });
const num = (c, id) => c.tasks.find(x => x.id === id).items;

// ---------- 1. a bagunca da tela ----------
// Os vencimentos estao de proposito em ordem trocada em relacao a criacao:
// se a numeracao seguisse o vencimento, o resultado seria outro.
const content = { tasks: [
  t("a", 60, "2026-09-20", "2026-09-10T09:00"),
  t("b", 59, "2026-09-18", "2026-09-10T09:05"),
  t("c", 51, "2026-09-15", "2026-09-10T09:10"),
  t("d",  1, "2026-09-12", "2026-09-11T08:00"),
  t("e",  1, "2026-09-12", "2026-09-11T08:30"),
  t("f",  1, "2026-09-12", "2026-09-11T07:00"),
  t("g", 26, "",           "2026-09-09T10:00"),   // sem vencimento
  t("h",  1, "",           "2026-09-09T11:00"),   // sem vencimento
  t("i", 35, "2026-09-01", "2026-09-08T10:00"),   // criada primeiro
]};

const mudou = renumeraRegistros(content);
console.log("renumerado:", content.tasks.slice().sort((x, y) => x.items - y.items)
  .map(x => x.id + "=" + x.items).join(" "));

ok("disse que mudou", mudou === true);
ok("numerou 1..N sem buraco",
   content.tasks.map(x => x.items).sort((p, q) => p - q).join(",") === "1,2,3,4,5,6,7,8,9");
ok("nenhum repetido", new Set(content.tasks.map(x => x.items)).size === content.tasks.length);

// a ordem esperada e a de criacao, nao a de vencimento
const esperado = ["i", "g", "h", "a", "b", "c", "f", "d", "e"];
ok("ordem e a de criacao", esperado.every((id, i) => num(content, id) === i + 1));
ok("a criada primeiro e o 1", num(content, "i") === 1);
ok("a criada por ultimo e o 9", num(content, "e") === 9);

// vencimento nao influencia mais
ok("sem vencimento nao vai mais para o fim", num(content, "g") === 2 && num(content, "h") === 3);
ok("vencimento mais antigo nao ganha o 1 por isso",
   num(content, "i") === 1 && content.tasks.find(x => x.id === "i").dueDate === "2026-09-01");
ok("mesma criacao-minuto distinta pelo horario", num(content, "f") < num(content, "d"));
ok("marcou a pagina na versao 2", content.regVersao === REG_VERSAO && REG_VERSAO === 2);

// ---------- 2. nao renumera de novo ----------
const antes = content.tasks.map(x => x.id + "=" + x.items).join(",");
ok("segunda abertura nao renumera", renumeraRegistros(content) === false);
ok("numeros intactos", content.tasks.map(x => x.id + "=" + x.items).join(",") === antes);

// editar vencimento nao mexe em nada (agora nem entra na conta)
content.tasks.find(x => x.id === "a").dueDate = "2026-01-01";
renumeraRegistros(content);
ok("vencimento editado nao renumera", num(content, "a") === 4);

// ---------- 3. pagina numerada na versao antiga e refeita ----------
const antiga = { regVersao: 1, tasks: [
  t("p", 7, "2026-05-01", "2026-02-02T10:00"),
  t("q", 3, "2026-01-01", "2026-02-01T10:00"),
]};
ok("versao 1 e renumerada", renumeraRegistros(antiga) === true);
ok("agora pela criacao", num(antiga, "q") === 1 && num(antiga, "p") === 2);

// ---------- 4. atividade nova continua de onde parou ----------
content.tasks.unshift(t("nova", null, "2026-02-02", "2026-09-15T10:00"));
content.tasks[0].items = proximoNumeroRegistro(content.tasks);
ok("nova pega o proximo livre", content.tasks[0].items === 10);

// ---------- 5. bordas ----------
ok("pagina sem tarefas nao faz nada", renumeraRegistros({ tasks: [] }) === false);
ok("content nulo nao quebra", renumeraRegistros(null) === false);
ok("sem a lista nao quebra", renumeraRegistros({}) === false);

const semData = { tasks: [t("x", 9, "", ""), t("y", 9, "", "2026-03-01"), t("z", 9, "", "2026-02-01")] };
renumeraRegistros(semData);
ok("sem createdAt vai para o fim",
   num(semData, "z") === 1 && num(semData, "y") === 2 && num(semData, "x") === 3);

const umaSo = { tasks: [t("u", 99, "2026-01-01", "2026-01-01T00:00")] };
renumeraRegistros(umaSo);
ok("uma tarefa vira 1", num(umaSo, "u") === 1);

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
