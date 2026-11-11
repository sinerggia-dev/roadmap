// Testa a visão de celular (Android e iPhone).
//
// Três defeitos reais, vistos em captura a 390px:
//
//  1. A barra de filtros VAZAVA para fora da tela. `repeat(6, 1fr)` é na
//     verdade `minmax(auto, 1fr)`: conteúdo que não quebra empurra a coluna
//     além da fração e a linha fica mais larga que o telefone.
//  2. Eram quase 780px de controles antes da primeira atividade — mais de uma
//     tela inteira só de filtros.
//  3. O iPhone dá zoom sozinho ao tocar num campo com fonte menor que 16px, e
//     a página fica torta até a pessoa desfazer com dois dedos.
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

// O bloco do celular, para não confundir com regras de telas grandes.
const iMob = src.indexOf("@media (max-width: 768px){");
let d = 0, fimMob = -1;
for (let j = src.indexOf("{", iMob); j < src.length; j++) {
  if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (!d) { fimMob = j + 1; break; } }
}
const mob = src.slice(iMob, fimMob);

const casos = [];
const ok = (d2, c, extra) => casos.push([d2 + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. o vazamento da grade ---- */
// `1fr` sozinho é o que deixava a barra mais larga que a tela.
ok("a grade dos filtros usa minmax(0, 1fr)",
   /grid-template-columns:repeat\(6, minmax\(0, 1fr\)\)/.test(mob));
ok("e `repeat(6, 1fr)` não sobrou em lugar nenhum",
   /repeat\(6, 1fr\)/.test(mob) === false);
ok("todo filho da barra pode encolher", /#taskToolbarRow > \*\{min-width:0;\}/.test(mob));
ok("os botões da barra quebram o texto em vez de esticar a coluna",
   /#tableViewBtn, #kanbanViewBtn, #groupCompanyBtn, #importarResumosBtn\{[\s\S]{0,180}white-space:normal/.test(mob));

/* ---- 2. o zoom do iPhone ---- */
// Abaixo de 16px o Safari amplia a página ao focar o campo.
ok("campos têm 16px no celular", /input, select, textarea, button\{font-size:16px;\}/.test(mob));
const m13 = mob.match(/font-size:1[0-5](\.\d+)?px/g) || [];
// A regra geral acima e vencida por seletores de id: o tamanho precisa estar
// repetido no bloco dos filtros, senao o iPhone continua ampliando.
const blocoFiltros = (mob.match(/#statusFilterSelect[\s\S]{0,260}?\}/) || [""])[0];
ok("os campos de filtro tambem declaram 16px", /font-size:16px/.test(blocoFiltros),
   blocoFiltros.replace(/\s+/g, " ").slice(0, 120));
ok("e nenhum deles ficou abaixo disso",
   /font-size:1[0-5](\.\d+)?px/.test(blocoFiltros) === false);

/* ---- 3. área segura e metas ---- */
ok("o viewport cobre o entalhe", /viewport-fit=cover/.test(src));
ok("há cor para a barra do navegador", /<meta name="theme-color"/.test(src));
ok("o conteúdo respeita a área segura das laterais",
   /padding-left:env\(safe-area-inset-left\)/.test(mob));
ok("e a barra de gestos embaixo", /env\(safe-area-inset-bottom\)/.test(mob));
ok("o sistema não reescala o texto por conta própria",
   /-webkit-text-size-adjust:100%/.test(src));

/* ---- 4. filtros recolhidos ---- */
ok("os filtros começam recolhidos no celular",
   /#taskToolbarRow:not\(\.aberto\)\{display:none;\}/.test(mob));
ok("há um botão para abri-los", /id="filtrosToggleBtn"/.test(src));
ok("o botão só aparece no celular", /#filtrosToggleBtn\{[\s\S]{0,40}display:flex/.test(mob));
ok("a seta indica aberto ou fechado", /seta\.textContent = aberto/.test(src));

/* ---- 5. o risco de esconder filtro: filtro ligado e invisível ---- */
// Já aconteceu neste app com os botões escondidos: faltavam linhas e ninguém
// entendia por quê. O contador no botão é o que impede a repetição.
globalThis.taskCompanyFilter = "Todas";
globalThis.taskAssigneeFilter = "Todos";
globalThis.taskPriorityFilter = "Todas";
globalThis.taskDueStateFilter = "Todos";
globalThis.taskDueFromFilter = "";
globalThis.taskDueToFilter = "";
globalThis.taskSearchText = "";
eval(ex("contarFiltrosAtivos") + "\nglobalThis.contarFiltrosAtivos = contarFiltrosAtivos;");

ok("sem filtro, conta zero", contarFiltrosAtivos() === 0);
const liga = [
  ["taskCompanyFilter", "Novatec"], ["taskAssigneeFilter", "Natanael"],
  ["taskPriorityFilter", "Alta"],   ["taskDueStateFilter", "vencido"],
  ["taskDueFromFilter", "2026-01-01"], ["taskDueToFilter", "2026-12-31"],
  ["taskSearchText", "reunião"],
];
liga.forEach(([k, v], i) => {
  globalThis[k] = v;
  ok("conta o filtro de " + k.replace("task", "").replace("Filter", ""),
     contarFiltrosAtivos() === i + 1, String(contarFiltrosAtivos()));
});
ok("conta os sete juntos", contarFiltrosAtivos() === 7);
// Espaço em branco na busca não é filtro: contaria sem filtrar nada.
globalThis.taskSearchText = "   ";
ok("busca só com espaços não conta", contarFiltrosAtivos() === 6);

ok("o contador some quando não há filtro", /conta\.hidden = n === 0/.test(src));
ok("e acompanha cada redesenho da tabela",
   /if \(typeof atualizaBotaoFiltros === "function"\) atualizaBotaoFiltros\(\);/.test(ex("renderTasks")));

/* ---- 6. janelas que não cabiam no telefone ---- */
ok("as janelas ocupam a largura toda no celular",
   /#resumoModal, #dlgModal\{width:100%;max-width:100%;\}/.test(mob));
ok("código longo quebra em vez de estourar a janela",
   /overflow-wrap:anywhere/.test(mob));

/* ---- 7. cada atividade vira um cartao ----
   A tabela tem 16 colunas. Num telefone cabem tres, e as tres primeiras eram
   ITENS, EMPRESA e RESPONSAVEL: o NOME DA TAREFA ficava fora da tela, e era
   preciso rolar de lado em cada linha para saber do que se tratava. */
const linha = ex("renderTaskRow");

// A chave e o rotulo viajam na celula: e isso que deixa o CSS empilhar sem um
// segundo desenho em JS, que duplicaria a logica de cada coluna.
ok("cada celula carrega a sua coluna", /td\.dataset\.col = key/.test(linha));
ok("e o rotulo da coluna", /td\.dataset\.rotulo = \(def && def\.label\) \|\| key/.test(linha));
ok("o CSS usa esse rotulo", /content:attr\(data-rotulo\)/.test(mob));

ok("a tabela vira blocos no celular", /#taskTable\{[\s\S]{0,200}display:block/.test(mob));
ok("o cabecalho some", /#taskTable thead\{display:none;\}/.test(mob));
ok("cada linha vira cartao", /#taskTable tr\{[\s\S]{0,160}border-radius:11px/.test(mob));
ok("cada celula vira rotulo e valor", /#taskTable td\{[\s\S]{0,120}display:flex/.test(mob));

// A largura total da tabela e calculada em JS e gravada inline (soma das
// colunas, as vezes acima de 2000px). Sem !important o cartao nasce maior que
// a tela e os valores ficam fora dela.
ok("a largura inline calculada em JS e vencida",
   /#taskTable\{[\s\S]{0,260}width:100% !important/.test(mob));
ok("e o codigo explica por que o !important e necessario",
   /largura total da tabela e calculada em JS/.test(mob));

// .wide impoe 40px de cada lado e vence por especificidade — num telefone isso
// e um quinto da tela so em margem.
ok("a margem lateral larga do computador e reduzida",
   /#pageView\.wide\{padding-left:12px !important/.test(mob));
ok("e a barra de rolagem reservada deixa de roubar largura",
   /#taskTableWrap\{overflow:visible !important/.test(mob));

ok("o nome da tarefa e o titulo do cartao, sem rotulo",
   /#taskTable td\[data-col="title"\]::before\{content:none;\}/.test(mob));
ok("e aparece em destaque", /data-col="title"\] > \*\{[\s\S]{0,60}font-weight:600/.test(mob));

// Fechado mostra so o essencial: dezesseis linhas por atividade seria pior que
// a rolagem lateral que isto veio corrigir.
const regraFechado = (mob.match(/#taskTable tr:not\(\.aberto\)[^{]*\{[^}]*\}/) || [""])[0];
["title", "company", "assignee", "dueDate", "status"].forEach(c => {
  ok("cartao fechado mostra " + c, regraFechado.indexOf('data-col="' + c + '"') >= 0);
});
ok("e esconde o resto", /display:none/.test(regraFechado));

ok("ha um botao para abrir o cartao", /className = "card-abrir"/.test(linha));
ok("que alterna e troca a seta",
   /classList\.toggle\("aberto"\)[\s\S]{0,120}abrir\.textContent = aberto/.test(linha));
ok("o clique no botao nao marca a caixa de selecao",
   /abrir\.addEventListener\("click", \(e\) => \{[\s\S]{0,40}e\.stopPropagation\(\)/.test(linha));

ok("o cabecalho de grupo continua uma faixa, nao um cartao",
   /#taskTable tr\.task-group-row\{[\s\S]{0,120}background:none/.test(mob));
ok("o vencimento vira a borda do cartao",
   /#taskTable tr\.due-vencido\{border-left:3px solid var\(--danger\)/.test(mob));
ok("as celulas presas do computador param de prender",
   /position:static/.test(mob));

/* ---- 8. o painel do topo divide a linha com o botao do menu ----
   Antes o botao flutuava sozinho e o painel ocupava uma faixa inteira logo
   abaixo: duas linhas para informacao de apoio, numa tela onde cada linha
   disputa espaco com as atividades. */
// O bloco pequeno de @media que cuida do painel do topo. Fatiado por indice:
// montar esse recorte por expressao regular exigiria escapes que ja se
// perderam uma vez no caminho ate aqui.
const iPainel = src.indexOf("@media (max-width:768px){");
const blocoPainel = iPainel > 0 ? src.slice(iPainel, iPainel + 1800) : "";
ok("o painel recua para a largura do botao do menu",
   /#painelTopo\{[\s\S]{0,200}margin:-44px 0 10px 60px/.test(blocoPainel));
ok("e o recuo cobre o botao (38px) com folga",
   /width:38px/.test(src) && /margin:-44px 0 10px 60px/.test(blocoPainel));
ok("o painel nao quebra em varias linhas", /flex-wrap:nowrap/.test(blocoPainel));
// O pedido foi MOVER as funcoes, nao tirar nenhuma.
ok("o botao de atualizar o tempo continua",
   /#ptAtualizar\{width:24px/.test(blocoPainel) && /#ptAtualizar\{display:none/.test(blocoPainel) === false);
ok("o local continua", /#ptLocal\{font-size:11px/.test(blocoPainel) &&
   /#ptLocal\{display:none/.test(blocoPainel) === false);
ok("so sai o que o proprio telefone ja mostra: a data por extenso",
   /#ptData\{display:none;\}/.test(blocoPainel));
ok("o alfinete e a cidade nao quebram linha", /#ptLocal\{[\s\S]{0,40}white-space:nowrap/.test(blocoPainel));

/* ---- 9. o painel ALINHADO com o botao do menu ----
   Nao basta estar na mesma linha: na primeira tentativa o painel comecava
   44px abaixo do botao e ficava visivelmente torto.

   Tres numeros se amarram, e e por isso que este teste faz a conta em vez de
   fixar o resultado: se alguem mudar o recuo do #pageView ou a posicao do
   botao, o painel desalinha em silencio. */
function num(re, onde){
  const m = re.exec(onde || src);
  return m ? Number(m[1]) : null;
}
const btnTop = num(/#mobileMenuBtn\{[\s\S]{0,120}?top:(\d+)px/);
const btnAlt = num(/#mobileMenuBtn\{[\s\S]{0,160}?height:(\d+)px/);
const iPv = src.indexOf("#pageView{padding:", src.indexOf("@media (max-width: 768px){"));
const pvTopo = num(/#pageView\{padding:(\d+)px/, src.slice(iPv, iPv + 80));
const ptMargem = num(/#painelTopo\{[\s\S]{0,80}?margin:(-?\d+)px/, blocoPainel);
const ptAltura = num(/#painelTopo\{[\s\S]{0,200}?min-height:(\d+)px/, blocoPainel);

ok("li os numeros dos dois elementos",
   btnTop !== null && btnAlt !== null && pvTopo !== null && ptMargem !== null && ptAltura !== null,
   "botao " + btnTop + "/" + btnAlt + ", pageView " + pvTopo + ", painel " + ptMargem + "/" + ptAltura);
// O painel comeca em (recuo do pageView + sua margem); o botao, em top.
ok("o painel comeca na mesma altura do botao",
   pvTopo + ptMargem === btnTop, (pvTopo + ptMargem) + " vs " + btnTop);
ok("e termina junto com ele", ptAltura === btnAlt, ptAltura + " vs " + btnAlt);
ok("a altura conta a borda, senao o painel passa do botao",
   /box-sizing:border-box/.test(blocoPainel));
ok("o codigo mostra a conta, para nao virar numero magico",
   /56 - 12/.test(blocoPainel));

let n = 0;
console.log("");
for (const [d2, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d2); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
