# -*- coding: utf-8 -*-
u"""Roda o ROADMAP INTEIRO no Chrome, com MSAL e OneDrive falsos.

POR QUE: ate agora so dava para testar pedacos em Node, porque o app exige
login real. Isto injeta um login de mentira e respostas de Graph de mentira
ANTES do script do app, com 158 atividades — uma delas com o resumo de verdade.
Assim da para medir o que trava no navegador, com DOM e CSS reais.
"""
import io, json, sys

import os as _os
RAIZ = _os.environ.get("ALVO_HTML") or (r"C:\Users\natan_cou1nrv\OneDrive\Documentos\claude\notas-pessoais\index.html")
RESUMO = r"C:\Users\natan_cou1nrv\OneDrive\Documentos\claude\transcricoes\2026-11-04_planejamento-natal.md"
SAIDA = (r"C:\Users\natan_cou1nrv\AppData\Local\Temp\claude\b13740ca9bf043d4"
         r"\c662cd08-823e-4de7-b1c7-776ad51d5434\scratchpad\app_falso.html")

s = io.open(RAIZ, encoding="utf-8").read()
resumo = io.open(RESUMO, encoding="utf-8").read()
import os as _os
if _os.environ.get("BINARIO"):
    import random as _r
    _r.seed(7)
    resumo = u"".join(unichr(_r.randint(1, 255)) if False else chr(_r.randint(32, 255))
                      for _ in range(1400000))


# ---- 158 atividades, parecidas com as de verdade
tasks = []
for i in range(158):
    n = 159 - i
    t = {
        "id": "t%d" % n,
        "items": n,
        "title": "Atividade de teste numero %d com um titulo razoavelmente longo" % n,
        "status": ["Pendente", "Iniciado", "Concluído"][i % 3],
        "priority": "Média",
        "dueDate": "2026-11-%02d" % ((i % 28) + 1),
        "company": ["Sinergia", "Metropolitana", "Novatec", "Qdelícia"][i % 4],
        "assignee": "Natanael",
        "createdAt": "2026-10-01T10:00:00.000Z",
    }
    if n == 158:
        t["resumo"] = resumo
        t["audio"] = {"id": "a1", "nome": "t158_2026-11-04_02-56.webm",
                      "url": "https://exemplo/x", "segundos": 176, "tamanho": 1400000}
    tasks.append(t)

pagina = {"tasks": tasks, "blocks": [], "events": []}
indice = {"pages": [
    {"id": "p1", "parentId": None, "title": "ROADMAP", "order": 1, "kind": "tarefas"},
    {"id": "p2", "parentId": None, "title": "Calendario", "order": 2, "kind": "calendario"},
    {"id": "p3", "parentId": None, "title": "MILLENA", "order": 3, "kind": "tarefas"},
]}
usuarios = {"usuarios": [{"email": "natanael.silva@sinerggia.com.br", "papel": "Editor", "nome": "Natanael"}]}

stub = u"""
<script>
/* ---- login e OneDrive de mentira, instalados ANTES do script do app ---- */
window.__marcos = [];
function marco(nome){ window.__marcos.push([nome, Math.round(performance.now())]); }
marco("inicio");

var PAGINA = %s, INDICE = %s, USUARIOS = %s;

window.msal = {
  PublicClientApplication: function(){
    this.initialize = async function(){};
    this.getAllAccounts = function(){ return [{ username: "natanael.silva@sinerggia.com.br" }]; };
    this.getActiveAccount = function(){ return { username: "natanael.silva@sinerggia.com.br" }; };
    this.setActiveAccount = function(){};
    this.acquireTokenSilent = async function(){ return { accessToken: "x" }; };
    this.loginPopup = async function(){ return { account: { username: "natanael.silva@sinerggia.com.br" } }; };
  }
};

function resp(obj, status){
  return Promise.resolve({
    ok: (status || 200) < 400, status: status || 200,
    json: async function(){ return obj; },
    text: async function(){ return JSON.stringify(obj); },
    blob: async function(){ return new Blob([JSON.stringify(obj)]); }
  });
}
window.fetch = function(url){
  url = String(url);
  if (url.indexOf("_indice.json") >= 0) return resp(INDICE);
  if (url.indexOf("usuarios.json") >= 0 || url.indexOf("_usuarios") >= 0) return resp(USUARIOS);
  if (url.indexOf("pagina_") >= 0) return resp(PAGINA);
  if (url.indexOf("sharedWithMe") >= 0) return resp({ value: [] });
  if (url.indexOf("/children") >= 0) return resp({ value: [] });
  // Tempo de mentira, para o painel do topo aparecer completo na medicao.
  if (url.indexOf("wttr") >= 0 || url.indexOf("open-meteo") >= 0)
    return resp({ current: { temperature_2m: 28, weather_code: 3 } });
  return resp({ id: "folder1", name: "Notas Pessoais - Dados" });
};
</script>
""" % (json.dumps(pagina, ensure_ascii=False), json.dumps(indice, ensure_ascii=False),
       json.dumps(usuarios, ensure_ascii=False))

# injeta logo antes do script principal do app
alvo = u"<script>\n/* =========================================================================="
i = s.find(alvo)
if i < 0:
    # alternativa: antes do ultimo <script>
    i = s.rindex(u"<script>")
s = s[:i] + stub + s[i:]

# medidor no fim
medidor = u"""
<script>
(async function(){
  function esperar(ms){ return new Promise(r => setTimeout(r, ms)); }
  var t0 = performance.now();
  currentUserEmail = "natanael.silva@sinerggia.com.br";
  try{ await afterLogin(); }catch(e){ window.__erro = String(e && e.message || e); }
  marco("afterLogin");
  await esperar(300);
  var linhas = document.querySelectorAll("#taskTableBody tr, table tbody tr").length;
  marco("linhas=" + linhas);

  // clicar no botao de resumo da atividade 158
  var alvo = null;
  document.querySelectorAll(".task-resumo-btn").forEach(function(b){
    if (!alvo && b.textContent.trim() && b.textContent.trim() !== "+") alvo = b;
  });
  if (!alvo){
    document.title = "SEM BOTAO | linhas=" + linhas +
      " | tds=" + document.querySelectorAll("td").length +
      " | app=" + document.getElementById("app").className +
      " | boot=" + document.getElementById("bootScreen").className +
      " | status=" + (document.getElementById("statusText")||{}).textContent +
      " | marcos=" + JSON.stringify(window.__marcos) +
      (window.__erro ? " | ERRO=" + window.__erro : "");
    return;
  }

  if (location.search.indexOf('semclique') >= 0){ document.title = 'pronto'; return; }
  var t1 = performance.now();
  alvo.click();
  await esperar(50);
  var ms = Math.round(performance.now() - t1);
  var vis = document.getElementById("resumoOverlay").classList.contains("visible");
  window.__res = "clique no resumo: " + ms + " ms | aberto=" + vis +
                 " | marcos=" + JSON.stringify(window.__marcos) +
                 (window.__erro ? " | ERRO=" + window.__erro : "");
  document.title = window.__res;
})();
</script>
"""
s = s.replace(u"</body>", medidor + u"</body>", 1)

io.open(SAIDA, "w", encoding="utf-8", newline="").write(s)
print("gerado: " + SAIDA)
