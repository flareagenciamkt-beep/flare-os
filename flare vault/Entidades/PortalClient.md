---
tags: [entidad]
aliases: [portal_client]
fuente: lib/portal-store.tsx
actualizado: 2026-07-11
---

# PortalClient

Subconjunto **seguro** de [[Client]] expuesto al [[Portal de clientes]] — espejo TypeScript del RPC `portal_client`.

Campos: `id`, `name`, `brand`, `industry`, `status`, `currentPhase`, `progressPercentage`, `mainGoal`, `monthlyGoal`, `contentGoal`.

Todo lo demás (fee, notas internas, accesos, reuniones, facturación) queda fuera por diseño — ver [[Seguridad del portal]].
