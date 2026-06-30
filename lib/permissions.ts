// Capacidades por rol. Centraliza qué puede hacer cada rol para gatear la UI
// (la seguridad real la impone RLS en Supabase).

import type { Role } from "./types";

export type Capability =
  | "viewAgency" // entrar al módulo agencia
  | "manageContent" // crear/editar ideas, tareas, mover en kanban
  | "approveInternally" // aprobar piezas internamente
  | "manageClients" // crear/editar/eliminar clientes
  | "viewBilling" // ver facturación
  | "manageBilling" // registrar/editar cobros
  | "managePortalAccess" // crear/vincular usuarios del portal
  | "manageSettings" // ajustes y configuración
  | "manageTeam"; // administrar miembros del equipo

const MATRIX: Record<Role, Capability[]> = {
  admin: [
    "viewAgency",
    "manageContent",
    "approveInternally",
    "manageClients",
    "viewBilling",
    "manageBilling",
    "managePortalAccess",
    "manageSettings",
    "manageTeam",
  ],
  team: [
    "viewAgency",
    "manageContent",
    "approveInternally",
    "manageClients",
    "viewBilling",
    "managePortalAccess",
  ],
  client: [],
};

export function can(role: Role | null | undefined, capability: Capability): boolean {
  // Sin rol conocido (modo demo sin Supabase) → se asume admin para no bloquear
  // la demo; con Supabase el rol real siempre está presente.
  if (!role) return true;
  return MATRIX[role].includes(capability);
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  team: "Equipo Flare",
  client: "Cliente",
};
