-- ─── Flare OS — Esquema V1 (Fase 6) ─────────────────────────────────────────
-- Ejecutar UNA VEZ en Supabase → SQL Editor. Después ejecutar seed.sql.
-- Regla clave: client_id opcional en ideas/tasks/resources/prompts/processes
-- (con valor → pertenece a un cliente; null → interno de Flare).
-- IDs como text para compatibilidad con el seed; los registros nuevos
-- se crean con UUID generado por la app.

-- 1. CLIENTS ------------------------------------------------------------------
create table public.clients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  brand text not null,
  industry text not null default '',
  status text not null default 'prospecto',
  owner text not null default '',
  priority text not null default 'media',
  current_phase text not null default 'onboarding',
  health_status text not null default 'bien',
  progress_percentage int not null default 0,
  description text not null default '',
  main_goal text not null default '',
  monthly_goal text not null default '',
  content_goal text not null default '',
  main_kpi text not null default '',
  next_action text not null default '',
  important_links jsonb not null default '[]',
  internal_notes text not null default '',
  last_update date not null default current_date,
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 2. IDEAS --------------------------------------------------------------------
create table public.ideas (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  description text not null default '',
  category text not null default 'contenido',
  status text not null default 'idea',
  priority text not null default 'media',
  format text not null default 'carrusel',
  channel text not null default 'instagram',
  suggested_date date,
  publish_date date,
  responsible text not null default '',
  notes text not null default '',
  prompt text not null default '',
  "references" text not null default '',
  cover_image text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 3. TASKS --------------------------------------------------------------------
create table public.tasks (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  idea_id text references public.ideas(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'pendiente',
  priority text not null default 'media',
  responsible text not null default '',
  due_date date,
  area text not null default 'contenido',
  notes text not null default '',
  related_link text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 4. RESOURCES ----------------------------------------------------------------
create table public.resources (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  type text not null default 'nota',
  category text not null default 'contenido',
  content text not null default '',
  external_link text not null default '',
  tags jsonb not null default '[]',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 5. PROMPTS ------------------------------------------------------------------
create table public.prompts (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  category text not null default 'contenido',
  prompt_content text not null default '',
  recommended_use text not null default '',
  required_variables jsonb not null default '[]',
  tags jsonb not null default '[]',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 6. PROCESSES ----------------------------------------------------------------
create table public.processes (
  id text primary key default gen_random_uuid()::text,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  area text not null default 'contenido',
  description text not null default '',
  steps jsonb not null default '[]',
  responsible text not null default '',
  frequency text not null default '',
  status text not null default 'borrador',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 7. CLIENT_METRICS -------------------------------------------------------------
create table public.client_metrics (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  period_month int not null,
  period_year int not null,
  instagram_followers int not null default 0,
  monthly_reach int not null default 0,
  interactions int not null default 0,
  leads_generated int not null default 0,
  whatsapp_clicks int not null default 0,
  posts_published int not null default 0,
  reels_published int not null default 0,
  carousels_published int not null default 0,
  stories_published int not null default 0,
  ad_spend numeric not null default 0,
  relevant_results text not null default '',
  performance_notes text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 8. PROFILES (equipo Flare, ligado a auth.users) -------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

-- Crear perfil automáticamente al registrar un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row Level Security ────────────────────────────────────────────────────
-- V1: cualquier usuario autenticado (equipo Flare) tiene acceso total.
-- Cuando exista el portal de clientes se agregan roles y políticas por client_id.

alter table public.clients enable row level security;
alter table public.ideas enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.prompts enable row level security;
alter table public.processes enable row level security;
alter table public.client_metrics enable row level security;
alter table public.profiles enable row level security;

create policy "team_all" on public.clients for all to authenticated using (true) with check (true);
create policy "team_all" on public.ideas for all to authenticated using (true) with check (true);
create policy "team_all" on public.tasks for all to authenticated using (true) with check (true);
create policy "team_all" on public.resources for all to authenticated using (true) with check (true);
create policy "team_all" on public.prompts for all to authenticated using (true) with check (true);
create policy "team_all" on public.processes for all to authenticated using (true) with check (true);
create policy "team_all" on public.client_metrics for all to authenticated using (true) with check (true);
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_own_update" on public.profiles for update to authenticated using (auth.uid() = id);
