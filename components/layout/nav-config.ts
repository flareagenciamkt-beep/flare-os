// Configuración de navegación compartida por el top-nav (desktop) y el Sheet
// (mobile). Tabs con link directo o con sub-ítems (dropdown), gateadas por
// capacidad de rol.

import {
  Banknote,
  Building2,
  CheckSquare,
  FolderOpen,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Capability } from "@/lib/permissions";

export interface NavLeaf {
  href: string;
  label: string;
  capability?: Capability;
}

export interface NavTab {
  label: string;
  icon: LucideIcon;
  href?: string; // tab de link directo
  items?: NavLeaf[]; // tab con dropdown
  capability?: Capability; // gatea toda la tab
}

export const NAV_TABS: NavTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/clients/dashboard" },
  { label: "Agencia", icon: Building2, href: "/agency/dashboard" },
  {
    label: "Clientes",
    icon: Users,
    items: [
      { href: "/clients", label: "Directorio" },
      { href: "/clients/progress", label: "Progreso" },
      { href: "/clients/notes", label: "Notas" },
    ],
  },
  { label: "Contenido", icon: LayoutGrid, href: "/agency/content" },
  { label: "Tareas", icon: CheckSquare, href: "/agency/tasks" },
  {
    label: "Métricas",
    icon: LineChart,
    items: [
      { href: "/clients/metrics", label: "Por cliente" },
      { href: "/agency/metrics", label: "Operativas" },
    ],
  },
  {
    label: "Recursos",
    icon: FolderOpen,
    items: [
      { href: "/agency/library", label: "Biblioteca" },
      { href: "/agency/prompts", label: "Prompts" },
      { href: "/agency/processes", label: "Procesos" },
    ],
  },
  {
    label: "Facturación",
    icon: Banknote,
    href: "/clients/billing",
    capability: "viewBilling",
  },
];

// Todos los hrefs de una tab (link directo + sub-ítems).
export function tabHrefs(tab: NavTab): string[] {
  return [tab.href, ...(tab.items ?? []).map((i) => i.href)].filter(
    (h): h is string => Boolean(h),
  );
}

// Índice de la tab activa según el pathname: gana el href más específico
// (prefijo más largo) para resolver solapamientos (/clients vs /clients/metrics).
export function activeTabIndex(tabs: NavTab[], pathname: string): number {
  let best = -1;
  let bestLen = -1;
  tabs.forEach((tab, i) => {
    for (const href of tabHrefs(tab)) {
      const match = pathname === href || pathname.startsWith(`${href}/`);
      if (match && href.length > bestLen) {
        best = i;
        bestLen = href.length;
      }
    }
  });
  return best;
}
