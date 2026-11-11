// Roda todas as suítes e devolve um resumo.
//
// Uso:  node testes/rodar.js
//       node testes/rodar.js --alvo caminho/para/index.html
//
// Por que existe: são 20 arquivos. Rodar um a um dá preguiça, e teste que dá
// preguiça de rodar não é rodado — que é o mesmo que não existir.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const AQUI = __dirname;
const argAlvo = process.argv.indexOf("--alvo");
const alvo = argAlvo > 0 ? path.resolve(process.argv[argAlvo + 1])
                         : path.join(AQUI, "..", "index.html");

if (!fs.existsSync(alvo)) {
  console.error("não achei o arquivo do app: " + alvo);
  process.exit(2);
}

const suites = fs.readdirSync(AQUI)
  .filter(f => /^teste_.*\.js$/.test(f) && f !== "teste_tema_fix.js")
  .sort();

console.log("app:    " + alvo);
console.log("suítes: " + suites.length + "\n");

let okTotal = 0, totalTotal = 0, falharam = [];

for (const f of suites) {
  let saida = "", codigo = 0;
  try {
    saida = execFileSync(process.execPath, [path.join(AQUI, f)],
      { env: Object.assign({}, process.env, { ALVO_HTML: alvo }),
        encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    saida = String((e.stdout || "") + (e.stderr || ""));
    codigo = e.status == null ? 1 : e.status;
  }
  const m = /^(\d+)\/(\d+) ok$/m.exec(saida);
  const nome = f.replace(/\.js$/, "");
  if (m) {
    okTotal += Number(m[1]);
    totalTotal += Number(m[2]);
    const bom = m[1] === m[2];
    if (!bom) falharam.push(nome);
    console.log((bom ? "ok    " : "FALHA ") + nome.padEnd(22) + m[0]);
    // Mostra só o que falhou — despejar tudo esconde o que importa.
    if (!bom) saida.split("\n").filter(l => l.startsWith("FALHA")).forEach(l => console.log("        " + l));
  } else {
    falharam.push(nome);
    console.log("ERRO  " + nome.padEnd(22) + "não produziu resumo (código " + codigo + ")");
    console.log("        " + saida.trim().split("\n").slice(0, 3).join("\n        "));
  }
}

console.log("\n" + okTotal + "/" + totalTotal + " verificações em " +
            suites.length + " suítes");
if (falharam.length) {
  console.log("falharam: " + falharam.join(", "));
  process.exit(1);
}
console.log("tudo certo");
