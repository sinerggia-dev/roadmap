// Testa o arrastar para reordenar as páginas da barra lateral.
//
// O QUE MAIS IMPORTA:
//  1. A ordem que fica salva tem que ser a ordem que se vê. Se a reordenação
//     deixar dois números iguais, a lista passa a depender de desempate e a
//     página "anda sozinha" no próximo carregamento.
//  2. Não mudar o pai sem querer. Arrastar é impreciso; soltar numa página de
//     outro nível não pode tirar a página do lugar onde ela vive.
//  3. Nenhuma página pode sumir da lista.
const fs = require("fs");
const alvo = process.env.ALVO_HTML ||
  "C:/Users/natan_cou1nrv/OneDrive/Documentos/claude/roadmap/index.html";
const src = fs.readFileSync(alvo, "utf8");

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

globalThis.indexData = { pages: [] };
eval([ex("reordenarPaginas"), ex("mesmoNivel"),
      "globalThis.reordenarPaginas = reordenarPaginas;",
      "globalThis.mesmoNivel = mesmoNivel;"].join("\n"));

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

// Como a barra lateral do usuário estava: MILLENA criada por último, no fim.
function montar() {
  globalThis.indexData = {
    pages: [
      { id: "roadmap",  parentId: null,    title: "ROADMAP",     order: 1 },
      { id: "cal",      parentId: null,    title: "Calendário",  order: 2 },
      { id: "dash",     parentId: null,    title: "Dashboard",   order: 3 },
      { id: "bloco",    parentId: null,    title: "Bloco",       order: 4 },
      { id: "sankhya",  parentId: null,    title: "Sankhya",     order: 5 },
      { id: "millena",  parentId: null,    title: "MILLENA",     order: 6 },
      { id: "sub1",     parentId: "bloco", title: "Sub A",       order: 1 },
      { id: "sub2",     parentId: "bloco", title: "Sub B",       order: 2 },
    ]
  };
}
const ordemRaiz = () => indexData.pages
  .filter(p => !p.parentId).sort((a, b) => a.order - b.order).map(p => p.id).join(",");
const ordemBloco = () => indexData.pages
  .filter(p => p.parentId === "bloco").sort((a, b) => a.order - b.order).map(p => p.id).join(",");

/* ---- 1. o caso que motivou tudo: MILLENA para junto do ROADMAP ---- */
montar();
ok("MILLENA começa no fim", ordemRaiz() === "roadmap,cal,dash,bloco,sankhya,millena");
ok("soltar logo abaixo de ROADMAP funciona", reordenarPaginas("millena", "roadmap", true) === true);
ok("e ela fica em segundo", ordemRaiz() === "roadmap,millena,cal,dash,bloco,sankhya", ordemRaiz());

montar();
reordenarPaginas("millena", "roadmap", false);
ok("soltar ACIMA de ROADMAP a põe em primeiro",
   ordemRaiz() === "millena,roadmap,cal,dash,bloco,sankhya", ordemRaiz());

/* ---- 2. a numeração tem que continuar limpa ---- */
// Números repetidos fariam a ordem depender de desempate, e a página andaria
// sozinha no próximo carregamento.
montar();
reordenarPaginas("millena", "roadmap", true);
const nums = indexData.pages.filter(p => !p.parentId).map(p => p.order);
ok("sem números repetidos", new Set(nums).size === nums.length, nums.join(","));
ok("numerados de 1 em diante, sem buracos",
   nums.slice().sort((a, b) => a - b).join(",") === "1,2,3,4,5,6", nums.join(","));

// Várias trocas seguidas não podem degradar a numeração.
montar();
reordenarPaginas("millena", "roadmap", true);
reordenarPaginas("sankhya", "cal", false);
reordenarPaginas("dash", "millena", true);
const n2 = indexData.pages.filter(p => !p.parentId).map(p => p.order).sort((a, b) => a - b);
ok("depois de três trocas ainda está limpa", n2.join(",") === "1,2,3,4,5,6", n2.join(","));
ok("e nenhuma página sumiu", indexData.pages.filter(p => !p.parentId).length === 6);

/* ---- 3. não mudar o pai sem querer ---- */
montar();
ok("não aceita soltar uma página de raiz dentro de um bloco",
   reordenarPaginas("millena", "sub1", false) === false);
ok("e nada mudou", ordemRaiz() === "roadmap,cal,dash,bloco,sankhya,millena" &&
   indexData.pages.find(p => p.id === "millena").parentId === null);
ok("nem o contrário", reordenarPaginas("sub1", "roadmap", true) === false);
ok("a subpágina continua no bloco",
   indexData.pages.find(p => p.id === "sub1").parentId === "bloco");

ok("mesmoNivel reconhece irmãs de raiz", mesmoNivel("roadmap", "millena") === true);
ok("e irmãs dentro do bloco", mesmoNivel("sub1", "sub2") === true);
ok("mas não níveis diferentes", mesmoNivel("roadmap", "sub1") === false);

/* ---- 4. reordenar dentro de um bloco funciona igual ---- */
montar();
ok("subpáginas também reordenam", reordenarPaginas("sub2", "sub1", false) === true);
ok("e na ordem certa", ordemBloco() === "sub2,sub1", ordemBloco());
ok("sem afetar a raiz", ordemRaiz() === "roadmap,cal,dash,bloco,sankhya,millena");

/* ---- 5. casos bobos que não podem quebrar ---- */
montar();
ok("soltar em si mesma não faz nada", reordenarPaginas("millena", "millena", true) === false);
ok("id inexistente não quebra", reordenarPaginas("millena", "nao-existe", true) === false);
ok("e a lista segue intacta", ordemRaiz() === "roadmap,cal,dash,bloco,sankhya,millena");

/* ---- 6. o que o código garante ---- */
const liga = ex("ligaArrasteDaPagina");
ok("a linha vira arrastável", /row\.draggable = true/.test(liga));
ok("mostra onde vai cair, acima ou abaixo",
   /alvo-antes/.test(liga) && /alvo-depois/.test(liga));
ok("a metade de baixo solta depois, a de cima antes",
   /e\.clientY - r\.top\) > r\.height \/ 2/.test(liga));
ok("alvo de outro nível é recusado visualmente",
   /classList\.add\("recusa"\)/.test(liga) && /dropEffect = "none"/.test(liga));
ok("e o navegador nem deixa soltar lá (sem preventDefault)",
   /return;   \/\/ sem preventDefault/.test(liga));
ok("as marcas somem ao terminar", /limpaMarcasDeArraste\(\)/.test(liga));
ok("grava e redesenha", /scheduleSaveIndex\(\)/.test(liga) && /buildTree\(\)/.test(liga));
ok("a senha é pedida só quando a ordem vai mudar mesmo",
   /requestEditPassword\("ordemPaginas"\)/.test(liga) &&
   liga.indexOf("requestEditPassword") > liga.indexOf("mesmoNivel(movida"));
ok("só quem pode editar arrasta",
   /if \(canEdit\)\{[\s\S]{0,120}ligaArrasteDaPagina\(row, page\)/.test(src));
ok("a ação entra na lista de senhas do administrador",
   /\{ key: "ordemPaginas",\s+label: "Mudar a ordem das p\u00e1ginas na barra lateral" \}/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
