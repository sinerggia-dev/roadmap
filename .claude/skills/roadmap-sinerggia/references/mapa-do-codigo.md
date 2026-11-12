# Mapa do código

**Gerado por `testes/gerar_mapa.py`. Não edite à mão** — rode o script de novo
depois de mexer no `index.html`, senão ele aponta para linhas que já mudaram.

O `index.html` tem 9787 linhas (~124 mil tokens). Mandar o arquivo inteiro numa
conversa ocupa quase todo o espaço disponível. Este mapa diz **onde** está cada
coisa; leia só o trecho de que precisar.

- CSS: linhas 1 a 1701
- HTML do corpo: até ~2153
- JavaScript: 2154 a 9787

Resumo: **306 funções**, **54 constantes**, **640 blocos de CSS**, **225 elementos
com id**.

## Seções do arquivo
| Linha | Seção |
|---|---|
| 54 | Outros fundos |
| 168 | Telas de login / bloqueio |
| 234 | App shell |
| 310 | Usuário (avatar + menu) |
| 341 | Mini calendário da barra lateral (consulta de datas/feriados) |
| 407 | Editor |
| 529 | Menu "/" e menu de novo tipo de página |
| 553 | Barra de formatação flutuante |
| 566 | Banco de tarefas |
| 1081 | Calendário |
| 1109 | Modal de evento |
| 1131 | Modal de senha |
| 1148 | Bloco de nota (coluna Nota) |
| 1217 | Dashboard |
| 1232 | Página de apresentação |
| 1380 | Análise por empresa (Dashboard) |
| 1428 | Painel de administração |
| 1463 | Menu mobile (hambúrguer) |
| 1474 | Recolher/expandir barra lateral (desktop) |
| 1488 | - |
| 1503 | Responsivo (celular) |
| 1528 | Filtros no celular |
| 1593 | Cada atividade vira um cartao |
| 1675 | Impressão (respeita os filtros aplicados no Banco de Tarefas) |
| 2154 | CONFIG — Microsoft 365 / Graph (mesmo App Registration do CAP/Qdelícia) |
| 2176 | ESTADO |
| 2221 | HELPERS |
| 2250 | LOGIN / TOKEN (MSAL) |
| 2402 | MICROSOFT GRAPH — WORKSPACE (pasta compartilhada + índice) |
| 2545 | INICIALIZAÇÃO APÓS LOGIN |
| 2653 | PÁGINAS — CRUD + ÁRVORE |
| 2669 | Numero de registro (coluna ITENS) |
| 2728 | Caixa alta vira "Primeira Maiuscula" |
| 2902 | MINI CALENDÁRIO DA BARRA LATERAL — consulta de datas, dias da semana |
| 3242 | MENU MOBILE (barra lateral retrátil no celular) |
| 3267 | Backup |
| 3383 | Painel do topo: saudacao, clima e hora |
| 3478 | Fundo da tela |
| 3494 | Intensidade do fundo |
| 3632 | Painel de aparencia |
| 3676 | Filtros recolhidos no celular |
| 3747 | Recolher/expandir barra lateral (desktop, dá mais espaço pro conteúdo) |
| 3779 | MENU "NOVA PÁGINA" (escolher tipo) |
| 3810 | AGENDAMENTO RÁPIDO — clicar numa data no mini calendário da barra lateral |
| 3877 | EDITOR DE PÁGINA (TÍTULO) |
| 3927 | Largura ajustável das caixas de filtro (arrastar a bordinha direita) |
| 3968 | Ordem ajustável da barra de ferramentas (arrastar pra reordenar) |
| 4133 | BLOCOS |
| 4420 | BARRA DE FORMATAÇÃO FLUTUANTE (negrito/itálico/sublinhado/tachado/link/alinhamento) |
| 4495 | BANCO DE TAREFAS |
| 4555 | Responsaveis (varios por atividade) |
| 4765 | Modal de senha (substitui prompt() nativo) |
| 4890 | Colunas (ordem, largura, visibilidade) |
| 5255 | Filtros extras (empresa / responsável / busca) |
| 6378 | Coluna Nota |
| 6576 | Coluna Anexo |
| 6628 | Avisar e perguntar, sem o visual do navegador |
| 6695 | Importar resumos de uma pasta do OneDrive |
| 6859 | Resumo da reuniao |
| 7245 | Gravar audio da reuniao ou da instrucao |
| 7669 | Documento do Office por atividade |
| 8151 | AGREGAÇÃO ENTRE PÁGINAS (tarefas/eventos de todas as páginas do tipo) |
| 8230 | DASHBOARD |
| 8233 | Análise por empresa |
| 8447 | APRESENTAÇÃO POR EMPRESA |
| 8591 | capa |
| 8602 | cartões |
| 8623 | participação por pessoa (logo após os cartões) |
| 8679 | turmas realizadas |
| 8697 | turmas a realizar |
| 8859 | PowerPoint em modo "print" |
| 8972 | PowerPoint com texto editavel |
| 9000 | capa |
| 9015 | resumo: os seis cartões |
| 9038 | estilo comum das tabelas |
| 9050 | turmas realizadas |
| 9068 | turmas a realizar |
| 9087 | participação por pessoa |
| 9297 | CALENDÁRIO |
| 9438 | MENU "/" |
| 9494 | PAINEL DE ADMINISTRAÇÃO |
| 9777 | BOOT |

## Constantes
| Linha | Nome | Valor |
|---|---|---|
| 2157 | `MSAL_CONFIG` | `{` |
| 2165 | `GRAPH_SCOPES` | `["Files.ReadWrite.All"];` |
| 2166 | `OWNER_EMAIL` | `"natanael.silva@sinerggia.com.br";` |
| 2167 | `FOLDER_NAME` | `"Notas Pessoais - Dados";` |
| 2168 | `INDEX_FILENAME` | `"_indice.json";` |
| 2169 | `USERS_FILENAME` | `"_usuarios.json";` |
| 2172 | `OWNER_DRIVE_ID` | `"b!lTwfpJvVJEOzjHLovSZS9lBvQQL9XqBPnLln3VF0a0bl1y8HbKerRarUr` |
| 2173 | `OWNER_FOLDER_ID` | `"013PHIGVJBNDABLZ4SVVBIULS6TYSNQ4HH";` |
| 2209 | `BLOCK_TYPES` | `[` |
| 2656 | `PAGE_KINDS` | `["notas", "tarefas", "calendario", "dashboard", "apresentaca` |
| 2668 | `STATUS_RENAME_MAP` | `{ "A fazer": "Pendente", "Em andamento": "Iniciado" };` |
| 2718 | `REG_VERSAO` | `2;` |
| 2736 | `TC_MINUSCULAS` | `new Set(["de","da","do","das","dos","e","em","na","no","nas"` |
| 2741 | `TC_SIGLAS` | `new Set(["GPD","WMS","MRP","CAP","CAR","CMO","OS","ERP","RH"` |
| 2906 | `SMC_WEEKDAY_LABELS` | `["D","S","T","Q","Q","S","S"];` |
| 2930 | `HOLIDAY_CACHE` | `{};` |
| 3387 | `PT_LOCAL` | `{ nome: "Recife", lat: -8.0476, lon: -34.8770 };` |
| 3486 | `TEMAS` | `[` |
| 3505 | `TEMA_TOKENS_FUNDO` | `["--bg", "--surface", "--surface-2", "--sidebar-bg",` |
| 3507 | `TEMA_TOKENS_TEXTO` | `["--text", "--text-light", "--text-dim"];` |
| 3508 | `TEMA_PASSO` | `0.045;   // 4,5% por degrau; os 4 degraus somam 18%` |
| 3969 | `DEFAULT_TOOLBAR_ORDER` | `["tableView", "kanbanView", "group", "status", "dueState", "` |
| 3992 | `TOOLBAR_LABELS` | `{` |
| 4737 | `SORT_ACCESSORS` | `{` |
| 4799 | `TASK_PASSWORD_PADRAO` | `"123456";` |
| 4831 | `ACOES_COM_SENHA` | `[` |
| 4880 | `TASK_EDIT_GRACE_MS` | `10 * 60 * 1000; // 10 minutos após criar a tarefa, edições n` |
| 4891 | `TASK_COLUMNS_DEF` | `[` |
| 4910 | `DEFAULT_COL_ORDER` | `TASK_COLUMNS_DEF.map(c => c.key);` |
| 4911 | `DEFAULT_COL_WIDTHS` | `{` |
| 5336 | `TASK_STATUS_TABS` | `["Todas", "Iniciado", "Pendente", "Concluído", "Cancelado"];` |
| 5964 | `DUE_STATES` | `{` |
| 6053 | `OPCAO_NOVA_EMPRESA` | `"\u0000nova-empresa";` |
| 6168 | `ASSIGNEE_TEXT_COLORS` | `{` |
| 6504 | `ATRIBUTOS_QUE_FICAM` | `{ A: ["href"] };` |
| 6581 | `ATTACH_FOLDER` | `"Anexos";` |
| 6582 | `ATTACH_MAX_BYTES` | `60 * 1024 * 1024;   // acima disso o upload simples do Graph` |
| 6704 | `IMPORT_FOLDER` | `"ROADMAP - Importar";` |
| 6705 | `IMPORT_MAX_BYTES` | `300 * 1024;   // resumo e texto; acima disso e outra coisa` |
| 6864 | `RESUMO_MAX_CHARS` | `300 * 1024;` |
| 6865 | `RESUMO_RENDER_MAX` | `120 * 1024;` |
| 6869 | `TIPOS_QUE_NAO_SAO_TEXTO` | `[` |
| 7253 | `AUDIO_FOLDER` | `"Audios";` |
| 7254 | `AUDIO_MAX_BYTES` | `ATTACH_MAX_BYTES;` |
| 7679 | `DOCS_FOLDER` | `"Documentos";` |
| 7680 | `DOC_TIPOS` | `{` |
| 8039 | `TASK_CELL_BUILDERS` | `{` |
| 8238 | `RE_EMAIL_NOTA` | `/[\w.+-]+@[\w-]+\.[\w.-]+/;` |
| 8241 | `RE_FIM_DOMINIO` | `/^([\w.+-]+@[\w-]+(?:\.[\w-]+)*?\.(?:com\.br\|gov\.br\|edu\.br` |
| 8246 | `RE_AUSENTE` | `/[\(\[]?\s*n[ãa]o\s+(?:participou\|compareceu\|veio\|assistiu)\` |
| 8456 | `AP_NAO_CONTA_PADRAO` | `"Navegando com Maestria";` |
| 8863 | `AP_LARG_CAPTURA` | `1280;` |
| 8864 | `AP_ALT_SLIDE` | `Math.round(AP_LARG_CAPTURA * 5.625 / 10);` |
| 9300 | `MESES_PT` | `["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho` |

## Funções

### ESTADO

| Linha | Função | Parâmetros |
|---|---|---|
| 2188 | `isPageCollapsed` | `id` |
| 2189 | `toggleCollapsedPage` | `id` |

### HELPERS

| Linha | Função | Parâmetros |
|---|---|---|
| 2224 | `genId` | `prefix` |
| 2227 | `escapeHtml` | `str` |
| 2232 | `setStatus` | `text` |
| 2235 | `getPageMeta` | `id` |
| 2238 | `firstNameFromEmail` | `email` |
| 2244 | `itemsBase` |  |

### LOGIN / TOKEN (MSAL)

| Linha | Função | Parâmetros |
|---|---|---|
| 2253 | `async initMsal` |  |
| 2262 | `async ensureGraphToken` |  |
| 2275 | `async graphFetch` | `url, options = {}` |
| 2283 | `recadoDoErroDeLogin` | `err` |
| 2312 | `limparEstadoDeLogin` |  |
| 2326 | `mostrarErroDeLogin` | `err` |
| 2369 | `doLogout` |  |

### MICROSOFT GRAPH — WORKSPACE (pasta compartilhada + índice)

| Linha | Função | Parâmetros |
|---|---|---|
| 2405 | `async resolveWorkspace` |  |
| 2464 | `async getJsonByPath` | `filename` |
| 2476 | `async putJsonByPath` | `filename, obj` |
| 2485 | `async loadIndex` |  |
| 2491 | `async loadUsers` |  |
| 2497 | `scheduleSaveIndex` |  |
| 2502 | `async doSaveIndex` |  |
| 2514 | `scheduleSavePage` | `pageId` |
| 2519 | `async doSavePage` | `pageId` |

### INICIALIZAÇÃO APÓS LOGIN

| Linha | Função | Parâmetros |
|---|---|---|
| 2553 | `bootMostrar` | `texto` |
| 2570 | `bootPasso` | `texto` |
| 2574 | `bootEsconder` |  |
| 2583 | `bootErro` | `e` |
| 2601 | `async afterLogin` |  |
| 2613 | `async afterLoginPassos` |  |
| 2646 | `showNoAccess` |  |

### PÁGINAS — CRUD + ÁRVORE

| Linha | Função | Parâmetros |
|---|---|---|
| 2658 | `defaultContentForKind` | `kind` |

### Numero de registro (coluna ITENS)

| Linha | Função | Parâmetros |
|---|---|---|
| 2674 | `numeroRegistroMax` | `tasks` |
| 2681 | `proximoNumeroRegistro` | `tasks` |
| 2689 | `numeraRegistrosPendentes` | `tasks` |
| 2708 | `ordemRegistro` | `a, b` |
| 2720 | `renumeraRegistros` | `content` |

### Caixa alta vira "Primeira Maiuscula"

| Linha | Função | Parâmetros |
|---|---|---|
| 2745 | `caixaUnica` | `t` |
| 2751 | `tituloBonito` | `texto` |
| 2766 | `migrateTaskStatuses` | `content` |
| 2788 | `async addPage` | `parentId, kind` |
| 2804 | `async deletePage` | `id` |
| 2841 | `async openPage` | `id` |
| 2865 | `showEmptyState` |  |
| 2872 | `highlightActivePage` |  |
| 2878 | `buildTree` | `query` |

### MINI CALENDÁRIO DA BARRA LATERAL — consulta de datas, dias da semana

| Linha | Função | Parâmetros |
|---|---|---|
| 2912 | `computeEasterDate` | `year` |
| 2931 | `getHolidaysForYear` | `year` |
| 2962 | `findHoliday` | `date` |
| 2967 | `holidayScopeLabel` | `scope` |
| 2974 | `ensureSmcTooltip` |  |
| 2985 | `showSmcTooltip` | `targetEl, text` |
| 2998 | `hideSmcTooltip` |  |
| 3004 | `renderSidebarMiniCalendar` |  |
| 3108 | `pageIcon` | `page` |
| 3123 | `limpaMarcasDeArraste` |  |
| 3128 | `mesmoNivel` | `a, b` |
| 3139 | `reordenarPaginas` | `idMovida, idAlvo, depois` |
| 3159 | `ligaArrasteDaPagina` | `row, page` |
| 3213 | `renderPageRow` | `page, depth, hasChildren` |

### MENU MOBILE (barra lateral retrátil no celular)

| Linha | Função | Parâmetros |
|---|---|---|
| 3245 | `isMobileViewport` |  |
| 3249 | `setSessionUI` | `aberta` |
| 3253 | `openMobileSidebar` |  |
| 3257 | `closeMobileSidebar` |  |

### Backup

| Linha | Função | Parâmetros |
|---|---|---|
| 3281 | `pastasDeArquivo` |  |
| 3283 | `async listaDeUmaPasta` | `nome` |
| 3296 | `async listaDeAnexos` |  |
| 3305 | `async montarBackup` | `aviso` |
| 3338 | `contaDoBackup` | `pacote` |

### Painel do topo: saudacao, clima e hora

| Linha | Função | Parâmetros |
|---|---|---|
| 3390 | `ptIconeDoTempo` | `codigo, noite` |
| 3402 | `ptSaudacaoDaHora` | `h` |
| 3410 | `ptNomeBonito` | `email` |
| 3415 | `ptPintaRelogio` |  |
| 3427 | `async ptAtualizaTempo` |  |
| 3455 | `ptLigaPainel` |  |

### Intensidade do fundo

| Linha | Função | Parâmetros |
|---|---|---|
| 3510 | `hexParaRgb` | `h` |
| 3516 | `rgbParaHex` | `c` |
| 3522 | `luminancia` | `hex` |
| 3531 | `contrasteEntre` | `a, b` |
| 3544 | `corDeTextoAjustada` | `corTexto, fundoBase, fundoNovo` |
| 3557 | `misturarCor` | `hex, p` |
| 3565 | `intensidadeAtual` |  |
| 3570 | `aplicaIntensidade` | `n` |
| 3611 | `temaAtual` |  |
| 3616 | `aplicaTema` | `id` |

### Painel de aparencia

| Linha | Função | Parâmetros |
|---|---|---|
| 3633 | `renderOpcoesDeTema` |  |
| 3655 | `fecharPainelTema` |  |
| 3660 | `abrirPainelTema` |  |

### Filtros recolhidos no celular

| Linha | Função | Parâmetros |
|---|---|---|
| 3682 | `contarFiltrosAtivos` |  |
| 3694 | `atualizaBotaoFiltros` |  |

### Recolher/expandir barra lateral (desktop, dá mais espaço pro conteúdo)

| Linha | Função | Parâmetros |
|---|---|---|
| 3748 | `applySidebarCollapsed` | `collapsed` |

### MENU "NOVA PÁGINA" (escolher tipo)

| Linha | Função | Parâmetros |
|---|---|---|
| 3782 | `showKindMenu` | `parentId, anchorEl` |

### AGENDAMENTO RÁPIDO — clicar numa data no mini calendário da barra lateral

| Linha | Função | Parâmetros |
|---|---|---|
| 3813 | `showScheduleMenu` | `dateStr, anchorEl` |
| 3836 | `async scheduleTaskFromCalendar` | `dateStr` |
| 3865 | `async scheduleEventFromCalendar` | `dateStr` |

### EDITOR DE PÁGINA (TÍTULO)

| Linha | Função | Parâmetros |
|---|---|---|
| 3913 | `salvarGruposFechados` |  |

### Largura ajustável das caixas de filtro (arrastar a bordinha direita)

| Linha | Função | Parâmetros |
|---|---|---|
| 3935 | `saveFilterFieldWidths` |  |
| 3938 | `makeFieldResizable` | `wrapEl, controlEl, key, minWidth` |

### Ordem ajustável da barra de ferramentas (arrastar pra reordenar)

| Linha | Função | Parâmetros |
|---|---|---|
| 3987 | `saveToolbarOrder` |  |
| 4004 | `saveToolbarVisibility` |  |
| 4007 | `toolbarVisivel` | `k` |
| 4009 | `applyToolbarVisibility` |  |
| 4018 | `applyToolbarOrder` |  |
| 4032 | `initToolbarDragReorder` |  |
| 4071 | `async renderEditor` |  |

### BLOCOS

| Linha | Função | Parâmetros |
|---|---|---|
| 4136 | `renderBlocks` |  |
| 4150 | `renderBlockRow` | `pageContent, block, index, numberValue` |
| 4225 | `getCaretOffset` | `el` |
| 4236 | `focusBlock` | `blockId, offset` |
| 4250 | `splitContentEditableAtCaret` | `el` |
| 4265 | `onBlockInput` | `block, contentEl` |
| 4273 | `checkSlashTrigger` | `block, contentEl, plainText` |
| 4281 | `checkMarkdownShortcuts` | `block, contentEl, plainText` |
| 4314 | `onBlockKeydown` | `e, pageContent, block, index, contentEl` |
| 4381 | `insertBlockAfter` | `index` |
| 4390 | `moveBlock` | `index, dir` |
| 4400 | `deleteBlock` | `index` |

### BARRA DE FORMATAÇÃO FLUTUANTE (negrito/itálico/sublinhado/tachado/link/alinhamento)

| Linha | Função | Parâmetros |
|---|---|---|
| 4453 | `showSelectionToolbar` | `range` |
| 4462 | `hideSelectionToolbar` |  |
| 4466 | `applyInlineFormat` | `command, value` |
| 4474 | `setBlockAlign` | `align` |

### BANCO DE TAREFAS

| Linha | Função | Parâmetros |
|---|---|---|
| 4498 | `slugify` | `text` |
| 4502 | `formatDateTimeBR` | `iso` |
| 4508 | `formatDateOnlyShort` | `iso` |
| 4514 | `formatDuration` | `totalSeconds` |
| 4522 | `getTaskDisplaySeconds` | `task` |
| 4528 | `toggleTaskTimer` | `task` |

### Responsaveis (varios por atividade)

| Linha | Função | Parâmetros |
|---|---|---|
| 4563 | `responsavelPadrao` |  |
| 4567 | `taskAssignees` | `task` |
| 4572 | `setTaskAssignees` | `task, lista` |
| 4577 | `assigneesLabel` | `task` |
| 4581 | `getAssigneeOptions` |  |
| 4590 | `normalizeCompany` | `v` |
| 4601 | `companyKey` | `v` |
| 4605 | `getCompanyOptions` | `tasks` |
| 4634 | `focaTarefaNova` | `id` |
| 4649 | `anyTaskFilterActive` |  |
| 4654 | `updateClearFiltersBtnState` |  |
| 4661 | `stripAccents` | `v` |
| 4664 | `normalizeForSearch` | `v` |
| 4671 | `notaParaBusca` | `html` |
| 4688 | `taskSearchHaystack` | `task` |
| 4716 | `taskMatchesCommonFilters` | `task` |
| 4752 | `sortTasksList` | `tasks` |

### Modal de senha (substitui prompt() nativo)

| Linha | Função | Parâmetros |
|---|---|---|
| 4767 | `askPassword` | `title` |
| 4774 | `closePasswordModal` | `result` |
| 4803 | `async hashDaSenha` | `texto, sal` |
| 4809 | `senhaAcoesDefinida` |  |
| 4816 | `async senhaAcoesConfere` | `tentativa` |
| 4852 | `exigeSenhaPara` | `acao` |
| 4859 | `async requestDeletePassword` | `alvo, acao` |
| 4869 | `async requestEditPassword` | `acao` |
| 4881 | `isTaskWithinGracePeriod` | `task` |
| 4885 | `async guardTaskFieldEdit` | `task, acao` |

### Colunas (ordem, largura, visibilidade)

| Linha | Função | Parâmetros |
|---|---|---|
| 4941 | `saveTaskColOrder` |  |
| 4942 | `saveTaskColWidths` |  |
| 4943 | `saveTaskColVisibility` |  |
| 4945 | `visibleColumnOrder` |  |
| 4950 | `endActiveColumnResize` |  |
| 4957 | `updateTaskTableWidth` |  |
| 4969 | `renderTaskTableHead` |  |
| 5073 | `renderSelectAllHeaderCell` | `tasksList` |
| 5095 | `listaVisibilidade` | `box, itens, estaVisivel, aoMudar` |
| 5119 | `limparFiltroDaBarra` | `k` |
| 5144 | `renderTaskViewMenu` |  |
| 5211 | `renderTaskColumnsMenu` |  |

### Filtros extras (empresa / responsável / busca)

| Linha | Função | Parâmetros |
|---|---|---|
| 5256 | `populateExtraFilters` | `allTasks` |
| 5338 | `setTaskStatusFilter` | `value` |
| 5344 | `renderTaskFilterTabs` |  |
| 5378 | `buildHojeTab` |  |
| 5407 | `updateTaskViewToggle` |  |
| 5456 | `renderTaskStats` | `allTasks` |
| 5535 | `renderTasks` |  |
| 5567 | `renderTableGrouped` | `tbody, tarefas, assigneeOptions` |
| 5683 | `renderKanban` | `content, assigneeOptions` |
| 5722 | `buildActiveFiltersSummary` |  |
| 5745 | `renderKanbanCard` | `task, assigneeOptions` |
| 5865 | `buildTaskSelect` | `task, field, options, pillClass` |
| 5889 | `buildTitleCell` | `task` |
| 5915 | `buildHorarioCell` | `task` |
| 5944 | `buildStatusCell` | `task` |
| 5949 | `buildPriorityCell` | `task` |
| 5956 | `todayISO` |  |
| 5971 | `dueState` | `task` |
| 5982 | `dueStateClass` | `task` |
| 5984 | `refreshDueState` | `el, task` |
| 5993 | `buildDueFlag` | `task` |
| 6007 | `bindDueInput` | `input, task` |
| 6035 | `buildDueCell` | `task` |
| 6055 | `buildCompanyCell` | `task` |
| 6117 | `buildItemsCell` | `task` |
| 6142 | `buildReadonlyDateCell` | `iso` |
| 6148 | `buildTimerCell` | `task` |
| 6172 | `assigneeTextColor` | `email` |
| 6177 | `paintAssigneeSelect` | `sel` |
| 6187 | `buildPeoplePicker` | `task, assigneeOptions` |
| 6294 | `buildAssigneeCell` | `task, assigneeOptions` |
| 6301 | `normalizeLinkUrl` | `v` |
| 6307 | `buildLinksCell` | `task` |

### Coluna Nota

| Linha | Função | Parâmetros |
|---|---|---|
| 6388 | `noteHtmlToText` | `html` |
| 6395 | `noteIsEmpty` | `html` |
| 6397 | `noteToHtml` | `v` |
| 6405 | `noteModalTyped` |  |
| 6409 | `noteModalStored` |  |
| 6414 | `openNoteModal` | `task, refreshCell` |
| 6431 | `async closeNoteModal` | `force` |
| 6442 | `async commitNoteModal` | `value` |
| 6452 | `applyNoteFormat` | `command, value` |
| 6459 | `bindNoteFormatBtn` | `id, command, prompter` |
| 6506 | `limparHtmlColado` | `html` |
| 6535 | `buildNoteCell` | `task` |

### Coluna Anexo

| Linha | Função | Parâmetros |
|---|---|---|
| 6584 | `attachName` | `task` |
| 6587 | `formatFileSize` | `bytes` |
| 6594 | `safeFileName` | `name` |
| 6598 | `async ensureAttachFolder` |  |
| 6614 | `async uploadAttachment` | `file, task` |

### Avisar e perguntar, sem o visual do navegador

| Linha | Função | Parâmetros |
|---|---|---|
| 6639 | `dlgMostrar` | `texto, opcoes` |
| 6672 | `dlgNaFila` | `texto, opcoes` |
| 6679 | `avisar` | `texto, opcoes` |
| 6684 | `perguntar` | `texto, opcoes` |

### Importar resumos de uma pasta do OneDrive

| Linha | Função | Parâmetros |
|---|---|---|
| 6710 | `registroDoArquivo` | `nome` |
| 6715 | `ehArquivoDeResumo` | `nome` |
| 6719 | `async listarPastaDeImportacao` |  |
| 6731 | `casarResumos` | `arquivos, tasks` |
| 6749 | `async textoDoArquivo` | `item` |
| 6767 | `async marcarComoImportado` | `item` |
| 6781 | `async importarResumos` |  |

### Resumo da reuniao

| Linha | Função | Parâmetros |
|---|---|---|
| 6879 | `tipoNaoTextual` | `nome` |
| 6889 | `problemaNoTextoDoResumo` | `texto, nome` |
| 6916 | `resumoVazio` | `t` |
| 6921 | `resumoParaHtml` | `texto` |
| 6970 | `resumoParaTexto` | `texto` |
| 6980 | `abrirResumo` | `task, aoFechar` |
| 7012 | `pintaResumoLeitura` |  |
| 7041 | `atualizaBotoesResumo` |  |
| 7057 | `fecharResumo` |  |
| 7103 | `escolherArquivosDeResumo` | `multiplo` |
| 7124 | `async aplicarResumoNaTask` | `task, texto, nomeArquivo, aoTerminar` |
| 7152 | `async buscarResumoDaAtividade` | `task, botao, aoTerminar` |
| 7198 | `buildResumoCell` | `task` |

### Gravar audio da reuniao ou da instrucao

| Linha | Função | Parâmetros |
|---|---|---|
| 7258 | `formatoDeAudio` |  |
| 7275 | `formatarDuracao` | `seg` |
| 7284 | `gravadorPinta` |  |
| 7295 | `gravadorSegundos` |  |
| 7308 | `async ensureAudioFolder` |  |
| 7323 | `async iniciarGravacao` | `task, aoTerminar` |
| 7362 | `pausarGravacao` |  |
| 7376 | `soltarMicrofone` |  |
| 7382 | `async finalizarGravacao` |  |
| 7458 | `async cancelarGravacao` |  |
| 7483 | `async enderecoDoAudio` | `a` |
| 7498 | `async baixarAudio` | `task, a, botao` |
| 7524 | `buildAudioCell` | `task` |

### Documento do Office por atividade

| Linha | Função | Parâmetros |
|---|---|---|
| 7689 | `crc32Bytes` | `bytes` |
| 7706 | `montarZip` | `arquivos` |
| 7739 | `escaparXml` | `t` |
| 7745 | `docxEmBranco` | `titulo` |
| 7768 | `async bytesDoDocumento` | `tipo, titulo` |
| 7784 | `async ensureDocsFolder` |  |
| 7800 | `async criarDocumentoDaTarefa` | `task, tipo` |
| 7817 | `buildDocumentoCell` | `task` |
| 7880 | `abrirMenuDocumento` | `btn, task, aoCriar` |
| 7924 | `buildAttachCell` | `task` |
| 8059 | `renderTaskRow` | `task, assigneeOptions` |
| 8118 | `async deleteTask` | `taskId` |

### AGREGAÇÃO ENTRE PÁGINAS (tarefas/eventos de todas as páginas do tipo)

| Linha | Função | Parâmetros |
|---|---|---|
| 8154 | `async ensurePagesOfKindLoaded` | `kind` |
| 8178 | `async recarregarTarefas` |  |
| 8190 | `async loadAllTasksFlat` |  |
| 8201 | `async loadAllEventsFlat` |  |
| 8212 | `async loadCalendarTasksIndex` |  |
| 8224 | `formatDateBR` | `iso` |

### Análise por empresa

| Linha | Função | Parâmetros |
|---|---|---|
| 8248 | `parseNotaTreinamento` | `notaHtml` |
| 8295 | `analiseEmpresa` | `flat, empresa` |
| 8354 | `pintaAnaliseEmpresa` | `empresa` |
| 8432 | `montaSeletorEmpresas` |  |

### APRESENTAÇÃO POR EMPRESA

| Linha | Função | Parâmetros |
|---|---|---|
| 8458 | `apMeses` | `iso` |
| 8467 | `apPeriodo` | `a` |
| 8480 | `apRoster` | `parts` |
| 8489 | `apContaPart` | `x` |
| 8496 | `apTemas` | `tema` |
| 8501 | `apLista` | `itens, classe` |
| 8513 | `apTituloCurto` | `t` |
| 8525 | `async renderApresentacao` |  |

### turmas a realizar

| Linha | Função | Parâmetros |
|---|---|---|
| 8722 | `ligaControlesApresentacao` | `a, empresa, titulo, excluir, comModulo, semModulo` |

### PowerPoint em modo "print"

| Linha | Função | Parâmetros |
|---|---|---|
| 8866 | `async montaPptxPrint` | `titulo, filtro` |

### PowerPoint com texto editavel

| Linha | Função | Parâmetros |
|---|---|---|
| 8977 | `montaPptxApresentacao` | `a, empresa, titulo, excluir, comModulo, semModulo, pessoas, filtro` |

### participação por pessoa

| Linha | Função | Parâmetros |
|---|---|---|
| 9121 | `montaPdfApresentacao` | `a, empresa, titulo, excluir, comModulo, semModulo, pessoas, filtro` |
| 9218 | `async renderDashboard` |  |

### CALENDÁRIO

| Linha | Função | Parâmetros |
|---|---|---|
| 9302 | `formatDateISO` | `d` |
| 9320 | `renderCalendar` |  |
| 9381 | `openEventModal` | `dateStr, existingEvent` |
| 9400 | `closeEventModal` |  |

### MENU "/"

| Linha | Função | Parâmetros |
|---|---|---|
| 9441 | `showSlashMenu` | `blockId, contentEl` |
| 9461 | `hideSlashMenu` |  |
| 9466 | `applySlashChoice` | `type` |

### PAINEL DE ADMINISTRAÇÃO

| Linha | Função | Parâmetros |
|---|---|---|
| 9503 | `async openAdminPanel` |  |
| 9528 | `async salvarSenhaAcoes` | `ev` |
| 9560 | `renderAcoesComSenha` |  |
| 9593 | `pintaEstadoDaSenha` |  |
| 9606 | `closeAdminPanel` |  |
| 9610 | `renderAdminUserList` |  |
| 9620 | `renderAdminUserRow` | `u` |
| 9642 | `setAdminMsg` | `text, isErr` |
| 9648 | `async findPermissionIdByEmail` | `email` |
| 9744 | `async changeUserRole` | `email, papel` |
| 9763 | `async revokeUser` | `email` |

## Blocos de CSS
| Linha | Seletor |
|---|---|
| 169 | `#loginScreen, #noAccessScreen` |
| 177 | `#noAccessScreen` |
| 180 | `#bootScreen` |
| 184 | `#bootScreen.visible` |
| 185 | `#bootScreen h1` |
| 186 | `#bootSpinner` |
| 192 | `#bootStatusText` |
| 193 | `#bootTempo` |
| 194 | `#bootErro` |
| 195 | `#bootErro.visible` |
| 196 | `#bootErroMsg` |
| 201 | `#bootErroAcoes` |
| 202 | `#bootErroAcoes button` |
| 206 | `#bootErroAcoes button.principal` |
| 207 | `#bootErroAcoes button:hover` |
| 208 | `#loginScreen h1, #noAccessScreen h1` |
| 209 | `#loginScreen p, #noAccessScreen p` |
| 210 | `#loginBtn` |
| 215 | `#loginBtn:hover` |
| 216 | `#loginBtn:active` |
| 217 | `#loginError` |
| 221 | `#loginError .cod` |
| 222 | `#loginResetBtn` |
| 226 | `#loginResetBtn[hidden]` |
| 227 | `#loginResetBtn:hover` |
| 228 | `#noAccessScreen button` |
| 232 | `#noAccessScreen button:hover` |
| 235 | `#app` |
| 236 | `#app.visible` |
| 238 | `#sidebar` |
| 242 | `#sidebarHeader` |
| 243 | `#sidebarHeader h2` |
| 246 | `#temaBtn` |
| 253 | `#temaBtn:hover` |
| 254 | `#temaBtn:focus-visible` |
| 255 | `#temaBtn .tema-icone` |
| 258 | `#temaPainel` |
| 263 | `#temaPainel.aberto` |
| 264 | `#temaPainel h4` |
| 268 | `#temaPainel h4.depois` |
| 269 | `.tema-opcoes` |
| 270 | `.tema-opcao` |
| 275 | `.tema-opcao:hover` |
| 276 | `.tema-opcao.ativo` |
| 279 | `.tema-bolha` |
| 280 | `#temaIntensidade` |
| 281 | `.tema-escala` |
| 282 | `#temaIntValor` |
| 283 | `#temaReset` |
| 288 | `#temaReset:hover` |
| 289 | `#searchInput` |
| 293 | `#searchInput:focus` |
| 294 | `#newPageBtn` |
| 299 | `#newPageBtn:hover` |
| 300 | `#newPageBtn:focus` |
| 301 | `#newPageBtn[hidden]` |
| 302 | `#exportTasksBtn, #printTasksBtn` |
| 307 | `#exportTasksBtn:hover, #printTasksBtn:hover` |
| 308 | `#printFiltersSummary` |
| 311 | `#userBlock` |
| 312 | `.user-avatar-btn` |
| 316 | `.user-avatar-btn:hover` |
| 317 | `.user-avatar-btn:focus` |
| 318 | `.user-avatar` |
| 322 | `.user-email-short` |
| 323 | `.user-caret` |
| 324 | `.user-menu` |
| 328 | `.user-menu[hidden]` |
| 329 | `.user-menu-item` |
| 333 | `.user-menu-item:hover` |
| 334 | `.user-menu-item[hidden]` |
| 335 | `#pageTree` |
| 336 | `#pageTree::-webkit-scrollbar` |
| 337 | `#pageTree::-webkit-scrollbar-track` |
| 338 | `#pageTree::-webkit-scrollbar-thumb` |
| 339 | `#pageTree::-webkit-scrollbar-thumb:hover` |
| 342 | `#sidebarMiniCal` |
| 343 | `.smc-header` |
| 344 | `.smc-label` |
| 345 | `.smc-nav` |
| 346 | `.smc-nav:hover` |
| 347 | `.smc-weekdays` |
| 348 | `.smc-grid` |
| 349 | `.smc-day` |
| 354 | `.smc-day.other-month` |
| 355 | `.smc-day.weekend` |
| 356 | `.smc-day.today` |
| 357 | `.smc-day.holiday-nacional` |
| 358 | `.smc-day.holiday-pernambuco` |
| 359 | `.smc-day.holiday-facultativo` |
| 360 | `.smc-day.today.holiday-nacional, .smc-day.today.holiday-pernambuco, .smc-day.today.holiday-facultativo` |
| 361 | `.smc-legend` |
| 362 | `.smc-legend span` |
| 363 | `.smc-dot` |
| 364 | `.smc-dot.nacional` |
| 365 | `.smc-dot.pernambuco` |
| 366 | `.smc-dot.facultativo` |
| 367 | `.smc-today-btn` |
| 368 | `.smc-tooltip` |
| 372 | `.smc-tooltip[hidden]` |
| 373 | `.smc-today-btn:hover` |
| 375 | `.page-row` |
| 379 | `.page-row:hover` |
| 382 | `.page-row.arrastando` |
| 383 | `.page-row.alvo-antes` |
| 384 | `.page-row.alvo-depois` |
| 385 | `.page-row.recusa` |
| 386 | `.page-row.active` |
| 387 | `.page-title-label` |
| 388 | `.row-toggle` |
| 393 | `.row-toggle:hover` |
| 394 | `.row-toggle.collapsed` |
| 395 | `.row-toggle-spacer` |
| 396 | `.row-actions` |
| 397 | `.page-row:hover .row-actions` |
| 398 | `.icon-btn` |
| 402 | `.icon-btn:hover` |
| 404 | `#sidebarFooter` |
| 405 | `#statusText` |
| 408 | `#editor` |
| 409 | `#emptyState` |
| 413 | `#emptyState::before` |
| 416 | `#emptyState div` |
| 417 | `#emptyState button` |
| 421 | `#emptyState button:hover` |
| 422 | `#emptyState button[hidden]` |
| 423 | `#pageView` |
| 426 | `#painelTopo` |
| 432 | `#painelTopo[hidden]` |
| 433 | `#painelTopo b` |
| 434 | `#painelTopo small` |
| 435 | `.pt-avatar` |
| 439 | `.pt-saudacao b` |
| 440 | `.pt-sep` |
| 441 | `.pt-clima` |
| 442 | `.pt-clima[hidden]` |
| 443 | `.pt-icone` |
| 444 | `.pt-relogio` |
| 445 | `.pt-relogio b` |
| 446 | `#ptAtualizar` |
| 451 | `#ptAtualizar:hover` |
| 452 | `#ptAtualizar:disabled` |
| 453 | `@media (max-width:768px)` |
| 482 | `#pageView.wide` |
| 483 | `#readOnlyBanner` |
| 487 | `#pageTitle` |
| 492 | `#pageTitle::placeholder` |
| 494 | `#blockList` |
| 495 | `.block-row` |
| 498 | `.block-gutter` |
| 501 | `.block-row:hover .block-gutter` |
| 502 | `.block-gutter button` |
| 506 | `.block-gutter button:hover` |
| 507 | `.block-body` |
| 508 | `.block-content` |
| 511 | `.block-content:empty::before` |
| 512 | `.block-content.h1` |
| 513 | `.block-content.h2` |
| 514 | `.block-content.h3` |
| 515 | `.block-content.quote` |
| 516 | `.bullet-marker` |
| 517 | `.number-marker` |
| 518 | `.todo-checkbox` |
| 519 | `.block-content.todo-done` |
| 520 | `.divider-block` |
| 522 | `#addBlockBtn` |
| 526 | `#addBlockBtn[hidden]` |
| 527 | `#addBlockBtn:hover` |
| 534 | `#slashMenu, #kindMenu` |
| 539 | `#slashMenu[hidden], #kindMenu[hidden]` |
| 540 | `.slash-item` |
| 544 | `.slash-item:hover, .slash-item.selected` |
| 545 | `.slash-item .slash-icon` |
| 549 | `.slash-item-label` |
| 554 | `#selectionToolbar` |
| 558 | `#selectionToolbar[hidden]` |
| 559 | `#selectionToolbar button` |
| 562 | `#selectionToolbar button.fmt-text` |
| 563 | `#selectionToolbar button:hover` |
| 564 | `.fmt-sep` |
| 567 | `#tasksView` |
| 568 | `#taskStatusRow` |
| 569 | `#taskStatusPills` |
| 570 | `.filter-field` |
| 571 | `.filter-field-label` |
| 572 | `#sidebarTaskStats` |
| 573 | `.mini-stat-group` |
| 574 | `.mini-stat-group:last-child` |
| 575 | `.mini-stat-group-label` |
| 576 | `.mini-stat-items` |
| 577 | `.mini-stat` |
| 582 | `.mini-stat:hover` |
| 583 | `.mini-stat.active` |
| 584 | `.mini-stat b` |
| 585 | `.mini-stat.active b` |
| 586 | `#taskFilterTabs` |
| 587 | `.filter-control-wrap` |
| 588 | `.field-resizer` |
| 591 | `.field-resizer::after` |
| 594 | `.field-resizer:hover::after` |
| 595 | `.task-filter-tab` |
| 599 | `.task-filter-tab.active` |
| 601 | `.task-filter-tab.task-filter-hoje` |
| 602 | `.task-filter-tab.task-filter-hoje:hover` |
| 603 | `.task-filter-tab.task-filter-hoje.active` |
| 606 | `.task-filter-tab.task-filter-hoje .hoje-qtd` |
| 607 | `.task-total-badge` |
| 611 | `#taskTable` |
| 612 | `#taskTable th` |
| 618 | `#taskTable td` |
| 622 | `#taskTable td:first-child, #taskTable th:first-child` |
| 623 | `#taskTable th.col-select-th, #taskTable td.task-select-td` |
| 624 | `.col-select-th input, .task-select-td input` |
| 625 | `#taskTable td.task-title-cell` |
| 626 | `.col-label` |
| 627 | `.col-hide-btn` |
| 631 | `#taskTable th:hover .col-hide-btn` |
| 632 | `.col-resizer` |
| 633 | `.col-resizer::after` |
| 636 | `.col-resizer:hover::after` |
| 637 | `.col-menu-wrap` |
| 638 | `.col-menu-item` |
| 640 | `#taskViewMenuWrap` |
| 641 | `#taskViewMenuBtn` |
| 646 | `#taskViewMenuBtn:hover` |
| 647 | `#taskViewMenu` |
| 652 | `#taskViewMenu .tvm-secao` |
| 656 | `#taskViewMenu .col-menu-item:hover` |
| 657 | `.col-menu-item:hover` |
| 658 | `.col-menu-reset` |
| 662 | `.col-menu-reset:hover` |
| 663 | `#statusFilterSelect, #dueStateFilterSelect, #companyFilterSelect, #assigneeFilterSelect, #taskSearchInput` |
| 667 | `#taskSearchInput` |
| 668 | `#dueFilterWrap` |
| 669 | `.due-filter-sep` |
| 670 | `#dueFromFilter, #dueToFilter` |
| 674 | `#clearFiltersBtn` |
| 679 | `#clearFiltersBtn:hover` |
| 680 | `#clearFiltersBtn.filters-active` |
| 681 | `#clearFiltersBtn.filters-active:hover` |
| 682 | `.task-title` |
| 683 | `.task-title:empty::before` |
| 684 | `.task-company` |
| 685 | `.task-items` |
| 686 | `.task-horario` |
| 688 | `.task-assignee` |
| 692 | `.task-assignee:focus` |
| 693 | `.task-assignee:disabled` |
| 698 | `#taskGroupBar` |
| 703 | `#taskGroupBar[hidden]` |
| 704 | `.group-bar-label` |
| 707 | `#taskGroupBar button` |
| 713 | `#taskGroupBar button:disabled` |
| 714 | `#groupSortSelect` |
| 718 | `#taskGroupBar .group-bar-sep` |
| 730 | `.task-group-btn` |
| 735 | `.task-group-btn:hover` |
| 736 | `.task-group-caret` |
| 737 | `.task-group-count` |
| 741 | `.task-people-btn` |
| 747 | `.task-people-btn:disabled` |
| 748 | `.task-people-btn.vazio` |
| 749 | `.task-people-menu` |
| 754 | `.task-people-menu[hidden]` |
| 755 | `.task-people-item` |
| 759 | `.task-people-item:hover` |
| 760 | `.kanban-card .task-people-btn` |
| 761 | `.task-links-wrap` |
| 762 | `.task-links-input` |
| 763 | `.task-links-input[hidden]` |
| 764 | `.task-link-icon` |
| 765 | `.task-link-icon[hidden]` |
| 766 | `.task-link-edit-btn` |
| 767 | `.task-link-edit-btn:hover` |
| 768 | `.task-link-edit-btn[hidden]` |
| 770 | `.task-note-wrap` |
| 771 | `.task-note-btn` |
| 775 | `.task-note-btn:hover` |
| 776 | `.task-note-btn.has-note` |
| 777 | `.task-note-open-btn` |
| 781 | `.task-note-open-btn:hover` |
| 782 | `.task-note-empty` |
| 784 | `.task-attach-wrap` |
| 785 | `.task-attach-btn` |
| 789 | `.task-attach-btn:hover` |
| 790 | `.task-attach-btn:disabled` |
| 791 | `.task-attach-link` |
| 795 | `.task-attach-link:hover` |
| 796 | `.task-attach-name` |
| 797 | `.task-attach-del` |
| 798 | `.task-attach-del:hover` |
| 799 | `.task-attach-busy` |
| 800 | `.task-attach-empty` |
| 802 | `.task-doc-wrap` |
| 803 | `.task-doc-link` |
| 807 | `.task-doc-link:hover` |
| 808 | `.task-doc-link span` |
| 809 | `.task-doc-novo` |
| 813 | `.task-doc-novo:hover` |
| 814 | `.task-doc-novo:disabled` |
| 817 | `.task-doc-menu` |
| 821 | `.task-doc-menu button` |
| 826 | `.task-doc-menu button:hover` |
| 828 | `.task-audio-wrap` |
| 829 | `.task-audio-btn` |
| 833 | `.task-audio-btn:hover` |
| 834 | `.task-audio-btn:disabled` |
| 836 | `.task-resumo-wrap` |
| 837 | `.task-resumo-btn` |
| 841 | `.task-resumo-btn.tem-resumo` |
| 842 | `.task-resumo-btn.task-resumo-open-btn` |
| 846 | `.task-resumo-btn:hover` |
| 847 | `.task-resumo-empty` |
| 848 | `.task-resumo-sync` |
| 852 | `.task-resumo-sync:hover` |
| 853 | `.task-resumo-sync:disabled` |
| 856 | `#dlgOverlay` |
| 860 | `#dlgOverlay.visible` |
| 861 | `#dlgModal` |
| 866 | `#dlgTitulo` |
| 868 | `#dlgTexto` |
| 872 | `#dlgAcoes` |
| 873 | `#dlgAcoes button` |
| 877 | `#dlgAcoes button:hover` |
| 878 | `#dlgAcoes button.principal` |
| 879 | `#dlgAcoes button.perigo` |
| 880 | `#dlgAcoes button:focus-visible` |
| 881 | `#resumoOverlay` |
| 885 | `#resumoOverlay.visible` |
| 886 | `#resumoModal` |
| 890 | `#resumoCloseBtn` |
| 891 | `#resumoModal h2` |
| 892 | `#resumoModalTaskTitle` |
| 894 | `#resumoLeitura` |
| 899 | `#resumoLeitura h3` |
| 900 | `#resumoLeitura h3:first-child` |
| 901 | `#resumoLeitura h4` |
| 903 | `#resumoLeitura p` |
| 904 | `#resumoLeitura ul` |
| 905 | `#resumoLeitura li` |
| 906 | `#resumoLeitura li.pendente` |
| 907 | `#resumoLeitura li.pendente::before` |
| 908 | `#resumoLeitura li.feito` |
| 909 | `#resumoLeitura li.feito::before` |
| 910 | `#resumoLeitura blockquote` |
| 914 | `#resumoLeitura hr` |
| 915 | `#resumoLeitura .vazio` |
| 916 | `#resumoEditor` |
| 922 | `#resumoModal.editando #resumoLeitura` |
| 923 | `#resumoModal.editando #resumoEditor` |
| 924 | `#resumoModalHint` |
| 925 | `#resumoModalActions` |
| 926 | `#resumoModalActionsRight` |
| 927 | `#resumoModalActions button` |
| 931 | `#resumoModalActions button:hover` |
| 932 | `#resumoModalActions button.principal` |
| 933 | `#resumoDeleteBtn:hover` |
| 934 | `.task-audio-dur` |
| 935 | `.task-audio-btn.tocando` |
| 936 | `.task-audio-link` |
| 940 | `.task-audio-link:hover` |
| 943 | `.task-audio-bar` |
| 947 | `.task-audio-prog` |
| 953 | `#gravadorPainel` |
| 958 | `#gravadorPainel[hidden]` |
| 959 | `#gravadorPainel .gr-tarefa` |
| 963 | `#gravadorPainel .gr-tempo` |
| 967 | `#gravadorPainel .gr-bolinha` |
| 971 | `#gravadorPainel.pausado .gr-bolinha` |
| 973 | `#gravadorPainel .gr-botoes` |
| 974 | `#gravadorPainel button` |
| 979 | `#gravadorPainel button:hover` |
| 980 | `#gravadorPainel button.principal` |
| 981 | `#gravadorPainel button:disabled` |
| 982 | `#gravadorMsg` |
| 983 | `.status-pill, .priority-pill` |
| 987 | `.status-pill.pendente` |
| 988 | `.status-pill.iniciado` |
| 989 | `.status-pill.concluido` |
| 990 | `.status-pill.cancelado` |
| 991 | `.priority-pill.baixa` |
| 992 | `.priority-pill.media` |
| 993 | `.priority-pill.alta` |
| 994 | `#addTaskBtn` |
| 998 | `#addTaskBtn[hidden]` |
| 999 | `#addTaskBtn:hover` |
| 1000 | `.del-task` |
| 1001 | `.del-task:hover` |
| 1007 | `.task-due` |
| 1011 | `.task-due-wrap` |
| 1012 | `.task-due-flag` |
| 1013 | `.task-due-flag:empty` |
| 1029 | `.task-meta-date` |
| 1030 | `.task-timer-cell` |
| 1031 | `.timer-toggle-btn` |
| 1035 | `.timer-toggle-btn:hover` |
| 1036 | `.timer-display` |
| 1037 | `.kanban-card-timer` |
| 1038 | `.kanban-card-dates` |
| 1040 | `#taskToolbarRow` |
| 1045 | `#taskToolbarRow > [hidden]` |
| 1046 | `.toolbar-dragging` |
| 1047 | `.view-toggle-btn` |
| 1052 | `.view-toggle-btn.active` |
| 1053 | `.view-toggle-btn:hover` |
| 1055 | `#taskKanban` |
| 1056 | `.kanban-col` |
| 1060 | `.kanban-col.drag-over` |
| 1061 | `.kanban-col h4` |
| 1062 | `.kanban-col-body` |
| 1063 | `.kanban-card` |
| 1067 | `.kanban-card.dragging` |
| 1068 | `.kanban-card-title` |
| 1069 | `.kanban-card-title:empty::before` |
| 1070 | `.kanban-card-meta` |
| 1071 | `.kanban-card select.priority-pill` |
| 1072 | `.kanban-card .task-due` |
| 1073 | `.kanban-assignee` |
| 1074 | `.kanban-company` |
| 1075 | `.kanban-del-btn` |
| 1079 | `.kanban-del-btn:hover` |
| 1082 | `#calendarView` |
| 1083 | `#calendarHeader` |
| 1084 | `#calMonthLabel` |
| 1085 | `#calPrevBtn, #calNextBtn` |
| 1089 | `#calPrevBtn:hover, #calNextBtn:hover` |
| 1090 | `#calendarWeekdays` |
| 1094 | `#calendarGrid` |
| 1095 | `.cal-day` |
| 1096 | `.cal-day.other-month` |
| 1097 | `.cal-day.today .cal-day-num` |
| 1098 | `.cal-day-num` |
| 1099 | `.cal-day-add` |
| 1103 | `.cal-day:hover .cal-day-add` |
| 1104 | `.cal-event-pill` |
| 1110 | `#eventOverlay` |
| 1114 | `#eventOverlay.visible` |
| 1115 | `#eventModal` |
| 1116 | `#eventModal h2` |
| 1117 | `#eventCloseBtn` |
| 1118 | `.event-label` |
| 1119 | `.event-input` |
| 1122 | `#eventModalActions` |
| 1123 | `#eventDeleteBtn` |
| 1124 | `#eventSaveBtn` |
| 1125 | `.cal-task-pill` |
| 1129 | `.cal-task-pill.cal-task-done` |
| 1132 | `#passwordOverlay` |
| 1136 | `#passwordOverlay.visible` |
| 1137 | `#passwordModal` |
| 1141 | `#passwordModal h3` |
| 1142 | `#passwordModalActions` |
| 1143 | `#passwordCancelBtn` |
| 1144 | `#passwordCancelBtn:hover` |
| 1145 | `#passwordOkBtn` |
| 1146 | `#passwordOkBtn:hover` |
| 1149 | `#noteOverlay` |
| 1153 | `#noteOverlay.visible` |
| 1154 | `#noteModal` |
| 1158 | `#noteCloseBtn` |
| 1159 | `#noteModal h2` |
| 1160 | `#noteModalTaskTitle` |
| 1161 | `#noteToolbar` |
| 1165 | `#noteToolbar[hidden]` |
| 1166 | `#noteToolbar button` |
| 1170 | `#noteToolbar button.fmt-text` |
| 1171 | `#noteToolbar button:hover` |
| 1172 | `#noteToolbar .fmt-sep` |
| 1173 | `#noteEditor` |
| 1178 | `#noteEditor:focus` |
| 1179 | `#noteEditor[contenteditable="false"]` |
| 1180 | `#noteEditor:empty::before` |
| 1181 | `#noteEditor ul, #noteEditor ol` |
| 1182 | `#noteEditor a` |
| 1207 | `#noteModalHint` |
| 1208 | `#noteModalActions` |
| 1209 | `#noteModalActionsRight` |
| 1210 | `#noteDeleteBtn` |
| 1211 | `#noteCancelBtn` |
| 1212 | `#noteCancelBtn:hover` |
| 1213 | `#noteSaveBtn` |
| 1214 | `#noteSaveBtn:hover` |
| 1215 | `#noteDeleteBtn[hidden], #noteSaveBtn[hidden]` |
| 1218 | `#dashboardView` |
| 1219 | `#dashboardStats, #dashboardUserStats` |
| 1220 | `#dashboardUserStats .dash-stat` |
| 1221 | `.dash-stat` |
| 1222 | `.dash-stat-num` |
| 1223 | `.dash-stat-label` |
| 1224 | `.dash-section-title` |
| 1225 | `.dash-row` |
| 1226 | `.dash-row:hover` |
| 1227 | `.dash-row-date` |
| 1228 | `.dash-row-title` |
| 1229 | `.dash-row-page` |
| 1230 | `.dash-empty` |
| 1235 | `#apresentacaoView` |
| 1245 | `#apresentacaoView h1,#apresentacaoView h2,#apresentacaoView h3` |
| 1248 | `#apresentacaoView h1` |
| 1249 | `#apresentacaoView h2` |
| 1250 | `#apresentacaoView h3` |
| 1251 | `#apresentacaoView p` |
| 1252 | `.ap-mono,.ap-mail,.ap-quando,.ap-pc,.ap-frac,.ap-conta` |
| 1255 | `.ap-capa` |
| 1256 | `.ap-eyebrow` |
| 1260 | `.ap-sub` |
| 1261 | `.ap-fonte` |
| 1262 | `.ap-painel` |
| 1266 | `.ap-cel` |
| 1267 | `.ap-cel .v` |
| 1269 | `.ap-cel .r` |
| 1270 | `.ap-cel.ok .v` |
| 1271 | `.ap-cel.falta .v` |
| 1272 | `.ap-secao` |
| 1273 | `.ap-cab` |
| 1275 | `.ap-conta` |
| 1276 | `.ap-nota` |
| 1277 | `.ap-reg` |
| 1279 | `.ap-reg-data` |
| 1280 | `.ap-reg-data small` |
| 1281 | `.ap-temas` |
| 1282 | `.ap-temas span` |
| 1284 | `.ap-rot` |
| 1286 | `.ap-roster` |
| 1287 | `.ap-roster div` |
| 1288 | `.ap-nome` |
| 1289 | `.ap-mail` |
| 1290 | `.ap-grade` |
| 1291 | `.ap-card` |
| 1292 | `.ap-card-topo` |
| 1293 | `.ap-chip` |
| 1295 | `.ap-chip.data` |
| 1296 | `.ap-chip.vazio` |
| 1297 | `.ap-pes` |
| 1298 | `.ap-pes-topo` |
| 1299 | `.ap-pes-topo h3` |
| 1300 | `.ap-pes-topo .ap-mail` |
| 1301 | `.ap-vao` |
| 1302 | `.ap-pc` |
| 1303 | `.ap-frac` |
| 1304 | `.ap-barra` |
| 1306 | `.ap-listas` |
| 1307 | `.ap-lista` |
| 1308 | `.ap-lista li` |
| 1310 | `.ap-lista li::before` |
| 1311 | `.ap-lista.feito li::before` |
| 1312 | `.ap-lista.falta li::before` |
| 1313 | `.ap-lista.ausente li::before` |
| 1314 | `.ap-lista.ausente li span:first-child` |
| 1316 | `.ap-faltou` |
| 1319 | `.ap-roster div.faltou .ap-nome` |
| 1320 | `.ap-quando` |
| 1321 | `.ap-quando.sem` |
| 1322 | `.ap-config` |
| 1327 | `.ap-config label` |
| 1328 | `.ap-config select` |
| 1332 | `.ap-vazio` |
| 1334 | `.ap-busca` |
| 1338 | `.ap-busca-rot` |
| 1340 | `.ap-busca input[type=search]` |
| 1344 | `.ap-busca input[type=search]:focus` |
| 1345 | `.ap-fp` |
| 1348 | `.ap-fp b` |
| 1349 | `.ap-fp:hover` |
| 1350 | `.ap-fp.ativo` |
| 1351 | `.ap-fp.ativo b` |
| 1352 | `.ap-pdf` |
| 1355 | `.ap-pdf:hover` |
| 1356 | `.ap-pdf:disabled` |
| 1357 | `.ap-pptx` |
| 1360 | `.ap-pptx:hover` |
| 1361 | `.ap-pptx:disabled` |
| 1362 | `.ap-pptx.ap-sec` |
| 1364 | `.ap-pptx.ap-sec:hover` |
| 1368 | `#apPalco` |
| 1369 | `.ap-status` |
| 1371 | `.ap-status:empty` |
| 1372 | `#apresentacaoView [hidden]` |
| 1373 | `@media (max-width:640px)` |
| 1381 | `#dashEmpresaBarra` |
| 1382 | `#dashEmpresaBarra label` |
| 1383 | `#dashEmpresaSel` |
| 1387 | `#dashEmpresaResumo` |
| 1388 | `.ae-cartoes` |
| 1389 | `.ae-cel` |
| 1393 | `.ae-cel .n` |
| 1394 | `.ae-cel .r` |
| 1395 | `.ae-cel.ok .n` |
| 1396 | `.ae-sub` |
| 1400 | `.ae-turma` |
| 1404 | `.ae-turma-topo` |
| 1405 | `.ae-turma-topo b` |
| 1406 | `.ae-quando` |
| 1407 | `.ae-quando.sem` |
| 1408 | `.ae-status` |
| 1409 | `.ae-tema` |
| 1410 | `.ae-gente` |
| 1411 | `.ae-chip` |
| 1415 | `.ae-pessoa` |
| 1419 | `.ae-pessoa b` |
| 1420 | `.ae-pessoa .em` |
| 1421 | `.ae-pessoa .vao` |
| 1422 | `.ae-pessoa .num` |
| 1423 | `.ae-pessoa .pc` |
| 1424 | `.ae-barra` |
| 1426 | `.ae-vazio` |
| 1429 | `#adminOverlay` |
| 1433 | `#adminOverlay.visible` |
| 1434 | `#adminPanel` |
| 1438 | `#adminPanel h2` |
| 1439 | `#adminPanel .sub` |
| 1440 | `#adminPanel h3` |
| 1441 | `#adminCloseBtn` |
| 1442 | `.admin-user-row` |
| 1445 | `.admin-user-row .u-email` |
| 1446 | `.admin-user-row select` |
| 1447 | `.admin-user-row button` |
| 1448 | `#adminInviteForm` |
| 1449 | `#adminInviteForm input[type=email]` |
| 1450 | `#adminInviteForm select` |
| 1451 | `#adminInviteForm button` |
| 1452 | `.secondary-btn` |
| 1456 | `.secondary-btn:hover` |
| 1457 | `#adminNoteIcon` |
| 1458 | `#adminMsg` |
| 1459 | `#adminMsg.err` |
| 1460 | `#adminMsg.ok` |
| 1461 | `#taskTableWrap` |
| 1464 | `#mobileMenuBtn` |
| 1469 | `#sidebarOverlay` |
| 1470 | `#sidebarOverlay.visible` |
| 1475 | `#sidebar` |
| 1476 | `#sidebarCollapseBtn` |
| 1484 | `#sidebarCollapseBtn:hover` |
| 1485 | `#sidebarCollapseBtn.collapsed` |
| 1486 | `#app.sidebar-collapsed #sidebar` |
| 1490 | `@media (max-width: 1300px)` |
| 1496 | `@media (max-width: 1024px)` |
| 1504 | `@media (max-width: 768px)` |
| 1676 | `@media print` |

## Elementos com id
| Linha | id |
|---|---|
| 1720 | `#loginScreen` |
| 1723 | `#loginBtn` |
| 1724 | `#loginError` |
| 1725 | `#loginResetBtn` |
| 1728 | `#noAccessScreen` |
| 1730 | `#noAccessMsg` |
| 1731 | `#noAccessLogoutBtn` |
| 1734 | `#bootScreen` |
| 1736 | `#bootSpinner` |
| 1737 | `#bootStatusText` |
| 1737 | `#bootPasso` |
| 1737 | `#bootTempo` |
| 1738 | `#bootErro` |
| 1739 | `#bootErroMsg` |
| 1740 | `#bootErroAcoes` |
| 1741 | `#bootRetryBtn` |
| 1742 | `#bootLogoutBtn` |
| 1747 | `#temaPainel` |
| 1749 | `#temaOpcoes` |
| 1751 | `#temaIntensidade` |
| 1754 | `#temaIntValor` |
| 1755 | `#temaReset` |
| 1758 | `#mobileMenuBtn` |
| 1759 | `#sidebarOverlay` |
| 1760 | `#sidebarCollapseBtn` |
| 1764 | `#gravadorPainel` |
| 1765 | `#gravadorTarefa` |
| 1766 | `#gravadorTempo` |
| 1768 | `#gravadorPausar` |
| 1769 | `#gravadorParar` |
| 1772 | `#gravadorCancelar` |
| 1774 | `#gravadorMsg` |
| 1777 | `#app` |
| 1778 | `#sidebar` |
| 1779 | `#sidebarHeader` |
| 1780 | `#temaBtn` |
| 1781 | `#userBlock` |
| 1782 | `#userAvatarBtn` |
| 1783 | `#userAvatarInitial` |
| 1784 | `#userEmailShort` |
| 1787 | `#userMenu` |
| 1788 | `#adminBtn` |
| 1789 | `#logoutBtn` |
| 1793 | `#newPageBtn` |
| 1794 | `#pageTree` |
| 1795 | `#sidebarTaskStats` |
| 1796 | `#sidebarFooter` |
| 1797 | `#statusText` |
| 1801 | `#editor` |
| 1802 | `#emptyState` |
| 1804 | `#emptyCreateBtn` |
| 1806 | `#pageView` |
| 1809 | `#painelTopo` |
| 1810 | `#ptAvatar` |
| 1812 | `#ptSaudacao` |
| 1813 | `#ptNome` |
| 1815 | `#ptAtualizar` |
| 1817 | `#ptClima` |
| 1818 | `#ptIcone` |
| 1819 | `#ptTemp` |
| 1820 | `#ptLocal` |
| 1824 | `#ptData` |
| 1825 | `#ptHora` |
| 1828 | `#readOnlyBanner` |
| 1829 | `#pageTitle` |
| 1830 | `#notesView` |
| 1831 | `#blockList` |
| 1832 | `#addBlockBtn` |
| 1834 | `#tasksView` |
| 1835 | `#printFiltersSummary` |
| 1836 | `#filtrosToggleBtn` |
| 1838 | `#filtrosConta` |
| 1839 | `#filtrosSeta` |
| 1841 | `#taskToolbarRow` |
| 1842 | `#tableViewBtn` |
| 1843 | `#kanbanViewBtn` |
| 1844 | `#groupCompanyBtn` |
| 1847 | `#taskFilterTabs` |
| 1851 | `#dueStateFilterSelect` |
| 1862 | `#companyFilterSelect` |
| 1866 | `#assigneeFilterSelect` |
| 1870 | `#dueFilterWrap` |
| 1871 | `#dueFromFilter` |
| 1873 | `#dueToFilter` |
| 1878 | `#taskSearchInput` |
| 1880 | `#clearFiltersBtn` |
| 1881 | `#exportTasksBtn` |
| 1882 | `#printTasksBtn` |
| 1883 | `#importarResumosBtn` |
| 1887 | `#taskViewMenuWrap` |
| 1888 | `#taskViewMenuBtn` |
| 1889 | `#taskViewMenu` |
| 1891 | `#tvmBarra` |
| 1893 | `#tvmColunas` |
| 1894 | `#tvmRestaurar` |
| 1898 | `#taskStatusRow` |
| 1899 | `#addTaskBtn` |
| 1900 | `#taskTotalBadge` |
| 1901 | `#taskStatusPills` |
| 1903 | `#taskGroupBar` |
| 1905 | `#expandAllGroupsBtn` |
| 1906 | `#collapseAllGroupsBtn` |
| 1909 | `#groupSortSelect` |
| 1916 | `#taskTableWrap` |
| 1917 | `#taskTable` |
| 1919 | `#taskTableHeadRow` |
| 1921 | `#taskTableBody` |
| 1924 | `#taskKanban` |
| 1943 | `#apresentacaoView` |
| 1944 | `#calendarView` |
| 1945 | `#calendarHeader` |
| 1946 | `#calPrevBtn` |
| 1947 | `#calMonthLabel` |
| 1948 | `#calNextBtn` |
| 1950 | `#calendarWeekdays` |
| 1953 | `#calendarGrid` |
| 1955 | `#dashboardView` |
| 1956 | `#dashboardStats` |
| 1958 | `#dashboardUserStats` |
| 1960 | `#dashEmpresaBarra` |
| 1962 | `#dashEmpresaSel` |
| 1963 | `#dashEmpresaResumo` |
| 1965 | `#dashEmpresa` |
| 1967 | `#dashboardUpcomingTasks` |
| 1969 | `#dashboardUpcomingEvents` |
| 1975 | `#slashMenu` |
| 1976 | `#kindMenu` |
| 1977 | `#selectionToolbar` |
| 1978 | `#fmtBoldBtn` |
| 1979 | `#fmtItalicBtn` |
| 1980 | `#fmtUnderlineBtn` |
| 1981 | `#fmtStrikeBtn` |
| 1983 | `#fmtAlignLeftBtn` |
| 1984 | `#fmtAlignCenterBtn` |
| 1985 | `#fmtAlignRightBtn` |
| 1987 | `#fmtLinkBtn` |
| 1988 | `#fmtClearBtn` |
| 1991 | `#adminOverlay` |
| 1992 | `#adminPanel` |
| 1993 | `#adminCloseBtn` |
| 1998 | `#adminUserList` |
| 2001 | `#adminInviteForm` |
| 2002 | `#inviteEmail` |
| 2003 | `#inviteRole` |
| 2007 | `#inviteWhatsapp` |
| 2008 | `#inviteApiKey` |
| 2011 | `#copyInviteMsgBtn` |
| 2012 | `#adminNoteIcon` |
| 2013 | `#adminMsg` |
| 2021 | `#ownerContactForm` |
| 2022 | `#ownerWhatsapp` |
| 2023 | `#ownerApiKey` |
| 2026 | `#ownerContactMsg` |
| 2030 | `#senhaAcoesEstado` |
| 2031 | `#senhaAcoesForm` |
| 2032 | `#senhaAcoesNova` |
| 2033 | `#senhaAcoesRepete` |
| 2036 | `#senhaAcoesMsg` |
| 2040 | `#acoesSenhaLista` |
| 2041 | `#acoesSenhaMsg` |
| 2047 | `#backupBtn` |
| 2048 | `#backupMsg` |
| 2053 | `#adminColumnsMenu` |
| 2056 | `#ownerIdsBox` |
| 2057 | `#ownerDriveIdText` |
| 2058 | `#ownerFolderIdText` |
| 2063 | `#passwordOverlay` |
| 2064 | `#passwordModal` |
| 2065 | `#passwordModalTitle` |
| 2066 | `#passwordInput` |
| 2067 | `#passwordModalActions` |
| 2068 | `#passwordCancelBtn` |
| 2069 | `#passwordOkBtn` |
| 2074 | `#dlgOverlay` |
| 2075 | `#dlgModal` |
| 2076 | `#dlgTitulo` |
| 2077 | `#dlgTexto` |
| 2078 | `#dlgAcoes` |
| 2079 | `#dlgCancelar` |
| 2080 | `#dlgOk` |
| 2085 | `#resumoOverlay` |
| 2086 | `#resumoModal` |
| 2087 | `#resumoCloseBtn` |
| 2089 | `#resumoModalTaskTitle` |
| 2090 | `#resumoLeitura` |
| 2091 | `#resumoEditor` |
| 2092 | `#resumoModalHint` |
| 2093 | `#resumoModalActions` |
| 2094 | `#resumoDeleteBtn` |
| 2095 | `#resumoModalActionsRight` |
| 2096 | `#resumoEditBtn` |
| 2097 | `#resumoCancelBtn` |
| 2098 | `#resumoSaveBtn` |
| 2104 | `#noteOverlay` |
| 2105 | `#noteModal` |
| 2106 | `#noteCloseBtn` |
| 2108 | `#noteModalTaskTitle` |
| 2109 | `#noteToolbar` |
| 2110 | `#noteFmtBold` |
| 2111 | `#noteFmtItalic` |
| 2112 | `#noteFmtUnderline` |
| 2113 | `#noteFmtStrike` |
| 2115 | `#noteFmtUl` |
| 2116 | `#noteFmtOl` |
| 2118 | `#noteFmtLink` |
| 2119 | `#noteFmtClear` |
| 2121 | `#noteEditor` |
| 2122 | `#noteModalHint` |
| 2123 | `#noteModalActions` |
| 2124 | `#noteDeleteBtn` |
| 2125 | `#noteModalActionsRight` |
| 2126 | `#noteCancelBtn` |
| 2127 | `#noteSaveBtn` |
| 2133 | `#eventOverlay` |
| 2134 | `#eventModal` |
| 2135 | `#eventCloseBtn` |
| 2136 | `#eventModalTitle` |
| 2137 | `#eventId` |
| 2139 | `#eventDate` |
| 2141 | `#eventTime` |
| 2143 | `#eventTitleInput` |
| 2145 | `#eventDescInput` |
| 2146 | `#eventModalActions` |
| 2147 | `#eventDeleteBtn` |
| 2148 | `#eventSaveBtn` |
