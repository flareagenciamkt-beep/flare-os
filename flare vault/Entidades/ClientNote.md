---
tags: [entidad]
aliases: [client_notes, Nota de cliente]
fuente: supabase/migrations/003
actualizado: 2026-07-15
---

# ClientNote

Nota por cliente (tabla `client_notes`, FK→[[Client]] cascade).

Campos: `title`, `content`, `type` (`NoteType`: general, reunion, feedback, problema, decision, recordatorio, estrategia), `isPinned`, `responsible`, `relatedEntityType`, `relatedEntityId` (referencia polimórfica opcional a otra entidad).

Vive en la pestaña "notas" de la [[Vista 360 del cliente]] — su único lugar desde `92cf0ab`: la vista global Clientes → Notas (`clients/notes`) se retiró en el recorte de módulos.
