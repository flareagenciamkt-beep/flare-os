-- ─── 003: Vista 360 del cliente (V1.1) ──────────────────────────────────────
-- Ejecutar UNA VEZ en Supabase → SQL Editor (después de 002_portal.sql).
-- Incremental y no destructiva: solo agrega columnas y tablas nuevas.
-- Las RPCs del portal no se tocan: fee, accesos, reuniones y facturación
-- quedan automáticamente invisibles para los usuarios del portal.

-- 1) clients: relación comercial y planificación ------------------------------
alter table public.clients
  add column monthly_fee numeric not null default 0,
  add column currency text not null default 'USD',
  add column start_date date,
  add column active_services jsonb not null default '[]',
  add column active_channels jsonb not null default '[]',
  add column next_deliverable text not null default '';

-- 2) client_metrics: campos manuales adicionales ------------------------------
alter table public.client_metrics
  add column impressions int not null default 0,
  add column clicks int not null default 0;
-- CPL no se almacena: se calcula en la app como ad_spend / leads_generated.

-- 3) client_strategy (1:1 con cliente) ----------------------------------------
create table public.client_strategy (
  id text primary key default gen_random_uuid()::text,
  client_id text not null unique references public.clients(id) on delete cascade,
  brand_brief text not null default '',
  target_audience text not null default '',
  offer text not null default '',
  tone text not null default '',
  brand_promise text not null default '',
  differentiators text not null default '',
  competitors text not null default '',
  do_guidelines text not null default '',
  dont_guidelines text not null default '',
  strategic_notes text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);

-- 4) client_notes (notas estructuradas por cliente) ---------------------------
create table public.client_notes (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  title text not null,
  content text not null default '',
  type text not null default 'general'
    check (type in ('general','reunion','feedback','problema','decision','recordatorio')),
  is_pinned boolean not null default false,
  responsible text not null default '',
  related_entity_type text not null default '',
  related_entity_id text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);
create index client_notes_client_id_idx on public.client_notes (client_id);

-- 5) client_access (registro de accesos, SIN contraseñas) ----------------------
create table public.client_access (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  platform text not null,
  username_or_email text not null default '',
  url text not null default '',
  status text not null default 'pendiente'
    check (status in ('pendiente','solicitado','recibido','validado')),
  responsible text not null default '',
  requires_sensitive_access boolean not null default false,
  notes text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);
create index client_access_client_id_idx on public.client_access (client_id);

-- 6) client_meetings ------------------------------------------------------------
create table public.client_meetings (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  meeting_date date not null,
  type text not null default '',
  participants text not null default '',
  topics text not null default '',
  decisions text not null default '',
  pending_items text not null default '',
  next_meeting_date date,
  created_at date not null default current_date,
  updated_at date not null default current_date
);
create index client_meetings_client_id_idx on public.client_meetings (client_id);

-- 7) client_billing (un registro por período) -----------------------------------
create table public.client_billing (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  monthly_fee numeric not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'pendiente'
    check (payment_status in ('pendiente','pagado','vencido','parcial')),
  billing_date date,
  included_services text not null default '',
  observations text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);
create index client_billing_client_id_idx on public.client_billing (client_id);

-- 8) RLS: mismo patrón que 002 — solo el equipo accede ---------------------------
alter table public.client_strategy enable row level security;
alter table public.client_notes enable row level security;
alter table public.client_access enable row level security;
alter table public.client_meetings enable row level security;
alter table public.client_billing enable row level security;

create policy "team_all" on public.client_strategy for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.client_notes    for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.client_access   for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.client_meetings for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
create policy "team_all" on public.client_billing  for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));
