---
tags: [termino]
aliases: [Flare (interno), clientId null]
fuente: lib/types.ts, lib/store.tsx
actualizado: 2026-07-15
---

# Recurso interno

**Convención central del modelo de datos**: [[Idea]] y [[Task]] tienen `clientId` **opcional**.

- Con `clientId` → pertenece a un [[Client]].
- `null` → es material **interno de Flare**; `clientName()` (`lib/store.tsx:421`) lo etiqueta como **"Flare (interno)"**.

Documentado en el comentario de cabecera de `lib/types.ts:1-3`. Las FKs son `on delete set null`: si se borra un cliente, sus piezas/tareas pasan a internas en vez de borrarse (a diferencia de [[ClientMetric]], [[ClientNote]], etc., que son cascade).

> Hasta `92cf0ab` la convención también cubría `Resource`, `Prompt` y `Process`, retirados de la app en el recorte de módulos (sus tablas siguen en Supabase pero la app ya no las usa). El comentario de `lib/types.ts` aún los menciona — quedó desactualizado en el código.
