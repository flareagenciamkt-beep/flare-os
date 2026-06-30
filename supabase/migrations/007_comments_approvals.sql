-- 007 · Comentarios por pieza + registro de aprobación (quién/cuándo).
-- Incluye RLS para el equipo y RPCs security definer para el portal del cliente.

-- ── Columnas de aprobación en ideas ────────────────────────────────────────
alter table public.ideas add column if not exists approved_by text;
alter table public.ideas add column if not exists approved_at timestamptz;

-- ── Tabla de comentarios ────────────────────────────────────────────────────
create table if not exists public.idea_comments (
  id text primary key default gen_random_uuid()::text,
  idea_id text not null references public.ideas(id) on delete cascade,
  author text not null default '',
  author_role text not null default 'team',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idea_comments_idea_id_idx
  on public.idea_comments(idea_id);

alter table public.idea_comments enable row level security;

-- Equipo autenticado (no clientes): acceso total.
drop policy if exists "team_all_comments" on public.idea_comments;
create policy "team_all_comments" on public.idea_comments
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('team', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('team', 'admin')
    )
  );

-- ── RPCs del portal (cliente) ──────────────────────────────────────────────
-- Lee los comentarios de las piezas de la marca del cliente logueado.
create or replace function public.portal_comments()
returns setof public.idea_comments
language sql
security definer
set search_path = public
as $$
  select c.*
  from public.idea_comments c
  join public.ideas i on i.id = c.idea_id
  where i.client_id = public.current_client_id()
  order by c.created_at asc;
$$;

-- Inserta un comentario del cliente en una pieza de su marca.
create or replace function public.portal_add_comment(p_idea_id text, p_body text)
returns setof public.idea_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id text := public.current_client_id();
  v_author text;
  v_id text;
begin
  -- Verifica que la pieza pertenezca a la marca del cliente.
  if not exists (
    select 1 from public.ideas i
    where i.id = p_idea_id and i.client_id = v_client_id
  ) then
    raise exception 'No autorizado para comentar esta pieza';
  end if;

  select coalesce(cl.brand, p.name, p.email)
    into v_author
  from public.profiles p
  left join public.clients cl on cl.id = p.client_id
  where p.id = auth.uid();

  insert into public.idea_comments (idea_id, author, author_role, body)
  values (p_idea_id, coalesce(v_author, 'Cliente'), 'client', p_body)
  returning id into v_id;

  return query select * from public.idea_comments where id = v_id;
end;
$$;

-- ── approve_idea: registrar quién/cuándo ───────────────────────────────────
-- Actualiza la función existente para fijar approved_by/approved_at cuando el
-- cliente aprueba desde el portal.
-- Se elimina primero: la versión previa (002) tenía defaults en los parámetros
-- y "create or replace" no puede quitarlos.
drop function if exists public.approve_idea(text, text, text);
create or replace function public.approve_idea(
  p_idea_id text,
  p_decision text,
  p_feedback text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id text := public.current_client_id();
  v_author text;
begin
  if not exists (
    select 1 from public.ideas i
    where i.id = p_idea_id and i.client_id = v_client_id
  ) then
    raise exception 'No autorizado para aprobar esta pieza';
  end if;

  select coalesce(cl.brand, p.name, p.email) into v_author
  from public.profiles p
  left join public.clients cl on cl.id = p.client_id
  where p.id = auth.uid();

  update public.ideas
  set
    client_approval = p_decision,
    client_feedback = p_feedback,
    client_approval_at = now(),
    status = case when p_decision = 'aprobada' then 'aprobada' else status end,
    approved_by = case when p_decision = 'aprobada' then coalesce(v_author, 'Cliente') else approved_by end,
    approved_at = case when p_decision = 'aprobada' then now() else approved_at end,
    updated_at = now()
  where id = p_idea_id;
end;
$$;
