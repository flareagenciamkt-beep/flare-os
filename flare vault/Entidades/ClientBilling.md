---
tags: [entidad]
aliases: [client_billing, Cobro]
fuente: supabase/migrations/003
actualizado: 2026-07-11
---

# ClientBilling

Cobro mensual por cliente (tabla `client_billing`, FK→[[Client]] cascade). **Un registro por período.**

Campos: `monthlyFee`, `currency` (`USD | COP | EUR | MXN`), `paymentStatus` ([[PaymentStatus]]), `billingDate`, `includedServices`, `observations`.

- `paymentStatus: vencido` genera una [[Notificaciones|notificación]].
- Gestionado en [[Facturación]] (capability `viewBilling`, ver [[Permisos y capacidades]]) y en la pestaña "facturacion" de la [[Vista 360 del cliente]].
- Nunca se expone al portal ([[Seguridad del portal]]).
