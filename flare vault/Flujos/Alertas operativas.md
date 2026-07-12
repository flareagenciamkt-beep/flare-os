---
tags: [flujo]
aliases: [clientAlerts]
fuente: lib/stats.ts
actualizado: 2026-07-11
---

# Alertas operativas

`clientAlerts()` (`lib/stats.ts`) — capa transversal que cruza [[Client]] + [[Idea]] + [[Task]] + [[ClientMetric]] + [[ClientAccess]] para generar alertas por cliente **activo** ([[ClientStatus]]):

- Tareas atrasadas ([[TaskStatus]])
- Contenido sin fecha ([[Parrilla de publicación]])
- Piezas en revisión cliente hace +5 días ([[Aprobación del cliente]])
- Métricas del mes sin registrar ([[ClientMetric]])
- Accesos pendientes ([[ClientAccess]])

Consumidas por [[Notificaciones]], la vista Progreso del [[Directorio de clientes]] y la [[Vista 360 del cliente]].
