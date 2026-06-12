"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckSquare,
  Database,
  FileText,
  Flame,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  LineChart,
  ListChecks,
  Settings,
  Sparkles,
  StickyNote,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CLIENT_NAV: NavItem[] = [
  { href: "/clients/dashboard", label: "Dashboard clientes", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes / Marcas", icon: Building2 },
  { href: "/clients/metrics", label: "Métricas por cliente", icon: LineChart },
  { href: "/clients/progress", label: "Progreso por cliente", icon: TrendingUp },
  { href: "/clients/notes", label: "Notas de clientes", icon: StickyNote },
];

const AGENCY_NAV: NavItem[] = [
  { href: "/agency/dashboard", label: "Dashboard agencia", icon: LayoutDashboard },
  { href: "/agency/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/agency/feed", label: "Feed", icon: LayoutGrid },
  { href: "/agency/kanban", label: "Kanban", icon: Kanban },
  { href: "/agency/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/agency/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/agency/library", label: "Biblioteca", icon: BookOpen },
  { href: "/agency/prompts", label: "Prompts", icon: Sparkles },
  { href: "/agency/processes", label: "Procesos / SOPs", icon: Workflow },
  { href: "/agency/metrics", label: "Métricas operativas", icon: ListChecks },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-flare" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      {item.label}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/clients") {
    // Evitar que "Clientes / Marcas" se marque activo en /clients/dashboard, etc.
    return (
      pathname === "/clients" ||
      (pathname.startsWith("/clients/") &&
        !["/clients/dashboard", "/clients/metrics", "/clients/progress", "/clients/notes"].some(
          (p) => pathname.startsWith(p),
        ))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-flare">
          <Flame className="size-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Flare OS</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Agency System · V1
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Clientes
        </p>
        <div className="space-y-0.5">
          {CLIENT_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>

        <p className="mt-6 mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Agencia
        </p>
        <div className="space-y-0.5">
          {AGENCY_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavLink
          item={{ href: "/settings", label: "Ajustes", icon: Settings }}
          active={pathname.startsWith("/settings")}
        />
        <div className="mt-3 flex items-center gap-2 px-2.5">
          {isSupabaseConfigured ? (
            <>
              <Database className="size-3.5 text-emerald-400" />
              <p className="text-[11px] text-muted-foreground">Supabase conectado</p>
            </>
          ) : (
            <>
              <FileText className="size-3.5 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">Modo demo · datos mock</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
