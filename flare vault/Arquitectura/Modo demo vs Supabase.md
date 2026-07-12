---
tags: [arquitectura]
fuente: lib/supabase.ts, lib/mock-data.ts
actualizado: 2026-07-12
---

# Modo demo vs Supabase

Flare OS corre en dos modos según haya credenciales de Supabase:

- **Demo/mock**: sin credenciales. Datos en memoria desde `lib/mock-data.ts`. Rol `null` → `can()` devuelve `true` (todo permitido). Sin persistencia.
- **Supabase**: persistencia real. `lib/supabase.ts` convierte camelCase (app) ↔ snake_case (DB) con `toRow()`/`fromRow()`. IDs son `text` (UUID) para compatibilidad con el seed. La seguridad real la impone **RLS** (ver [[Seguridad del portal]] y [[Roles]]); `is_team()` incluye a admin desde la migración 008.

Si el esquema no existe, el [[Store de agencia (useFlare)]] queda en estado `missing-schema`.

Historial de migraciones (contexto de versiones): V1 `schema.sql` → 002 portal+aprobaciones → 003 [[Vista 360 del cliente]] → 004 operación V1.2 → 006 simplificación de [[IdeaStatus]] a 7 estados → 007 [[IdeaComment|comentarios]]+registro de aprobación → 008 rol admin → 009 modales premium (campos estructurados en clients/ideas/tasks) → 010 [[ConnectedAccount|cuentas conectadas]] + tokens server-only → 011 [[IntegrationSettings|`integration_settings`]] (credenciales de integraciones server-only).

El proyecto está **vinculado al CLI de Supabase** (sesión 2026-07-11): se reparó el historial de migraciones (002–009 marcadas como aplicadas) y `supabase db push` quedó operativo; la 010 y la 011 ya están aplicadas en la base viva.

**Deploy** (`ab164c8`, cierre de la fase 7): el proyecto vive en **Vercel** (team `flareagenciamkt-beeps-projects`, dominio `flare-os.vercel.app`) con auto-deploy desde `main` de GitHub. `SUPABASE_SECRET_KEY` está configurada en Vercel (production + preview) y `.env.local` — es el **único secreto de bootstrap**: el resto de la configuración (credenciales de Meta) se hace desde la app en [[Ajustes]].
