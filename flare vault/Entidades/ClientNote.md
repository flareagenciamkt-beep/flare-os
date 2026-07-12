---
tags: [entidad]
aliases: [client_notes, Nota de cliente]
fuente: supabase/migrations/003
actualizado: 2026-07-11
---

# ClientNote

Nota por cliente (tabla `client_notes`, FK→[[Client]] cascade).

Campos: `title`, `content`, `type` (`NoteType`: general, reunion, feedback, problema, decision, recordatorio, estrategia), `isPinned`, `responsible`, `relatedEntityType`, `relatedEntityId` (referencia polimórfica opcional a otra entidad).

Vive en la pestaña "notas" de la [[Vista 360 del cliente]] y en la vista cross-cliente [[Directorio de clientes|Clientes → Notas]] (`app/(app)/clients/notes/page.tsx`).
