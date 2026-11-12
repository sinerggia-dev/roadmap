# Visão de celular

Tudo abaixo vive no bloco `@media (max-width: 768px)` do `index.html`.

A barra lateral vira painel deslizante (botão ☰, fixo em `top:12px`, 38 px).

---

## Cartões no lugar da tabela

A tabela tem 16 colunas. Num telefone de 390 px cabem três, e as três primeiras
eram ITENS, EMPRESA e RESPONSÁVEL — **o nome da tarefa ficava fora da tela**.
Para saber do que era cada atividade, era preciso rolar de lado, linha por
linha.

A solução não foi desenhar um cartão do zero. Isso duplicaria a lógica de cada
célula, e com o tempo as duas versões divergiriam: o conserto numa não chegaria
na outra. Em vez disso, **são as mesmas células, empilhadas**:

- `renderTaskRow` grava `data-col` e `data-rotulo` em cada `<td>`;
- o CSS do celular transforma a tabela em blocos e cada célula numa linha de
  "rótulo: valor", com `td::before{content:attr(data-rotulo)}`;
- a tarefa vira o título do cartão, sem rótulo;
- o vencimento vira a borda esquerda colorida.

Fechado, o cartão mostra tarefa, empresa, responsável, vencimento e status. O
resto abre no botão ▾. Dezesseis linhas por atividade seria pior que a rolagem
lateral que isto veio corrigir.

Uma coluna nova entra nesse formato sozinha, desde que use o
`TASK_CELL_BUILDERS`.

---

## Filtros recolhidos

Abertos, eram quase 780 px de controles antes da primeira atividade — mais de
uma tela inteira. Hoje ficam atrás do botão **⚙ Filtros**.

Esconder filtro tem um risco que este app já pagou: **filtro ligado e invisível
faz faltarem linhas sem explicação**. Por isso o botão mostra um contador de
quantos estão ativos (`contarFiltrosAtivos`), atualizado a cada redesenho da
tabela. Um filtro novo precisa entrar nessa contagem.

---

## iPhone e Android

- **Zoom automático:** o Safari amplia a página ao focar um campo com fonte
  menor que 16 px, e ela fica torta. Todo campo do celular está em 16 px. A
  regra geral `input, select, textarea, button{font-size:16px}` **não basta**:
  seletores de id a vencem, então o tamanho precisa estar repetido no bloco dos
  filtros. Isso já passou batido uma vez.
- **Entalhe e barra de gestos:** `viewport-fit=cover` no viewport e
  `env(safe-area-inset-*)` no corpo.
- `-webkit-text-size-adjust:100%`, senão o sistema reescala o texto sozinho.
- `<meta name="theme-color">` para a barra do navegador acompanhar o tema.

---

## Alinhamento do painel do topo

O painel (nome, tempo, local, hora) divide a linha com o botão ☰. A conta:

```
botão:     top 12px, altura 38px   →  ocupa 12 a 50
#pageView: recuo de 56px no topo
painel:    margem -44px (56 - 12)  →  ocupa 12 a 50
```

Três números em regras diferentes. Mudar um desalinha em silêncio, e só se
descobre olhando a tela. O `testes/teste_celular.js` **refaz a conta** em vez de
fixar o −44.

---

## Como medir de verdade

Chrome sem janela não respeita `--window-size` para o viewport (pedindo 390 px,
`innerWidth` sai 504). A medição confiável usa uma moldura: uma página com um
`<iframe>` de 390 px exatos apontando para o app, e `--allow-file-access-from-files`
para conseguir ler o conteúdo do iframe.

Com isso dá para listar todo elemento cujo `getBoundingClientRect().right`
ultrapassa a largura, e descobrir quem está vazando — em vez de olhar uma
captura cortada e adivinhar. Foi assim que apareceram os dois ladrões de
largura descritos em `armadilhas.md` (item 8).
