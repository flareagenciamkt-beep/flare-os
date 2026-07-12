-- 010: cuentas conectadas para analytics ---------------------------------------
-- Asocia cuentas de plataformas (Instagram, TikTok…) a cada cliente para
-- atribuir sus métricas. La conexión OAuth es opcional: sin credenciales de la
-- plataforma la cuenta queda "asociada" (modo manual). Los tokens OAuth viven
-- en una tabla aparte SIN policies: solo la service key del servidor los toca.

-- 1) connected_accounts ---------------------------------------------------------
create table public.connected_accounts (
  id text primary key default gen_random_uuid()::text,
  client_id text not null references public.clients(id) on delete cascade,
  provider text not null default 'instagram'
    check (provider in ('instagram','facebook','tiktok','youtube','linkedin','meta_ads','google_analytics','otro')),
  handle text not null default '',
  url text not null default '',
  external_id text not null default '',
  status text not null default 'asociada'
    check (status in ('asociada','conectada','expirada','error','desconectada')),
  sync_enabled boolean not null default false,
  connected_at timestamptz,
  last_sync_at timestamptz,
  notes text not null default '',
  created_at date not null default current_date,
  updated_at date not null default current_date
);
create index connected_accounts_client_id_idx on public.connected_accounts (client_id);

alter table public.connected_accounts enable row level security;
create policy "team_all" on public.connected_accounts for all to authenticated using ((select public.is_team())) with check ((select public.is_team()));

-- 2) connected_account_tokens ----------------------------------------------------
-- RLS habilitado SIN policies: ningún rol del navegador (anon/authenticated)
-- puede leer ni escribir. Solo los route handlers de app/api/integrations/*
-- (service key) gestionan tokens.
create table public.connected_account_tokens (
  account_id text primary key references public.connected_accounts(id) on delete cascade,
  access_token text not null,
  refresh_token text not null default '',
  expires_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.connected_account_tokens enable row level security;
