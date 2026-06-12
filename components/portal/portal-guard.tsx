"use client";

// Guard del portal: exige Supabase configurado + sesión + rol 'client'.
// Los usuarios del equipo que entren a /portal van al dashboard interno.

import * as React from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Splash } from "@/components/layout/splash";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    let cancelled = false;

    async function check() {
      const { data } = await sb.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const profile = await getOwnProfile();
      if (cancelled) return;
      if (profile?.role !== "client") {
        router.replace("/clients/dashboard");
        return;
      }
      setReady(true);
    }
    void check();

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-flare">
            <Flame className="size-5 text-white" />
          </div>
          <p className="mt-3 text-sm font-semibold">Portal de clientes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            El portal requiere conexión a Supabase. La app está en modo demo
            (sin credenciales en .env.local), así que esta sección no está disponible.
          </p>
          <Button className="mt-4" onClick={() => router.replace("/login")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) return <Splash label="Verificando acceso..." />;
  return <>{children}</>;
}
