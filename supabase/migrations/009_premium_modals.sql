-- 009 · Modales premium: remap de enums (cliente) + columnas nuevas en
-- clients / ideas / tasks. Todas las columnas son text/jsonb (sin enums PG),
-- así que basta agregarlas como nullable y remapear los valores legacy.

-- ── Remap de valores de estado del cliente ─────────────────────────────────
update public.clients set health_status = 'observacion' where health_status = 'atencion';
update public.clients set health_status = 'riesgo'      where health_status = 'atrasado';
update public.clients set current_phase = 'optimizacion'   where current_phase = 'pausa';
update public.clients set current_phase = 'reporte_mensual' where current_phase = 'cerrado';

-- ── clients: campos nuevos de los modales premium ──────────────────────────
alter table public.clients
  add column if not exists monthly_goal_type text,
  add column if not exists monthly_goal_value numeric,
  add column if not exists content_goal_type text,
  add column if not exists content_goal_value numeric,
  add column if not exists review_frequency text,
  add column if not exists main_formats jsonb default '[]'::jsonb,
  add column if not exists publish_frequency text,
  add column if not exists contract_type text,
  add column if not exists payment_method text,
  add column if not exists client_payment_status text,
  add column if not exists renewal_date date,
  add column if not exists portal_contact_name text,
  add column if not exists portal_access_email text,
  add column if not exists portal_role text,
  add column if not exists portal_visibility text,
  add column if not exists portal_permissions jsonb default '{}'::jsonb;

-- ── ideas: tipo de idea ────────────────────────────────────────────────────
alter table public.ideas
  add column if not exists idea_type text;

-- ── tasks: tipo de tarea + checklist ───────────────────────────────────────
alter table public.tasks
  add column if not exists task_type text,
  add column if not exists checklist jsonb default '[]'::jsonb;

-- ── ideas: galería de imágenes (carruseles) ────────────────────────────────
alter table public.ideas
  add column if not exists images jsonb default '[]'::jsonb;
