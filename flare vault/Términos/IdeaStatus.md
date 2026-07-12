---
tags: [termino]
aliases: [Estados de pieza, KANBAN_COLUMNS]
fuente: lib/types.ts, supabase/migrations/006
actualizado: 2026-07-11
---

# IdeaStatus

**El flujo de producción de contenido** — 7 estados de una [[Idea]] (columnas del Kanban, `KANBAN_COLUMNS`; la migración 006 los simplificó):

`idea` → `en_produccion` → `en_revision_interna` → `en_revision_cliente` → `aprobada` → `programada` → `publicada`

- **"Activas"** = todas menos `publicada` (`ACTIVE_IDEA_STATUSES` en `lib/stats.ts`).
- Legacy remapeados: `validada`, `pausada`, `archivada` → `idea`.
- Al entrar a `en_revision_cliente`, la [[ClientApproval]] se resetea a `pendiente` (trigger `reset_idea_approval` + `store.moveIdea`).
- `aprobada`/`programada`/`publicada` alimentan el [[Progreso operativo|portalProgress]] que ve el cliente.

Ver el flujo completo en [[Ciclo de vida de una pieza]].
