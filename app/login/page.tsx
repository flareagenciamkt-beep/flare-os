"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Flame, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const routeByRole = React.useCallback(async () => {
    const profile = await getOwnProfile();
    router.replace(profile?.role === "client" ? "/portal" : "/clients/dashboard");
  }, [router]);

  // Si ya hay sesión activa, entrar directo según el rol.
  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) void routeByRole();
      });
  }, [routeByRole]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : authError.message,
      );
      return;
    }
    await routeByRole();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-flare">
            <Flame className="size-6 text-white" />
          </div>
          <h1 className="text-lg font-semibold">Flare OS</h1>
          <p className="text-xs text-muted-foreground">
            Sistema operativo interno de Flare
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          {isSupabaseConfigured ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@flare.agency"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn data-icon="inline-start" />
                {loading ? "Entrando..." : "Iniciar sesión"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Los usuarios del equipo se crean en Supabase → Authentication.
              </p>
            </form>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium">Modo demo activo</p>
              <p className="text-xs text-muted-foreground">
                No hay credenciales de Supabase en .env.local, así que Flare OS corre
                con datos de ejemplo sin necesidad de iniciar sesión.
              </p>
              <Button className="w-full" onClick={() => router.replace("/clients/dashboard")}>
                Entrar en modo demo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
