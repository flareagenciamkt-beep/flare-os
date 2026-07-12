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

## Solo consulta (sin registro manual)

Desde `7942b4a` el módulo es de **solo lectura + eliminar**: se retiró el botón "Registrar métricas", el formulario (`components/forms/metric-form.tsx`, eliminado) y la acción Editar de la tabla (`MetricsTable` ya no recibe `onEdit`). Queda `deleteMetric` para borrar registros erróneos.

Decisión de producto: las [[ClientMetric|métricas]] entrarán **únicamente por el sync** de las [[ConnectedAccount|cuentas de analytics conectadas]] (ver [[Conexión OAuth de Meta]]). Como el sync aún no existe, **hoy no hay vía de ingreso de métricas nuevas**; los registros históricos se conservan y se muestran. Los copys de `/clients/metrics` ("alimentado por sus cuentas de analytics") y los empty states apuntan a conectar cuentas en la pestaña accesos de la [[Vista 360 del cliente]].
