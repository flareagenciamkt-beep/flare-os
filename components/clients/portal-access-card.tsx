"use client";

// Gestión de acceso al portal para un cliente: crear usuarios nuevos (vía
// /api/portal-users, server-side), listar los vinculados y vincular/desvincular
// perfiles existentes por email (solo equipo, vía RLS).

import * as React from "react";
import { Copy, KeyRound, Link2, RefreshCw, Unlink, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fromRow, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

// Sin ambigüos (0/O, 1/l/I) para dictarla por teléfono sin dolor.
const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#$%&*";

function generatePassword(length = 14): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
}

export function PortalAccessCard({ clientId }: { clientId: string }) {
  const [linked, setLinked] = React.useState<Profile[]>([]);
  const [email, setEmail] = React.useState("");
  const [working, setWorking] = React.useState(false);

  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [createdCreds, setCreatedCreds] = React.useState<{
    email: string;
    password: string;
  } | null>(null);

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

  const createUser = async () => {
    const targetEmail = newEmail.trim().toLowerCase();
    const password = newPassword.trim() || generatePassword();
    setCreating(true);
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/portal-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newName.trim(),
          email: targetEmail,
          password,
          clientId,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "No se pudo crear el usuario.");
        return;
      }
      setCreatedCreds({ email: targetEmail, password });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      toast.success(`Usuario creado con acceso al portal de esta marca`);
      void refresh();
    } finally {
      setCreating(false);
    }
  };

  const copyCreds = async () => {
    if (!createdCreds) return;
    await navigator.clipboard.writeText(
      `Portal Flare\nEmail: ${createdCreds.email}\nContraseña: ${createdCreds.password}`,
    );
    toast.success("Credenciales copiadas");
  };

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
        "No existe un usuario con ese email. Créalo con el formulario de arriba.",
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

  const canCreate = newName.trim().length >= 2 && newEmail.includes("@");

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

        {/* ── Crear usuario nuevo ──────────────────────────────────────── */}
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Crear usuario nuevo
        </p>
        <div className="space-y-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del contacto"
            className="h-8 text-xs"
          />
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@delcliente.com"
            type="email"
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Contraseña (vacío = generar)"
              className="h-8 text-xs"
            />
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Generar contraseña"
              onClick={() => setNewPassword(generatePassword())}
            >
              <RefreshCw />
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={creating || !canCreate}
            onClick={createUser}
          >
            <UserPlus data-icon="inline-start" />
            {creating ? "Creando..." : "Crear usuario del portal"}
          </Button>
        </div>

        {createdCreds && (
          <div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="text-[11px] font-medium text-emerald-400">
              Usuario creado — comparte estas credenciales:
            </p>
            <p className="mt-1 font-mono text-[11px]">{createdCreds.email}</p>
            <p className="font-mono text-[11px]">{createdCreds.password}</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Guárdala en un gestor de contraseñas: no se mostrará de nuevo.
              </p>
              <Button variant="outline" size="icon-xs" aria-label="Copiar credenciales" onClick={copyCreds}>
                <Copy />
              </Button>
            </div>
          </div>
        )}

        {/* ── Vincular usuario existente ───────────────────────────────── */}
        <p className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Vincular usuario existente
        </p>
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
      </CardContent>
    </Card>
  );
}
