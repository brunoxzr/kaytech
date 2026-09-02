# Como replicar esta landing page em outro projeto

Resumo do que foi construído no projeto KayTech, para servir de roteiro em um novo projeto/chat.

## Stack

- Laravel + Inertia.js + React (TypeScript)
- Tailwind CSS v4
- Framer Motion (animações de scroll-reveal)
- lucide-react (ícones — cuidado: versões recentes removeram ícones de marca como Instagram/Github/Twitter; usar ícones genéricos ou outra lib se precisar de logos de rede social)

## 1. Hero cinematográfico controlado por scroll

A peça central: em vez de vídeo `<video>` com `currentTime` (trava em navegadores/mobile), usa **sequência de frames como imagens**, desenhadas em `<canvas>`.

**Passo a passo:**
1. Extrair um vídeo de produto/marca em frames JPG a 30fps com `ffmpeg`:
   ```
   ffmpeg -i video.mp4 -vf "fps=30" -q:v 4 frames/frame-%04d.jpg
   ```
   Gerar uma versão desktop (16:9) e outra mobile (9:16), cada uma com seus próprios frames.
2. Hook `useScrollFrames`: pré-carrega todas as imagens como `new Image()`, escuta scroll, calcula a proporção de scroll dentro de um container alto (`h-[700vh]` — quanto maior, mais lento/suave o avanço), e faz um loop `requestAnimationFrame` contínuo que interpola (lerp) entre o frame exibido e o frame-alvo, para movimento fluido em vez de saltos.
3. Desenho no canvas: como CSS `object-fit` **não funciona em `<canvas>`**, é preciso calcular manualmente o "cover fit" (ou "contain fit") — escalar a imagem pra preencher/caber no box, centralizado, e dimensionar o canvas em pixels reais usando `devicePixelRatio`.
4. Container: `<div style="height: 700vh"><div class="sticky top-0 h-screen">...canvas...</div></div>` — **cuidado**: nenhum ancestral pode ter `overflow` diferente de `visible` (nem `overflow-x-hidden`), ou o `position: sticky` quebra silenciosamente.
5. Estado de loading: fundo preto + logo centralizada com fade-out, exibido até todos os frames carregarem.
6. Ao final do scroll (progress ~90-100%), um overlay de texto (título, CTA) aparece com fade sobreposto ao frame final escurecido — só depois disso libera o scroll normal pro resto da página (via um callback `onVideoEndChange` que controla a visibilidade da navbar/conteúdo abaixo).
7. Sempre trocar de frames-desktop pra frames-mobile baseado em `matchMedia('(min-width: 768px)')`, com uma `variantKey` no hook para forçar reload ao cruzar o breakpoint.

## 2. Direção de arte (evitar "cara de template de IA")

Decisões que tiram a aparência genérica:
- **Tipografia com personalidade**: trocar a fonte de sistema padrão por uma combinação de duas fontes via Google Fonts — uma geométrica/forte para títulos (ex: Space Grotesk) e uma neutra para corpo de texto (ex: Inter).
- **Cor de marca como acento raro**, não em tudo: preto/branco dominante, a cor de marca (ex: roxo) aparece só em detalhes pontuais (link ativo, sublinhado, bolinha separadora), não em pills, glows e botões por toda a página.
- **Sem os clichês**: nada de "eyebrow pill com ícone + glow blur atrás do título", nada de cards uniformes com `bg-white/5 border-white/10` repetidos em toda seção, nada de mockup fake de dashboard/terminal genérico.
- **Composição assimétrica por seção**: cada seção tem um layout diferente — numerais grandes tipográficos, listas divididas por `divide-y` em vez de grid de cards, imagem grande alternando lado esquerdo/direito por índice par/ímpar nos "cases", carrossel infinito de logos sem caixas/bordas.
- **Microinterações discretas com Framer Motion**: fade + translateY pequeno (`opacity: 0, y: 20` → `opacity: 1, y: 0`) disparado por `whileInView`, sem exageros de escala/zoom/voar.
- Botão primário: fundo branco sólido, texto preto, `rounded-full`, leve `scale` no hover — mais distinto que botão roxo genérico.

## 3. Estrutura de seções (ordem típica)

1. Hero (frames de scroll) + texto overlay no final
2. Navbar (aparece só depois do hero terminar)
3. Marquee infinito de logos de clientes/parceiros (sem caixas)
4. Seção "diagnóstico"/problema — numerais grandes, lista editorial
5. Cases/portfólio — composição editorial (não grid 3 colunas), OU carrossel infinito se o volume for maior
6. Produtos próprios (se houver) — mesmo padrão editorial dos cases
7. Processo de trabalho — timeline horizontal com linha conectora
8. Serviços — lista interativa (clique expande descrição), não 8 cards fixos
9. Diferenciais — lista numerada com ícone, não grid uniforme
10. Seção "fundador"/sobre — foto + bio, sem card com glow
11. Stack de tecnologias — tabs por categoria
12. Contato — direto (WhatsApp/CTA único), sem formulário longo se o objetivo é conversão rápida
13. Footer — título grande de encerramento + colunas de links, sem cards

## 4. Admin (se o projeto tiver painel)

- CRUD simples por recurso: `Controller` com `index/store/update/destroy`, validação inline (`$request->validate([...])`), sem FormRequest separado para telas internas.
- Model-per-recurso com `$fillable` e `$casts` básicos.
- Frontend: modal client-side com `useForm` do Inertia, grid de cards com editar/excluir.
- **Upload de imagem real** (não campo de texto com caminho): endpoint genérico `POST /admin/upload` que recebe `multipart/form-data`, salva com `Storage::disk('public')->putFile()` (rodar `php artisan storage:link` uma vez), retorna a URL pública; componente React reutilizável de dropzone/preview que chama esse endpoint via `fetch` com `FormData`.
- Se quiser sidebar customizável (recolher, cor de destaque, dark/light, densidade): usar um React Context que persiste em `localStorage`, aplica CSS custom properties (`--accent-color` etc.) e classes (`dark`, `ui-skin-bordered`) no `<html>`, mantendo tudo prefixado (ex: `admin-*`) para não vazar estilo pro site público.

## 5. Cuidados técnicos que já causaram bugs nesta sessão

- `import * as Icons from 'lucide-react'` incha o bundle (600KB+) — sempre importar só os ícones usados, nomeados.
- Confirmar quais ícones existem na versão instalada da lib antes de usar (versões recentes do lucide-react removeram ícones de marca/logo).
- `overflow-x-hidden` em qualquer ancestral quebra `position: sticky` — isolar essa proteção pra um elemento mais interno (ex: `<main>`), não na raiz que contém o hero sticky.
- Canvas não respeita CSS `object-fit` — sempre calcular contain/cover manualmente.
- Ao trocar entre variantes de dados que têm o mesmo "tamanho" (ex: mesmo número de frames desktop/mobile), não confiar só em `frameCount` como dependência de `useEffect` — usar uma chave explícita (`variantKey`) pra garantir que o efeito recarregue.
