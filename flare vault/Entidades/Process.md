---
tags: [entidad]
aliases: [SOP, processes, Proceso]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# Process

Procedimiento/SOP de la agencia (tabla `processes`), gestionado en [[Procesos (SOPs)]].

Campos: `clientId` (nullable → [[Recurso interno]]), `title`, `area` ([[TaskArea]]), `description`, `steps[]`, `responsible`, `frequency`, `status` (`ProcessStatus`: `activo | borrador | archivado`).
