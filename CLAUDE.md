# ROADMAP — Sinerggia

Espaço de notas e atividades compartilhado da Sinerggia. **Página única**: todo
o app vive em `index.html` — CSS, HTML e JavaScript no mesmo arquivo, sem etapa
de build, sem dependências instaladas.

No ar: https://sinerggia-dev.github.io/roadmap/

A interface, os comentários e as mensagens de commit são **em português**.

---

## A restrição que manda em tudo: não roda local

O login usa MSAL, e o `redirectUri` é montado a partir do endereço real da
página (`origin + pathname`). `file://` não serve, e um servidor local também
não — o endereço precisa estar cadastrado no registro do aplicativo.

**Consequência prática:** não dá para abrir o `index.html` e conferir no
navegador. O ciclo é:

```
editar → git push → esperar o GitHub Pages (1-2 min) → Ctrl+F5 no site
```

Para confirmar que o que está no ar é o que você escreveu:

```bash
curl -s "https://sinerggia-dev.github.io/roadmap/index.html?cb=1" | diff - index.html
```

Por isso: **rode os testes antes de publicar**. Publicar para descobrir se
funciona custa minutos e queima a paciência de quem está usando o app.

---

## Testes

```bash
node testes/rodar.js          # 632 verificações, 20 suítes, só precisa de Node
python testes/teste_navegador.py   # app real num Chrome sem janela
```

As suítes **extraem funções de dentro do `index.html`** e as rodam no Node com
DOM e `localStorage` falsos.

**O que elas não pegam: nada que dependa de desenhar a tela.** Um travamento ao
abrir o resumo passou por todas elas — a lógica levava 130 ms, o navegador
levava 9 segundos para desenhar o resultado. O `teste_navegador.py` nasceu
disso. Veja `testes/README.md`.

Ao consertar um defeito, **prove que o teste pega**: desfaça o conserto, veja a
suíte reprovar, refaça. Teste que nunca falhou não protege nada.

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
`OWNER_FOLDER_ID`, `OWNER_EMAIL`.

---

## Armadilhas já pagas — não caia de novo

**`/content` do Graph quebra por CORS.** `GET .../items/{id}/content` responde
com redirecionamento para outro servidor, e o cabeçalho de autorização não
sobrevive ao salto: o erro chega como `Failed to fetch`. Peça o item e use
`@microsoft.graph.downloadUrl`, que já vem autenticado.

**Regra de autor vence `[hidden]`.** `.algo{display:flex}` escrito por nós tem
mais peso que o `[hidden]{display:none}` do navegador — o elemento não some. Já
quebrou o menu do celular e os botões da barra. Use `[hidden]{display:none
!important}` no seletor específico.

**`<a download>` é ignorado entre domínios.** Para baixar com o nome certo,
busque os bytes e crie um endereço local.

**Nunca desenhe megabytes de HTML.** Um arquivo binário importado como texto
levou a janela a 9 segundos e à mensagem "página não está respondendo". Valide
o que entra e limite o que é desenhado.

**`confirm()` é síncrono; `perguntar()` devolve Promise.** Sem `await`,
`!perguntar(...)` é sempre falso — e a ação destrutiva acontece sem perguntar.
O `teste_dialogo` cobra o `await` em toda chamada.

**Constante que lê outra declarada abaixo derruba o app inteiro** (tela
branca). O `teste_carga` varre isso.

**Erro engolido vira tela preta.** Já aconteceu três vezes: entrada que falhava
sem dizer por quê, carregamento sem sinal nenhum, resumo que não abria. Toda
falha precisa aparecer escrita, com saída — e, quando couber, com o número
medido.

---

## Senhas por ação

`ACOES_COM_SENHA` lista o que pede senha (excluir, mover colunas, gravar áudio,
importar resumo…). O administrador liga e desliga cada uma em **Administração**.
Toda ação sensível nova entra nessa lista, com chave própria.

A senha de fábrica é `123456`, usada enquanto nenhuma foi definida.

---

## Estilo de código

Comentário explica **por quê**, não o quê. Quando uma escolha tem um motivo não
óbvio — uma ordem que importa, um caminho que parece melhor e não é, um defeito
que já aconteceu —, registre o motivo junto do código.

O mesmo vale para a mensagem de commit: diga o que o defeito causava, não só o
que mudou.
