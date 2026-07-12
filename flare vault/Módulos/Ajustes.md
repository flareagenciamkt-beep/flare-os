---
tags: [modulo]
aliases: [Settings]
fuente: app/(app)/settings/page.tsx, components/settings/integrations-card.tsx
actualizado: 2026-07-12
---

# Ajustes

Configuración, paleta, equipo y gestión (`app/(app)/settings/page.tsx`). Gateado por la capability `manageSettings` — solo `admin` ([[Permisos y capacidades]]).

## Card "Integraciones · Meta" (`ab164c8`)

`components/settings/integrations-card.tsx` ya no es un checklist de env vars: es un **formulario** para configurar la integración sin tocar código. Consulta `GET /api/integrations/meta/credentials` (estados + App ID enmascarado, nunca el secreto) y según el resultado muestra:

- **Sin `SUPABASE_SECRET_KEY` en el servidor**: aviso ámbar — es la única variable de infraestructura que falta (se configura una vez en Vercel).
- **Sin credenciales de Meta**: formulario con **App ID** (input numérico) y **App Secret** (input `type="password"`, `autoComplete="off"`) que se guardan con `POST /credentials` (solo `admin`). Instrucciones inline: crear la app en developers.facebook.com (caso de uso Instagram + Insights) y pegar aquí.
- **Integración activa**: banner verde "Integración activa · App ID 1234…89" (indica si viene de variables de entorno) con botón **Cambiar** que reabre el formulario.

El secreto **nunca vuelve al navegador**: queda en la tabla server-only [[IntegrationSettings|`integration_settings`]]. En [[Modo demo vs Supabase|modo demo]] la card solo informa. Ver [[Conexión OAuth de Meta]] y [[ConnectedAccount]].
