# -*- coding: utf-8 -*-
u"""Gera o mapa do codigo a partir do index.html.

POR QUE EXISTE: o index.html tem ~9.800 linhas e cerca de 124 mil tokens.
Mandar o arquivo inteiro para uma conversa ocupa quase todo o espaco e sobra
pouco para trabalhar. O mapa lista ONDE esta cada coisa — funcoes, constantes,
secoes de CSS, elementos de tela — em poucas centenas de linhas.

POR QUE E UM SCRIPT, e nao um texto escrito a mao: mapa escrito a mao envelhece
em silencio. Depois de algumas mudancas ele aponta para linhas que nao existem
mais, e quem confia nele erra. Gerado, basta rodar de novo.

    python testes/gerar_mapa.py

Escreve .claude/skills/roadmap-sinerggia/references/mapa-do-codigo.md
"""
import io
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
ALVO = os.environ.get("ALVO_HTML") or os.path.join(RAIZ, "index.html")
SAIDA = os.path.join(RAIZ, ".claude", "skills", "roadmap-sinerggia",
                     "references", "mapa-do-codigo.md")

s = io.open(ALVO, encoding="utf-8").read()
linhas = s.split("\n")

# ---------------------------------------------------------------- secoes
# Os cabecalhos de bloco do arquivo, do tipo:
#   /* ======= NOME ======= */   ou   /* ---------- Nome ---------- */
secoes = []
for i, l in enumerate(linhas):
    m = re.match(r"\s*/\*\s*=+\s*$", l)
    if m and i + 1 < len(linhas):
        titulo = linhas[i + 1].strip()
        if titulo and not titulo.startswith("="):
            secoes.append((i + 1, titulo))
        continue
    m = re.match(r"\s*/\*\s*-{4,}\s*(.+?)\s*-{4,}", l)
    if m:
        secoes.append((i + 1, m.group(1).strip()))


def secao_de(linha):
    atual = ""
    for n, t in secoes:
        if n <= linha:
            atual = t
        else:
            break
    return atual


# ---------------------------------------------------------------- funcoes
funcoes = []
for i, l in enumerate(linhas):
    m = re.match(r"(async )?function ([A-Za-z_$][\w$]*)\s*\(([^)]*)\)", l)
    if m:
        funcoes.append((i + 1, ("async " if m.group(1) else "") + m.group(2),
                        m.group(3).strip(), secao_de(i + 1)))

# ---------------------------------------------------------------- constantes
constantes = []
for i, l in enumerate(linhas):
    m = re.match(r"(?:const|let) ([A-Z][A-Z0-9_]{2,})\s*=\s*(.{0,60})", l)
    if m:
        constantes.append((i + 1, m.group(1), m.group(2).rstrip()))

# ---------------------------------------------------------------- CSS
blocos_css = []
fim_css = s.index("</style>")
for i, l in enumerate(linhas):
    if sum(len(x) + 1 for x in linhas[:i]) > fim_css:
        break
    m = re.match(r"\s{2}([#.][A-Za-z][\w.#:\-\[\]=\"' >,]*)\{", l)
    if m:
        blocos_css.append((i + 1, m.group(1)))
    m = re.match(r"\s*@media ([^{]+)\{", l)
    if m:
        blocos_css.append((i + 1, "@media " + m.group(1).strip()))

# ---------------------------------------------------------------- ids do HTML
ids = []
corpo_ini = s.index("<body>")
for i, l in enumerate(linhas):
    pos = sum(len(x) + 1 for x in linhas[:i])
    if pos < corpo_ini:
        continue
    if pos > s.rindex("<script>"):
        break
    for m in re.finditer(r'id="([A-Za-z][\w-]*)"', l):
        ids.append((i + 1, m.group(1)))


def tabela(itens, cab):
    out = ["| " + " | ".join(cab) + " |",
           "|" + "|".join(["---"] * len(cab)) + "|"]
    for it in itens:
        out.append("| " + " | ".join(str(x) for x in it) + " |")
    return "\n".join(out)


partes = []
partes.append(u"""# Mapa do código

**Gerado por `testes/gerar_mapa.py`. Não edite à mão** — rode o script de novo
depois de mexer no `index.html`, senão ele aponta para linhas que já mudaram.

O `index.html` tem %d linhas (~%d mil tokens). Mandar o arquivo inteiro numa
conversa ocupa quase todo o espaço disponível. Este mapa diz **onde** está cada
coisa; leia só o trecho de que precisar.

- CSS: linhas 1 a %d
- HTML do corpo: até ~%d
- JavaScript: %d a %d

Resumo: **%d funções**, **%d constantes**, **%d blocos de CSS**, **%d elementos
com id**.
""" % (len(linhas), round(len(s) / 3.5 / 1000),
       s[:fim_css].count("\n") + 1,
       s[:s.rindex("<script>")].count("\n") + 1,
       s[:s.rindex("<script>")].count("\n") + 2, len(linhas),
       len(funcoes), len(constantes), len(blocos_css), len(ids)))

partes.append(u"\n## Seções do arquivo\n")
partes.append(tabela([(n, t) for n, t in secoes], ["Linha", "Seção"]))

partes.append(u"\n\n## Constantes\n")
partes.append(tabela([(n, "`%s`" % k, "`%s`" % v.replace("|", "\\|"))
                      for n, k, v in constantes], ["Linha", "Nome", "Valor"]))

partes.append(u"\n\n## Funções\n")
atual = None
corpo = []
for n, nome, args, sec in funcoes:
    if sec != atual:
        if corpo:
            partes.append(tabela(corpo, ["Linha", "Função", "Parâmetros"]))
            partes.append("\n")
        atual = sec
        partes.append(u"\n### %s\n\n" % (sec or "(sem seção)"))
        corpo = []
    corpo.append((n, "`%s`" % nome, "`%s`" % args if args else ""))
if corpo:
    partes.append(tabela(corpo, ["Linha", "Função", "Parâmetros"]))

partes.append(u"\n\n## Blocos de CSS\n")
partes.append(tabela([(n, "`%s`" % sel.replace("|", "\\|"))
                      for n, sel in blocos_css], ["Linha", "Seletor"]))

partes.append(u"\n\n## Elementos com id\n")
partes.append(tabela([(n, "`#%s`" % i) for n, i in ids], ["Linha", "id"]))

io.open(SAIDA, "w", encoding="utf-8", newline="").write(u"".join(partes) + u"\n")
print("mapa gerado: %s" % SAIDA)
print("  %d funcoes, %d constantes, %d blocos de CSS, %d ids"
      % (len(funcoes), len(constantes), len(blocos_css), len(ids)))
