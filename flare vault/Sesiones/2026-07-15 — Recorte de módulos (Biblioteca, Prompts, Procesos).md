---
tags: [sesion]
actualizado: 2026-07-15
---

# 2026-07-15 — Recorte de módulos (Biblioteca, Prompts, Procesos)

El vault queda al día **hasta `92cf0ab`** (`feat: recorte de módulos que no se usan`, ya pusheado). Sesión anterior: hasta `ab164c8`.

Decisión de producto: se **eliminaron de la app** los módulos que no se usaban. Del lado agencia desaparecen Biblioteca (`/agency/library`, entidad `Resource`), Prompts (`/agency/prompts`, entidad `Prompt`) y Procesos (`/agency/processes`, entidad `Process`) — páginas, formularios, `resource-card`, `ProcessStatusBadge`, tipos (`Resource`/`Prompt`/`Process`/`ResourceType`/`ResourceCategory`/`ProcessStatus` y labels), schemas zod, mocks y el CRUD del [[Store de agencia (useFlare)|store]], que ya no consulta esas tablas. También se retiraron las páginas globales `clients/notes` y `clients/progress` (las [[ClientNote|notas]] siguen en la [[Vista 360 del cliente]]; el [[Progreso operativo|progreso]] sigue por cliente) y la pestaña "recursos" de la Vista 360. El grupo "Recursos" de `NAV_TABS` quedó sin ítems, la card "Progreso promedio" del [[Dashboard de clientes]] enlaza ahora a `/clients`, y se actualizaron tests E2E y copys de [[Ajustes]].

**Importante**: las tablas `resources`/`prompts`/`processes` de Supabase **no se borraron** — conservan sus datos por si se revierte la decisión; la app simplemente ya no las usa. Se conservan los módulos [[Métricas]], [[Facturación]] y las reuniones ([[ClientMeeting]]). La convención de [[Recurso interno]] sigue viva, ahora solo para [[Idea]] y [[Task]].

## Notas eliminadas (concepto retirado del código)
- `Módulos/Biblioteca de recursos`
- `Módulos/Biblioteca de prompts`
- `Módulos/Procesos (SOPs)`
- `Entidades/Resource`
- `Entidades/Prompt`
- `Entidades/Process`

(Los wikilinks a estas notas en bitácoras anteriores quedan rotos a propósito, como registro histórico.)

## Notas modificadas
- [[Home]] — fuera la fila "Recursos" de módulos y las tres entidades
- [[Recurso interno]] — la convención ahora cubre solo [[Idea]] y [[Task]]; nota sobre el comentario desactualizado en `lib/types.ts`
- [[Client]] — relaciones 1:N recortadas
- [[TaskArea]] — ya no aplica a procesos
- [[Vista 360 del cliente]] — sin pestaña "recursos"
- [[Directorio de clientes]] — sin vistas globales Progreso y Notas
- [[ClientNote]] — vive solo en la ficha del cliente
- [[Progreso operativo]] — dónde se muestra ahora
- [[Alertas operativas]] — consumidores actualizados
- [[Estructura del proyecto]] — convención clave, `components/` sin `library/`, migraciones 002…011, rutas API al día
- [[Store de agencia (useFlare)]] — sin CRUD de resources/prompts/processes; `clientName()` en `lib/store.tsx:421`
- [[Dashboard de clientes]] — enlace de la card "Progreso promedio"
