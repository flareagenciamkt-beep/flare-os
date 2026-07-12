---
tags: [modulo]
fuente: components/layout/notifications.tsx
actualizado: 2026-07-11
---

# Notificaciones

Campana en la top-nav (`components/layout/notifications.tsx`). Combina dos fuentes:

1. [[Alertas operativas]] (`clientAlerts` de `lib/stats.ts`) de los clientes con [[ClientStatus]] `activo` → enlaza a `/clients/[id]` ([[Vista 360 del cliente]]).
2. Cobros [[PaymentStatus|vencidos]] de [[ClientBilling]] → enlaza a [[Facturación]].
