---
tags: [flujo]
aliases: [Flujo de contenido]
fuente: lib/store.tsx, supabase/migrations/002, supabase/migrations/006
actualizado: 2026-07-11
---

# Ciclo de vida de una pieza

**El flujo estrella de Flare OS** — una [[Idea]] cruzando módulos de punta a punta:

```
[[Contenido]] (crear pieza)
  → Kanban: en_produccion → en_revision_interna
  → aprobación interna del equipo (store.approveIdea, capability approveInternally)
  → en_revision_cliente ──► [[Portal de clientes]] (portal_ideas / idea-dialog)
       cliente aprueba o pide cambios (RPC approve_idea → [[ClientApproval]])
  → aprobada → programada ([[Parrilla de publicación]]) → publicada
  → cuenta en publishedThisMonth → alimenta [[Métricas]] y los dashboards
```

Estados en [[IdeaStatus]]. Invariante clave: `store.moveIdea` (agencia) y el RPC `approve_idea` (portal) mantienen la **misma lógica** — entrar a revisión cliente resetea la aprobación; aprobar avanza a `aprobada` y sella `approvedBy`/`approvedAt`. Detalle en [[Aprobación del cliente]].
