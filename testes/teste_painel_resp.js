// Testa (1) a tarefa nova nascendo com o usuário como responsável e
// (2) o painel do topo: saudação, relógio e clima.
//
// O QUE MAIS IMPORTA: o painel não pode depender da rede para existir. Relógio e
// saudação são o que a pessoa mais olha; o clima é a única parte que pode faltar,
// e quando falta tem de sumir, não virar tarja de erro no alto da tela todo dia.
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
const ok = (d, c) => casos.push([d, !!c]);

/* ===================== 1. responsável da tarefa nova ===================== */
globalThis.currentUserEmail = "natanael.silva@sinerggia.com.br";
eval(ex("responsavelPadrao") + "\nglobalThis.responsavelPadrao = responsavelPadrao;");

ok("a tarefa nova nasce com o usuário atual",
   responsavelPadrao().length === 1 && responsavelPadrao()[0] === globalThis.currentUserEmail);
globalThis.currentUserEmail = null;
ok("sem sessão não inventa responsável", responsavelPadrao().length === 0);
globalThis.currentUserEmail = "natanael.silva@sinerggia.com.br";

// os dois pontos de criação — o botão e o calendário — têm de usar o mesmo
const criacoes = src.match(/assignee: currentUserEmail \|\| "", assignees: responsavelPadrao\(\)/g) || [];
ok("os dois pontos de criação usam o padrão", criacoes.length === 2, criacoes.length);
ok("não sobrou criação com responsável vazio",
   (src.match(/assignee: "", assignees: \[\]/g) || []).length === 0);
// `assignee` espelha o primeiro da lista: o formato antigo ainda é lido em vários lugares
ok("o campo antigo é preenchido junto", /assignee: currentUserEmail \|\| ""/.test(src));

/* ===================== 2. painel do topo ===================== */
eval(ex("ptSaudacaoDaHora") + "\n" + ex("ptIconeDoTempo") +
     "\nglobalThis.ptSaudacaoDaHora = ptSaudacaoDaHora; globalThis.ptIconeDoTempo = ptIconeDoTempo;");

ok("saudação muda com a hora",
   ptSaudacaoDaHora(8) === "Bom dia," && ptSaudacaoDaHora(14) === "Boa tarde," &&
   ptSaudacaoDaHora(19) === "Boa noite,");
ok("meio-dia já é tarde, e 18h já é noite",
   ptSaudacaoDaHora(12) === "Boa tarde," && ptSaudacaoDaHora(18) === "Boa noite,");
// A madrugada ainda e noite, e o dia comeca as 5: as 2h ninguem diz "bom dia".
ok("madrugada é noite", ptSaudacaoDaHora(0) === "Boa noite," && ptSaudacaoDaHora(4) === "Boa noite,");
ok("às 5 já é bom dia", ptSaudacaoDaHora(5) === "Bom dia,");

ok("céu limpo tem sol de dia e lua de noite",
   ptIconeDoTempo(0, false) !== ptIconeDoTempo(0, true));
ok("todo código WMO devolve algum ícone",
   [0,1,2,3,45,48,51,61,65,71,80,95,99,500].every(c => {
     const i = ptIconeDoTempo(c, false);
     return typeof i === "string" && i.length > 0;
   }));
ok("nenhum ícone saiu como escape quebrado",
   ![0,2,3,45,61,71,80,95].some(c => /u[0-9a-f]{4}/i.test(ptIconeDoTempo(c, false))));

/* ---- a parte que não pode depender de rede ---- */
const corpoRelogio = ex("ptPintaRelogio");
ok("o relógio não faz chamada de rede", corpoRelogio.indexOf("fetch") < 0);
ok("a saudação também não", ex("ptSaudacaoDaHora").indexOf("fetch") < 0);

const corpoTempo = ex("ptAtualizaTempo", "async function ");
ok("o clima falha escondendo, não avisando",
   /catch[\s\S]{0,200}caixa\.hidden = true/.test(corpoTempo) &&
   corpoTempo.indexOf("alert(") < 0 && !/setStatus\(/.test(corpoTempo));
ok("não busca dois ao mesmo tempo", /ptBuscandoTempo/.test(corpoTempo));
ok("o botão volta a funcionar mesmo após erro", /finally\{[\s\S]{0,160}disabled = false/.test(corpoTempo));
ok("a leitura ignora o cache do navegador", /cache: "no-store"/.test(corpoTempo));

const corpoLiga = ex("ptLigaPainel");
ok("o relógio é alinhado na virada do minuto",
   /60000 - \(Date\.now\(\) % 60000\)/.test(corpoLiga));
ok("o painel só aparece depois do login",
   /ptLigaPainel\(\);\s*\/\/ so aqui: antes do login/.test(src));
ok("o clima se renova sozinho de tempos em tempos", /setInterval\(ptAtualizaTempo/.test(corpoLiga));
ok("e o botão ↻ força a atualização", /btn\.addEventListener\("click", ptAtualizaTempo\)/.test(corpoLiga));

/* ---- aparência ---- */
ok("o painel usa os tokens do tema, não cor fixa",
   /#painelTopo\{[^}]*var\(--surface\)/.test(src) &&
   !/#painelTopo\{[^}]*#[0-9a-f]{6}/i.test(src));
ok("no celular ele deixa de flutuar", /#painelTopo\{float:none/.test(src));
ok("nasce escondido, para não piscar antes de ter nome",
   /id="painelTopo" hidden/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
