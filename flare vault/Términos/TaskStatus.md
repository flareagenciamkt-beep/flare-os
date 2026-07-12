---
tags: [termino]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# TaskStatus

Estados de una [[Task]]: `pendiente`, `en_progreso`, `bloqueada`, `en_revision`, `completada`.

- **"Abierta"** = cualquier estado ≠ `completada`.
- **"Atrasada"** = `dueDate` en el pasado y no completada (`isTaskOverdue` en `lib/stats.ts`) → dispara [[Alertas operativas]].
