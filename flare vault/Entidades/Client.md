---
tags: [entidad]
aliases: [Cliente, clients]
fuente: lib/types.ts, supabase/schema.sql
actualizado: 2026-07-11
---

# Client

**Entidad central** de Flare OS (tabla `clients`). Casi todo cuelga de ella.

Campos núcleo: `name`, `brand`, `industry`, `status` ([[ClientStatus]]), `owner`, `priority` ([[Prioridad]]), `currentPhase` ([[ClientPhase]]), `healthStatus` ([[HealthStatus]]), `progressPercentage`, `description`, `mainGoal`, `monthlyGoal`, `contentGoal`, `mainKpi`, `nextAction`, `importantLinks` (`ClientLink[]`), `internalNotes`, `lastUpdate`.

Comercial (V1.1): `monthlyFee`, `currency` (USD/COP/EUR/MXN), `startDate`, `activeServices[]`, `activeChannels[]`, `nextDeliverable`.

Modales premium (V1.3, opcionales): `monthlyGoalType/Value`, `contentGoalType/Value`, `reviewFrequency`, `mainFormats[]`, `publishFrequency`, `contractType`, `paymentMethod`, `clientPaymentStatus`, `renewalDate`, `portalContactName`, `portalAccessEmail`, `portalRole`, `portalVisibility`, `portalPermissions` (`metrics/calendar/comment/approve/createTasks/reports/download`).

## Relaciones
- 1:N → [[Idea]], [[Task]], [[Resource]], [[Prompt]], [[Process]] (todas con `clientId` **nullable** → [[Recurso interno]]; `on delete set null`)
- 1:N cascade → [[ClientMetric]], [[ClientNote]], [[ClientAccess]], [[ClientMeeting]], [[ClientBilling]]
- 1:1 → [[ClientStrategy]] (`client_id unique`, cascade)
- [[Profile]].`clientId` (set null) vincula un usuario rol `client` a su marca
- Vista segura para el portal: [[PortalClient]]

Módulos que la consumen: [[Directorio de clientes]], [[Vista 360 del cliente]], [[Dashboard de clientes]], [[Notificaciones]].
