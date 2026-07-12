---
tags: [modulo]
aliases: [Portal, (portal)]
fuente: app/(portal)/portal/, components/portal/
actualizado: 2026-07-11
---

# Portal de clientes

Superficie **externa** para las marcas: Inicio, Feed, Calendario y Métricas (`app/(portal)/portal/{page,feed,calendar,metrics}.tsx`), envuelta por `PortalGuard > PortalProvider > PortalShell`.

Qué puede hacer el cliente:
- Ver su [[PortalClient|ficha]], su [[Parrilla de publicación|parrilla]] y sus [[ClientMetric|métricas]].
- **Aprobar o pedir cambios** en piezas ([[Aprobación del cliente]], `components/portal/idea-dialog.tsx`).
- Comentar piezas ([[IdeaComment]]).
- Ver su [[Progreso operativo|portalProgress]], derivado de piezas reales.

Todo el acceso a datos pasa por RPCs seguras — [[Store del portal (usePortal)]] y [[Seguridad del portal]]. Solo entran usuarios con [[Roles|rol]] `client` ([[Autenticación y guards]]). Permisos finos por cliente en `Client.portalPermissions`.
