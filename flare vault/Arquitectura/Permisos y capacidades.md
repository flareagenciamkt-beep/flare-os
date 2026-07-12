---
tags: [arquitectura, termino]
fuente: lib/permissions.ts
actualizado: 2026-07-11
---

# Permisos y capacidades

`lib/permissions.ts` define las **Capabilities** y la función `can(role, capability)`.

Capabilities: `viewAgency`, `manageContent`, `approveInternally`, `manageClients`, `viewBilling`, `manageBilling`, `managePortalAccess`, `manageSettings`, `manageTeam`.

Matriz por [[Roles|rol]]:
- **admin** — todas.
- **team** — todas menos `manageBilling`, `manageSettings`, `manageTeam`.
- **client** — ninguna (solo opera el [[Portal de clientes]]).
- **rol `null`** ([[Modo demo vs Supabase|modo demo]]) — `can()` devuelve `true` para todo.

⚠️ `can()` es UX, no seguridad: la seguridad real la impone RLS en Supabase (ver [[Seguridad del portal]]).

Gates visibles: [[Facturación]] requiere `viewBilling`; [[Ajustes]] requiere `manageSettings`; la aprobación interna de una [[Idea]] requiere `approveInternally`.
