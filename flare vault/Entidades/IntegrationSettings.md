---
tags: [entidad]
aliases: [integration_settings, Credenciales de integraciones]
fuente: supabase/migrations/011_integration_settings.sql, app/api/integrations/meta/shared.ts
actualizado: 2026-07-12
---

# IntegrationSettings

Tabla `integration_settings` (migración 011, `ab164c8`): guarda las **credenciales de integraciones configuradas desde la app** — el admin las pega en [[Ajustes|Ajustes → Integraciones]] en vez de editar `.env`/Vercel. Hoy solo existe la fila `meta`; el diseño admite futuras (`google`, ...).

Campos: `id` (text PK, nombre de la integración), `settings` (jsonb — para Meta: `appId` y `appSecret`), `updated_by` (id del admin que guardó), `updated_at`.

- **Server-only por diseño**: RLS habilitado **sin policies** (mismo patrón que `connected_account_tokens` de [[ConnectedAccount]]) — solo los route handlers con `SUPABASE_SECRET_KEY` la leen/escriben; el navegador jamás ve los secretos, la UI solo recibe estados y el App ID enmascarado.
- **No es una entidad del cliente**: no existe en `lib/types.ts` ni en el [[Store de agencia (useFlare)|store]]; vive únicamente en el servidor.
- La lee `getMetaConfig(admin)` (`app/api/integrations/meta/shared.ts`) con fallback a las env vars `META_APP_ID`/`META_APP_SECRET`; la escribe `POST /api/integrations/meta/credentials` (solo `admin`, ver [[Conexión OAuth de Meta]]).
- Migración **ya aplicada en producción** vía CLI de Supabase (ver [[Modo demo vs Supabase]]).
