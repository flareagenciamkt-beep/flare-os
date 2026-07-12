---
tags: [flujo]
aliases: [clientOperationalProgress, portalProgress]
fuente: lib/stats.ts
actualizado: 2026-07-11
---

# Progreso operativo

Dos cálculos de progreso en `lib/stats.ts`:

- **`clientOperationalProgress()`** (interno): combinación ponderada — manual 40% (`Client.progressPercentage`) + producción 25% + tareas 15% + calendario 10% + higiene 10%. Se muestra en la vista Progreso del [[Directorio de clientes]].
- **`portalProgress()`** (externo): el progreso que ve el cliente en el [[Portal de clientes]], derivado **solo de piezas reales** ([[Idea]] en `aprobada`/`programada`/`publicada` — [[IdeaStatus]]).

Otras funciones de la misma capa: `summarizeClient()`, `publishedThisMonth()`, `ideasPerWeekday()` — consumidas por [[Dashboard de clientes]] y [[Dashboard de agencia]].
