---
tags: [entidad]
aliases: [idea_comments, Comentarios de pieza]
fuente: supabase/migrations/007
actualizado: 2026-07-11
---

# IdeaComment

Hilo de comentarios por pieza (tabla `idea_comments`, migración 007).

Campos: `ideaId` (FK→[[Idea]], cascade), `author`, `authorRole` (`admin|team|client` — ver [[Roles]]), `body`.

Permite conversación **bidireccional equipo↔cliente**: la agencia comenta desde [[Contenido]]/[[Vista 360 del cliente]]; el cliente desde el [[Portal de clientes]] vía RPCs `portal_comments`/`portal_add_comment` ([[Store del portal (usePortal)]]).
