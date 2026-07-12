---
tags: [arquitectura]
fuente: lib/store.tsx
actualizado: 2026-07-12
---

# Store de agencia (`useFlare`)

Store global en memoria (`lib/store.tsx`, `FlareStoreProvider`, hook `useFlare()`) que alimenta todo el módulo interno.

- En [[Modo demo vs Supabase|modo Supabase]] hace carga inicial (`fetchAll`) y cada mutación es **optimista + persistencia** (`makeCrud` con `add/update/remove` → `persist()`).
- Estados de carga: `loading | ready | missing-schema | error`.
- `clientName()` (`lib/store.tsx:446`) etiqueta `clientId: null` como "Flare (interno)" — ver [[Recurso interno]].
- `moveIdea()` replica la lógica del trigger `reset_idea_approval`: al entrar una [[Idea]] a `en_revision_cliente` se resetea la [[ClientApproval]] a `pendiente`. Ver [[Aprobación del cliente]].
- `approveIdea()` = aprobación interna del equipo (capability `approveInternally`, ver [[Permisos y capacidades]]).
- `upsertStrategy()` para [[ClientStrategy]] (relación 1:1 con [[Client]]).
- Desde V1.4 gestiona [[ConnectedAccount]]: `connectedAccounts` + `addConnectedAccount`/`updateConnectedAccount`/`deleteConnectedAccount` (mock `MOCK_CONNECTED_ACCOUNTS`).

Contraparte externa: [[Store del portal (usePortal)]].
