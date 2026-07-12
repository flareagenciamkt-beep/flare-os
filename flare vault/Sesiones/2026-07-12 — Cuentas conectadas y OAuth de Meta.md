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
