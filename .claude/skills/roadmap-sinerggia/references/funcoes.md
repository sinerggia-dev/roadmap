# O que existe e por quê

Resumo do que foi construído no ROADMAP e, principalmente, **do motivo de cada
coisa**. O código conta o que faz; aqui ficam as decisões e os defeitos que
custaram caro — o que não dá para deduzir lendo o `index.html`.

O histórico completo está em `git log`. Isto é o mapa.

---

## As colunas da tabela de atividades

| Coluna | O que faz |
|---|---|
| **Itens** | Número de registro, dado automaticamente na criação, seguindo data e hora |
| **Tarefa, Empresa, Responsável** | Nome da empresa normalizado para Primeira Maiúscula, mesmo digitado em caixa alta |
| **Vencimento, Horário, Status, Prioridade** | |
| **Nota** | Texto formatado, em janela própria |
| **Links, Anexo** | Arquivos na pasta `Anexos` do OneDrive |
| **Documento** | Cria Word, Excel ou PowerPoint **online**, na pasta `Documentos` |
| **Áudio** | Grava reunião ou instrução pelo navegador, na pasta `Audios` |
| **Resumo** | Resumo da reunião colado na atividade, em Markdown simples |

## Fora da tabela

- **Páginas**: notas, banco de tarefas, calendário, dashboard e apresentação
  por empresa. Arrastar na barra lateral reordena.
- **Aparência**: cinco fundos (Cinza, Azul, Preto, Claro, Papel) e ajuste de
  intensidade de −4 a +4.
- **Senha por ação**: cada ação sensível pode pedir senha ou não, configurável
  pelo administrador.
- **Backup**: baixa índice, usuários, todas as páginas e a lista dos arquivos
  das três pastas, num arquivo só.
- **Painel do topo**: saudação, nome, clima, temperatura, local e hora.
- **Alerta de vencimento**: e-mail e WhatsApp, por GitHub Actions.

---

## Decisões que parecem detalhe e não são

**O gravador de áudio fica fora da tabela.** A tabela se redesenha a cada letra
digitada no filtro; um gravador dentro da célula morreria no meio da reunião.
E falha de envio **não descarta a gravação** — a tela oferece baixar o arquivo.
Uma reunião de uma hora não tem segunda chance.

**O resumo abre em modo leitura.** É texto para consultar, não para editar o
tempo todo. Mas se a célula está vazia, abre escrevendo — que é o que a pessoa
quer naquele momento.

**Arrastar páginas só reordena entre irmãs.** Soltar numa página de outro nível
mudaria o pai, e isso acontece sem querer com facilidade.

**Reordenar renumera o nível inteiro.** Inventar um número entre os vizinhos
funciona nas primeiras vezes; depois os números se amontoam, aparece empate e a
página "anda sozinha" no carregamento seguinte.

**A intensidade do fundo mede o contraste.** Não desloca o texto um tanto fixo:
mede e afasta o texto até recuperar o contraste que tinha. Cada cor tem folga
diferente — no tema claro o texto secundário começa com 4,7:1 e não aguenta
nada.

---

## Defeitos já pagos

Estão em `armadilhas.md`, com o sintoma que cada um causou. Vale ler antes de
mexer: o caminho errado, em todos eles, é o mais óbvio.
