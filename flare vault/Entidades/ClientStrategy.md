---
tags: [entidad]
aliases: [client_strategy, Estrategia del cliente]
fuente: supabase/migrations/003
actualizado: 2026-07-11
---

# ClientStrategy

Estrategia de marca por cliente (tabla `client_strategy`, migración 003). **Relación 1:1 con [[Client]]** (`client_id unique`, cascade) — el store usa `upsertStrategy` ([[Store de agencia (useFlare)]]).

Campos: `brandBrief`, `targetAudience`, `offer`, `tone`, `brandPromise`, `differentiators`, `competitors`, `doGuidelines`, `dontGuidelines`, `strategicNotes`.

Se edita en la pestaña "estrategia" de la [[Vista 360 del cliente]].
