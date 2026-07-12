---
tags: [modulo]
aliases: [Settings]
fuente: app/(app)/settings/page.tsx, components/settings/integrations-card.tsx
actualizado: 2026-07-12
---

# Ajustes

Configuración, paleta, equipo y gestión (`app/(app)/settings/page.tsx`). Gateado por la capability `manageSettings` — solo `admin` ([[Permisos y capacidades]]).

## Card "Integraciones · Meta" (`7ad8a53`)

`components/settings/integrations-card.tsx` consulta `GET /api/integrations/meta/status` (solo booleanos, sin secretos) y muestra:

- Si todo está listo (`metaConfigured` + `serverKeyConfigured`): aviso de integración activa apuntando a conectar cuentas desde la ficha del cliente.
- Si falta setup: **checklist guiado** de lo pendiente — crear la app en developers.facebook.com y poner `META_APP_ID`/`META_APP_SECRET`, y tener `SUPABASE_SECRET_KEY` en `.env.local`.

Ver [[Conexión OAuth de Meta]] y [[ConnectedAccount]].
