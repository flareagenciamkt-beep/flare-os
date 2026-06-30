-- 006 · Simplifica los estados de las piezas a 7:
--   idea, en_produccion, en_revision_interna, en_revision_cliente,
--   aprobada, programada, publicada.
-- Remapea los estados legacy. `ideas.status` es text (sin enum), así que basta
-- con un UPDATE; el default ya es 'idea'.

update public.ideas set status = 'idea' where status = 'validada';
update public.ideas set status = 'idea' where status in ('pausada', 'archivada');

-- (Opcional) Garantiza que solo existan estados válidos de aquí en adelante.
alter table public.ideas
  drop constraint if exists ideas_status_check;
alter table public.ideas
  add constraint ideas_status_check check (status in (
    'idea',
    'en_produccion',
    'en_revision_interna',
    'en_revision_cliente',
    'aprobada',
    'programada',
    'publicada'
  ));
