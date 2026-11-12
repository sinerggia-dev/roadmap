# Arquitetura

Tudo em `index.html`: `<style>` no topo, o HTML do corpo, e um `<script>` único
no fim com todo o JavaScript. Não há build, bundler nem `node_modules`.

Bibliotecas vêm por CDN no `<head>`: msal-browser (login), xlsx 0.18.5
(planilha), jspdf (PDF), pptxgenjs 3.12.0 (slides), html2canvas (captura).

---

## Tipos de página

Criadas pelo botão **+ Nova página**. O tipo fica em `page.kind`:

| `kind` | O que é |
|---|---|
| `tarefas` | Banco de tarefas — a tabela de atividades. É o coração do app |
| `notas` | Texto livre, em blocos |
| `calendario` | Eventos por data |
| `dashboard` | Gráficos a partir das atividades |
| `apresentacao` | Relatório de treinamentos por empresa, com presença |

Várias páginas de cada tipo podem coexistir. A ordem na barra lateral vem de
`page.order` e muda arrastando.

---

## Acrescentar uma coluna à tabela de atividades

Uma coluna nova precisa aparecer em alguns registros. Esquecer um deles dá um
defeito silencioso — a coluna existe mas não ordena, ou não entra na busca.

1. `TASK_COLUMNS_DEF` — a chave e o rótulo. A ordem aqui é a ordem padrão.
2. `DEFAULT_COL_WIDTHS` — a largura em pixels.
3. `TASK_CELL_BUILDERS` — a função que monta o `<td>` da célula.
4. `ACOES_COM_SENHA` — se a coluna tiver ação sensível (criar, apagar, enviar),
   com chave própria, para o administrador poder ligar e desligar.
5. `taskSearchHaystack` — se o conteúdo deve ser encontrado pela busca da barra.
6. `SORT_ACCESSORS` — se a coluna deve poder ordenar.

O `renderTaskRow` já grava `data-col` e `data-rotulo` em cada `<td>`: é isso que
permite ao CSS do celular empilhar as mesmas células como cartão, sem um segundo
desenho em JavaScript. Uma coluna nova ganha isso de graça.

---

## Senhas por ação

`ACOES_COM_SENHA` é a lista do que pede senha. O administrador liga e desliga
cada item em **Administração**.

- `exigeSenhaPara(chave)` responde se aquela ação pede senha. Chave
  desconhecida ou ausente **pede** — o erro cai para o lado seguro.
- `requestEditPassword(chave)` e `guardTaskFieldEdit(task, chave)` são os
  portões usados pelo app.
- A senha de fábrica é `123456`, válida enquanto nenhuma for definida. Ela está
  no código, que é público: trocar antes de convidar gente é o certo.
- Tarefa recém-criada tem um período de graça e não pede senha para editar.

---

## Temas e aparência

`TEMAS` lista os fundos (`grafite`, `azul`, `preto`, `claro`, `sepia`). Cada um
é um conjunto das mesmas variáveis CSS num bloco `:root[data-tema="..."]`.

Nenhuma cor fixa no JavaScript: tudo por token (`var(--text)`,
`var(--pessoa-natanael)`), senão a cor que funciona num fundo some no outro.

A **intensidade** (−4 a +4) lê as cores do fundo escolhido, mistura com branco
ou preto e grava o resultado como estilo embutido no `<html>`. O texto não é
deslocado por um tanto fixo: o código **mede o contraste** e afasta o texto até
recuperar o que ele tinha. Cada token tem folga diferente — no tema claro o
texto secundário começa com 4,7:1 e não aguenta nada.

O resultado é guardado já calculado, para o `<head>` aplicar antes do primeiro
desenho e a tela não piscar no fundo padrão.

---

## Login e acesso

MSAL com conta Microsoft corporativa. `resolveWorkspace()` decide o que a
pessoa pode:

- **Dono** (`OWNER_EMAIL`): cria a pasta de dados se não existir, `canEdit`.
- **Outros**: acham a pasta pelo atalho fixo (`OWNER_DRIVE_ID` +
  `OWNER_FOLDER_ID`) ou, se vazios, pelo "compartilhado comigo" do Graph — que
  às vezes demora horas a refletir um compartilhamento novo. O papel vem de
  `_usuarios.json`.

Um endereço novo do app (outra pasta no GitHub Pages) **precisa ser cadastrado**
como URI de redirecionamento no registro do aplicativo no Azure, senão a entrada
falha com `AADSTS50011` e a mensagem não explica o motivo.

---

## Publicar

```bash
git add index.html
git commit -m "..."
git push origin HEAD
```

O GitHub Pages republica sozinho em 1 a 2 minutos. Confirme com o `curl | diff`
do SKILL.md antes de dizer ao usuário que está no ar.

Há também `scripts/enviar_alertas_vencimento.py`, disparado por GitHub Actions,
que lê o OneDrive e avisa por e-mail e WhatsApp sobre vencimentos próximos.
