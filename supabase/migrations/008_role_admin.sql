-- 008 · Rol "admin" además de team/client.
-- admin opera como el equipo a nivel de datos (RLS) y suma capacidades extra
-- que se gatean en la UI (ajustes, facturación, gestión).

-- 1) Permitir 'admin' en el check de role.
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'team', 'client'));

-- 2) is_team() ahora incluye admin: las policies team_all cubren a los admins.
create or replace function public.is_team()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = (select auth.uid()) and role in ('team', 'admin')
  );
$$;

-- (Para promover un usuario a admin):
--   update public.profiles set role = 'admin' where email = 'tu@correo.com';
