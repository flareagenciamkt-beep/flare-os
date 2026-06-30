"use client";

// Navegación superior tipo pill (reemplaza el sidebar). Logo a la izquierda,
// tabs en píldoras al centro (link directo o dropdown), y a la derecha búsqueda
// compacta + notificaciones + avatar. En mobile, las tabs colapsan en un Sheet.

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Search, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Notifications } from "@/components/layout/notifications";
import { useRole } from "@/components/layout/role-provider";
import { NAV_TABS, activeTabIndex, tabHrefs } from "@/components/layout/nav-config";
import { ROLE_LABELS } from "@/lib/permissions";
import { useFlare } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const PILL_ACTIVE =
  "bg-[rgba(241,233,224,0.08)] text-[#F1E9E0] shadow-[inset_0_0_0_1px_rgba(241,233,224,0.1)]";
const PILL_IDLE =
  "text-[#8a827a] hover:bg-[rgba(241,233,224,0.04)] hover:text-[#F1E9E0]";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { can, profile } = useRole();
  const { clients } = useFlare();

  const tabs = NAV_TABS.filter((t) => !t.capability || can(t.capability));
  const activeIdx = activeTabIndex(tabs, pathname);

  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "FL";

  const results = query.trim()
    ? clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.brand.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  const isLeafActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 px-3 md:px-5">
      {/* Logo */}
      <Link href="/clients/dashboard" className="flex shrink-0 items-center">
        <Image
          src="/flare-logo-v2.png"
          alt="Flare OS"
          width={84}
          height={56}
          priority
          className="h-9 w-auto"
          style={{ filter: "drop-shadow(0 2px 12px rgba(245,42,108,0.3))", objectFit: "contain" }}
        />
      </Link>

      {/* Tabs (desktop) — grupo en píldora */}
      <nav className="mx-auto hidden max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-[rgba(241,233,224,0.06)] bg-[rgba(0,0,0,0.25)] p-1 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, i) => {
          const active = i === activeIdx;
          const cls = cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? PILL_ACTIVE : PILL_IDLE,
          );
          if (tab.href) {
            return (
              <Link key={tab.label} href={tab.href} className={cls}>
                {tab.label}
              </Link>
            );
          }
          return (
            <DropdownMenu key={tab.label}>
              <DropdownMenuTrigger render={<button className={cls} />}>
                {tab.label}
                <ChevronDown className="size-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {(tab.items ?? []).map((leaf) => (
                  <DropdownMenuItem
                    key={leaf.href}
                    onClick={() => router.push(leaf.href)}
                    className={cn(isLeafActive(leaf.href) && "text-flare-soft")}
                  >
                    {leaf.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </nav>

      {/* Cluster derecho */}
      <div className="ml-auto flex items-center gap-2">
        {/* Búsqueda compacta (xl+) */}
        <div className="relative hidden xl:block">
          <div
            className="flex w-56 items-center gap-2 rounded-full px-3 py-2"
            style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(241,233,224,0.07)" }}
          >
            <Search className="size-[13px] shrink-0" style={{ color: "#6e665f" }} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Buscar clientes…"
              className="flex-1 bg-transparent text-[13px] text-[#F1E9E0] outline-none placeholder:text-[#6e665f]"
            />
          </div>
          {searchOpen && results.length > 0 && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 overflow-hidden rounded-xl shadow-2xl"
              style={{ background: "#14110F", border: "1px solid rgba(241,233,224,0.1)" }}
            >
              {results.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#D8CFC5] transition-colors hover:bg-[rgba(241,233,224,0.04)]"
                  onMouseDown={() => {
                    router.push(`/clients/${c.id}`);
                    setQuery("");
                    setSearchOpen(false);
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

        <Notifications />

        {/* Avatar */}
        {isSupabaseConfigured ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Cuenta" />}
            >
              <span
                className="flare-gradient flex size-9 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {initials}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate">{userEmail ?? "Sesión activa"}</span>
                  {profile && (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {ROLE_LABELS[profile.role]}
                    </span>
                  )}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {can("manageSettings") && (
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings /> Ajustes
                </DropdownMenuItem>
              )}
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
          <span
            className="flare-gradient flex size-9 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {initials}
          </span>
        )}

        {/* Hamburguesa (mobile) */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="flex size-9 items-center justify-center rounded-full bg-[rgba(241,233,224,0.05)] lg:hidden"
        >
          <Menu className="size-[18px]" style={{ color: "#A39A91" }} />
        </button>
      </div>

      {/* Nav mobile (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetTitle className="px-5 pb-1 pt-5">Navegación</SheetTitle>
          <nav className="flex flex-col gap-1 overflow-y-auto px-3 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const targets = tabHrefs(tab);
              const active = targets.some(isLeafActive);
              if (tab.href) {
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active ? PILL_ACTIVE : PILL_IDLE,
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {tab.label}
                  </Link>
                );
              }
              return (
                <div key={tab.label} className="mt-1">
                  <p className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="size-3.5" />
                    {tab.label}
                  </p>
                  {(tab.items ?? []).map((leaf) => (
                    <Link
                      key={leaf.href}
                      href={leaf.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-medium",
                        isLeafActive(leaf.href) ? PILL_ACTIVE : PILL_IDLE,
                      )}
                    >
                      {leaf.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
