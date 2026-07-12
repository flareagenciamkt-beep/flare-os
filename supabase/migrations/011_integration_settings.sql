-- 011: credenciales de integraciones configurables desde la app -----------------
-- Guarda las credenciales de integraciones (Meta, futuras) para que el admin
-- las pegue en Ajustes en vez de editar .env/Vercel. RLS habilitado SIN
-- policies: solo los route handlers (service key) leen/escriben. El navegador
-- jamás ve los secretos; la UI solo recibe estados y el app id enmascarado.

create table public.integration_settings (
  id text primary key, -- 'meta', 'google', ...
  settings jsonb not null default '{}'::jsonb,
  updated_by text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.integration_settings enable row level security;
