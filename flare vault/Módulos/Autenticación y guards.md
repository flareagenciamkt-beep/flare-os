---
tags: [modulo]
aliases: [Auth, AuthGuard, PortalGuard]
fuente: components/layout/auth-guard.tsx, components/portal/portal-guard.tsx
actualizado: 2026-07-11
---

# Autenticación y guards

- **Login / reset**: `app/login/page.tsx`, `app/reset-password/page.tsx` (Supabase Auth).
- **AuthGuard** (`components/layout/auth-guard.tsx`) — envuelve `(app)`; si el [[Roles|rol]] es `client`, redirige a `/portal`.
- **PortalGuard** (`components/portal/portal-guard.tsx`) — envuelve `(portal)`; si el rol NO es `client`, redirige a `/clients/dashboard`.
- `app/page.tsx` → redirige a `/clients/dashboard`.
- [[Modo demo vs Supabase|Modo demo]]: sin Supabase → rol `null` → `can()` permite todo.
- Los [[Profile|profiles]] se crean con el trigger `handle_new_user`; usuarios del portal vía `app/api/portal-users/route.ts`.
