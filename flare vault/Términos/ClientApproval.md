---
tags: [termino]
aliases: [Aprobación de pieza]
fuente: lib/types.ts, supabase/migrations/002
actualizado: 2026-07-11
---

# ClientApproval

Estado de aprobación de una [[Idea]] **desde el portal**: `pendiente`, `aprobada`, `cambios_solicitados`.

- Se resetea a `pendiente` cada vez que la pieza entra a `en_revision_cliente` ([[IdeaStatus]]).
- Aprobar (RPC `approve_idea`) avanza la pieza a status `aprobada` y sella `approvedBy`/`approvedAt`.
- `cambios_solicitados` viene acompañado de `clientFeedback`.

Flujo completo en [[Aprobación del cliente]].
