# Testes

```bash
node testes/rodar.js
```

632 verificações em 20 suítes. Só precisa de Node — nada a instalar.

---

## Por que os testes são assim

**Este app não roda local.** O `redirectUri` do login é montado a partir do
endereço real da página, e `file://` não serve. Então não dá para abrir o
`index.html` no navegador e conferir na mão: o ciclo é `git push` → esperar o
GitHub Pages → recarregar o site.

Por isso as suítes **extraem funções de dentro do `index.html`** e as executam
no Node, com DOM e `localStorage` falsos. Não é elegante, mas é o que permite
verificar a lógica sem publicar a cada tentativa.

## O que elas pegam e o que não pegam

Pegam lógica: contas, formatos, regras, textos, e garantias que ficam no código
(uma senha pedida, um `await` que não pode faltar, um escape que não pode
sumir).

**Não pegam nada que dependa de desenhar a tela.** Foi assim que um travamento
ao abrir o resumo passou por todas elas: a lógica levava 130 ms, mas o
navegador levava 9 segundos para desenhar o resultado. Daí veio o
`teste_navegador.py`.

## O teste de navegador

```bash
python testes/teste_navegador.py
```

Monta o app inteiro com login e OneDrive falsos, 158 atividades e um resumo
real, abre num Chrome sem janela e mede. É o único que exercita DOM e CSS de
verdade. Precisa do Chrome instalado; sem ele, avisa e não reprova.

## Apontar para outro arquivo

```bash
node testes/rodar.js --alvo ../outro/index.html
ALVO_HTML=/caminho/index.html node testes/teste_audio.js
```

## Ao mexer no app

Rode `node testes/rodar.js` antes de publicar. Se uma suíte falhar porque o
comportamento **mudou de propósito**, atualize a verificação — mas confira
antes se ela não está apontando um defeito de verdade.

E ao consertar um defeito, **prove que o teste pega**: desfaça o conserto,
veja a suíte reprovar, refaça. Teste que nunca falhou não protege nada.
