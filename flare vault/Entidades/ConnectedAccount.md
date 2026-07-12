---
tags: [entidad]
aliases: [connected_accounts, Cuenta conectada, Cuentas de analytics]
fuente: lib/types.ts, supabase/migrations/010_connected_accounts.sql
actualizado: 2026-07-12
---

# ConnectedAccount

Cuenta de una plataforma (Instagram, TikTok…) asociada a un [[Client]] para **atribuir sus métricas**: identifica *la cuenta que se mide* (tabla `connected_accounts`, FK→[[Client]] cascade, migración 010, V1.4).

**No confundir con [[ClientAccess]]**: aquel es el checklist de accesos/credenciales; esto es la cuenta cuyas [[ClientMetric|métricas]] se registran (y eventualmente se sincronizan).

Campos: `provider` (`ConnectedProvider`: `instagram | facebook | tiktok | youtube | linkedin | meta_ads | google_analytics | otro`), `handle` (@usuario o nombre), `url`, `externalId` (id en la plataforma — lo **autocompleta el callback OAuth** vía `discoverAccount`, igual que el `handle` si detecta el `@usuario`), `status`, `syncEnabled`, `connectedAt`, `lastSyncAt` (lo actualiza cada sync exitoso), `notes`.

**Estados** (`ConnectedAccountStatus`):

| Estado | Significado |
|---|---|
| `asociada` | registrada a mano, sin conexión API (modo por defecto) |
| `conectada` | OAuth activo, lista para sync (el sync exitoso la reafirma) |
| `expirada` | token vencido — la marca el sync al detectar `expires_at` pasado; requiere reconexión |
| `error` | el último sync/OAuth falló (rechazo del Graph API o fallo de upsert) |
| `desconectada` | desvinculada de la API (sigue asociada al cliente) |

- La conexión OAuth es **opcional**: sin credenciales de la plataforma la cuenta queda `asociada`. Ojo: como el registro manual de [[ClientMetric|métricas]] se retiró (`7942b4a`), una cuenta solo `asociada` **no alimenta métricas**: hay que conectarla y sincronizarla. Ver [[Conexión OAuth de Meta]].
- **Sync con un clic** (`7ad8a53`): `POST /api/integrations/meta/sync` lee el Graph API con el token guardado y hace upsert del [[ClientMetric|registro mensual]] (solo Instagram por ahora). Se dispara con el botón "Sincronizar" del panel de [[Métricas]] o "Sincronizar ahora" por cuenta.
- **Asociación 1-clic**: la sección "Cuentas de analytics" detecta [[ClientAccess|accesos]] del cliente que parecen cuentas medibles (`providerFromPlatform` mapea el texto libre de plataforma) y ofrece chips para asociarlos como cuenta con un clic (queda `asociada`, con nota "Asociada desde el registro de accesos.").
- **Los tokens nunca viven en esta entidad**: van en la tabla `connected_account_tokens` (RLS habilitado **sin policies** → solo la service key del servidor los toca).
- RLS de `connected_accounts`: `team_all` vía `is_team()` — el [[Portal de clientes]] no la ve.
- Formulario: `connectedAccountSchema` (`lib/schemas.ts`) solo pide `provider`, `handle`, `url`, `notes`; el estado y los campos de sync los gestiona el sistema.
- UI: `components/clients/connected-accounts-section.tsx` (sección "Cuentas de analytics" en la pestaña accesos de la [[Vista 360 del cliente]]) + `components/forms/connected-account-form.tsx`; chips por cuenta en el panel de [[Métricas]].
- CRUD en el [[Store de agencia (useFlare)]]: `connectedAccounts`, `addConnectedAccount`, `updateConnectedAccount`, `deleteConnectedAccount`. Mock: `MOCK_CONNECTED_ACCOUNTS` (`lib/mock-data.ts`).
