"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const results = query.trim()
    ? clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.brand.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  const section = pathname.startsWith("/agency")
    ? "Agencia"
    : pathname.startsWith("/settings")
      ? "General"
      : "Clientes";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xs text-muted-foreground">{section}</span>
        <span className="text-xs text-muted-foreground">/</span>
        <h1 className="truncate text-sm font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar cliente..."
            className="h-8 pl-8 text-sm"
          />
          {open && results.length > 0 && (
            <div className="absolute top-9 z-50 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
              {results.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  onMouseDown={() => {
                    router.push(`/clients/${c.id}`);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{c.brand}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {c.industry}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {isSupabaseConfigured ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <Avatar className="size-7">
                <AvatarFallback className="bg-flare/15 text-xs font-semibold text-flare-soft">
                  {initials}
                </AvatarFallback>
              </Avatar>
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
          <Avatar className="size-7">
            <AvatarFallback className="bg-flare/15 text-xs font-semibold text-flare-soft">
              JA
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
