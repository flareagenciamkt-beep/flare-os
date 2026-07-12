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
- El registro es **manual**; desde V1.4 las [[ConnectedAccount|cuentas conectadas]] identifican a qué cuenta de plataforma se atribuyen (y preparan el futuro sync vía [[Conexión OAuth de Meta]]).

Consumida por [[Métricas]], [[Vista 360 del cliente]] y el [[Portal de clientes]].
