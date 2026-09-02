---
description: Projeto-base iResult — finalidade e governança das diretrizes
alwaysApply: true
---

# Projeto-base iResult

Este repositório **não é um produto final**. Existe para ser a **estrutura base** de todos os sistemas da iResult (stack, shell, `x-ui`, permissões, UI/UX Mestre).

## Ao evoluir a base

- Prefira padrões reutilizáveis (componentes, tokens, layouts, seeds, convenções) em vez de soluções pontuais de um cliente.
- Preserve Laravel + Livewire + Blade + Tailwind + Spatie Permission + shell admin + `x-ui`.
- Mudanças aqui tendem a se propagar para os demais projetos.

## Atualização de diretrizes (obrigatório perguntar)

Ao **final** de uma alteração, se a mudança deve entrar nas diretrizes do projeto — por exemplo:

- `.cursor/rules/*`
- `docs/sistema-mestre-ui-ux-iresult.md`
- seções de padrões do `README.md`
- convenções de stack, UI, permissões ou estrutura de módulos

**não atualize sozinho.** Resuma o que mudou e **pergunte** se deve registrar/atualizar a diretriz correspondente. Só altere as diretrizes após confirmação explícita.
