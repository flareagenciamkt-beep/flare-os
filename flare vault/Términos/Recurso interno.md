---
tags: [termino]
aliases: [Flare (interno), clientId null]
fuente: lib/types.ts, lib/store.tsx
actualizado: 2026-07-11
---

# Recurso interno

**Convención central del modelo de datos**: [[Idea]], [[Task]], [[Resource]], [[Prompt]] y [[Process]] tienen `clientId` **opcional**.

- Con `clientId` → pertenece a un [[Client]].
- `null` → es material **interno de Flare**; `clientName()` (`lib/store.tsx:446`) lo etiqueta como **"Flare (interno)"**.

Documentado en `lib/types.ts:1-3` y `supabase/schema.sql:3-6`. Las FKs son `on delete set null`: si se borra un cliente, sus piezas/tareas/recursos pasan a internos en vez de borrarse (a diferencia de [[ClientMetric]], [[ClientNote]], etc., que son cascade).
