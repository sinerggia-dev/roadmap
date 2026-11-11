// Testa o marcador de ausencia: parser + os tres estados da analise.
// Extrai as funcoes reais do index.html e roda no Node.
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
function exConst(n) {
  const m = src.match(new RegExp("^const " + n + " = .*$", "m"));
  if (!m) throw new Error("nao achei const " + n);
  return m[0].replace("const ", "globalThis.");
}

// noteHtmlToText usa o DOM; aqui basta desmontar as tags.
globalThis.noteHtmlToText = (h) => String(h || "")
  .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h\d)>/gi, "\n")
  .replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

globalThis.stripAccents = (t) => String(t).normalize("NFD").replace(/[^\x00-\x7F]/g, "");
globalThis.companyKey = (v) => globalThis.stripAccents(String(v || "").trim()).toLowerCase();

eval([exConst("RE_EMAIL_NOTA"), exConst("RE_FIM_DOMINIO"), exConst("RE_AUSENTE"),
      ex("parseNotaTreinamento"), ex("analiseEmpresa")].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

// ---------- 1. o caso do usuario: Maria Cristina ----------
const nota1 = `Tema:<br>GPD<br>Participantes:<br>Natanael<br>Silva<br>natanael.silva@sinerggia.com.br<br>` +
  `Maria<br>Cristina Gomes De Melo (Não participou)<br>allanamelo2003@hotmail.com<br>` +
  `Ronaldo<br>Bezerra De Araujo<br>ronaldoaraujos1978@gmail.com`;
const p1 = parseNotaTreinamento(nota1);
console.log("caso 1:", JSON.stringify(p1.participantes, null, 0));
ok("3 pessoas, ninguem a mais", p1.participantes.length === 3);
ok("Maria marcada como ausente", p1.participantes[1].ausente === true);
ok("nome da Maria sai limpo", p1.participantes[1].nome === "Maria Cristina Gomes De Melo");
ok("os outros dois presentes", !p1.participantes[0].ausente && !p1.participantes[2].ausente);
ok("marcador nao virou observacao", !p1.obs.join(" ").toLowerCase().includes("participou"));
ok("tema preservado", p1.tema.join(" ") === "GPD");

// ---------- 2. marcador em linha propria, e depois do e-mail ----------
const p2 = parseNotaTreinamento(`Participantes:<br>Joao<br>Pereira<br>(faltou)<br>joao@x.com.br<br>` +
  `Ana Lima<br>ana@x.com.br (não compareceu)<br>Bia Souza - AUSENTE<br>bia@x.com.br`);
console.log("caso 2:", JSON.stringify(p2.participantes, null, 0));
ok("linha propria antes do e-mail", p2.participantes[0].ausente && p2.participantes[0].nome === "Joao Pereira");
ok("marcador depois do e-mail", p2.participantes[1].ausente && p2.participantes[1].nome === "Ana Lima");
ok("AUSENTE maiusculo com hifen", p2.participantes[2].ausente && p2.participantes[2].nome === "Bia Souza");
ok("nada sobrou em obs", p2.obs.length === 0);

// ---------- 3. secao "Nao compareceram:" ----------
const p3 = parseNotaTreinamento(`Participantes:<br>Ana<br>ana@x.com<br>Não compareceram:<br>Rui Dias<br>rui@x.com`);
console.log("caso 3:", JSON.stringify(p3.participantes, null, 0));
ok("secao marca ausencia", p3.participantes.length === 2 && !p3.participantes[0].ausente && p3.participantes[1].ausente);

// ---------- 4. nao inventa ausencia onde nao ha ----------
const p4 = parseNotaTreinamento(`Participantes:<br>Ana Faltosa<br>ana@x.com<br>Rui Ausentino<br>rui@x.com`);
console.log("caso 4:", JSON.stringify(p4.participantes, null, 0));
ok("sobrenome parecido nao marca", !p4.participantes[0].ausente);
// "Ausentino" contem "ausent" mas o marcador exige a palavra inteira
ok("Ausentino nao marca", !p4.participantes[1].ausente && p4.participantes[1].nome === "Rui Ausentino");

// ---------- 4b. observacao comum nao pode marcar ausencia ----------
const p4b = parseNotaTreinamento(`Participantes:<br>Ana Lima<br>ana@x.com nao foi enviado o link<br>` +
  `Rui Dias<br>rui@x.com - o certificado nao estava pronto`);
console.log("caso 4b:", JSON.stringify(p4b.participantes, null, 0));
ok("\"nao foi enviado\" nao marca ausencia", !p4b.participantes[0].ausente);
ok("\"nao estava pronto\" nao marca ausencia", !p4b.participantes[1].ausente);
ok("as observacoes foram para obs", p4b.obs.length === 2);

// ---------- 5. e-mail com texto colado continua funcionando ----------
const p5 = parseNotaTreinamento(`Participantes:<br>Nat<br>natanael.silva@sinerggia.com.brLINK DO VIDEOhttps://x/y`);
ok("corte no dominio preservado", p5.participantes.length === 1 &&
   p5.participantes[0].email === "natanael.silva@sinerggia.com.br" && !p5.participantes[0].ausente);

// ---------- 6. analise: tres estados e percentual sobre presenca ----------
const t = (id, status, dueDate, note, title) =>
  ({ task: { id, status, dueDate, note, title, company: "Sankhya" } });
const flat = [
  // turma feita: Maria faltou
  t("a", "Concluído", "2026-03-10", nota1, "Treinamento Sankhya - GPD"),
  // turma feita: todos presentes
  t("b", "Concluído", "2026-04-10",
    `Tema:<br>OS<br>Participantes:<br>Maria Cristina Gomes De Melo<br>allanamelo2003@hotmail.com`, "Treinamento - OS"),
  // turma futura
  t("c", "Pendente", "2026-12-01",
    `Tema:<br>MRP<br>Participantes:<br>Maria Cristina Gomes De Melo<br>allanamelo2003@hotmail.com`, "Treinamento - MRP"),
];
const a = analiseEmpresa(flat, "Sankhya");
const maria = a.pessoas.find(v => v.email === "allanamelo2003@hotmail.com");
console.log("\nMaria:", { pct: maria.pct, feitos: maria.feitos.length, ausentes: maria.ausentes.length,
  faltam: maria.faltam.length, tot: maria.tot });
ok("Maria: 1 feito, 1 ausencia, 1 a realizar", maria.feitos.length === 1 && maria.ausentes.length === 1 && maria.faltam.length === 1);
ok("Maria: total 3", maria.tot === 3);
ok("Maria: 33% (presenca sobre escalacao)", maria.pct === 33);
ok("vagasAusentes conta a falta", a.vagasAusentes === 1);
ok("vagasFeitas nao conta a falta", a.vagasFeitas === 3);   // Natanael+Ronaldo (turma a) + Maria (turma b)
ok("comAusencia lista so a Maria", a.comAusencia.length === 1 && a.comAusencia[0].email === maria.email);
const totalVagas = a.vagasFeitas + a.vagasAusentes + a.vagasAbertas;
ok("pctVagas usa o denominador cheio", a.pctVagas === Math.round(100 * a.vagasFeitas / totalVagas));
ok("pctTurmas nao mudou (turma aconteceu)", a.pctTurmas === 67);

// ---------- 7. sem nenhuma ausencia, nada muda ----------
const b = analiseEmpresa([flat[1], flat[2]], "Sankhya");
const m2 = b.pessoas[0];
ok("sem ausencia: pct como antes", m2.pct === 50 && m2.ausentes.length === 0);
ok("sem ausencia: comAusencia vazio", b.comAusencia.length === 0 && b.vagasAusentes === 0);

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
