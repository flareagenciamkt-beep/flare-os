"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, LogOut, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlare } from "@/lib/store";
import { clientAlerts } from "@/lib/stats";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import * as React from "react";

const NUM_FMT = new Intl.NumberFormat("es-CO");

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
  "/clients/dashboard": "Resumen general",
  "/clients": "Directorio de cuentas",
  "/agency/dashboard": "Centro operativo",
  "/agency/calendar": "Planificación",
  "/agency/ideas": "Laboratorio",
  "/agency/kanban": "Producción",
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clients, ideas, tasks, metrics, accesses, billing } = useFlare();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "FL";

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

  // Notificaciones reales: una entrada por alerta operativa de cada cliente
  // activo, más los cobros vencidos. Las críticas (atrasos, vencidos) van primero.
  const notifs = React.useMemo(() => {
    const items: {
      id: string;
      brand: string;
      detail: string;
      href: string;
      danger: boolean;
    }[] = [];
    for (const c of clients) {
      if (c.status !== "activo") continue;
      for (const detail of clientAlerts(c, ideas, tasks, metrics, accesses)) {
        items.push({
          id: `${c.id}-${detail}`,
          brand: c.brand,
          detail,
          href: `/clients/${c.id}`,
          danger: /atrasad|cr[ií]tico|vencid/i.test(detail),
        });
      }
    }
    for (const b of billing) {
      if (b.paymentStatus !== "vencido") continue;
      const brand = clients.find((c) => c.id === b.clientId)?.brand ?? "Cliente";
      items.push({
        id: `bill-${b.id}`,
        brand,
        detail: `Cobro vencido — ${NUM_FMT.format(b.monthlyFee)} ${b.currency}`,
        href: "/clients/billing",
        danger: true,
      });
    }
    return items.sort((a, z) => Number(z.danger) - Number(a.danger));
  }, [clients, ideas, tasks, metrics, accesses, billing]);
  const alertCount = notifs.length;

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
    <header className="flex h-[60px] shrink-0 items-center gap-3 px-4 md:gap-6 md:px-[26px]" style={{ borderBottom: "1px solid rgba(241,233,224,0.06)", background: "rgba(12,10,9,0.7)", backdropFilter: "blur(12px)" }}>
      {/* Botón de menú (solo móvil) */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="flex size-9 shrink-0 items-center justify-center rounded-[10px] md:hidden"
        style={{ border: "1px solid rgba(241,233,224,0.08)" }}
      >
        <Menu className="size-[18px]" style={{ color: "#A39A91" }} />
      </button>

      {/* Title area */}
      <div className="flex items-baseline gap-3 md:min-w-[230px]">
        <span className="truncate text-[16.5px] font-bold tracking-tight" style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.2px" }}>
          {title}
        </span>
        {sub && (
          <span className="hidden text-[12px] lg:inline" style={{ color: "#6e665f" }}>
            {sub}
          </span>
        )}
      </div>

      {/* Search bar */}
      <div className="hidden flex-1 justify-center sm:flex">
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
                  <span className="ml-auto text-[11px]" style={{ color: "#6e665f" }}>
                    {c.industry}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: notifications + avatar */}
      <div className="ml-auto flex items-center gap-3 md:gap-4">
        {/* Notification bell — panel con alertas operativas y cobros vencidos */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                aria-label={
                  alertCount > 0 ? `${alertCount} notificaciones` : "Sin notificaciones"
                }
                className="relative flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] outline-none transition-all hover:border-[rgba(241,233,224,0.2)] focus-visible:ring-2 focus-visible:ring-ring"
                style={{ border: "1px solid rgba(241,233,224,0.08)" }}
              />
            }
          >
            <Bell className="size-4" style={{ color: "#A39A91" }} />
            {alertCount > 0 && (
              <span
                className="absolute -right-[5px] -top-[5px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold text-white"
                style={{ background: "linear-gradient(90deg, #F52A6C, #FF6A35)", border: "2px solid #0A0808" }}
              >
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[13px] font-semibold">Notificaciones</span>
              {alertCount > 0 && (
                <span className="text-[11px] text-muted-foreground">{alertCount}</span>
              )}
            </div>
            <DropdownMenuSeparator className="my-0" />
            {notifs.length === 0 ? (
              <div className="px-3 py-8 text-center text-[12px] text-muted-foreground">
                Todo en orden — sin alertas operativas.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto py-1">
                {notifs.slice(0, 12).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => router.push(n.href)}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[rgba(241,233,224,0.04)]"
                  >
                    <span
                      className="mt-[5px] size-1.5 shrink-0 rounded-full"
                      style={{ background: n.danger ? "#FF5C5C" : "#FFC247" }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-[#F1E9E0]">
                        {n.brand}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        {n.detail}
                      </span>
                    </span>
                  </button>
                ))}
                {notifs.length > 12 && (
                  <p className="px-3 pb-1 pt-2 text-center text-[11px] text-muted-foreground">
                    +{notifs.length - 12} más
                  </p>
                )}
              </div>
            )}
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem
              onClick={() => router.push("/clients/dashboard")}
              className="justify-center text-[12px] font-medium text-flare-soft"
            >
              Ver dashboard de clientes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="h-[22px] w-px" style={{ background: "rgba(241,233,224,0.08)" }} />

        {/* User avatar */}
        {isSupabaseConfigured ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <div className="flare-gradient flex size-[30px] items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ fontFamily: "var(--font-display), sans-serif" }}>
                {initials}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">
                  {userEmail ?? "Sesión activa"}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
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
          <div className="flare-gradient flex size-[30px] cursor-pointer items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ fontFamily: "var(--font-display), sans-serif" }}>
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
