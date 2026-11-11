// Testa a gravação de áudio da reunião.
//
// O QUE NÃO DÁ PARA TESTAR AQUI: gravar de verdade. MediaRecorder e microfone
// só existem no navegador. O que dá para testar é tudo o que decide se a
// gravação se perde ou não: a escolha de formato, a conta do tempo com pausa,
// e — por leitura do código — o caminho de falha, que é onde uma reunião de uma
// hora iria pro ralo se estivesse errado.
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

eval([
  ex("formatarDuracao"), ex("formatoDeAudio"), ex("gravadorSegundos"),
  src.match(/^const AUDIO_FOLDER = .*$/m)[0].replace("const ", "globalThis."),
  "globalThis.formatarDuracao = formatarDuracao;",
  "globalThis.formatoDeAudio = formatoDeAudio;",
  "globalThis.gravadorSegundos = gravadorSegundos;",
].join("\n"));

const casos = [];
const ok = (d, c, extra) => casos.push([d + (c ? "" : (extra ? "  <- " + extra : "")), !!c]);

/* ---- 1. duração: o que a pessoa lê no painel enquanto grava ---- */
ok("começa em 00:00", formatarDuracao(0) === "00:00");
ok("um minuto e cinco", formatarDuracao(65) === "01:05");
ok("meia hora", formatarDuracao(1800) === "30:00");
ok("reunião de uma hora mostra a hora", formatarDuracao(3725) === "1:02:05");
ok("segundo quebrado arredonda, não vira 00:0.5", formatarDuracao(9.6) === "00:10");
ok("negativo não vira lixo na tela", formatarDuracao(-3) === "00:00");

/* ---- 2. formato: cada navegador grava uma coisa ---- */
// Chrome e Edge: Opus no WebM, que é o mais leve.
globalThis.MediaRecorder = { isTypeSupported: (m) => m === "audio/webm;codecs=opus" || m === "audio/webm" };
let f = formatoDeAudio();
ok("no Chrome escolhe Opus, o mais leve", f.mime === "audio/webm;codecs=opus" && f.ext === "webm");

// Safari não faz WebM nenhum; só mp4. Se o código insistisse em WebM, o Mac e o
// iPhone não gravariam nada.
globalThis.MediaRecorder = { isTypeSupported: (m) => m === "audio/mp4" };
f = formatoDeAudio();
ok("no Safari cai para mp4, em vez de falhar", f.mime === "audio/mp4" && f.ext === "m4a");

// Firefox antigo: ogg/opus.
globalThis.MediaRecorder = { isTypeSupported: (m) => m === "audio/ogg;codecs=opus" };
f = formatoDeAudio();
ok("ogg também serve", f.mime === "audio/ogg;codecs=opus" && f.ext === "ogg");

// Navegador que não diz o que aceita: deixa ele escolher, não desiste.
globalThis.MediaRecorder = {};
f = formatoDeAudio();
ok("sem isTypeSupported, grava assim mesmo", f && f.mime === "" && f.ext === "webm");

// Navegador sem MediaRecorder: aí sim não dá, e o código tem de dizer isso.
delete globalThis.MediaRecorder;
ok("sem MediaRecorder, devolve null (a tela avisa)", formatoDeAudio() === null);

/* ---- 3. o relógio com pausa ---- */
// Pausar e não descontar o tempo parado daria uma duração mentirosa no nome do
// arquivo e na coluna.
const agora = Date.now();
globalThis.gravacao = { inicio: agora - 60000, parado: 0, pausado: false };
ok("um minuto corrido conta um minuto", Math.round(gravadorSegundos()) === 60);

globalThis.gravacao = { inicio: agora - 60000, parado: 20000, pausado: false };
ok("vinte segundos pausado não entram na conta", Math.round(gravadorSegundos()) === 40);

// Enquanto está pausado, o relógio congela: a conta usa o instante da pausa.
globalThis.gravacao = { inicio: agora - 60000, pausadoEm: agora - 10000, parado: 0, pausado: true };
ok("pausado agora, o relógio congela", Math.round(gravadorSegundos()) === 50);

globalThis.gravacao = null;
ok("sem gravação, zero", gravadorSegundos() === 0);

/* ---- 4. o que o código garante — a parte que decide se a reunião se perde ---- */
const fin = ex("finalizarGravacao", "async function ");

ok("falha de envio NÃO descarta: oferece baixar o arquivo",
   /catch[\s\S]{0,120}ofereceBaixar/.test(fin) && /a\.download = "audio-/.test(fin));
ok("arquivo grande demais também vira download, não erro seco",
   /blob\.size > AUDIO_MAX_BYTES[\s\S]{0,200}ofereceBaixar/.test(fin));
ok("o painel só some depois que a pessoa resolve o que fazer",
   /ofereceBaixar[\s\S]*?textContent = "Fechar"/.test(fin));
ok("diz em alto e bom som que a gravação não se perdeu",
   /A gravação não se perdeu/.test(fin));
ok("gravação vazia não vira arquivo de zero byte no OneDrive",
   /if \(!blob\.size\)[\s\S]{0,120}Nada foi gravado/.test(fin));
ok("o microfone é solto no fim (senão a luz fica acesa)",
   /soltarMicrofone\(\)/.test(fin) && /getTracks\(\)\.forEach\(t => t\.stop\(\)\)/.test(src));

const ini = ex("iniciarGravacao", "async function ");
ok("pede pedaço a cada segundo, não só no fim", /rec\.start\(1000\)/.test(ini));
ok("microfone negado vira recado, não erro mudo",
   /catch[\s\S]{0,160}permissão do navegador/.test(ini));
ok("não deixa abrir duas gravações ao mesmo tempo",
   /if \(gravacao\)\{[\s\S]{0,120}gravação em andamento/.test(ini));

// O navegador pode aceitar o mime na pergunta e recusar na hora de construir.
// Perder a reuniao por causa do formato seria bobo: tenta de novo sem mime.
ok("se o construtor recusar o formato, grava no que o navegador quiser",
   /catch[\s\S]{0,200}rec = new MediaRecorder\(fluxo\);[\s\S]{0,60}formato\.mime = ""/.test(ini));
ok("e se nem assim der, solta o microfone antes de desistir",
   /catch\s*\(e2\)[\s\S]{0,160}getTracks\(\)\.forEach\(t => t\.stop\(\)\)[\s\S]{0,160}return;/.test(ini));

ok("fechar a aba gravando dispara o aviso do navegador",
   /beforeunload[\s\S]{0,160}if \(!gravacao\) return;[\s\S]{0,120}returnValue/.test(src));
ok("cancelar pergunta antes de jogar fora",
   /Descartar esta gravação\?/.test(ex("cancelarGravacao")));

/* ---- 5. painel fora da tabela ---- */
// A tabela se redesenha a cada letra digitada no filtro. Um gravador dentro da
// célula morreria junto com ela no meio da reunião.
const painel = src.indexOf('<div id="gravadorPainel"');
const app = src.indexOf('<div id="app">');
ok("o painel fica fora do #app, que é redesenhado", painel > 0 && app > painel);
ok("e é fixo na tela", /#gravadorPainel\{[^}]*position:fixed/.test(src));

/* ---- 6. ligação com o resto do app ---- */
ok("a coluna existe na tabela", /\{ key: "audio", label: "Áudio" \}/.test(src));
ok("a célula é construída pelo registro de colunas", /audio: \(task\) => buildAudioCell\(task\)/.test(src));
ok("gravar e remover pedem senha pela ação 'audio'",
   (src.match(/guardTaskFieldEdit\(task, "audio"\)/g) || []).length === 2);
ok("a ação aparece na lista de senhas do administrador",
   /\{ key: "audio",\s+label: "Gravar e remover áudio" \}/.test(src));
ok("vai para a pasta Audios", AUDIO_FOLDER === "Audios");
ok("a pasta é criada só se não existir, e tolera corrida entre abas",
   /conflictBehavior": "fail"[\s\S]{0,200}res = await graphFetch\(caminho\)/.test(ex("ensureAudioFolder", "async function ")));
ok("o nome do arquivo leva o id da tarefa, para não atropelar outra",
   /const nome = g\.task\.id \+ "_"/.test(fin));
ok("tirar o áudio avisa que o arquivo continua no OneDrive",
   /continua na pasta " \+\s*\n?\s*AUDIO_FOLDER/.test(src) || /continua na pasta " \+[\s\S]{0,40}AUDIO_FOLDER/.test(src));
// Erro real de producao: /content responde com redirecionamento para outro
// servidor, o cabecalho de autorizacao nao sobrevive ao salto, o navegador barra
// por CORS e o usuario ve "Failed to fetch". O caminho bom e o endereco de
// download do proprio item, que ja vem autenticado.
const toca = ex("enderecoDoAudio", "async function ");
const cel = ex("buildAudioCell");
ok("NAO busca o /content, que quebra por CORS no redirecionamento",
   /\$\{a\.id\}\/content/.test(src) === false);
ok("pede o item e usa o endereco de download ja autenticado",
   /graphFetch\(`\$\{itemsBase\(\)\}\/\$\{a\.id\}`/.test(toca) &&
   /item\["@microsoft\.graph\.downloadUrl"\]/.test(toca));
ok("sem endereco de download, avisa em vez de tocar nada",
   /devolveu endere\u00e7o de download/.test(toca));
ok("toca enquanto baixa, sem segurar a reuniao inteira na memoria",
   /som\.src = await enderecoDoAudio\(a\)/.test(cel) && /createObjectURL/.test(cel) === false);
ok("nao reaproveita endereco velho: pede sem cache", /cache: "no-store"/.test(toca));

/* ---- 4b. o controle proprio: dizer se esta tocando ---- */
// O <audio controls> do navegador, na largura de uma coluna, vira um botao
// redondo gigante sem tempo e sem barra: nao da para saber se esta tocando.
ok("nao usa o player nativo, que some na largura da coluna",
   /controls = true/.test(cel) === false);
ok("o botao vira pausa enquanto toca", /play\.textContent = tocando \? "\u23f8" : "\u25b6"/.test(cel));
ok("e fica destacado, para ler de longe", /classList\.toggle\("tocando", tocando\)/.test(cel));
ok("tocando mostra onde esta; parado, o tamanho da gravacao",
   /formatarDuracao\(t\) \+ " \/ " \+ formatarDuracao\(fim\)/.test(cel));
ok("tem barra de progresso", /class[NL]ame = "task-audio-prog"/.test(cel) || /task-audio-prog/.test(cel));
ok("da para clicar na barra e pular para um ponto",
   /barra\.addEventListener\("click"[\s\S]{0,260}som\.currentTime =/.test(cel));
ok("clique na barra sem audio carregado nao quebra",
   /if \(!som \|\| !isFinite\(som\.duration\)/.test(cel));
ok("o segundo clique pausa, nao baixa de novo",
   /if \(som\)\{[\s\S]{0,140}if \(som\.paused\) som\.play[\s\S]{0,40}else som\.pause/.test(cel));
ok("falha ao tocar devolve o botao, nao deixa no reticencias",
   (cel.match(/play\.disabled = false;/g) || []).length >= 3);
ok("ao terminar, volta ao inicio", /"ended"[\s\S]{0,60}currentTime = 0/.test(cel));
/* ---- 4c. baixar ---- */
// O endereco do OneDrive abria uma pagina do SharePoint com um tocador e nenhum
// jeito obvio de baixar. O botao agora baixa de verdade.
const baixa = ex("baixarAudio", "async function ");
ok("o botao baixa, nao abre o SharePoint",
   /class[NL]ame = "task-audio-link"/.test(cel) && /baixarAudio\(task, a, baixar\)/.test(cel) &&
   /abrir\.href = a\.url/.test(cel) === false);
// <a download> e ignorado quando o arquivo vem de outro dominio: o navegador
// abriria a pagina em vez de baixar. Por isso busca os bytes antes.
ok("busca os bytes e cria endereco local, senao o download seria ignorado",
   /createObjectURL\(blob\)/.test(baixa) && /link\.download =/.test(baixa));
ok("baixa com nome legivel, nao com o codigo interno",
   /safeFileName\(task\.title \|\| "audio"\) \+ ext/.test(baixa));
ok("mantem a extensao do arquivo gravado",
   /match\(\/\\.\[a-z0-9\]\+\$\/i\)/.test(baixa));
ok("solta a memoria depois", /revokeObjectURL/.test(baixa));
ok("erro ao baixar aparece, e o botao volta ao normal",
   /avisar\("N\u00e3o consegui baixar/.test(baixa) && /finally\{[\s\S]{0,80}botao\.textContent = rotulo/.test(baixa));
ok("quem é só leitor vê a coluna mas não grava",
   /if \(!canEdit\)[\s\S]{0,200}task-attach-empty/.test(ex("buildAudioCell")));

let n = 0;
console.log("");
for (const [d, c] of casos) { if (c) n++; console.log((c ? "ok    " : "FALHA ") + d); }
console.log("\n" + n + "/" + casos.length + " ok");
process.exit(n === casos.length ? 0 : 1);
