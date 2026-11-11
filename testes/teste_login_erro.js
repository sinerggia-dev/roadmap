// Testa o que o app diz quando a entrada falha.
//
// O DEFEITO QUE ISTO FECHA: o catch do botão trocava QUALQUER erro por
// "Não foi possível entrar com a Microsoft. Tente novamente." Quem lê isso não
// sabe se o pop-up foi bloqueado, se fechou a janela sem querer, ou se sobrou
// uma entrada pela metade travando todas as próximas — e cada um tem uma saída
// diferente. Engolir a causa é o mesmo defeito da tela preta.
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

eval(ex("recadoDoErroDeLogin") + "\nglobalThis.recadoDoErroDeLogin = recadoDoErroDeLogin;");

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c || !extra ? "" : "  <- " + extra), !!c]);

/* ---- 1. cada erro leva a uma saída diferente ---- */
// Fechou a janela: não é erro, não precisa assustar nem oferecer conserto.
let r = recadoDoErroDeLogin({ errorCode: "user_cancelled" });
ok("cancelar não vira erro assustador", /cancelada/i.test(r.texto) && r.destravar === false);
ok("e não mostra código técnico para quem só desistiu", r.codigo === "");

// Pop-up bloqueado: o conserto é no navegador, não no app — destravar não ajuda.
r = recadoDoErroDeLogin({ errorCode: "popup_window_error" });
ok("pop-up bloqueado diz que foi o navegador", /bloqueou a janela/i.test(r.texto));
ok("e ensina onde liberar", /pop-ups para este site/i.test(r.texto));
ok("sem oferecer destravar, que não resolveria isso", r.destravar === false);
r = recadoDoErroDeLogin({ errorCode: "empty_window_error" });
ok("a outra forma de bloqueio cai no mesmo recado", /bloqueou a janela/i.test(r.texto));

// Entrada pela metade: ESTE é o caso invisível, que trava todas as próximas.
r = recadoDoErroDeLogin({ errorCode: "interaction_in_progress" });
ok("entrada pela metade é explicada", /entrada pela metade/i.test(r.texto));
ok("e oferece o botão que destrava", r.destravar === true);

r = recadoDoErroDeLogin({ errorCode: "monitor_window_timeout" });
ok("janela que não respondeu vira recado de conexão", /demorou demais/i.test(r.texto));

/* ---- 2. erro desconhecido mostra o que veio, não some ---- */
r = recadoDoErroDeLogin({ errorCode: "algo_novo", errorMessage: "detalhe cru do MSAL" });
ok("erro desconhecido mostra o detalhe", r.texto.indexOf("detalhe cru do MSAL") >= 0);
ok("e o código, para dar para investigar", r.codigo === "algo_novo");
ok("e oferece destravar, que é o que costuma resolver", r.destravar === true);

// Nunca pode voltar a frase genérica que não dizia nada.
["user_cancelled", "popup_window_error", "interaction_in_progress", "qualquer"].forEach(c => {
  const x = recadoDoErroDeLogin({ errorCode: c });
  ok("'" + c + "' não cai na frase genérica de antes",
     /Tente novamente\.$/.test(x.texto) === false);
});

/* ---- 3. erro em formatos diferentes não quebra ---- */
ok("Error comum é entendido",
   recadoDoErroDeLogin(new Error("interaction_in_progress aqui")).destravar === true);
ok("texto solto não quebra", typeof recadoDoErroDeLogin("deu ruim").texto === "string");
ok("nulo não quebra", typeof recadoDoErroDeLogin(null).texto === "string");
ok("objeto vazio não quebra", typeof recadoDoErroDeLogin({}).texto === "string");

/* ---- 4. o destravador ---- */
const limpa = ex("limparEstadoDeLogin");
ok("limpa as duas lojas do navegador", /\[sessionStorage, localStorage\]/.test(limpa));
ok("mira nas chaves do MSAL e no estado de interação",
   /indexOf\("msal"\) === 0/.test(limpa) && /interaction\.status/.test(limpa));
ok("loja bloqueada não derruba a limpeza", /catch\(e\)\{\}/.test(limpa));
ok("conta o que limpou, para dizer se havia algo", /return n;/.test(limpa));
ok("e diz quando não havia nada travado", /N\u00e3o havia nada travado/.test(src));

/* ---- 5. o botão ---- */
const handler = src.slice(src.indexOf('document.getElementById("loginBtn").addEventListener'));
ok("mostra a causa, não a frase genérica", /mostrarErroDeLogin\(err\)/.test(handler));
ok("trava o botão enquanto tenta, para não abrir duas janelas",
   /btn\.disabled = true/.test(handler));
ok("e destrava mesmo se der erro", /finally\{[\s\S]{0,80}btn\.disabled = false/.test(handler));
ok("o botão de destravar começa escondido", /id="loginResetBtn" hidden/.test(src));
ok("a mensagem dá para selecionar e copiar", /#loginError\{[\s\S]{0,200}user-select:text/.test(src));
ok("e respeita as quebras de linha", /#loginError\{[\s\S]{0,200}white-space:pre-wrap/.test(src));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
