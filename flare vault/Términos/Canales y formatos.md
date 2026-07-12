---
tags: [termino]
aliases: [Channel, IdeaFormat, IdeaCategory]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# Canales y formatos

Vocabulario de clasificación de una [[Idea]]:

- **Channel** (dónde se publica): `instagram`, `tiktok`, `facebook`, `linkedin`, `web`, `email`, `whatsapp`, `otro`. También en `Client.activeChannels[]`.
- **IdeaFormat** (qué es): `carrusel`, `reel`, `post`, `historia`, `tiktok`, `short`, `blog`, `email`, `landing`, `anuncio`, `automatizacion`, `otro`. También en `Client.mainFormats[]`.
- **IdeaCategory** (tipo de trabajo): `contenido`, `campana`, `automatizacion`, `web`, `estrategia`, `diseno`, `ventas`, `otro`.

Presets de negocio relacionados en `lib/form-options.ts`: `INDUSTRY_OPTIONS`, `MAIN_GOAL_OPTIONS`, `GOAL_TYPE_OPTIONS` (Leads, Ventas, Seguidores, Alcance…), `KPI_OPTIONS` (Leads por WhatsApp, Costo por lead, CPC, CPM…).
