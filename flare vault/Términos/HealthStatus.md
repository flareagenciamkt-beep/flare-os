---
tags: [termino]
aliases: [Salud de cuenta]
fuente: lib/types.ts, supabase/migrations/009
actualizado: 2026-07-11
---

# HealthStatus

Salud de la cuenta de un [[Client]]: `bien`, `observacion`, `riesgo`, `critico`, `pausado`.

- `riesgo` y `critico` marcan al cliente como en riesgo (`isClientAtRisk`).
- Migración 009 remapeó valores legacy: `atencion → observacion`, `atrasado → riesgo`.

Se muestra en [[Directorio de clientes]], [[Dashboard de clientes]] y [[Vista 360 del cliente]].
