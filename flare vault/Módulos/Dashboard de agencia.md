---
tags: [modulo]
fuente: app/(app)/agency/dashboard/page.tsx, components/dashboard/
actualizado: 2026-07-11
---

# Dashboard de agencia

KPIs operativos de contenido: ideas activas ([[IdeaStatus]]), en producción, esperando cliente, `publishedThisMonth`, y barras por día de semana (`ideasPerWeekday` — ver [[Parrilla de publicación]]).

Componentes en `components/dashboard/`: `bento-card`, `ring-stat`, `week-bars`, `week-timeline`, `big-counter`, `segmented-bar`, `task-checklist`, `welcome-header`.

Se alimenta de la capa transversal `lib/stats.ts` ([[Alertas operativas]], [[Progreso operativo]]).
