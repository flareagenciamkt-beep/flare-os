-- ─── 004: Operación completa de clientes (V1.2) ─────────────────────────────
-- Ejecutar UNA VEZ en Supabase → SQL Editor (después de 002 y 003).
-- Incremental: agrega columnas/índices, amplía constraints y actualiza
-- los estados de producción a un set granular.
--
-- POST-MIGRACIÓN (manual): las piezas que estaban "en revisión" quedan como
-- "revisión interna". Mueve manualmente a "Revisión cliente" las que estaban
-- esperando aprobación del cliente.

-- 1) ideas: campos de producción --------------------------------------------
alter table public.ideas
  add column copy text not null default '',
  add column script text not null default '',
  add column design_notes text not null default '',
  add column external_url text not null default '';

-- 2) tasks: vínculo opcional a reunión ---------------------------------------
alter table public.tasks
  add column meeting_id text references public.client_meetings(id) on delete set null;

-- 3) client_access: nuevo estado "problema" ----------------------------------
alter table public.client_access drop constraint client_access_status_check;
alter table public.client_access add constraint client_access_status_check
  check (status in ('pendiente','solicitado','recibido','validado','problema'));

-- 4) client_notes: nuevo tipo "estrategia" ------------------------------------
alter table public.client_notes drop constraint client_notes_type_check;
alter table public.client_notes add constraint client_notes_type_check
  check (type in ('general','reunion','feedback','problema','decision','recordatorio','estrategia'));

-- 5) Estados granulares: lo que estaba "en revisión" pasa a revisión INTERNA --
update public.ideas set status = 'en_revision_interna' where status = 'en_revision';

-- 6) Trigger de reset: ahora al entrar a revisión del CLIENTE -----------------
create or replace function public.reset_idea_approval()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'en_revision_cliente' and old.status is distinct from 'en_revision_cliente' then
    new.client_approval := 'pendiente';
    new.client_approval_at := null;
  end if;
  return new;
end;
$$;

-- 7) approve_idea: opera sobre revisión cliente; aprobar avanza el estado -----
-- (misma firma que en 002 => los grants/revokes existentes se conservan)
create or replace function public.approve_idea(
  p_idea_id text,
  p_decision text,
  p_feedback text default ''
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client text := public.current_client_id();
begin
  if v_client is null then
    raise exception 'Solo usuarios del portal pueden aprobar contenidos.';
  end if;
  if p_decision not in ('aprobada', 'cambios_solicitados') then
    raise exception 'Decisión inválida.';
  end if;
  if p_decision = 'cambios_solicitados' and coalesce(trim(p_feedback), '') = '' then
    raise exception 'Cuéntanos qué cambios necesitas.';
  end if;

  update public.ideas
     set client_approval = p_decision,
         client_feedback = coalesce(p_feedback, ''),
         client_approval_at = now(),
         status = case when p_decision = 'aprobada' then 'aprobada' else status end,
         updated_at = current_date
   where id = p_idea_id
     and client_id = v_client
     and status = 'en_revision_cliente';

  if not found then
    raise exception 'Esta pieza ya no está disponible para aprobación.';
  end if;
end;
$$;

-- 8) portal_ideas: ocultar también las piezas pausadas -------------------------
-- (misma firma => grants conservados)
create or replace function public.portal_ideas()
returns table (
  id text, client_id text, title text, description text,
  category text, status text, priority text, format text, channel text,
  suggested_date date, publish_date date, cover_image text,
  client_approval text, client_feedback text, client_approval_at timestamptz,
  created_at date, updated_at date
)
language sql stable security definer set search_path = public
as $$
  select i.id, i.client_id, i.title, i.description,
         i.category, i.status, i.priority, i.format, i.channel,
         i.suggested_date, i.publish_date, i.cover_image,
         i.client_approval, i.client_feedback, i.client_approval_at,
         i.created_at, i.updated_at
    from public.ideas i
   where i.client_id is not null
     and i.client_id = public.current_client_id()
     and i.status not in ('archivada', 'pausada');
$$;

-- 9) Índices de operación (no existía ninguno en ideas/tasks) ------------------
create index ideas_client_id_idx    on public.ideas (client_id);
create index ideas_status_idx       on public.ideas (status);
create index ideas_publish_date_idx on public.ideas (publish_date);
create index tasks_client_id_idx    on public.tasks (client_id);
create index tasks_due_date_idx     on public.tasks (due_date);
create index tasks_meeting_id_idx   on public.tasks (meeting_id);
