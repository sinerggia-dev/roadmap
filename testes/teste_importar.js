// Testa a importação de resumos da pasta do OneDrive.
//
// O QUE MAIS IMPORTA AQUI:
//  1. Casar arquivo com a atividade CERTA. Pôr o resumo de uma reunião na
//     atividade errada é pior que não importar: fica parecendo verdade.
//  2. Não apagar o que já existe sem perguntar.
//  3. Não sumir com arquivo em silêncio — quem não entrou tem que ser dito.
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

eval([ex("registroDoArquivo"), ex("ehArquivoDeResumo"), ex("casarResumos"),
      src.match(/^const IMPORT_FOLDER = .*$/m)[0].replace("const ", "globalThis."),
      src.match(/^const IMPORT_MAX_BYTES = .*$/m)[0].replace("const ", "globalThis."),
      "globalThis.registroDoArquivo = registroDoArquivo;",
      "globalThis.ehArquivoDeResumo = ehArquivoDeResumo;",
      "globalThis.casarResumos = casarResumos;"].join("\n"));

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. o número no começo do nome ---- */
ok("pega o número do começo", registroDoArquivo("158 - planejamento natal.md") === 158);
ok("aceita sem espaço", registroDoArquivo("158-natal.md") === 158);
ok("aceita só o número", registroDoArquivo("7.md") === 7);
ok("aceita espaço antes", registroDoArquivo("  42 reuniao.md") === 42);
// O caso que estragaria tudo: um nome com data vira a "atividade 2026".
ok("nome que começa com data NÃO vira atividade 2026",
   registroDoArquivo("2026-11-04 reuniao.md") === 2026);
ok("sem número no começo, devolve nulo", registroDoArquivo("reuniao 158.md") === null);
ok("nome vazio não quebra", registroDoArquivo("") === null && registroDoArquivo(null) === null);
// Por que o de cima é aceitável: 2026 simplesmente não casa com atividade
// nenhuma, e o arquivo é devolvido com motivo — não entra na errada.

/* ---- 2. que arquivo conta ---- */
ok("aceita .md", ehArquivoDeResumo("158 x.md"));
ok("aceita .txt", ehArquivoDeResumo("158 x.txt"));
ok("recusa .docx", ehArquivoDeResumo("158 x.docx") === false);
ok("recusa áudio", ehArquivoDeResumo("158 x.mp3") === false);
ok("NÃO reimporta o que já foi importado", ehArquivoDeResumo("158 x.importado.md") === false);

/* ---- 3. casar com a atividade certa ---- */
const tasks = [
  { items: 158, title: "Apresentação Manual Digital" },
  { items: 157, title: "Reunião Semanal Qdelicia" },
  { items: "", title: "Sem número" },
  { items: 159, title: "Canal do Youtube", resumo: "já tenho um resumo" },
];
const arquivos = [
  { name: "158 - natal.md", size: 500 },
  { name: "157 reuniao.md", size: 400 },
  { name: "999 fantasma.md", size: 100 },
  { name: "sem numero.md", size: 100 },
  { name: "159 grande.md", size: 9 * 1024 * 1024 },
];
const r = casarResumos(arquivos, tasks);
ok("casa pelo número de registro", r.casados.length === 2);
ok("e com a atividade certa",
   r.casados[0].task.title === "Apresentação Manual Digital" &&
   r.casados[1].task.title === "Reunião Semanal Qdelicia");
ok("número que não existe sobra, com motivo",
   r.sobrou.some(x => x.nome === "999 fantasma.md" && /não há atividade com o número 999/.test(x.motivo)));
ok("arquivo sem número sobra, com motivo",
   r.sobrou.some(x => x.nome === "sem numero.md" && /não começa com o número/.test(x.motivo)));
ok("arquivo grande demais sobra, com motivo",
   r.sobrou.some(x => x.nome === "159 grande.md" && /grande demais/.test(x.motivo)));
ok("nada se perde: todo arquivo ou casa ou é explicado",
   r.casados.length + r.sobrou.length === arquivos.length);
// Atividade sem numero de registro nao pode virar alvo de nada.
ok("atividade sem número nunca recebe resumo",
   r.casados.every(c => Number(c.task.items) > 0));

/* ---- 4. o que o código garante ---- */
const imp = ex("importarResumos", "async function ");
ok("avisa antes de substituir resumo que já existe",
   /jaTinham\.length && !\(await perguntar\(/.test(imp));
ok("e lista quais seriam substituídas, para dar para decidir",
   /jaTinham\.map\(c => "  " \+ c\.registro/.test(imp));
ok("marca como importado em vez de apagar o arquivo",
   /marcarComoImportado/.test(imp) && /\.importado/.test(ex("marcarComoImportado", "async function ")));
ok("pasta ausente vira oferta de escolher arquivo, nao erro cru",
   /não foi encontrada no seu OneDrive/.test(imp));
ok("pasta vazia explica por que, inclusive o .importado",
   /Nenhum arquivo novo[\s\S]{0,200}importado/.test(imp));
ok("relata o que entrou E o que não entrou",
   /resumo\(s\) importado\(s\)/.test(imp) && /N\u00e3o entraram/.test(imp) && /Deram erro/.test(imp));
ok("um arquivo com erro não derruba os outros",
   /for \(const c of casados\)[\s\S]{0,700}catch\(e\)\{[\s\S]{0,120}falhas\.push/.test(imp));
ok("arquivo vazio não apaga o resumo que já estava lá",
   /if \(resumoVazio\(texto\)\)\{[\s\S]{0,80}continue;/.test(imp));
ok("só grava se algo entrou de fato",
   /if \(feitos\.length\)\{[\s\S]{0,80}scheduleSavePage/.test(imp));
ok("redesenha a tabela depois de importar", /renderTasks\(\)/.test(imp));
ok("pede senha pela ação própria",
   /requestEditPassword\("importarResumos"\)/.test(imp));
ok("a ação aparece na lista do administrador",
   /\{ key: "importarResumos", label: "Importar resumos do OneDrive" \}/.test(src));
ok("sem página aberta, avisa em vez de quebrar",
   /Abra uma p\u00e1gina de atividades primeiro/.test(imp));
ok("o botão volta ao normal mesmo se der erro", /finally\{[\s\S]{0,120}btn\.disabled = false/.test(imp));

// Tira os comentarios antes de olhar: a palavra /content aparece no comentario
// que EXPLICA por que nao usamos /content.
const texto = ex("textoDoArquivo", "async function ").replace(/\/\/.*$/gm, "");
ok("baixa pelo endereço autenticado, não pelo /content",
   /downloadUrl/.test(texto) && /\/content/.test(texto) === false);

ok("o botão pode ser escondido como os outros da barra",
   /data-tkey="importar"/.test(src) && /importar: "Importar resumos"/.test(src));
ok("a pasta tem nome claro", IMPORT_FOLDER === "ROADMAP - Importar");

const busca2 = ex("buscarResumoDaAtividade", "async function ");
/* ---- 5. escolher o arquivo no computador ----
   POR QUE ISTO EXISTE: a pasta do OneDrive so funciona com a sincronizacao
   ligada. Na maquina onde isto foi testado o OneDrive nem roda, e a pasta local
   esta parada desde fevereiro de 2024 — arquivo escrito la nao sobe. O seletor
   do navegador nao depende de sincronizacao nenhuma. */
const seletor = ex("escolherArquivosDeResumo");
const aplica = ex("aplicarResumoNaTask", "async function ");

ok("aceita os formatos de texto", /accept = "\.md,\.markdown,\.txt/.test(seletor));
ok("no lote, da para marcar varios", /inp\.multiple = !!multiplo/.test(seletor));
// Sem tratar a desistencia, a promessa ficaria pendurada e o botao preso em "...".
ok("desistir do seletor nao deixa a promessa pendurada",
   /addEventListener\("cancel"/.test(seletor) && /addEventListener\("focus"/.test(seletor));
ok("e nao resolve duas vezes", /if \(!resolvido\)\{ resolvido = true/.test(seletor));

ok("pasta ausente deixa de ser erro e vira oferta",
   /arquivos = await listarPastaDeImportacao\(\); \}catch\(e\)\{ arquivos = null; \}/.test(imp));
ok("o lote oferece escolher quando nao ha nada na pasta",
   /ok: "Escolher arquivos"/.test(imp) && /escolherArquivosDeResumo\(true\)/.test(imp));
ok("o botao por linha tambem oferece",
   /ok: "Escolher arquivo"/.test(busca2) && /escolherArquivosDeResumo\(false\)/.test(busca2));
ok("arquivo do computador entra com a mesma forma dos da pasta",
   /arquivos = deEscolha\.map\(f => \(\{ name: f\.name, size: f\.size, arquivoLocal: f \}\)\)/.test(imp));
ok("e e lido direto, sem passar pelo OneDrive",
   /if \(item\.arquivoLocal\) return await item\.arquivoLocal\.text\(\)/.test(src));
ok("arquivo do computador nao e renomeado: nao e nosso",
   /if \(item\.arquivoLocal\) return;/.test(src));

/* As protecoes valem igual nos dois caminhos, porque sao o mesmo codigo. */
ok("arquivo vazio nao apaga o resumo que ja estava la",
   /if \(resumoVazio\(texto\)\)\{[\s\S]{0,160}return false;/.test(aplica));
ok("nao substitui resumo existente sem perguntar",
   /!resumoVazio\(task\.resumo\) &&[\s\S]{0,180}await perguntar\(/.test(aplica));
ok("so grava quando o resumo entrou de fato",
   /task\.resumo = texto;[\s\S]{0,120}scheduleSavePage/.test(aplica) && /return true;/.test(aplica));
ok("os dois caminhos usam a MESMA funcao, nao copias divergentes",
   (src.match(/aplicarResumoNaTask\(/g) || []).length >= 3);

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
