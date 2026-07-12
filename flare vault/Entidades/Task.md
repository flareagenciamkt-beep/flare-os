---
tags: [entidad]
aliases: [Tarea, tasks]
fuente: lib/types.ts, supabase/schema.sql
actualizado: 2026-07-11
---

# Task

Tarea del equipo (tabla `tasks`), gestionada en el módulo [[Tareas]].

Campos: `clientId` (nullable FK→[[Client]]), `ideaId` (nullable FK→[[Idea]]), `meetingId?` (nullable FK→[[ClientMeeting]], V1.2 — ver [[De reunión a tareas]]), `taskType?`, `title`, `description`, `status` ([[TaskStatus]]), `priority` ([[Prioridad]]), `responsible`, `dueDate`, `area` ([[TaskArea]]), `notes`, `relatedLink`, `checklist?` (`TaskChecklistItem[]`: `id/text/done`).

- Puede colgar a la vez de un cliente, una pieza y/o una reunión.
- "Abierta" = status ≠ `completada`; "atrasada" = `dueDate` pasado sin completar (`isTaskOverdue` en `lib/stats.ts`) → alimenta [[Alertas operativas]].
- `clientId: null` → [[Recurso interno]].
