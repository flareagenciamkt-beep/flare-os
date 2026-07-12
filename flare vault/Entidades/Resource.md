---
tags: [entidad]
aliases: [Recurso, resources]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# Resource

Asset/recurso de la [[Biblioteca de recursos]] (tabla `resources`).

Campos: `clientId` (nullable → [[Recurso interno]]), `title`, `type` (`ResourceType`: logo, brandbook, foto, video, documento, prompt, sop, plantilla, script, nota, referencia, proceso, link, otro), `category` (`ResourceCategory`: contenido, diseno, estrategia, automatizacion, ventas, desarrollo, cliente, otro), `content`, `externalLink`, `tags[]`.

Se muestra por cliente en la pestaña "recursos" de la [[Vista 360 del cliente]].
