---
tags: [modulo]
aliases: [Ficha de cliente, clients/[id]]
fuente: app/(app)/clients/[id]/page.tsx, components/clients/
actualizado: 2026-07-12
---

# Vista 360 del cliente

Ficha completa por marca (`app/(app)/clients/[id]/page.tsx`) — **punto de convergencia de casi todas las entidades**. ⚠️ `params` es **Promise** (patrón del Next custom, ver [[Stack tecnológico]]).

| Pestaña | Entidad |
|---|---|
| resumen | [[Client]] |
| estrategia | [[ClientStrategy]] |
| produccion | [[Idea]] (piezas en curso) |
| calendario | [[Idea]] ([[Parrilla de publicación]]) |
| tareas | [[Task]] |
| metricas | [[ClientMetric]] |
| notas | [[ClientNote]] |
| recursos | [[Resource]] |
| accesos | [[ClientAccess]] + [[ConnectedAccount]] (sección "Cuentas de analytics", V1.4) |
| reuniones | [[ClientMeeting]] |
| facturacion | [[ClientBilling]] |

Componentes: `components/clients/{strategy,notes,access,meetings,billing,production,access-tab,portal-access-card,connected-accounts-section}.tsx`. Añadida en la migración 003 (V1.1).
