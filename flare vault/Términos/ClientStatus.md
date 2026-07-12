---
tags: [termino]
aliases: [Estado comercial]
fuente: lib/types.ts
actualizado: 2026-07-11
---

# ClientStatus

Estado **comercial** de un [[Client]]: `prospecto`, `onboarding`, `activo`, `pausado`, `cerrado`, `perdido`.

Solo los clientes `activo` generan [[Alertas operativas]] y [[Notificaciones]].

No confundir con [[ClientPhase]] (fase operativa) ni [[HealthStatus]] (salud de la cuenta).
