---
tags: [arquitectura]
fuente: supabase/migrations/002, supabase/migrations/003, supabase/migrations/007
actualizado: 2026-07-11
---

# Seguridad del portal

El [[Portal de clientes]] **nunca toca tablas base**: todo pasa por RPCs `security definer` que filtran por `current_client_id()` (ver [[Store del portal (usePortal)]]).

**Campos que jamás se exponen al cliente**: `internal_notes`, `notes`, `prompt`, `references`, `performance_notes`, el fee mensual, [[ClientAccess|accesos]], [[ClientMeeting|reuniones]] y [[ClientBilling|facturación]].

- Comentarios bidireccionales equipo↔cliente vía `idea_comments` + RPCs `portal_comments`/`portal_add_comment` (migración 007). Ver [[IdeaComment]].
- Creación de usuarios del portal: `app/api/portal-users/route.ts` — usa `SUPABASE_SECRET_KEY` solo en servidor y exige que quien llama sea rol `team`/`admin`.
- Guards de ruteo: ver [[Autenticación y guards]].
- RLS por rol: ver [[Roles]] y [[Permisos y capacidades]].
