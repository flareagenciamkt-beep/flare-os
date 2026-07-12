---
tags: [entidad]
aliases: [prompts]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# Prompt

Prompt de IA reutilizable (tabla `prompts`), gestionado en la [[Biblioteca de prompts]].

Campos: `clientId` (nullable → [[Recurso interno]]), `title`, `category` (`ResourceCategory`), `promptContent`, `recommendedUse`, `requiredVariables[]` (variables que hay que rellenar al usarlo), `tags[]`.

No confundir con el campo `prompt` de la entidad [[Idea]] (el prompt puntual usado para esa pieza).
