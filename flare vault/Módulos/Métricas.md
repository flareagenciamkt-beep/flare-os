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
