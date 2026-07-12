---
tags: [modulo]
aliases: [Billing, clients/billing]
fuente: app/(app)/clients/billing/page.tsx, components/clients/billing-tab.tsx
actualizado: 2026-07-11
---

# Facturación

Cobros mensuales por cliente ([[ClientBilling]]) — `app/(app)/clients/billing/page.tsx` + `components/clients/billing-tab.tsx`.

- **Gateado por la capability `viewBilling`** ([[Permisos y capacidades]]): `team` puede ver, solo `admin` gestiona (`manageBilling`).
- Multi-moneda: USD, COP, EUR, MXN.
- Los cobros [[PaymentStatus|vencidos]] aparecen en [[Notificaciones]].
- Nada de esto llega al portal ([[Seguridad del portal]]).
