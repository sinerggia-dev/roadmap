// Ordem de carga: um `const` que lê outro `const` declarado mais abaixo derruba
// o app INTEIRO no load — tela branca, nada funciona.
//
// Em arquivo único de milhares de linhas esse erro é fácil de cometer e difícil
// de ver: a declaração parece inocente, e o app só quebra quando abre. Como não
// dá para rodar este app fora do navegador (o MSAL exige a origem real), este
// teste lê as declarações de topo e cobra a ordem.
const fs = require("fs");
const src = fs.readFileSync((process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html")), "utf8");

const inicio = src.lastIndexOf("<script>");
const fim = src.lastIndexOf("</script>");
const js = src.slice(inicio, fim);
const linhas = js.split("\n");

// Declarações de topo: começam na coluna 0. As de dentro de função são indentadas.
const ordem = new Map();          // nome -> linha
const decls = [];                 // { nome, linha, corpo }
linhas.forEach((l, i) => {
  const m = /^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)$/.exec(l);
  if (!m) return;
  ordem.set(m[1], i);
  decls.push({ nome: m[1], linha: i, corpo: m[2] });
});

const problemas = [];
for (const d of decls) {
  // Inicializador que é função só roda depois, quando alguém chama: ler um nome
  // declarado abaixo ali é legítimo.
  if (/=>|\bfunction\b/.test(d.corpo)) continue;
  // Inicializador de uma linha só; os de várias linhas (objetos grandes) são
  // tratados abaixo, juntando até o fecho.
  let corpo = d.corpo;
  if (!/[;,]\s*(\/\/.*)?$/.test(corpo) || /[\[{(]\s*$/.test(corpo)) {
    let prof = 0, j = d.linha;
    do {
      const t = linhas[j];
      for (const c of t) { if ("[{(".includes(c)) prof++; else if ("]})".includes(c)) prof--; }
      if (j > d.linha) corpo += "\n" + t;
      j++;
    } while (prof > 0 && j < linhas.length && j - d.linha < 400);
    if (/=>|\bfunction\b/.test(corpo)) continue;
  }
  const semTexto = corpo.replace(/"[^"]*"|'[^']*'|`[^`]*`|\/\/.*/g, " ");
  for (const nome of semTexto.match(/[A-Za-z_$][\w$]*/g) || []) {
    if (nome === d.nome) continue;
    const onde = ordem.get(nome);
    if (onde !== undefined && onde > d.linha) {
      problemas.push(`${d.nome} (linha ${inicioLinha(d.linha)}) lê ${nome}, declarado só na ${inicioLinha(onde)}`);
    }
  }
}

function inicioLinha(i) {
  // Linha dentro do index.html, para dar para abrir direto.
  return src.slice(0, inicio).split("\n").length + i - 1;
}

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

ok("nenhuma constante de topo lê outra declarada abaixo",
   problemas.length === 0, problemas.join(" | "));

// O caso concreto que motivou o teste: a lista de pastas do backup.
ok("a lista de pastas do backup é função, não constante",
   /function pastasDeArquivo\(\)\{ return \[ATTACH_FOLDER, DOCS_FOLDER, AUDIO_FOLDER\]; \}/.test(src));
ok("e o backup percorre as três pastas",
   /for \(const nome of pastasDeArquivo\(\)\)/.test(src));
ok("cada item do backup diz de que pasta veio", /pasta: nome, nome: f\.name/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
