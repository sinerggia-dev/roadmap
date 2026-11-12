# Armadilhas já pagas

Cada item aqui custou tempo real e apareceu ao usuário como defeito. Estão
registrados porque o caminho errado é, em todos eles, o mais óbvio — quem chega
sem saber repete.

---

## 1. Erro engolido vira tela preta

Aconteceu **três vezes** neste app.

- O `afterLogin` escondia a tela de login e só mostrava o `#app` depois de
  resolver a pasta no OneDrive. No meio, nada era desenhado. E o "Carregando…"
  era escrito no `#statusText`, que mora **dentro** do `#app` — escondido
  justamente durante a espera. Pior: exceção ali subia sem tratamento e a tela
  ficava preta para sempre.
- O botão de entrar trocava qualquer erro por "Não foi possível entrar. Tente
  novamente." Pop-up bloqueado, janela fechada e entrada pela metade têm saídas
  diferentes — e a última trava todas as tentativas seguintes.
- A janela do resumo abria e montava o texto no mesmo bloco. Se a montagem
  demorasse, o clique parecia não ter feito nada.

**Regra que ficou:** toda falha aparece escrita, com uma saída (tentar de novo,
trocar de conta, baixar o arquivo) e, quando houver, com o número medido. Nunca
uma frase genérica, nunca silêncio.

---

## 2. `/content` do Microsoft Graph quebra por CORS

`GET .../items/{id}/content` **não** devolve o arquivo: responde com um
redirecionamento para outro servidor. O cabeçalho de autorização não sobrevive
ao salto, o navegador barra, e o erro chega como `Failed to fetch` — que não
diz nada a ninguém.

**Caminho certo:** peça o item (`GET .../items/{id}`) e use o
`@microsoft.graph.downloadUrl`, que já vem autenticado. Para áudio, entregue
esse endereço direto ao player: toca enquanto baixa, em vez de segurar uma
reunião inteira na memória antes do primeiro som.

---

## 3. Regra de autor vence `[hidden]`

`.algo{display:flex}` escrito por nós tem mais peso que o
`[hidden]{display:none}` do navegador. O elemento recebe `hidden` e **não
some**. Já quebrou o menu do celular e os botões da barra.

**Correção:** `#seletor-especifico > [hidden]{display:none !important;}`

Parente próximo: esconder um filtro **não** o desliga. Filtro invisível e ativo
faz faltarem linhas sem explicação. Ao esconder um filtro, limpe-o — ou mostre
em algum lugar que ele está ligado (foi o que levou ao contador no botão
"Filtros" do celular).

---

## 4. `confirm()` é síncrono; `perguntar()` devolve Promise

O app trocou os avisos do navegador por janelas próprias. `perguntar()` devolve
uma Promise: sem `await`, `!perguntar(...)` é **sempre falso**, e a ação
destrutiva acontece sem perguntar — um "Excluir página?" que apaga calado.

`testes/teste_dialogo.js` cobra `await` em toda chamada e que o resultado seja
usado. Se acrescentar uma confirmação nova, ela entra nessa conta.

---

## 5. Constante que lê outra declarada abaixo derruba o app inteiro

Em arquivo único de 8.000 linhas é fácil escrever, no topo, uma constante que
usa outra definida lá embaixo. É erro de zona morta temporal: o script inteiro
morre no carregamento — tela branca, nada funciona.

`testes/teste_carga.js` varre isso. Se precisar de um valor declarado adiante,
use uma função (o corpo só é lido quando chamada).

---

## 6. Nunca desenhe megabytes de HTML

Um `.webm` de 1,4 MB foi importado como se fosse texto. A conversão levava
130 ms; o navegador levava **8951 ms** para desenhar 1,5 MB de HTML, e a página
virava "não está respondendo".

Hoje são três camadas, e as três são necessárias:
1. recusar na entrada o que não é texto (extensão, byte zero, proporção de
   `U+FFFD` acima de 2%);
2. limitar o tamanho (300 KB);
3. nunca desenhar mais que 120 KB — **mesmo que já esteja salvo**, senão quem
   tem lixo gravado não consegue abrir a janela nem para apagar.

---

## 7. `<a download>` é ignorado entre domínios

Apontar um `<a download>` para o OneDrive não baixa: o navegador abre a página
do SharePoint. Para baixar com o nome certo, busque os bytes e crie um endereço
local (`URL.createObjectURL`).

---

## 8. A largura da tabela é calculada em JavaScript

`table.style.width` recebe a soma das colunas, às vezes acima de 2000 px, como
estilo embutido. Qualquer CSS que precise mudar a largura da tabela — a visão
de cartões do celular, por exemplo — precisa de `!important`, senão perde.

Da mesma família: `#pageView.wide` impõe 40 px de cada lado e vence a regra do
celular **por especificidade**, não por ordem.

---

## 9. Números que se amarram em lugares diferentes

O painel do topo alinha com o botão do menu por uma conta de três números que
moram em regras separadas: `top` do botão, altura do botão, recuo do
`#pageView`. Mudar um desalinha em silêncio.

Quando existir esse acoplamento, **escreva a conta no comentário** e faça o
teste refazer a conta, em vez de fixar o resultado.

---

## 10. Camadas de escape ao gerar código por script

Editar o `index.html` por script Python é comum aqui. `\n` escrito num heredoc
chega como quebra de linha real e parte strings de JavaScript ao meio. Já
aconteceu várias vezes.

Saídas: escrever o script em arquivo (não em heredoc), usar strings cruas,
`chr(92)` para a barra invertida, ou trocar por alternativas sem escape. E
sempre `node --check` depois.

---

## 11. Duas cópias do mesmo arquivo divergem

O gerador do teste de navegador existiu em dois lugares. Eles divergiram, e uma
medição foi feita sobre o arquivo errado — dando confiança numa conclusão
falsa. Uma cópia só, versionada.
