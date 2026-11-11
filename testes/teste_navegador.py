# -*- coding: utf-8 -*-
u"""Teste no NAVEGADOR DE VERDADE, com DOM e CSS reais.

Ate aqui todos os testes rodavam em Node, sobre funcoes extraidas do arquivo:
pegam logica, nao pegam nada que dependa de desenhar a tela. Foi assim que um
travamento ao abrir o resumo passou batido por 17 suites.

Este monta o app inteiro com login e OneDrive falsos, 158 atividades e o resumo
real, abre no Chrome sem janela e mede. Precisa do Chrome instalado; sem ele,
avisa e nao reprova.
"""
import io, os, re, subprocess, sys

SP = os.path.dirname(os.path.abspath(__file__))
GER = os.path.join(SP, "monta_app_falso.py")
PAGINA = (r"C:\Users\natan_cou1nrv\AppData\Local\Temp\claude\b13740ca9bf043d4"
          r"\c662cd08-823e-4de7-b1c7-776ad51d5434\scratchpad\app_falso.html")

CHROMES = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
           r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
           r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"]
nav = next((c for c in CHROMES if os.path.exists(c)), None)
if not nav:
    print("Chrome/Edge nao encontrado - teste de navegador pulado")
    sys.exit(0)

def rodar(binario=False):
    env = dict(os.environ)
    if binario:
        env["BINARIO"] = "1"
    else:
        env.pop("BINARIO", None)
    subprocess.run([sys.executable, GER], check=True, capture_output=True, env=env)
    out = subprocess.run(
        [nav, "--headless=new", "--disable-gpu", "--virtual-time-budget=120000",
         "--dump-dom", "file:///" + PAGINA.replace("\\", "/")],
        capture_output=True, timeout=300).stdout.decode("utf-8", "replace")
    t = (re.search(r"<title>(.*?)</title>", out, re.S) or [None, ""])[1]
    e = (re.search(r'id="bootErroMsg"[^>]*>([^<]*)', out) or [None, ""])[1]
    return t, e

titulo, erro = rodar(False)

casos = []
def ok(d, c, extra=""):
    casos.append((d + ("" if c or not extra else "  <- " + extra), bool(c)))

ok("o app carrega sem estourar na entrada", not erro.strip(), erro.strip())
ok("a tabela desenha as atividades", "linhas=16" in titulo or "linhas=15" in titulo, titulo)
ok("a janela do resumo abre", "aberto=true" in titulo, titulo)

m = re.search(r"clique no resumo: (\d+) ms", titulo)
ok("e abre em menos de 3 segundos", m and int(m.group(1)) < 3000, titulo)
if m:
    print("tempo medido para abrir o resumo: " + m.group(1) + " ms")

# ---- regressao: 1,4 MB de binario (o .webm do audio importado por engano)
# Antes do conserto isto levava 8951 ms e o navegador declarava a pagina sem
# resposta. O limite de desenho tem de manter isso rapido.
tb, eb = rodar(True)
mb = re.search(r"clique no resumo: (\d+) ms", tb)
ok("com 1,4 MB de lixo salvo, a janela ainda abre", "aberto=true" in tb, tb)
ok("e abre rapido, sem travar a pagina", mb and int(mb.group(1)) < 3000, tb)
if mb:
    print("tempo com 1,4 MB de binario salvo: " + mb.group(1) + " ms")

n = sum(1 for _, c in casos if c)
print("")
for d, c in casos:
    print(("ok    " if c else "FALHA ") + d)
print("\n%d/%d ok" % (n, len(casos)))
sys.exit(0 if n == len(casos) else 1)
