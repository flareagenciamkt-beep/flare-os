---
tags: [arquitectura]
fuente: lib/portal-store.tsx
actualizado: 2026-07-11
---

# Store del portal (`usePortal`)

Store del [[Portal de clientes]] (`lib/portal-store.tsx`, `PortalProvider`, hook `usePortal()`).

**No accede a tablas base.** Solo llama RPCs `security definer` de Supabase:

| RPC | Qué devuelve/hace |
|---|---|
| `portal_client` | El [[PortalClient]] del usuario (subconjunto seguro de [[Client]]) |
| `portal_ideas` | Piezas visibles para el cliente |
| `portal_metrics` | [[ClientMetric]] sin `performance_notes` |
| `portal_comments` / `portal_add_comment` | Hilo de [[IdeaComment]] bidireccional |
| `approve_idea` | [[Aprobación del cliente]] de una pieza |

Todas filtran por `current_client_id()`. Ver [[Seguridad del portal]] para qué campos nunca se exponen.
