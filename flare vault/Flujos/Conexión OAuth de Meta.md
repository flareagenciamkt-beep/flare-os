---
tags: [flujo]
aliases: [OAuth Meta, Integraciones, Sync de métricas]
fuente: app/api/integrations/meta/
actualizado: 2026-07-12
---

# Conexión OAuth de Meta

Flujo (V1.4) para conectar por OAuth una [[ConnectedAccount]] de proveedor Meta (`instagram`, `facebook`, `meta_ads`) y **sincronizar sus [[ClientMetric|métricas]]** con un clic. Desde `7ad8a53` el ciclo está completo: **asociar → conectar → sincronizar → métricas en `client_metrics`**.

## Origen de las credenciales (`ab164c8`)

Las credenciales de la app de Meta **se configuran desde la propia app**, no por código ni env: el admin las pega en [[Ajustes|Ajustes → Integraciones]] y quedan en [[IntegrationSettings|`integration_settings`]] (tabla server-only, migración 011). `getMetaConfig(admin)` (`shared.ts`) las resuelve en cascada: **primero la base** (`source: "db"`), y como fallback las env vars `META_APP_ID`/`META_APP_SECRET` (`source: "env"`, ya comentadas en `.env.example`). Sin credenciales en ninguno de los dos lados, los endpoints responden `501`, la UI avisa y la cuenta queda `asociada` en modo manual — todo sigue funcionando. El único secreto que sí exige env es `SUPABASE_SECRET_KEY` (bootstrap de infraestructura, una sola vez).

**`/api/integrations/meta/credentials`** (`app/api/integrations/meta/credentials/route.ts`) — reemplaza y elimina el antiguo `GET /status`:

- `GET` (roles `team`/`admin`): estado de configuración — `serverKeyConfigured`, `metaConfigured`, `source` y el **App ID enmascarado** (`1234…89`). Nunca el secreto.
- `POST` (solo `admin`): guarda App ID (validado numérico con zod) y App Secret vía upsert en `integration_settings` con `updated_by`.
- `DELETE` (solo `admin`): desconecta la integración (borra la fila `meta`).

El helper **`requireRole(admin, request, roles)`** (`shared.ts`) centraliza la autenticación de las rutas (JWT del header → `auth.getUser` → rol del [[Profile|profile]]): lo usan `connect`, `sync` y `credentials`. El `callback` no puede usarlo (llega por redirect sin `Authorization`) y sigue confiando en el `state` firmado.

## Conectar (OAuth)

1. **UI** — botón "Conectar (OAuth Meta)" en `components/clients/connected-accounts-section.tsx` (solo para proveedores Meta no conectados). En [[Modo demo vs Supabase|modo demo]] solo informa.
2. **`GET /api/integrations/meta/connect`** (`app/api/integrations/meta/connect/route.ts`) — exige sesión con rol `team`/`admin` ([[Roles]]), verifica que la cuenta exista y responde `{ url }` con el diálogo de autorización de Facebook. El `state` viaja **firmado con HMAC-SHA256** (`signState` en `shared.ts`) porque el callback llega por redirect sin `Authorization`.
3. **Diálogo de Meta** — scopes mínimos de lectura: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `ads_read`, `business_management` (Graph `v21.0`).
4. **`GET /api/integrations/meta/callback`** (`app/api/integrations/meta/callback/route.ts`) — verifica el `state` (`verifyState`, comparación timing-safe), canjea `code` → token corto → **token de larga duración** (~60 días), lo guarda en `connected_account_tokens` (tabla **server-only**: RLS sin policies) y marca la cuenta como `conectada` (`syncEnabled`, `connectedAt`). Además **autodescubre la identidad real** de la cuenta (`discoverAccount` en `shared.ts`): consulta `/me/accounts` (páginas de FB con su IG business vinculado, campo `instagram_business_account{id,username}`) o `/me/adaccounts` para `meta_ads`, y autocompleta `externalId` y el `handle` (`@usuario` si el que había no empezaba por `@`) — el usuario no llena nada a mano. Si algo falla, marca `error` con el detalle en `notes`. Siempre redirige de vuelta a la [[Vista 360 del cliente]].

## Sincronizar (`7ad8a53`)

**`POST /api/integrations/meta/sync`** (`app/api/integrations/meta/sync/route.ts`) — body `{ accountId }`, solo `team`/`admin`. **Por ahora solo `instagram`** (otros proveedores → `501`). Con el token guardado consulta el Graph API:

- `GET /{igId}?fields=followers_count` → `instagramFollowers`.
- `GET /{igId}/insights` con `metric=reach,views,total_interactions` (`metric_type=total_value`, mes en curso) → `monthlyReach`, `impressions` (views), `interactions`.
- `GET /{igId}/media` (timestamp + media_type + media_product_type) → cuenta las piezas publicadas del mes: `CAROUSEL_ALBUM` → carruseles, `REELS`/`VIDEO` → reels, resto → posts.

Con eso hace **upsert del registro mensual** en `client_metrics` (actualiza el del mes o crea uno con el resto de campos en cero) y marca la cuenta `conectada` + `lastSyncAt`. Manejo de fallos: token vencido → estado `expirada` y `409` pidiendo reconectar; sin `externalId` → `409` pidiendo reconectar (autodetección); rechazo del Graph API o error de upsert → estado `error` y `502`.

**Cliente**: `syncConnectedAccount()` (`lib/integrations.ts`) llama al endpoint con el access token de la sesión de Supabase (en demo devuelve error explicativo). La UI ofrece dos entradas:

- Botón **"Sincronizar"** en el `MetricsPanel` ([[Métricas]]) — aparece si el cliente tiene cuentas `conectada`, las sincroniza todas y llama a `refresh()` del [[Store de agencia (useFlare)|store]] para recargar.
- Ítem **"Sincronizar ahora"** por cuenta en la sección "Cuentas de analytics" (`connected-accounts-section.tsx`).

## Asociación 1-clic desde Accesos

La sección "Cuentas de analytics" sugiere asociar como [[ConnectedAccount]] los [[ClientAccess|accesos]] del cliente que parecen cuentas medibles: `providerFromPlatform()` mapea el texto libre de `platform` a un `ConnectedProvider` (regex: "instagram"/"ig" → `instagram`, "meta ads"/"pauta" → `meta_ads`, etc.) y muestra chips "+ Proveedor" si ese proveedor aún no está asociado.

## Seguridad

- Tokens **nunca** llegan al navegador ni al tipo `ConnectedAccount`: solo los route handlers con `SUPABASE_SECRET_KEY` los leen/escriben.
- Las credenciales de la app viven en [[IntegrationSettings|`integration_settings`]] (RLS sin policies, server-only): el **App Secret jamás vuelve al navegador**; `GET /credentials` solo devuelve estados y el App ID enmascarado.
- `META_OAUTH_REDIRECT_URL` opcional para cuando el dominio público difiere del origen.

**Pendiente**: sync de `facebook`, `meta_ads` y demás proveedores; renovación automática del token antes de los ~60 días.
