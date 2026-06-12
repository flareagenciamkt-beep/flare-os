"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalGuard } from "@/components/portal/portal-guard";
import { PortalProvider, usePortal } from "@/lib/portal-store";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/feed", label: "Feed" },
  { href: "/portal/calendar", label: "Calendario" },
  { href: "/portal/metrics", label: "Métricas" },
];

function PortalShell({ children }: { children: React.ReactNode }) {
  const { client } = usePortal();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-flare">
              <Flame className="size-4 text-white" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{client.brand}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Portal de contenido · Flare
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-1"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await getSupabase().auth.signOut();
                router.replace("/login");
              }}
            >
              <LogOut />
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard>
      <PortalProvider>
        <PortalShell>{children}</PortalShell>
      </PortalProvider>
    </PortalGuard>
  );
}
