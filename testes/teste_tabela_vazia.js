// Testa o aviso de tabela vazia e os filtros que não apareciam na tela.
//
// O CASO REAL: a página CLIENTES mostrava "0 Atividades" e uma tabela vazia,
// como se não tivesse carregado. Mas o atalho "Hoje" ao lado marcava 4 — e os
// dois números saem da MESMA fonte. A página tinha carregado; um filtro estava
// escondendo tudo.
//
// O que torna isso possível, e é o que este teste protege:
//   - PRIORIDADE não tem controle nenhum na barra de filtros;
//   - RESPONSÁVEL, ligado pelo painel lateral, recebe um e-mail que a caixa da
//     barra não tem como opção — ela volta a exibir "Todos" e mente;
//   - os filtros atravessam a troca de página.
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

globalThis.taskCompanyFilter = "Todas";
globalThis.taskAssigneeFilter = "Todos";
globalThis.taskPriorityFilter = "Todas";
globalThis.taskDueStateFilter = "Todos";
globalThis.taskDueFromFilter = "";
globalThis.taskDueToFilter = "";
globalThis.taskSearchText = "";
globalThis.taskFilter = "Todas";
eval(ex("filtrosAtivos") + "\nglobalThis.filtrosAtivos = filtrosAtivos;");

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. reconhecer que há filtro ligado ---- */
ok("sem filtro, diz que não há", filtrosAtivos() === false);

const cada = [
  ["taskCompanyFilter", "Novatec", "Todas"],
  ["taskAssigneeFilter", "natanael@x.com", "Todos"],
  ["taskPriorityFilter", "Alta", "Todas"],
  ["taskDueStateFilter", "vencido", "Todos"],
  ["taskDueFromFilter", "2026-01-01", ""],
  ["taskDueToFilter", "2026-12-31", ""],
  ["taskSearchText", "reunião", ""],
];
cada.forEach(([k, v, limpo]) => {
  globalThis[k] = v;
  ok("enxerga o filtro de " + k.replace("task", "").replace("Filter", ""), filtrosAtivos() === true);
  globalThis[k] = limpo;
});
ok("e volta a zero depois de limpar todos", filtrosAtivos() === false);

// Busca só com espaços não é filtro: contaria sem esconder nada, e o aviso
// diria que há filtro quando não há.
globalThis.taskSearchText = "   ";
ok("busca só com espaços não conta como filtro", filtrosAtivos() === false);
globalThis.taskSearchText = "";

// O filtro de status fica de fora de propósito: ele tem controle visível e
// aceso na tela, então não é dele que vem a confusão.
globalThis.taskFilter = "Concluído";
ok("o filtro de status não entra nesta conta (tem controle visível)",
   filtrosAtivos() === false);
globalThis.taskFilter = "Todas";

/* ---- 2. o aviso distingue as duas causas ---- */
// Zero linhas tem duas causas muito diferentes, e na tela elas eram idênticas.
const pinta = ex("pintaTabelaVazia");
ok("página sem atividade nenhuma diz isso",
   /ainda n\\u00e3o tem atividades/.test(pinta));
ok("e ensina como criar a primeira", /\+ Nova tarefa/.test(pinta));
ok("página COM atividades escondidas diz outra coisa",
   /Nenhuma atividade corresponde aos filtros/.test(pinta));
ok("e informa quantas a página tem de verdade",
   /A p\\u00e1gina tem " \+ totalNaPagina/.test(pinta));
ok("nomeia os filtros ligados", /buildActiveFiltersSummary\(\)/.test(pinta));
ok("e oferece limpar ali mesmo", /Limpar filtros/.test(pinta));
ok("o botão reaproveita o Limpar filtros da barra, em vez de repetir a lógica",
   /getElementById\("clearFiltersBtn"\)/.test(pinta));

ok("some assim que houver linha", /if \(mostradas > 0\)/.test(pinta));
ok("esconde a casca da tabela: cabeçalho sem linha parece defeito",
   /wrap\.style\.display = "none"/.test(pinta) && /wrap\.style\.display = ""/.test(pinta));
ok("o texto entra por innerHTML só com conteúdo nosso; o resumo vai por textContent",
   /lista\.textContent = buildActiveFiltersSummary\(\)/.test(pinta));

ok("é chamado ao fim do desenho da tabela",
   /pintaTabelaVazia\(content\.tasks\.length, sorted\.length\)/.test(ex("renderTasks")));

/* ---- 3. a descrição dos filtros deixou de ser só da impressão ---- */
// Ela já existia e nomeava tudo, mas só era usada ao imprimir — a tela nunca
// mostrava. Era informação pronta, guardada onde ninguém via.
const usos = (src.match(/buildActiveFiltersSummary\(\)/g) || []).length;
ok("o resumo dos filtros é usado também na tela, não só ao imprimir", usos >= 2,
   usos + " usos");

/* ---- 4. o painel lateral para de mentir ---- */
const sinc = ex("sincronizaCaixaDeResponsavel");
// O que importa e que a chamada esteja no clique do painel, junto da
// atribuicao do filtro — nao a ordem das linhas (declaracao de funcao sobe).
const grupoResp = (src.match(/buildGroup\("Respons[\s\S]{0,800}?\}\)\)\);/) || [""])[0];
ok("o painel lateral acerta a caixa da barra ao filtrar por responsável",
   /taskAssigneeFilter = /.test(grupoResp) &&
   /sincronizaCaixaDeResponsavel\(\)/.test(grupoResp));
ok("e só atribui quando a opção existe, senão a caixa voltaria para Todos calada",
   /const tem = Array\.prototype\.some\.call\(sel\.options/.test(sinc) &&
   /if \(tem\) sel\.value = taskAssigneeFilter/.test(sinc));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
