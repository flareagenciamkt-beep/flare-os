"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckSquare,
  Database,
  FileText,
  Kanban,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  LineChart,
  ListChecks,
  LogOut,
  Receipt,
  Settings,
  Sparkles,
  StickyNote,
  TrendingUp,
  Workflow,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";
import type { Profile } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  phase2?: boolean;
}

const ROLE_LABELS: Record<Profile["role"], string> = {
  team: "Equipo Flare",
  client: "Cliente",
};

function initialsFrom(value: string): string {
  const parts = value.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "CLIENTES",
    items: [
      { href: "/clients/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/clients", label: "Clientes", icon: Building2 },
      { href: "/clients/metrics", label: "Métricas", icon: LineChart },
      { href: "/clients/progress", label: "Progreso", icon: TrendingUp },
    ],
  },
  {
    title: "PRODUCCIÓN",
    items: [
      { href: "/agency/ideas", label: "Ideas", icon: Lightbulb },
      { href: "/agency/feed", label: "Feed", icon: LayoutGrid },
      { href: "/agency/kanban", label: "Kanban", icon: Kanban },
      { href: "/agency/calendar", label: "Calendario", icon: CalendarDays },
      { href: "/agency/tasks", label: "Tareas", icon: CheckSquare },
    ],
  },
  {
    title: "AGENCIA",
    items: [
      { href: "/agency/dashboard", label: "Vista agencia", icon: LayoutDashboard },
      { href: "/agency/metrics", label: "Métricas op.", icon: ListChecks },
      { href: "/clients/notes", label: "Notas", icon: StickyNote },
      { href: "/clients/billing", label: "Facturación", icon: Receipt },
      { href: "/agency/library", label: "Biblioteca", icon: BookOpen },
      { href: "/agency/prompts", label: "Prompts", icon: Sparkles, phase2: true },
      { href: "/agency/processes", label: "Procesos", icon: Workflow, phase2: true },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/clients") {
    return (
      pathname === "/clients" ||
      (pathname.startsWith("/clients/") &&
        !["/clients/dashboard", "/clients/metrics", "/clients/progress", "/clients/notes", "/clients/billing"].some(
          (p) => pathname.startsWith(p),
        ))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-[11px] rounded-[11px] px-[11px] py-[9px] text-[14px] transition-all",
        active
          ? "font-semibold text-[#F1E9E0]"
          : "font-medium text-[#8a827a] hover:bg-[rgba(241,233,224,0.045)] hover:text-[#F1E9E0]",
      )}
      style={
        active
          ? {
              background: "rgba(241,233,224,0.045)",
              border: "1px solid rgba(241,233,224,0.08)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }
          : { border: "1px solid transparent" }
      }
    >
      {/* Active bar indicator */}
      <span
        className="absolute left-0 top-1/2 w-[3px] rounded-r-[3px] transition-all"
        style={{
          transform: "translateY(-50%)",
          height: active ? "18px" : "0px",
          background: active ? "linear-gradient(180deg, #F52A6C, #FF6A35)" : "transparent",
          boxShadow: active ? "0 0 12px rgba(245,42,108,0.5)" : "none",
        }}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-[#F52A6C]" : "text-[#6e665f] group-hover:text-[#A39A91]",
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.phase2 && (
        <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: "rgba(199,146,234,0.5)" }} title="Fase 2" />
      )}
    </Link>
  );
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Carga el perfil del usuario logueado para el bloque inferior.
    void getOwnProfile().then(setProfile);
  }, []);

  const displayName = profile?.name || profile?.email || "Modo demo";
  const roleLabel = profile ? ROLE_LABELS[profile.role] : "DATOS MOCK";
  const initials = profile ? initialsFrom(profile.name || profile.email) : "FL";

  return (
    <>
      {/* Backdrop en móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        onClick={(e) => {
          // En móvil, navegar cierra el drawer.
          if (onClose && (e.target as HTMLElement).closest("a")) onClose();
        }}
        className={cn(
          "relative z-50 flex w-[246px] shrink-0 flex-col transition-transform duration-300",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:h-full",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full md:translate-x-0",
        )}
        style={{ background: "linear-gradient(180deg, #0D0B0A, #0A0807)", borderRight: "1px solid rgba(241,233,224,0.06)", padding: "24px 14px 16px" }}
      >
      {/* Gradient border glow on right edge */}
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-px" style={{ background: "linear-gradient(180deg, transparent, rgba(245,42,108,0.18) 30%, rgba(255,106,53,0.12) 60%, transparent)" }} />

      {/* Logo area */}
      <div className="flex items-center gap-[11px] px-2.5 pb-[22px]">
        <Image
          src="/flare-logo-v2.png"
          alt="flare"
          width={84}
          height={56}
          priority
          style={{ filter: "drop-shadow(0 2px 12px rgba(245,42,108,0.3))", objectFit: "contain" }}
        />
        <span className="whitespace-pre rounded-[6px] font-mono text-[8px] leading-[1.3] tracking-[1.6px]" style={{ color: "#6e665f", border: "1px solid rgba(241,233,224,0.1)", padding: "3px 6px" }}>
          {"CREATIVE\nOS · V1"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title} className="mb-1.5 flex flex-col gap-[3px]" style={{ paddingTop: i > 0 ? "10px" : "0", borderTop: i > 0 ? "1px solid rgba(241,233,224,0.06)" : "none" }}>
            <div className="px-2.5 pb-[7px] text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6e665f" }}>
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </div>
        ))}
      </nav>

      {/* Settings & logout */}
      <div className="flex flex-col gap-1 border-t border-[rgba(241,233,224,0.06)] pt-2">
        <NavLink
          item={{ href: "/settings", label: "Ajustes", icon: Settings }}
          active={pathname.startsWith("/settings")}
        />
        {isSupabaseConfigured && (
          <button
            onClick={async () => {
              await getSupabase().auth.signOut();
              router.replace("/login");
            }}
            className="group flex w-full items-center gap-[11px] rounded-[11px] px-[11px] py-[9px] text-[14px] font-medium text-[#8a827a] transition-all hover:bg-[rgba(241,233,224,0.045)] hover:text-[#F1E9E0]"
            style={{ border: "1px solid transparent" }}
          >
            <LogOut className="size-4 shrink-0 text-[#6e665f] transition-colors group-hover:text-[#A39A91]" />
            Cerrar sesión
          </button>
        )}
      </div>

      {/* User profile */}
      <div className="mt-1.5 flex items-center gap-[11px] rounded-[13px] px-[11px] py-3" style={{ background: "rgba(241,233,224,0.025)", border: "1px solid rgba(241,233,224,0.06)" }}>
        <div className="flare-gradient flex size-[34px] shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold text-white" style={{ fontFamily: "var(--font-display), sans-serif", boxShadow: "0 4px 14px rgba(245,42,108,0.32)" }}>
          {initials}
        </div>
        <div className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-[13px] font-semibold text-[#F1E9E0]">{displayName}</span>
          <span className="truncate text-[11px]" style={{ color: "#8a827a" }}>{roleLabel}</span>
        </div>
        <span className="ml-auto h-[7px] w-[7px] shrink-0 rounded-full animate-pulse-glow" style={{ background: "#3DD68C", boxShadow: "0 0 8px rgba(61,214,140,0.7)" }} />
      </div>

      {/* Connection status */}
      <div className="mt-2 flex items-center gap-2 px-2.5">
        {isSupabaseConfigured ? (
          <>
            <Database className="size-3.5" style={{ color: "#3DD68C" }} />
            <p className="text-[11px]" style={{ color: "#6e665f" }}>Supabase conectado</p>
          </>
        ) : (
          <>
            <FileText className="size-3.5" style={{ color: "#6e665f" }} />
            <p className="text-[11px]" style={{ color: "#6e665f" }}>Modo demo · datos mock</p>
          </>
        )}
      </div>
      </aside>
    </>
  );
}
