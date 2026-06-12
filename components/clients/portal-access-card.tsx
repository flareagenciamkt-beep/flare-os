"use client";

// Gestión de acceso al portal para un cliente: lista los usuarios vinculados
// y permite vincular/desvincular perfiles por email (solo equipo, vía RLS).

import * as React from "react";
import { KeyRound, Link2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fromRow, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export function PortalAccessCard({ clientId }: { clientId: string }) {
  const [linked, setLinked] = React.useState<Profile[]>([]);
  const [email, setEmail] = React.useState("");
  const [working, setWorking] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const { data } = await getSupabase()
      .from("profiles")
      .select("id, name, email, role, client_id")
      .eq("client_id", clientId);
    setLinked((data ?? []).map((row) => fromRow<Profile>(row)));
  }, [clientId]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Fetch-on-mount: setState tras await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  if (!isSupabaseConfigured) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Acceso al portal
          </p>
          <p className="text-xs text-muted-foreground">
            Disponible al conectar Supabase (modo demo activo).
          </p>
        </CardContent>
      </Card>
    );
  }

  const link = async () => {
    const target = email.trim().toLowerCase();
    if (!target) return;
    setWorking(true);
    const sb = getSupabase();
    const { data, error } = await sb
      .from("profiles")
      .select("id, name, email, role, client_id")
      .eq("email", target)
      .maybeSingle();

    if (error || !data) {
      toast.error(
        "No existe un usuario con ese email. Créalo primero en Supabase → Authentication → Add user (Auto Confirm).",
      );
      setWorking(false);
      return;
    }
    const profile = fromRow<Profile>(data);
    if (profile.role === "team") {
      toast.error(
        "Ese usuario es del equipo Flare. Cambia su rol en Supabase antes de vincularlo como cliente.",
      );
      setWorking(false);
      return;
    }
    const { error: updateError } = await sb
      .from("profiles")
      .update({ role: "client", client_id: clientId })
      .eq("id", profile.id);
    setWorking(false);
    if (updateError) {
      toast.error(`No se pudo vincular: ${updateError.message}`);
      return;
    }
    toast.success(`${target} ahora tiene acceso al portal de esta marca`);
    setEmail("");
    void refresh();
  };

  const unlink = async (profile: Profile) => {
    const { error } = await getSupabase()
      .from("profiles")
      .update({ client_id: null })
      .eq("id", profile.id);
    if (error) {
      toast.error(`No se pudo desvincular: ${error.message}`);
      return;
    }
    toast.success(`${profile.email} ya no tiene acceso al portal`);
    void refresh();
  };

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <KeyRound className="size-3.5 text-flare" />
          Acceso al portal
        </p>

        {linked.length > 0 ? (
          <div className="mb-3 space-y-1.5">
            {linked.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{p.email}</p>
                  <p className="text-[10px] text-muted-foreground">{p.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Desvincular ${p.email}`}
                  onClick={() => unlink(p)}
                >
                  <Unlink />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs text-muted-foreground">
            Nadie tiene acceso al portal de esta marca todavía.
          </p>
        )}

        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@delcliente.com"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") void link();
            }}
          />
          <Button size="sm" disabled={working || !email.trim()} onClick={link}>
            <Link2 data-icon="inline-start" />
            Vincular
          </Button>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          El usuario debe existir primero: Supabase → Authentication → Add user
          (marca &quot;Auto Confirm User&quot;).
        </p>
      </CardContent>
    </Card>
  );
}
