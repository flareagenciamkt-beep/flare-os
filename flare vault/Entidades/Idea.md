---
tags: [entidad]
aliases: [Pieza, ideas, Pieza de contenido]
fuente: lib/types.ts, supabase/schema.sql
actualizado: 2026-07-11
---

# Idea

La **"pieza" de contenido** (tabla `ideas`) — unidad de trabajo del módulo [[Contenido]] y protagonista del [[Ciclo de vida de una pieza]].

Campos: `clientId` (nullable FK→[[Client]], ver [[Recurso interno]]), `title`, `description`, `category` (IdeaCategory), `ideaType?`, `status` ([[IdeaStatus]]), `priority` ([[Prioridad]]), `format` y `channel` ([[Canales y formatos]]), `suggestedDate`, `publishDate`, `responsible`, `notes`, `prompt`, `references`.

Producción (V1.2): `copy`, `script`, `designNotes`, `externalUrl`, `coverImage`, `images[]` (galería/carrusel).

Aprobación del cliente: `clientApproval` ([[ClientApproval]]), `clientFeedback`, `clientApprovalAt`, `approvedBy`, `approvedAt`. Ver [[Aprobación del cliente]].

## Relaciones
- N:1 → [[Client]] (nullable)
- 1:N → [[Task]] (`Task.ideaId`, set null) y [[IdeaComment]] (cascade)

Fecha efectiva en calendario/feed: `publishDate ?? suggestedDate` — ver [[Parrilla de publicación]]. Los campos `notes`, `prompt` y `references` **nunca se exponen al portal** ([[Seguridad del portal]]).
