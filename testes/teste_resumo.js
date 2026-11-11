// Testa a coluna RESUMO.
//
// O QUE MAIS IMPORTA AQUI, em ordem:
//  1. ESCAPE. O resumo é texto colado de fora (do Plaud, de um e-mail, de onde
//     for). Se ele virasse HTML, qualquer um que colasse <script> ou um onerror
//     estaria injetando código na tabela que o escritório inteiro abre.
//  2. Render fiel: os resumos do Plaud vêm em Markdown; títulos, itens e
//     pendências precisam aparecer como tal, senão a coluna não serve para ler.
//  3. Ler nunca pede senha; salvar e apagar pedem.
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

eval([ex("escapeHtml"), ex("resumoVazio"), ex("resumoParaHtml"), ex("resumoParaTexto"),
      ex("problemaNoTextoDoResumo"), ex("tipoNaoTextual"),
      src.match(/^const TIPOS_QUE_NAO_SAO_TEXTO = \[[\s\S]*?\n\];$/m)[0].replace("const ", "globalThis."),
      "globalThis.tipoNaoTextual = tipoNaoTextual;",
      src.match(/^const RESUMO_MAX_CHARS = .*$/m)[0].replace("const ", "globalThis."),
      src.match(/^const RESUMO_RENDER_MAX = .*$/m)[0].replace("const ", "globalThis."),
      "globalThis.problemaNoTextoDoResumo = problemaNoTextoDoResumo;",
      "globalThis.resumoVazio = resumoVazio;",
      "globalThis.resumoParaHtml = resumoParaHtml;",
      "globalThis.resumoParaTexto = resumoParaTexto;"].join("\n"));

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. ESCAPE: o que impede um resumo colado de virar código ---- */
const malicioso = '<script>alert(1)</script>\n- <img src=x onerror="roubar()">\n## A & B <b>já</b>';
const h = resumoParaHtml(malicioso);
ok("tag colada não vira tag de verdade", h.indexOf("<script>") < 0 && h.indexOf("&lt;script&gt;") >= 0);
ok("atributo de evento não escapa", h.indexOf("onerror=\"roubar") < 0);
ok("<img> colado aparece como texto", h.indexOf("<img") < 0 && h.indexOf("&lt;img") >= 0);
ok("& vira entidade", h.indexOf("A &amp; B") >= 0);
ok("mas o HTML que NÓS geramos é real", /<h3>/.test(h) && /<ul>/.test(h) && /<li>/.test(h));
// Negrito do Markdown é nosso, não do texto colado:
ok("**negrito** do Markdown vira <b>", /<b>sim<\/b>/.test(resumoParaHtml("**sim**")));
ok("<b> colado NÃO vira negrito", resumoParaHtml("<b>nao</b>").indexOf("<b>nao</b>") < 0);

/* ---- 2. o Markdown que os resumos do Plaud realmente usam ---- */
// Texto igual ao que o Plaud devolveu na reunião de Planejamento de Natal.
const doPlaud = [
  "## Informações da reunião",
  "> **Data:** 2026-11-04 08:27:48",
  "## Notas da reunião",
  "### Compartilhamento do link",
  "- Foi combinado enviar o link e as perguntas a Eliana.",
  "- Eliana ainda não havia visualizado a mensagem.",
  "## Próximos encaminhamentos",
  "- [ ] Confirmar se Eliana recebeu o link.",
  "- [x] Compartilhar os cadernos.",
  "---",
  "| Data | Duração |",
  "|---|---|",
  "| 04/11/2026 | 12m 45s |",
].join("\n");
const p = resumoParaHtml(doPlaud);
ok("## vira título de seção", (p.match(/<h3>/g) || []).length === 3);
ok("### vira subtítulo", /<h4>Compartilhamento do link<\/h4>/.test(p));
ok("> vira citação", /<blockquote><b>Data:<\/b>/.test(p));
ok("itens viram lista", /<ul><li>Foi combinado[\s\S]*?<\/li>/.test(p));
ok("pendência aberta fica marcada como pendente", /<li class="pendente">Confirmar/.test(p));
ok("pendência feita fica marcada como feita", /<li class="feito">Compartilhar/.test(p));
ok("--- vira separador", /<hr>/.test(p));
ok("linha de tabela vira texto legível", /<p>Data \u00b7 Dura\u00e7\u00e3o<\/p>/.test(p));
ok("a linha de traços da tabela some", p.indexOf("---|---") < 0 && !/<p>\s*<\/p>/.test(p));
ok("lista fecha antes do próximo título", /<\/li><\/ul><h3>/.test(p));

/* ---- 3. detalhes que estragam a leitura se errados ---- */
ok("linha em branco não vira parágrafo vazio", resumoParaHtml("a\n\n\nb") === "<p>a</p><p>b</p>");
ok("texto solto vira parágrafo", resumoParaHtml("só isso") === "<p>só isso</p>");
ok("nada entra, nada sai", resumoParaHtml("") === "" && resumoParaHtml(null) === "");
ok("lista é fechada no fim, sem <ul> órfão",
   (resumoParaHtml("- a\n- b").match(/<ul>/g) || []).length ===
   (resumoParaHtml("- a\n- b").match(/<\/ul>/g) || []).length);
ok("uma lista só para itens seguidos",
   (resumoParaHtml("- a\n- b\n- c").match(/<ul>/g) || []).length === 1);

/* ---- 4. vazio ---- */
ok("sem resumo é vazio", resumoVazio(undefined) && resumoVazio("") && resumoVazio(null));
ok("só espaço e quebra de linha é vazio", resumoVazio("   \n  \t "));
ok("uma letra já não é vazio", resumoVazio("a") === false);

/* ---- 5. a prévia do botão, que é o que se lê passando o mouse ---- */
const prev = resumoParaTexto(doPlaud);
ok("a prévia não mostra marcação", prev.indexOf("#") < 0 && prev.indexOf("**") < 0 && prev.indexOf("[") < 0);
ok("e começa pelo conteúdo", prev.indexOf("Informações da reunião") === 0);

/* ---- 6. ligação com o resto do app ---- */
const cel = ex("buildResumoCell");
ok("a coluna existe", /\{ key: "resumo", label: "Resumo" \}/.test(src));
ok("a célula é construída pelo registro de colunas", /resumo: \(task\) => buildResumoCell\(task\)/.test(src));
ok("ABRIR para ler não pede senha",
   /Abrir para ler nunca pede senha/.test(cel) && /abrirResumo\(task, refresh\)/.test(cel));
ok("salvar pede senha pela ação 'resumo'",
   /guardTaskFieldEdit\(resumoTask, "resumo"\)/.test(src));
ok("apagar também pede, e confirma antes",
   /Apagar o resumo desta atividade\?[\s\S]{0,140}guardTaskFieldEdit\(resumoTask, "resumo"\)/.test(src));
ok("a ação aparece na lista de senhas do administrador",
   /\{ key: "resumo",\s+label: "Escrever e apagar resumo" \}/.test(src));
ok("quem é só leitor vê o resumo mas não edita",
   /if \(!resumoVazio\(task\.resumo\)\)/.test(cel) && /\} else if \(canEdit\)\{/.test(cel));
ok("o resumo entra na busca da barra", /task\.resumo \|\| "",/.test(src));
ok("vazio e com permissão, já abre escrevendo",
   /classList\.toggle\("editando", canEdit && resumoVazio\(task\.resumo\)\)/.test(src));
ok("salvar vazio apaga o campo, não grava string vazia",
   /if \(resumoVazio\(t\)\) delete resumoTask\.resumo;/.test(src));

/* ---- 6b. o botao de atualizar, por linha ---- */
// O QUE ELE NAO FAZ, e precisa estar claro no codigo: nao fala com o Plaud.
// A pagina nao tem como. Ele olha a pasta de importacao do OneDrive.
const busca = ex("buscarResumoDaAtividade", "async function ");
ok("o botao aparece na celula", /class[NL]ame = "task-resumo-sync"/.test(cel));
ok("e so para quem pode editar", /if \(canEdit\)\{[\s\S]{0,260}task-resumo-sync/.test(cel));
ok("olha a pasta de importacao, nao o Plaud",
   /listarPastaDeImportacao\(\)/.test(busca) && /plaud/i.test(busca) === false);
ok("o codigo explica POR QUE nao olha o Plaud",
   /nao consegue falar com o Plaud[\s\S]{0,200}pagina estatica nao/.test(src));
ok("so traz o arquivo desta atividade",
   /\(arquivos \|\| \[\]\)\.filter\(f => registroDoArquivo\(f\.name\) === n\)/.test(busca));
ok("atividade sem numero de registro avisa, em vez de pegar arquivo errado",
   /if \(!n\)\{[\s\S]{0,200}n\u00famero de registro/.test(busca));
ok("com mais de um arquivo, vale o mais recente",
   /sort\(\(a, b\) =>[\s\S]{0,120}lastModifiedDateTime/.test(busca));
// Estas tres garantias passaram para aplicarResumoNaTask, usada tanto pelo
// arquivo da pasta quanto pelo escolhido no computador: uma copia so, nao duas
// que podem divergir.
const aplicar = ex("aplicarResumoNaTask", "async function ");
ok("nao substitui resumo existente sem perguntar",
   /!resumoVazio\(task\.resumo\) &&[\s\S]{0,180}await perguntar\(/.test(aplicar));
ok("pasta vazia diz o que falta, em vez de so falhar",
   /Nada esperando pela atividade/.test(busca));
ok("arquivo vazio nao apaga o que ja estava la",
   /if \(resumoVazio\(texto\)\)\{[\s\S]{0,160}return false;/.test(aplicar));
ok("marca o arquivo como importado, para nao repetir",
   /await marcarComoImportado\(alvo\)/.test(busca));
ok("grava e redesenha a celula", /scheduleSavePage\(currentPageId\)/.test(aplicar) &&
   /if \(aoTerminar\) aoTerminar\(\)/.test(aplicar));
ok("e o botao por linha usa essa mesma funcao",
   /aplicarResumoNaTask\(task, texto, alvo\.name, aoTerminar\)/.test(busca));
ok("o botao volta ao normal mesmo com erro",
   /finally\{[\s\S]{0,120}botao\.disabled = false/.test(busca));
ok("pede senha pela mesma acao da importacao",
   /requestEditPassword\("importarResumos"\)/.test(busca));

/* ---- 6c. recusar o que nao e texto ----
   O CASO REAL: o seletor aceitou o .webm do audio e o app leu 1,4 MB de
   binario como resumo. Medido no Chrome, abrir isso levava 8951 ms e o
   navegador declarava a pagina sem resposta. */
const NULO = String.fromCharCode(0);
const FFFD = String.fromCharCode(0xFFFD);

// O nome do arquivo ja responde, e responde melhor: "2616 KB, grande demais"
// estava certo mas errava o alvo — um audio de 50 KB passaria pelo limite e
// viraria lixo do mesmo jeito.
ok("o .webm do audio e reconhecido pelo nome",
   /áudio/.test(problemaNoTextoDoResumo("", "Apresentacao.webm") || ""));
ok("e isso vale mesmo sendo pequeno",
   problemaNoTextoDoResumo("tres letras", "x.mp3") !== null);
ok("video tambem", /vídeo/.test(problemaNoTextoDoResumo("", "a.mp4") || ""));
ok("imagem tambem", /imagem/.test(problemaNoTextoDoResumo("", "foto.PNG") || ""));
ok("PDF tambem", /PDF/.test(problemaNoTextoDoResumo("", "contrato.pdf") || ""));
ok("Word e Excel tambem", /Office/.test(problemaNoTextoDoResumo("", "ata.docx") || "") &&
   /Office/.test(problemaNoTextoDoResumo("", "planilha.xlsx") || ""));
ok("compactado tambem", /compactado/.test(problemaNoTextoDoResumo("", "tudo.zip") || ""));
ok("maiusculas nao enganam", tipoNaoTextual("A.WEBM") !== null);
ok("mas .md e .txt passam",
   tipoNaoTextual("resumo.md") === null && tipoNaoTextual("notas.txt") === null);
ok("nome sem extensao nao e acusado", tipoNaoTextual("resumo sem extensao") === null);
ok("extensao parecida nao e confundida", tipoNaoTextual("relatorio.mdx") === null);
ok("e a validacao recebe o nome do arquivo",
   /problemaNoTextoDoResumo\(texto, nomeArquivo\)/.test(src));

ok("texto normal passa", problemaNoTextoDoResumo("## Reuniao" + String.fromCharCode(10) + "- item com acentuacao: coracao") === null);
ok("texto com tabulacao e quebra passa",
   problemaNoTextoDoResumo("linha1" + String.fromCharCode(9) + "col2" + String.fromCharCode(10) + String.fromCharCode(13) + "linha2") === null);
ok("texto vazio nao e acusado de binario", problemaNoTextoDoResumo("") === null);

// Byte zero: so existe em binario.
ok("byte zero denuncia binario", /bin/.test(problemaNoTextoDoResumo("abc" + NULO + "def") || ""));

// U+FFFD e o que o navegador poe no lugar de byte que nao e texto valido —
// foi exatamente o que apareceu na tela do usuario.
const comoVeioOAudio = (FFFD + "E" + FFFD + "B" + FFFD + "webm" + FFFD + "OpusHead" + FFFD).repeat(80);
ok("o lixo do audio e reconhecido como binario",
   /bin/.test(problemaNoTextoDoResumo(comoVeioOAudio) || ""));
ok("e a mensagem cita audio e PDF, para a pessoa entender o que errou",
   /udio|PDF/.test(problemaNoTextoDoResumo(comoVeioOAudio) || ""));

// Um acento solto nao pode ser confundido com binario.
ok("texto com um caractere estranho isolado ainda passa",
   problemaNoTextoDoResumo("Reuniao de alinhamento " + FFFD + " com a equipe toda, assunto X") === null);

// Tamanho: resumo de reuniao nao tem megabytes.
ok("arquivo grande demais e recusado",
   /grande demais/.test(problemaNoTextoDoResumo("a".repeat(RESUMO_MAX_CHARS + 1)) || ""));
ok("e diz o tamanho e o limite",
   /KB/.test(problemaNoTextoDoResumo("a".repeat(RESUMO_MAX_CHARS + 1)) || ""));
ok("logo abaixo do limite passa", problemaNoTextoDoResumo("a".repeat(RESUMO_MAX_CHARS - 10)) === null);
ok("o limite e razoavel para um resumo de reuniao",
   RESUMO_MAX_CHARS >= 100 * 1024 && RESUMO_MAX_CHARS <= 1024 * 1024);

ok("a validacao roda ANTES de gravar, e recebe o nome do arquivo",
   /const problema = problemaNoTextoDoResumo\(texto, nomeArquivo\);/.test(aplicar) &&
   aplicar.indexOf("problemaNoTextoDoResumo") < aplicar.indexOf("task.resumo = texto"));
ok("e explica o que escolher no lugar", /Escolha o arquivo de texto do resumo/.test(src));

/* O terceiro cuidado: mesmo com lixo JA salvo, a janela tem de abrir — senao
   nao da nem para apagar. */
const pinta = ex("pintaResumoLeitura");
ok("texto gigante nao e desenhado inteiro", /t\.length > RESUMO_RENDER_MAX/.test(pinta));
ok("mostra so o comeco", /t\.slice\(0, 2000\)/.test(pinta));
ok("e diz como limpar", /Apagar resumo para limpar/.test(pinta));
ok("o comeco entra como texto, nao como HTML", /pre\.textContent = t\.slice/.test(pinta));
ok("o limite de desenho e menor que o de aceitacao",
   RESUMO_RENDER_MAX < RESUMO_MAX_CHARS);

/* ---- 7. o resumo vai no backup ---- */
// Ele mora no JSON da pagina, que o backup le inteiro — nada a fazer, mas se um
// dia o backup passar a escolher campos, este teste avisa.
ok("o backup copia a página inteira, então leva o resumo junto",
   /pacote\.paginas\[p\.id\] = await getJsonByPath\("pagina_" \+ p\.id/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
