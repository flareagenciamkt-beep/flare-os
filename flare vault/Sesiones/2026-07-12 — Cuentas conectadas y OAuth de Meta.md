---
tags: [sesion]
actualizado: 2026-07-12
---

# 2026-07-12 — Cuentas conectadas y OAuth de Meta

Cubre la sesión de trabajo del **2026-07-11**: cambios sin commitear sobre `e239591` (rediseño global). El vault queda al día **hasta `e239591` + working tree** de esa sesión.

Se introdujo [[ConnectedAccount]] (V1.4): cuentas de plataformas asociadas a un [[Client]] para atribuir sus [[ClientMetric|métricas]], distintas de [[ClientAccess]]. Migración 010 (`connected_accounts` con RLS `team_all` + `connected_account_tokens` server-only, **ya aplicada en la base viva** vía CLI de Supabase, que quedó vinculado con el historial 002–009 reparado). Esqueleto del flujo [[Conexión OAuth de Meta]] detrás de `META_APP_ID`/`META_APP_SECRET` (patrón 501); sin credenciales todo sigue en modo manual. Fix menor: `app/api/portal-users/route.ts` acepta rol `admin` además de `team` (el vault ya lo describía así).

## Notas creadas
- [[ConnectedAccount]]
- [[Conexión OAuth de Meta]]

## Notas modificadas
- [[ClientAccess]] — distinción con la entidad nueva
- [[ClientMetric]] — atribución de métricas por cuenta
- [[Métricas]] — chips de cuentas asociadas en `MetricsPanel`
- [[Vista 360 del cliente]] — sección "Cuentas de analytics" en la pestaña accesos
- [[Store de agencia (useFlare)]] — CRUD de `connectedAccounts`
- [[Modo demo vs Supabase]] — migración 010 y vínculo al CLI de Supabase
- [[Home]] — enlaces a las notas nuevas

---

## Retiro del registro manual de métricas (hasta `7942b4a`)

Segunda pasada del día. El vault queda al día **hasta `7942b4a`** (`feat: retirar el registro manual de métricas`).

Decisión de producto: las [[ClientMetric|métricas]] de cliente entrarán **únicamente por el sync** de las [[ConnectedAccount|cuentas de analytics conectadas]]. Se eliminaron `components/forms/metric-form.tsx`, `metricSchema`/`MetricFormValues` (`lib/schemas.ts`) y `addMetric`/`updateMetric` del store; se conserva `deleteMetric` para borrar registros erróneos. El `MetricsPanel` queda en solo consulta + eliminar (sin botón "Registrar métricas" ni Editar; `MetricsTable` perdió `onEdit`) y los copys/empty states apuntan a las cuentas de analytics. Como el sync aún no existe, hoy no hay vía de ingreso de métricas nuevas (los históricos se conservan).

### Notas modificadas
- [[Métricas]] — sección "Solo consulta (sin registro manual)"
- [[ClientMetric]] — sin registro manual; entrada futura solo por sync
- [[Store de agencia (useFlare)]] — solo queda `deleteMetric`
- [[Conexión OAuth de Meta]] — el sync es ahora la única vía de ingreso pendiente
- [[ConnectedAccount]] — una cuenta `asociada` ya no implica registro manual

---

## Sync de métricas con un clic y setup guiado (hasta `7ad8a53`)

Tercera pasada del día. El vault queda al día **hasta `7ad8a53`** (`feat: sync de métricas con un clic y setup guiado de la integración Meta`).

Se cerró el ciclo de las cuentas de analytics: el callback OAuth ahora **autodescubre la identidad** de la cuenta (`discoverAccount` en `shared.ts` — `externalId` y `@usuario` vía `/me/accounts` o `/me/adaccounts`), y el nuevo `POST /api/integrations/meta/sync` consulta el Graph API (seguidores, reach/views/interacciones e inventario de `/media` del mes) y hace **upsert del registro mensual** en `client_metrics` (solo Instagram; `team`/`admin`; token vencido → `expirada`, fallo → `error`). La UI suma el botón "Sincronizar" en el `MetricsPanel`, "Sincronizar ahora" por cuenta, sugerencias 1-clic desde [[ClientAccess|Accesos]] (`providerFromPlatform`) y la card "Integraciones · Meta" en [[Ajustes]] con checklist de setup (`GET /status`). En el store: `refresh()` para recargar tras el sync; nuevo helper cliente `lib/integrations.ts`. El ciclo queda: asociar (o 1-clic desde Accesos) → conectar OAuth → sincronizar → métricas.

### Notas modificadas
- [[Conexión OAuth de Meta]] — secciones nuevas: Sincronizar, asociación 1-clic, endpoint `/status`; el autodescubrimiento en el callback
- [[Métricas]] — botón "Sincronizar" en el panel; el sync ya existe
- [[ConnectedAccount]] — `externalId`/`handle` autocompletados, estados `expirada`/`error` los gestiona el sync, sugerencias 1-clic
- [[ClientMetric]] — qué campos llena el sync y cuáles quedan en cero
- [[Ajustes]] — card "Integraciones · Meta" con checklist guiado
- [[ClientAccess]] — sugerencias 1-clic hacia cuentas de analytics
- [[Store de agencia (useFlare)]] — `refresh()`

---

## Credenciales de Meta desde la app y deploy en Vercel (hasta `ab164c8`)

Cuarta pasada del día. El vault queda al día **hasta `ab164c8`** (`feat: credenciales de Meta configurables desde Ajustes (sin tocar código)`).

Las credenciales de la integración de Meta ya no viven en env: el admin las pega en [[Ajustes|Ajustes → Integraciones]] (formulario App ID + App Secret) y quedan en la tabla server-only [[IntegrationSettings|`integration_settings`]] (migración 011, RLS sin policies, ya aplicada en producción). La nueva ruta `/api/integrations/meta/credentials` (GET estado + App ID enmascarado / POST solo admin / DELETE solo admin) **reemplaza y elimina** `/api/integrations/meta/status`. En `shared.ts`: `getMetaConfig(admin)` resuelve credenciales base-primero con fallback a `META_APP_ID`/`META_APP_SECRET`, y `requireRole()` centraliza la autenticación de las rutas. Además quedó cerrada la **fase 7 de deploy**: el proyecto corre en Vercel (`flare-os.vercel.app`, auto-deploy desde `main`) con `SUPABASE_SECRET_KEY` como único secreto de bootstrap.

### Notas creadas
- [[IntegrationSettings]]

### Notas modificadas
- [[Conexión OAuth de Meta]] — sección "Origen de las credenciales": `getMetaConfig`, ruta `/credentials`, helper `requireRole`; `/status` eliminado
- [[Ajustes]] — la card de integraciones ahora es un formulario (secreto nunca vuelve al navegador)
- [[Modo demo vs Supabase]] — migración 011 en el historial + sección "Deploy" (Vercel)
- [[Seguridad del portal]] — patrón de tablas server-only (tokens + credenciales)
- [[Stack tecnológico]] — deploy en Vercel
- [[Home]] — enlace a [[IntegrationSettings]]
