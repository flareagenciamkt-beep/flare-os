-- ─── 005: Storage para subir piezas (imágenes/archivos) ─────────────────────
-- Ejecutar UNA VEZ en Supabase → SQL Editor (después de las migraciones previas).
--
-- Crea el bucket público "media" y sus políticas:
-- * Lectura pública (para mostrar las imágenes de las piezas en la app/portal).
-- * Subir / actualizar / borrar SOLO el equipo Flare autenticado (is_team()).
-- El bucket es público en LECTURA: no subas aquí archivos sensibles.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Lectura pública de los archivos del bucket.
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- Subir: solo el equipo autenticado.
drop policy if exists "media_team_insert" on storage.objects;
create policy "media_team_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_team()));

-- Actualizar: solo el equipo.
drop policy if exists "media_team_update" on storage.objects;
create policy "media_team_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_team()))
  with check (bucket_id = 'media' and (select public.is_team()));

-- Borrar: solo el equipo.
drop policy if exists "media_team_delete" on storage.objects;
create policy "media_team_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_team()));
