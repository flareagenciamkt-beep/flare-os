---
tags: [entidad]
aliases: [client_access, Accesos]
fuente: supabase/migrations/003
actualizado: 2026-07-12
---

# ClientAccess

Registro de accesos/credenciales del cliente **sin contraseñas** (tabla `client_access`, FK→[[Client]] cascade).

**No confundir con [[ConnectedAccount]]** (V1.4): esto es el *checklist* de accesos que el cliente debe entregar; aquella identifica la cuenta cuyas métricas se miden.

Campos: `platform`, `usernameOrEmail`, `url`, `status` (`AccessStatus`: `pendiente | solicitado | recibido | validado | problema`), `responsible`, `requiresSensitiveAccess`, `notes`.

- "Accesos pendientes" alimenta [[Alertas operativas]].
- Desde `7ad8a53`, los accesos que parecen cuentas medibles (Instagram, Meta Ads…) se ofrecen como **sugerencias 1-clic** para asociarlos como [[ConnectedAccount]] (`providerFromPlatform` en `connected-accounts-section.tsx` mapea el texto libre de `platform` a un proveedor).
- Nunca se expone al portal ([[Seguridad del portal]]).
- Pestaña "accesos" de la [[Vista 360 del cliente]].
