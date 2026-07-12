---
tags: [flujo]
aliases: [OAuth Meta, Integraciones]
fuente: app/api/integrations/meta/
actualizado: 2026-07-12
---

# Conexión OAuth de Meta

Flujo (esqueleto, V1.4) para conectar por OAuth una [[ConnectedAccount]] de proveedor Meta (`instagram`, `facebook`, `meta_ads`) y habilitar el futuro sync automático de [[ClientMetric|métricas]].

**Patrón 501 (como `portal-users`)**: detrás de las env vars `META_APP_ID` / `META_APP_SECRET` (solo servidor, `.env.example`). Sin credenciales, los endpoints responden `501`, la UI muestra un aviso y la cuenta queda `asociada` en modo manual — todo sigue funcionando.

## Pasos

1. **UI** — botón "Conectar (OAuth Meta)" en `components/clients/connected-accounts-section.tsx` (solo para proveedores Meta no conectados). En [[Modo demo vs Supabase|modo demo]] solo informa.
2. **`GET /api/integrations/meta/connect`** (`app/api/integrations/meta/connect/route.ts`) — exige sesión con rol `team`/`admin` ([[Roles]]), verifica que la cuenta exista y responde `{ url }` con el diálogo de autorización de Facebook. El `state` viaja **firmado con HMAC-SHA256** (`signState` en `shared.ts`) porque el callback llega por redirect sin `Authorization`.
3. **Diálogo de Meta** — scopes mínimos de lectura: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`, `ads_read`, `business_management` (Graph `v21.0`).
4. **`GET /api/integrations/meta/callback`** (`app/api/integrations/meta/callback/route.ts`) — verifica el `state` (`verifyState`, comparación timing-safe), canjea `code` → token corto → **token de larga duración** (~60 días), lo guarda en `connected_account_tokens` (tabla **server-only**: RLS sin policies) y marca la cuenta como `conectada` (`syncEnabled`, `connectedAt`). Si algo falla, marca `error` con el detalle en `notes`. Siempre redirige de vuelta a la [[Vista 360 del cliente]].

## Seguridad

- Tokens **nunca** llegan al navegador ni al tipo `ConnectedAccount`: solo los route handlers con `SUPABASE_SECRET_KEY` los leen/escriben.
- `META_OAUTH_REDIRECT_URL` opcional para cuando el dominio público difiere del origen.

**Pendiente**: el sync de métricas en sí no existe todavía — el registro en [[Métricas]] sigue siendo manual.
