---
tags: [entidad]
aliases: [profiles, Perfil]
fuente: lib/profile.ts, supabase/schema.sql
actualizado: 2026-07-11
---

# Profile

Perfil de usuario (tabla `profiles`, PK = `auth.users.id`, cascade).

Campos: `name`, `email`, `role` ([[Roles]]: `admin | team | client`), `clientId` (FK→[[Client]], nullable, set null) — vincula un usuario `client` a su marca.

- Se crea por el trigger `handle_new_user`: los usuarios nuevos entran como `client` **sin vínculo** a marca.
- Helper: `getOwnProfile()` en `lib/profile.ts`.
- El `clientId` del profile es lo que `current_client_id()` usa para filtrar los RPCs del portal ([[Seguridad del portal]]).
- Usuarios del portal se crean vía `app/api/portal-users/route.ts`.
