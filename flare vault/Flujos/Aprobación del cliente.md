---
tags: [flujo]
fuente: supabase/migrations/002, supabase/migrations/007, lib/portal-store.tsx
actualizado: 2026-07-11
---

# Aprobación del cliente

Flujo de revisión externa de una [[Idea]] dentro del [[Ciclo de vida de una pieza]]:

1. La agencia mueve la pieza a `en_revision_cliente` ([[IdeaStatus]]) → el trigger `reset_idea_approval` (y su réplica en `store.moveIdea`) resetea [[ClientApproval]] a `pendiente`.
2. El cliente la ve en el [[Portal de clientes]] (`idea-dialog`) y puede:
   - **Aprobar** → RPC `approve_idea`: `clientApproval = aprobada`, la pieza avanza a status `aprobada`, se sellan `approvedBy`/`approvedAt`.
   - **Pedir cambios** → `clientApproval = cambios_solicitados` + `clientFeedback`.
3. La conversación sigue por [[IdeaComment]] (bidireccional, migración 007).
4. "Piezas en revisión cliente +5 días" dispara una [[Alertas operativas|alerta]].

La aprobación **interna** (equipo) es distinta: `store.approveIdea` con capability `approveInternally` ([[Permisos y capacidades]]), en el paso `en_revision_interna`.
