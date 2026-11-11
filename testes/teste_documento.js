// Testa a coluna DOCUMENTO: gera os três arquivos com o código real do app e
// grava em disco, para o Python validar que são pacotes Office legíveis.
//
// O QUE NÃO DÁ PARA TESTAR AQUI: se o Office online abre o arquivo. Isso precisa
// do Office. O que dá é garantir que o pacote é íntegro e tem as partes certas —
// um ZIP corrompido ou faltando parte é o que faria o Office recusar.
const fs = require("fs");
const path = (process.env.ALVO_HTML || require("path").join(__dirname, "..", "index.html"));
const src = fs.readFileSync(path, "utf8");

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

// ---- o que o navegador dá de graça e o Node v14 não ----
const { TextEncoder } = require("util");
global.TextEncoder = TextEncoder;
global.window = global;
global.navigator = { userAgent: "node" };
global.location = { href: "http://l/" };
global.atob = b => Buffer.from(b, "base64").toString("binary");
global.btoa = b => Buffer.from(b, "binary").toString("base64");
// A biblioteca de planilha e opcional: fora da maquina original ela pode
// nao existir, e isso nao deve derrubar o resto da suite.
let XLSX_OK = true;
try{ global.XLSX = require("xlsx"); }
catch(e){
  try{ global.XLSX = require("C:/tmp/xlsx_node/node_modules/xlsx"); }
  catch(e2){ XLSX_OK = false; global.XLSX = null; }
}

eval([ex("crc32Bytes"), ex("montarZip"), ex("escaparXml"), ex("docxEmBranco"),
      src.match(/^const DOC_TIPOS = \{[\s\S]*?\n\};$/m)[0].replace("const ", "globalThis."),
      "globalThis.docxEmBranco = docxEmBranco; globalThis.montarZip = montarZip;",
      "globalThis.escaparXml = escaparXml; globalThis.crc32Bytes = crc32Bytes;"].join("\n"));

const casos = [];
const ok = (d, c) => casos.push([d, !!c]);

/* ---- 1. o .docx, que é o gerado à mão ---- */
const docx = docxEmBranco("Reunião Aline — Métricas & <acessos>");
fs.writeFileSync(require("path").join(require("os").tmpdir(), "doc_teste.docx"), Buffer.from(docx));
ok("o .docx começa com a assinatura de ZIP", docx[0] === 0x50 && docx[1] === 0x4B);
ok("tem tamanho de arquivo real, não vazio", docx.length > 800 && docx.length < 4000);

/* ---- 2. o .xlsx, pelo SheetJS que o app já carrega ---- */
const ws = XLSX.utils.aoa_to_sheet([["Reunião Aline"], []]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Notas");
const xlsx = new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
fs.writeFileSync(require("path").join(require("os").tmpdir(), "doc_teste.xlsx"), Buffer.from(xlsx));
ok("o .xlsx sai do SheetJS com conteúdo", xlsx.length > 1000);

/* ---- 3. escape de XML: título com caractere perigoso ---- */
ok("& vira entidade", escaparXml("a & b") === "a &amp; b");
ok("< e > viram entidades", escaparXml("<x>") === "&lt;x&gt;");
ok("aspas também", escaparXml('"a"') === "&quot;a&quot;");
ok("acento passa intacto", escaparXml("Reunião") === "Reunião");

/* ---- 4. o CRC32, que é o que o Office usa para recusar pacote corrompido ---- */
// Valor conhecido: CRC32 de "123456789" é 0xCBF43926.
ok("CRC32 bate com o valor conhecido",
   crc32Bytes(new TextEncoder().encode("123456789")) === 0xCBF43926);

/* ---- 5. tipos oferecidos ---- */
ok("oferece os três formatos", Object.keys(DOC_TIPOS).join(",") === "word,excel,ppt");
ok("cada um com extensão certa",
   DOC_TIPOS.word.ext === "docx" && DOC_TIPOS.excel.ext === "xlsx" && DOC_TIPOS.ppt.ext === "pptx");
ok("e com o tipo MIME do Office",
   Object.keys(DOC_TIPOS).every(k => /openxmlformats-officedocument/.test(DOC_TIPOS[k].mime)));

/* ---- 6. garantias no código ---- */
ok("o nome do arquivo leva o id da tarefa, para não atropelar outra",
   /task\.id \+ "_" \+ safeFileName/.test(src));
ok("a criação pede senha pela ação 'documento'",
   /guardTaskFieldEdit\(task, "documento"\)/.test(src));
ok("tirar o documento avisa que o arquivo continua no OneDrive",
   /continua na pasta ' \+ DOCS_FOLDER/.test(src));
ok("a pasta é criada só se não existir, e tolera corrida entre abas",
   /conflictBehavior": "fail"[\s\S]{0,200}res = await graphFetch\(caminho\)/.test(ex("ensureDocsFolder", "async function ")));
ok("abre o documento logo após criar", /window\.open\(task\.documento\.url/.test(src));
ok("erro na criação aparece, não some", /Não consegui criar o documento/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
