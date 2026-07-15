---
tags: [arquitectura]
actualizado: 2026-07-15
---

# Estructura del proyecto

- `app/(app)/…` — módulo interno (agencia + clientes + settings). Layout: `AuthGuard > RoleProvider > FlareStoreProvider > AppShell` (`app/(app)/layout.tsx`).
- `app/(portal)/portal/…` — [[Portal de clientes]]. Layout: `PortalGuard > PortalProvider > PortalShell`.
- `app/api/` — route handlers server-side: `portal-users` (crea usuarios del portal con `SUPABASE_SECRET_KEY`) e `integrations/meta/{connect,callback,sync,credentials}` ([[Conexión OAuth de Meta]]).
- `app/login/`, `app/reset-password/`, `app/page.tsx` (redirige a `/clients/dashboard`).
- `lib/` — dominio: `types.ts` (**fuente de verdad de tipos y labels**), `store.tsx` ([[Store de agencia (useFlare)]]), `portal-store.tsx` ([[Store del portal (usePortal)]]), `supabase.ts` (conversión `toRow`/`fromRow` camelCase↔snake_case), `permissions.ts` ([[Permisos y capacidades]]), `stats.ts` ([[Alertas operativas]], [[Progreso operativo]]), `mock-data.ts`, `schemas.ts`, `form-options.ts`, `profile.ts`, `dates.ts`, `storage.ts`, `images.ts`, `import-grid.ts`.
- `components/` — por dominio: `clients/`, `ideas/`, `tasks/`, `metrics/`, `portal/`, `dashboard/`, `settings/`, `forms/`, `layout/`, `shared/`, `ui/` (`library/` desapareció con el recorte `92cf0ab`).
- `supabase/` — `schema.sql` (V1), `seed.sql`, `migrations/002…011`.
- `flare vault/` — este vault de Obsidian.

**Convención clave**: [[Idea]] y [[Task]] tienen `clientId` opcional — `null` significa [[Recurso interno]] de Flare (`lib/types.ts:1-3`). Hasta `92cf0ab` también aplicaba a `Resource`/`Prompt`/`Process`, retirados de la app.

Navegación: `components/layout/nav-config.ts` (`NAV_TABS`, tab activa por prefijo más largo).
