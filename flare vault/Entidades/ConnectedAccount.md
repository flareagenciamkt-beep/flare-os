---
tags: [entidad]
aliases: [connected_accounts, Cuenta conectada, Cuentas de analytics]
fuente: lib/types.ts, supabase/migrations/010_connected_accounts.sql
actualizado: 2026-07-12
---

# ConnectedAccount

Cuenta de una plataforma (Instagram, TikTok…) asociada a un [[Client]] para **atribuir sus métricas**: identifica *la cuenta que se mide* (tabla `connected_accounts`, FK→[[Client]] cascade, migración 010, V1.4).

**No confundir con [[ClientAccess]]**: aquel es el checklist de accesos/credenciales; esto es la cuenta cuyas [[ClientMetric|métricas]] se registran (y eventualmente se sincronizan).

Campos: `provider` (`ConnectedProvider`: `instagram | facebook | tiktok | youtube | linkedin | meta_ads | google_analytics | otro`), `handle` (@usuario o nombre), `url`, `externalId` (id en la plataforma, lo llena el OAuth), `status`, `syncEnabled`, `connectedAt`, `lastSyncAt`, `notes`.

**Estados** (`ConnectedAccountStatus`):

| Estado | Significado |
|---|---|
| `asociada` | registrada a mano, sin conexión API (modo por defecto) |
| `conectada` | OAuth activo, lista para sync |
| `expirada` | token vencido, requiere reconexión |
| `error` | el último sync/OAuth falló |
| `desconectada` | desvinculada de la API (sigue asociada al cliente) |

- La conexión OAuth es **opcional**: sin credenciales de la plataforma la cuenta queda `asociada` y el registro de métricas sigue manual. Ver [[Conexión OAuth de Meta]].
- **Los tokens nunca viven en esta entidad**: van en la tabla `connected_account_tokens` (RLS habilitado **sin policies** → solo la service key del servidor los toca).
- RLS de `connected_accounts`: `team_all` vía `is_team()` — el [[Portal de clientes]] no la ve.
- Formulario: `connectedAccountSchema` (`lib/schemas.ts`) solo pide `provider`, `handle`, `url`, `notes`; el estado y los campos de sync los gestiona el sistema.
- UI: `components/clients/connected-accounts-section.tsx` (sección "Cuentas de analytics" en la pestaña accesos de la [[Vista 360 del cliente]]) + `components/forms/connected-account-form.tsx`; chips por cuenta en el panel de [[Métricas]].
- CRUD en el [[Store de agencia (useFlare)]]: `connectedAccounts`, `addConnectedAccount`, `updateConnectedAccount`, `deleteConnectedAccount`. Mock: `MOCK_CONNECTED_ACCOUNTS` (`lib/mock-data.ts`).
