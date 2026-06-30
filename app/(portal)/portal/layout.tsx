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
    <div className="h-screen overflow-hidden p-0 sm:p-3 md:p-4" style={{ background: "#070606" }}>
      <div
        className="flex h-full flex-col overflow-hidden rounded-none sm:rounded-[28px]"
        style={{
          background:
            "radial-gradient(1100px 520px at 80% -240px, rgba(245,42,108,0.06), transparent 70%), linear-gradient(180deg, #100D0C, #0A0807)",
          border: "1px solid rgba(241,233,224,0.07)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(241,233,224,0.04)",
        }}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-flare">
              <Flame className="size-4 text-white" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{client.brand}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Portal de contenido · Flare
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full border border-[rgba(241,233,224,0.06)] bg-[rgba(0,0,0,0.25)] p-1">
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
                      "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-[rgba(241,233,224,0.08)] text-foreground shadow-[inset_0_0_0_1px_rgba(241,233,224,0.1)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar sesión"
              onClick={async () => {
                await getSupabase().auth.signOut();
                router.replace("/login");
              }}
            >
              <LogOut />
            </Button>
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-2 md:px-6">{children}</div>
        </main>
      </div>
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
