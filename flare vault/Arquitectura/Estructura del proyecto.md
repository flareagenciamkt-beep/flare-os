---
tags: [arquitectura]
actualizado: 2026-07-11
---

# Estructura del proyecto

- `app/(app)/…` — módulo interno (agencia + clientes + settings). Layout: `AuthGuard > RoleProvider > FlareStoreProvider > AppShell` (`app/(app)/layout.tsx`).
- `app/(portal)/portal/…` — [[Portal de clientes]]. Layout: `PortalGuard > PortalProvider > PortalShell`.
- `app/api/portal-users/route.ts` — único route handler server-side (crea usuarios del portal con `SUPABASE_SECRET_KEY`).
- `app/login/`, `app/reset-password/`, `app/page.tsx` (redirige a `/clients/dashboard`).
- `lib/` — dominio: `types.ts` (**fuente de verdad de tipos y labels**), `store.tsx` ([[Store de agencia (useFlare)]]), `portal-store.tsx` ([[Store del portal (usePortal)]]), `supabase.ts` (conversión `toRow`/`fromRow` camelCase↔snake_case), `permissions.ts` ([[Permisos y capacidades]]), `stats.ts` ([[Alertas operativas]], [[Progreso operativo]]), `mock-data.ts`, `schemas.ts`, `form-options.ts`, `profile.ts`, `dates.ts`, `storage.ts`, `images.ts`, `import-grid.ts`.
- `components/` — por dominio: `clients/`, `ideas/`, `tasks/`, `metrics/`, `library/`, `portal/`, `dashboard/`, `forms/`, `layout/`, `shared/`, `ui/`.
- `supabase/` — `schema.sql` (V1), `seed.sql`, `migrations/002…009`.
- `flare vault/` — este vault de Obsidian.

**Convención clave**: [[Idea]], [[Task]], [[Resource]], [[Prompt]] y [[Process]] tienen `clientId` opcional — `null` significa [[Recurso interno]] de Flare (`lib/types.ts:1-3`).

Navegación: `components/layout/nav-config.ts` (`NAV_TABS`, tab activa por prefijo más largo).
