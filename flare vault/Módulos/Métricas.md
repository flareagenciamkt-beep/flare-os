---
tags: [modulo]
fuente: app/(app)/clients/metrics/page.tsx, app/(app)/agency/metrics/page.tsx
actualizado: 2026-07-12
---

# Métricas

Dos vistas:

- **Por cliente** (`app/(app)/clients/metrics/page.tsx`) — [[ClientMetric]] mensuales por marca, con gráficos.
- **Operativas** (`app/(app)/agency/metrics/page.tsx`) — métricas de la agencia.

Componente principal: `components/metrics/metrics-panel.tsx`. El CPL se calcula al vuelo (`adSpend / leadsGenerated`). El cliente ve sus métricas en el [[Portal de clientes]] vía RPC `portal_metrics` (sin `performanceNotes` — [[Seguridad del portal]]).

Desde V1.4 el `MetricsPanel` muestra **chips de las [[ConnectedAccount|cuentas asociadas]]** del cliente (punto verde = `conectada`, ámbar = `error`/`expirada`, gris = manual) para dejar claro a qué cuenta se atribuyen los datos.

## Botón "Sincronizar" (`7ad8a53`)

Si el cliente tiene cuentas con estado `conectada`, el `MetricsPanel` muestra un botón **"Sincronizar"** que dispara `syncConnectedAccount()` (`lib/integrations.ts`) para **todas** las cuentas conectadas y luego llama a `refresh()` del [[Store de agencia (useFlare)|store]] para recargar los datos desde Supabase. El sync server-side (`POST /api/integrations/meta/sync`) trae seguidores, alcance, interacciones y piezas del mes desde el Graph API y hace upsert del registro mensual — ver [[Conexión OAuth de Meta]]. También hay un "Sincronizar ahora" por cuenta en la sección Cuentas de analytics de la [[Vista 360 del cliente]].

## Solo consulta (sin registro manual)

Desde `7942b4a` el módulo es de **solo lectura + eliminar**: se retiró el botón "Registrar métricas", el formulario (`components/forms/metric-form.tsx`, eliminado) y la acción Editar de la tabla (`MetricsTable` ya no recibe `onEdit`). Queda `deleteMetric` para borrar registros erróneos.

Decisión de producto: las [[ClientMetric|métricas]] entran **únicamente por el sync** de las [[ConnectedAccount|cuentas de analytics conectadas]] (ver [[Conexión OAuth de Meta]]) — desde `7ad8a53` ese sync existe (Instagram). Los registros históricos se conservan y se muestran. Los copys de `/clients/metrics` ("alimentado por sus cuentas de analytics") y los empty states apuntan a conectar cuentas en la pestaña accesos de la [[Vista 360 del cliente]].
