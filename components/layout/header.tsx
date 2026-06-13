"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlare } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import * as React from "react";

const SECTION_TITLES: [string, string][] = [
  ["/clients/dashboard", "Dashboard de clientes"],
  ["/clients/metrics", "Métricas por cliente"],
  ["/clients/progress", "Progreso por cliente"],
  ["/clients/notes", "Notas de clientes"],
  ["/clients/billing", "Facturación"],
  ["/clients", "Clientes / Marcas"],
  ["/agency/dashboard", "Dashboard de agencia"],
  ["/agency/ideas", "Ideas"],
  ["/agency/feed", "Feed"],
  ["/agency/kanban", "Kanban"],
  ["/agency/calendar", "Calendario"],
  ["/agency/tasks", "Tareas"],
  ["/agency/library", "Biblioteca"],
  ["/agency/prompts", "Prompts"],
  ["/agency/processes", "Procesos / SOPs"],
  ["/agency/metrics", "Métricas operativas"],
  ["/settings", "Ajustes"],
];

const SECTION_SUBS: Record<string, string> = {
  "/clients/dashboard": "RESUMEN GENERAL",
  "/clients": "DIRECTORIO DE CUENTAS",
  "/agency/dashboard": "CENTRO OPERATIVO",
  "/agency/calendar": "PLANIFICACIÓN",
  "/agency/ideas": "LABORATORIO",
  "/agency/kanban": "PRODUCCIÓN",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { clients } = useFlare();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "SR";

  const clientDetail = pathname.match(/^\/clients\/([^/]+)$/);
  const detailClient =
    clientDetail && !SECTION_TITLES.some(([p]) => p === pathname)
      ? clients.find((c) => c.id === clientDetail[1])
      : undefined;

  const title =
    detailClient?.brand ??
    SECTION_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "Flare OS";

  const sub = SECTION_SUBS[pathname] ?? "";

  const results = query.trim()
    ? clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.brand.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-6 px-[26px]" style={{ borderBottom: "1px solid rgba(241,233,224,0.06)", background: "rgba(12,10,9,0.7)", backdropFilter: "blur(12px)" }}>
      {/* Title area */}
      <div className="flex min-w-[230px] items-baseline gap-3">
        <span className="text-[16.5px] font-bold tracking-tight" style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.2px" }}>
          {title}
        </span>
        {sub && (
          <span className="font-mono text-[9.5px] tracking-[1.4px]" style={{ color: "#6e665f" }}>
            {sub}
          </span>
        )}
      </div>

      {/* Search bar */}
      <div className="flex flex-1 justify-center">
        <div className="relative flex w-full max-w-[400px] items-center gap-[9px] rounded-[10px] px-3 py-2 transition-all" style={{ background: "#110E0D", border: "1px solid rgba(241,233,224,0.07)" }}>
          <Search className="size-[13px] shrink-0" style={{ color: "#6e665f" }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar clientes, piezas, campañas…"
            className="flex-1 bg-transparent text-[13px] text-[#F1E9E0] outline-none placeholder:text-[#6e665f]"
          />
          <span className="rounded-[5px] font-mono text-[9.5px]" style={{ color: "#6e665f", border: "1px solid rgba(241,233,224,0.1)", padding: "2px 6px" }}>
            ⌘K
          </span>

          {open && results.length > 0 && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl shadow-2xl" style={{ background: "#14110F", border: "1px solid rgba(241,233,224,0.1)" }}>
              {results.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#D8CFC5] transition-colors hover:bg-[rgba(241,233,224,0.04)]"
                  onMouseDown={() => {
                    router.push(`/clients/${c.id}`);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="truncate font-medium">{c.brand}</span>
                  <span className="ml-auto font-mono text-[9px] tracking-[1px]" style={{ color: "#6e665f" }}>
                    {c.industry}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: notifications + avatar */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] transition-all hover:border-[rgba(241,233,224,0.2)]" style={{ border: "1px solid rgba(241,233,224,0.08)" }}>
          <Bell className="size-4" style={{ color: "#A39A91" }} />
          <span className="absolute right-[8px] top-[7px] h-[7px] w-[7px] rounded-full" style={{ background: "linear-gradient(90deg, #F52A6C, #FF6A35)", border: "2px solid #0A0808" }} />
        </div>

        <span className="h-[22px] w-px" style={{ background: "rgba(241,233,224,0.08)" }} />

        {/* User avatar */}
        {isSupabaseConfigured ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <div className="flare-gradient flex size-[30px] items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
                {initials}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {userEmail ?? "Sesión activa"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await getSupabase().auth.signOut();
                  router.replace("/login");
                }}
              >
                <LogOut /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flare-gradient flex size-[30px] cursor-pointer items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
