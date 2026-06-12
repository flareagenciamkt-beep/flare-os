-- ─── 002: Portal de clientes con aprobaciones ───────────────────────────────
-- Ejecutar UNA VEZ en Supabase → SQL Editor (después de schema.sql + seed.sql).
-- Después de ejecutarla: Authentication → Sign In/Up → desactivar signups públicos.
--
-- Seguridad:
-- * Los clientes NO leen tablas base: solo RPCs security definer con columnas
--   explícitas (no se filtran internal_notes, notes, prompt, references,
--   performance_notes).
-- * Aprobación solo vía RPC approve_idea (valida propiedad y estado).
-- * Se elimina profiles_own_update: con la columna role sería escalación.

-- 1) profiles: rol + vínculo a cliente + email --------------------------------
alter table public.profiles
  add column role text not null default 'team' check (role in ('team','client')),
  add column client_id text references public.clients(id) on delete set null,
  add column email text not null default '';

-- Backfill: las filas existentes (el equipo) quedan role='team' por el default.
update public.profiles p
   set email = coalesce(u.email, '')
  from auth.users u
 where u.id = p.id;

-- Los usuarios nuevos entran como 'client' SIN vínculo (mínimo privilegio).
-- Un nuevo miembro del equipo se promueve a 'team' desde el Table Editor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    'client'
  );
  return new;
end;
$$;

-- 2) Helpers de rol (security definer => leen profiles sin recursión RLS) -----
create or replace function public.is_team()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = (select auth.uid()) and role = 'team'
  );
$$;

create or replace function public.current_client_id()
returns text
language sql stable security definer set search_path = public
as $$
  select client_id from public.profiles
   where id = (select auth.uid()) and role = 'client';
$$;

revoke execute on function public.is_team(), public.current_client_id() from public, anon;
grant execute on function public.is_team(), public.current_client_id() to authenticated;

-- 3) ideas: campos de aprobación del cliente -----------------------------------
alter table public.ideas
  add column client_approval text not null default 'pendiente'
    check (client_approval in ('pendiente','aprobada','cambios_solicitados')),
  add column client_feedback text not null default '',
  add column client_approval_at timestamptz;

-- Al volver una pieza a "en_revision", la aprobación anterior queda obsoleta.
create or replace function public.reset_idea_approval()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'en_revision' and old.status is distinct from 'en_revision' then
    new.client_approval := 'pendiente';
    new.client_approval_at := null;
  end if;
  return new;
end;
$$;

create trigger trg_reset_idea_approval
  before update on public.ideas
  for each row execute function public.reset_idea_approval();

-- 4) Policies: el equipo todo, los clientes nada directo ------------------------
drop policy "team_all" on public.clients;
drop policy "team_all" on public.ideas;
drop policy "team_all" on public.tasks;
drop policy "team_all" on public.resources;
drop policy "team_all" on public.prompts;
drop policy "team_all" on public.processes;
drop policy "team_all" on public.client_metrics;
drop policy "profiles_read" on public.profiles;
drop policy "profiles_own_update" on public.profiles;

create policy "team_all" on public.clients        for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.ideas          for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.tasks          for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.resources      for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.prompts        for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.processes      for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.client_metrics for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

-- profiles: cada quien ve la suya; el equipo ve y edita todas (para vincular).
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_team()));
create policy "profiles_team_update" on public.profiles for update to authenticated
  using ((select public.is_team())) with check ((select public.is_team()));
-- Sin policies de insert/delete: las filas las crea el trigger (security definer).

-- 5) Lecturas del portal: RPCs con columnas explícitas --------------------------
create or replace function public.portal_client()
returns table (
  id text, name text, brand text, industry text, status text,
  current_phase text, progress_percentage int,
  main_goal text, monthly_goal text, content_goal text
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.name, c.brand, c.industry, c.status,
         c.current_phase, c.progress_percentage,
         c.main_goal, c.monthly_goal, c.content_goal
    from public.clients c
   where c.id = public.current_client_id();
$$;

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
     and i.status <> 'archivada';
$$;

create or replace function public.portal_metrics()
returns table (
  id text, client_id text, period_month int, period_year int,
  instagram_followers int, monthly_reach int, interactions int,
  leads_generated int, whatsapp_clicks int, posts_published int,
  reels_published int, carousels_published int, stories_published int,
  ad_spend numeric, relevant_results text
)
language sql stable security definer set search_path = public
as $$
  select m.id, m.client_id, m.period_month, m.period_year,
         m.instagram_followers, m.monthly_reach, m.interactions,
         m.leads_generated, m.whatsapp_clicks, m.posts_published,
         m.reels_published, m.carousels_published, m.stories_published,
         m.ad_spend, m.relevant_results
    from public.client_metrics m
   where m.client_id = public.current_client_id();
$$;

-- 6) Escritura del cliente: aprobación atómica vía RPC ---------------------------
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
         updated_at = current_date
   where id = p_idea_id
     and client_id = v_client
     and status = 'en_revision';

  if not found then
    raise exception 'Esta pieza ya no está disponible para aprobación.';
  end if;
end;
$$;

revoke execute on function
  public.portal_client(), public.portal_ideas(), public.portal_metrics(),
  public.approve_idea(text, text, text)
from public, anon;

grant execute on function
  public.portal_client(), public.portal_ideas(), public.portal_metrics(),
  public.approve_idea(text, text, text)
to authenticated;
