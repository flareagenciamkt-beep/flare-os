---
tags: [termino]
aliases: [Role, admin, team, client]
fuente: lib/permissions.ts, supabase/migrations/008
actualizado: 2026-07-11
---

# Roles

Tres roles en el campo `role` de [[Profile]] (`ROLE_LABELS`):

- **`admin`** (Administrador) — todas las [[Permisos y capacidades|capabilities]]. Existe desde la migración 008; `is_team()` en RLS lo incluye.
- **`team`** (Equipo Flare) — opera el módulo agencia, sin `manageBilling`/`manageSettings`/`manageTeam`.
- **`client`** (Cliente) — solo el [[Portal de clientes]]; ninguna capability interna.

Equipo preset (`TEAM_MEMBERS` en mock): Juan, Sara, Andrés, Laura.

Los guards de ruteo redirigen según rol — ver [[Autenticación y guards]]. En [[Modo demo vs Supabase|modo demo]] el rol es `null` y todo está permitido.
