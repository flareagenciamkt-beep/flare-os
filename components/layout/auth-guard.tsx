"use client";

// Protege el shell de la app: con Supabase configurado exige sesión activa;
// en modo demo (sin credenciales) deja pasar directo.

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";
import { Splash } from "./splash";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(!isSupabaseConfigured);

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
      // Los usuarios del portal no entran a la app interna.
      // Perfil null (migración pendiente / error) → comportamiento de equipo:
      // solo afecta el ruteo, el acceso a datos lo protege RLS.
      const profile = await getOwnProfile();
      if (cancelled) return;
      if (profile?.role === "client") {
        router.replace("/portal");
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

  if (!ready) return <Splash label="Verificando sesión..." />;
  return <>{children}</>;
}
