"use client";

// Integración de Meta configurable desde la app: el admin pega App ID y App
// Secret aquí y quedan guardados server-side (integration_settings); nada de
// editar .env ni Vercel. El secreto nunca vuelve al navegador.

import * as React from "react";
import { CheckCircle2, CircleDashed, Plug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface CredentialsStatus {
  serverKeyConfigured: boolean;
  metaConfigured: boolean;
  source: "db" | "env" | null;
  appIdMasked: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function IntegrationsCard() {
  const [status, setStatus] = React.useState<CredentialsStatus | null>(null);
  const [appId, setAppId] = React.useState("");
  const [appSecret, setAppSecret] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const loadStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/meta/credentials", {
        headers: await authHeaders(),
      });
      const json = (await res.json()) as CredentialsStatus;
      setStatus(
        res.ok
          ? json
          : { serverKeyConfigured: false, metaConfigured: false, source: null, appIdMasked: null },
      );
    } catch {
      setStatus({ serverKeyConfigured: false, metaConfigured: false, source: null, appIdMasked: null });
    }
  }, []);

  React.useEffect(() => {
    // Fetch-on-mount asíncrono: los setState ocurren tras los await (la regla
    // no distingue el patrón, igual que en lib/store.tsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isSupabaseConfigured) void loadStatus();
  }, [loadStatus]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/meta/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ appId: appId.trim(), appSecret: appSecret.trim() }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "No se pudieron guardar las credenciales.");
        return;
      }
      toast.success("Integración de Meta configurada");
      setAppId("");
      setAppSecret("");
      setEditing(false);
      await loadStatus();
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Plug className="size-4 text-flare" />
            Integraciones · Meta (Instagram)
          </p>
          <p className="text-xs text-muted-foreground">
            Disponible al conectar Supabase (modo demo activo).
          </p>
        </CardContent>
      </Card>
    );
  }

  const showForm = editing || (status !== null && status.serverKeyConfigured && !status.metaConfigured);

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Plug className="size-4 text-flare" />
          Integraciones · Meta (Instagram)
        </p>

        {status === null ? (
          <p className="text-xs text-muted-foreground">Comprobando configuración...</p>
        ) : !status.serverKeyConfigured ? (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90">
            Falta SUPABASE_SECRET_KEY en el servidor (variable de infraestructura,
            se configura una sola vez en Vercel). Con ella lista, las credenciales
            de Meta se pegan aquí mismo.
          </div>
        ) : (
          <div className="space-y-3">
            {status.metaConfigured && !editing ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <p className="flex items-center gap-2 text-xs text-emerald-300/90">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Integración activa · App ID {status.appIdMasked}
                  {status.source === "env" ? " (desde variables de entorno)" : ""}
                </p>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <CircleDashed className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                <span>
                  Crea una app en developers.facebook.com (caso de uso: Instagram +
                  Insights) y pega aquí sus credenciales. Quedan guardadas en el
                  servidor: no hay que tocar código ni variables de entorno.
                </span>
              </div>
            )}

            {showForm && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="App ID">
                  <Input
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1234567890"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="App Secret">
                  <Input
                    type="password"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                </Field>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Button size="sm" disabled={saving || !appId.trim() || !appSecret.trim()} onClick={() => void save()}>
                    {saving ? "Guardando..." : "Guardar credenciales"}
                  </Button>
                  {editing && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )}

            {status.metaConfigured && (
              <p className="text-[11px] text-muted-foreground/80">
                Con esto activo: conecta cuentas desde la ficha del cliente (tab
                Accesos → Cuentas de analytics) y sincroniza métricas con un clic.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
