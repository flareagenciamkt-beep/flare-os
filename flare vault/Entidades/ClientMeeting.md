---
tags: [entidad]
aliases: [client_meetings, Reunión]
fuente: supabase/migrations/003
actualizado: 2026-07-11
---

# ClientMeeting

Reunión con el cliente (tabla `client_meetings`, FK→[[Client]] cascade).

Campos: `meetingDate`, `type`, `participants`, `topics`, `decisions`, `pendingItems`, `nextMeetingDate`.

- Una [[Task]] puede colgar de una reunión vía `Task.meetingId` (V1.2) — ver [[De reunión a tareas]].
- Nunca se expone al portal ([[Seguridad del portal]]).
- Pestaña "reuniones" de la [[Vista 360 del cliente]].
