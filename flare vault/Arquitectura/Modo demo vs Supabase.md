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

Historial de migraciones (contexto de versiones): V1 `schema.sql` → 002 portal+aprobaciones → 003 [[Vista 360 del cliente]] → 004 operación V1.2 → 006 simplificación de [[IdeaStatus]] a 7 estados → 007 [[IdeaComment|comentarios]]+registro de aprobación → 008 rol admin → 009 modales premium (campos estructurados en clients/ideas/tasks) → 010 [[ConnectedAccount|cuentas conectadas]] + tokens server-only.

El proyecto está **vinculado al CLI de Supabase** (sesión 2026-07-11): se reparó el historial de migraciones (002–009 marcadas como aplicadas) y `supabase db push` quedó operativo; la 010 ya está aplicada en la base viva.
