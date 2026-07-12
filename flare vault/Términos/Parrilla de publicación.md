---
tags: [termino]
aliases: [Parrilla, Calendario de contenido, ideaDate]
fuente: lib/dates.ts, components/ideas/calendar-view.tsx
actualizado: 2026-07-11
---

# Parrilla de publicación

Las vistas **Calendario** y **Feed** del módulo [[Contenido]] son la parrilla de publicación de cada cliente.

- Fecha efectiva de una [[Idea]]: `publishDate ?? suggestedDate` (`ideaDate`).
- `ideasPerWeekday` (en `lib/stats.ts`) genera la distribución lunes→domingo para el [[Dashboard de agencia]].
- El cliente ve su propia parrilla en el [[Portal de clientes]] (Feed y Calendario).
- "Contenido sin fecha" es una de las [[Alertas operativas]].

Las piezas llegan a la parrilla al alcanzar `programada` en el [[Ciclo de vida de una pieza]].
