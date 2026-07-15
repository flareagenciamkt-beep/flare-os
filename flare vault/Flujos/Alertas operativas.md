---
tags: [flujo]
aliases: [clientAlerts]
fuente: lib/stats.ts
actualizado: 2026-07-15
---

# Alertas operativas

`clientAlerts()` (`lib/stats.ts`) — capa transversal que cruza [[Client]] + [[Idea]] + [[Task]] + [[ClientMetric]] + [[ClientAccess]] para generar alertas por cliente **activo** ([[ClientStatus]]):

- Tareas atrasadas ([[TaskStatus]])
- Contenido sin fecha ([[Parrilla de publicación]])
- Piezas en revisión cliente hace +5 días ([[Aprobación del cliente]])
- Métricas del mes sin registrar ([[ClientMetric]])
- Accesos pendientes ([[ClientAccess]])

Consumidas por [[Notificaciones]] y la [[Vista 360 del cliente]] (la vista global Clientes → Progreso que también las mostraba se retiró en `92cf0ab`).
