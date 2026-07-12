---
tags: [entidad]
aliases: [client_metrics, Métrica mensual]
fuente: lib/types.ts, supabase/schema.sql
actualizado: 2026-07-12
---

# ClientMetric

Métricas mensuales por cliente (tabla `client_metrics`, FK→[[Client]] **cascade**). Un registro por `periodMonth` (1-12) + `periodYear`.

Campos: `instagramFollowers`, `monthlyReach`, `impressions`, `clicks`, `interactions`, `leadsGenerated`, `whatsappClicks`, `postsPublished`, `reelsPublished`, `carouselsPublished`, `storiesPublished`, `adSpend`, `relevantResults`, `performanceNotes`.

- **CPL no se almacena**: se calcula `adSpend / leadsGenerated`.
- `performanceNotes` nunca llega al portal ([[Seguridad del portal]]); el RPC `portal_metrics` expone el resto.
- "Métricas del mes sin registrar" es una de las [[Alertas operativas]].
- **Ya no hay registro manual** (desde `7942b4a`): se eliminaron el formulario (`metric-form.tsx`), `metricSchema`/`MetricFormValues` (`lib/schemas.ts`) y `addMetric`/`updateMetric` del [[Store de agencia (useFlare)|store]]. Solo queda `deleteMetric` para borrar registros erróneos.
- La entrada de datos es **exclusivamente por el sync** de las [[ConnectedAccount|cuentas de analytics conectadas]] ([[Conexión OAuth de Meta]]). Desde `7ad8a53` el sync existe (solo Instagram): `POST /api/integrations/meta/sync` hace **upsert del registro del mes en curso** — llena `instagramFollowers`, `monthlyReach`, `impressions` (views), `interactions`, `postsPublished`, `reelsPublished`, `carouselsPublished`; el resto de campos (`clicks`, `leadsGenerated`, `adSpend`…) quedan en cero al crear el registro.

Consumida por [[Métricas]], [[Vista 360 del cliente]] y el [[Portal de clientes]].
