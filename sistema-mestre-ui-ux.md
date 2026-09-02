---
description: Sistema Mestre de UI/UX da iResult — padrão obrigatório de interface
alwaysApply: true
---

# Sistema Mestre de UI/UX (obrigatório)

Fonte oficial: `docs/sistema-mestre-ui-ux-iresult.md` (v1.1)

Antes de criar ou alterar telas, layouts ou componentes visuais, leia esse documento e trate-o como padrão obrigatório.

## Este produto

- Laravel 12 + Livewire 3 + Blade + Tailwind
- Tema **claro** apenas; identidade **preto/branco**; referência **Google Antigravity** (Manager + Settings), sem copiar marca
- Tokens em `resources/css/app.css`: canvas/surface `#F2F2F2`, subtle `#ECECEC`, muted `#E3E3E3`, bordas `#D6D6D6` / `#C2C2C2` — sem branco puro
- Tipografia base administrativa: **13/20 px** (`text-sm` no Tailwind + `--font-size-body`); títulos usam escalas maiores
- UI via `resources/views/components/ui` (`x-ui.*`) e shell `layouts/admin`
- Permissões Spatie (`app/Support/Permissions.php`) na UI e no servidor

## Shell da base

- Sidebar silenciosa (Manager): marca + nav + conta; **sem** botão primário preto “Iniciar” e **sem** campo buscar no menu
- Topbar mínima (mobile + avatar)
- **Home** (`/dashboard`): saudação, `x-ui.composer` stub (~52 px, raio 24–28), atalhos; largura ~800 px — home admin, **não** chat-first
- **Settings** (`/configuracoes`): painel central, nav ~220 px + conteúdo, X no canto superior direito para fechar
- CRUDs: listagem operacional em `max-w-listing` — não forçar layout de agent/chat
- Compositor stub: navega módulos por texto ou avisa “Assistente em breve”; sem IA real nesta base

## Regras não negociáveis

- Uma intenção dominante e uma ação primária por região
- Interface silenciosa: tipografia/espaçamento antes de cards, bordas e sombras
- Revelação progressiva; preservar busca, filtros, página e seleção nas listagens
- Estados: loading, vazio, vazio-após-filtro, erro, sucesso, permissão
- Confirmações com verbo e impacto (nunca só “Tem certeza?”)
- Não inventar regras de negócio; mudanças de fluxo pedem aprovação
- Reutilizar `x-ui.*`; não criar variações visuais sem necessidade
- Modais e painéis flutuantes: X de fechar sempre no canto superior direito, sem caixa/borda/fundo fixo, com respiro no cabeçalho para o título não encostar no botão
- Evitar ERP antigo, Bootstrap genérico ou excesso de cards
- Não copiar marca/logo/textos/ícones do Antigravity, Google, ChatGPT ou OpenAI

## Ao entregar UI

Validar o checklist do documento e registrar exceções justificadas.
