---
tags: [termino]
aliases: [Estado de pago]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# PaymentStatus

Estado de pago de un [[ClientBilling]]: `pendiente`, `pagado`, `vencido`, `parcial`.

`vencido` genera una [[Notificaciones|notificación]] con enlace a [[Facturación]].

Monedas soportadas (`CURRENCY_OPTIONS`): `USD`, `COP`, `EUR`, `MXN`.
