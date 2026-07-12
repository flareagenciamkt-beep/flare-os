---
tags: [flujo]
fuente: supabase/migrations/004
actualizado: 2026-07-11
---

# De reunión a tareas

Flujo V1.2: los `pendingItems` y `decisions` de una [[ClientMeeting]] se convierten en [[Task|tareas]] vinculadas vía `Task.meetingId` (FK nullable, set null).

Así una tarea puede rastrearse hasta la reunión donde se acordó, además de su [[Client]] y/o su [[Idea]]. Se opera desde la pestaña "reuniones" de la [[Vista 360 del cliente]] y el módulo [[Tareas]].
