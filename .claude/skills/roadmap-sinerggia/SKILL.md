---
name: roadmap-sinerggia
description: Contexto completo do app ROADMAP da Sinerggia, repositorio sinerggia-dev/roadmap, publicado em sinerggia-dev.github.io/roadmap — uma página única em index.html com atividades, notas, calendário, dashboard e apresentação, cujos dados ficam no OneDrive via Microsoft Graph. Use esta skill sempre que a conversa tocar no ROADMAP, no app de atividades da Sinerggia, no antigo notas-pessoais, ou em qualquer parte dele — colunas da tabela (Tarefa, Empresa, Responsável, Vencimento, Nota, Anexo, Documento, Áudio, Resumo), senhas por ação, importar resumos, gravação de áudio, backup, temas e aparência, visão de celular, alertas de vencimento ou os testes em testes/. Use também quando o pedido for corrigir um defeito, acrescentar uma função ou revisar algo nesse app, mesmo que o nome ROADMAP não seja dito, bastando o contexto ser esse projeto.
---

# ROADMAP — Sinerggia

App de atividades e notas compartilhado da Sinerggia. **Página única**: todo o
app vive em `index.html` — CSS, HTML e JavaScript no mesmo arquivo, sem etapa de
build e sem dependências instaladas. Cerca de 8.000 linhas.

- Repositório: `sinerggia-dev/roadmap` (era `notas-pessoais`; renomeado)
- No ar: https://sinerggia-dev.github.io/roadmap/
- Dono e administrador: natanael.silva@sinerggia.com.br

Interface, comentários e mensagens de commit **em português**.

---

## A restrição que manda em tudo: o app não roda local

O login usa MSAL, e o `redirectUri` é montado a partir do endereço real da
página (`origin + pathname`). `file://` não serve, e um servidor local também
não — o endereço precisa estar cadastrado no registro do aplicativo no Azure.

Na prática: **não existe "abrir o index.html e testar"**. O ciclo é

```
editar → git push → esperar o GitHub Pages (1-2 min) → o usuário recarrega
```

Isso muda como trabalhar. Publicar para descobrir se funciona custa minutos e
queima a paciência de quem está usando o app. Então:

1. Rode os testes **antes** do push, não depois.
2. Quando a mudança envolver desenho de tela, use o teste de navegador — os
   testes em Node não enxergam nada visual.
3. Diga ao usuário, sem rodeios, o que você **não** conseguiu verificar. Ele é
   quem abre o site e confirma; essa informação é o que permite a ele saber
   onde olhar.

Para conferir que o que está no ar é o que você escreveu:

```bash
curl -s "https://sinerggia-dev.github.io/roadmap/index.html?cb=1" | diff - index.html
```

---

## Testes

```bash
node testes/rodar.js              # 700 verificações em 21 suítes, só precisa de Node
python testes/teste_navegador.py  # o app real num Chrome sem janela
```

As suítes extraem funções de dentro do `index.html` e as rodam no Node com DOM e
`localStorage` falsos.

**O que elas não pegam: nada que dependa de desenhar a tela.** Um travamento de
9 segundos ao abrir o resumo passou por todas elas — a lógica levava 130 ms, o
navegador levava 9 segundos para desenhar o resultado. O `teste_navegador.py`
nasceu disso.

Ao consertar um defeito, **prove que o teste pega**: desfaça o conserto, veja a
suíte reprovar, refaça. Teste que nunca falhou não protege nada — e aqui, onde
não dá para abrir o app e olhar, o teste é a única evidência que existe.

Quando uma suíte falhar porque o comportamento mudou **de propósito**, atualize
a verificação; mas confira antes se ela não está apontando um defeito real.
Detalhes em `testes/README.md`.

---

## Onde ficam os dados

Nada é guardado no repositório. Tudo vive no OneDrive do dono, lido e gravado
pelo Microsoft Graph:

```
"Notas Pessoais - Dados"/     ← o nome é histórico; não vale o risco de mudar
├── _indice.json              ← lista de páginas
├── _usuarios.json            ← acessos, papéis e senhas de ação
├── pagina_<id>.json          ← uma por página (atividades, blocos, eventos)
├── Anexos/  Documentos/  Audios/
```

Constantes no topo do script: `FOLDER_NAME`, `OWNER_DRIVE_ID`,
`OWNER_FOLDER_ID`, `OWNER_EMAIL`, `INDEX_FILENAME`, `USERS_FILENAME`.

---

## Antes de mexer, leia a armadilha certa

Este projeto já pagou caro por um punhado de erros, e eles se repetem porque o
caminho errado é sempre o mais óbvio. **Leia `references/armadilhas.md` antes
de tocar em qualquer coisa** — são poucas páginas e cada item vem com o sintoma
que ele causou.

Os quatro que mais voltam:

- **Erro engolido vira tela preta.** Aconteceu três vezes. Toda falha precisa
  aparecer escrita, com saída, e de preferência com o número medido.
- **`/content` do Microsoft Graph quebra por CORS.** Use o
  `@microsoft.graph.downloadUrl`.
- **Regra de autor vence `[hidden]`.** O elemento não some.
- **`confirm()` é síncrono; `perguntar()` devolve Promise.** Sem `await`, a
  ação destrutiva acontece sem perguntar.

## Outras referências

- `references/arquitetura.md` — como o app é organizado por dentro, o que são
  as páginas, como uma coluna nova é acrescentada, onde ficam os registros de
  colunas, ações com senha e temas.
- `references/funcoes.md` — o que já existe e as decisões por trás (por que o
  gravador fica fora da tabela, por que reordenar renumera o nível inteiro, por
  que a intensidade do fundo mede contraste).
- `references/celular.md` — a visão de telefone: cartões no lugar da tabela,
  filtros recolhidos, o zoom do iPhone, como medir a largura de verdade.

---

## Estilo

Comentário explica **por quê**, não o quê. Quando uma escolha tem um motivo não
óbvio — uma ordem que importa, um caminho que parece melhor e não é, um defeito
que já aconteceu —, registre o motivo junto do código. É isso que impede o
próximo a passar por ali de "simplificar" de volta para o erro.

O mesmo vale para a mensagem de commit: diga o que o defeito causava, não só o
que mudou.

Ações sensíveis novas entram em `ACOES_COM_SENHA`, com chave própria, para o
administrador poder ligar e desligar cada uma.
