---
tags: [modulo]
aliases: [agency/content, Ideas]
fuente: app/(app)/agency/content/page.tsx, components/ideas/
actualizado: 2026-07-11
---

# Contenido

Módulo unificado de [[Idea|piezas]] con **4 vistas intercambiables** vía `?view=`: **Lista, Kanban, Calendario, Feed** (`app/(app)/agency/content/page.tsx`).

Componentes: `components/ideas/{ideas-table,kanban-board,calendar-view,feed-view,idea-card,idea-filters,feed-preview}.tsx`.

- El Kanban usa las 7 columnas de [[IdeaStatus]].
- Calendario/Feed = [[Parrilla de publicación]].
- Rutas legacy que redirigen aquí: `/agency/ideas`, `/feed`, `/kanban`, `/calendar` → `/agency/content?view=…`.

Es el punto de partida del [[Ciclo de vida de una pieza]].
