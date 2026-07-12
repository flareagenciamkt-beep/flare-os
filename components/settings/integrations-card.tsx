"use client";

// Estado de las integraciones externas (Meta) con la guía del setup pendiente.

import * as React from "react";
import { CheckCircle2, CircleDashed, Plug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface IntegrationsStatus {
  metaConfigured: boolean;
  serverKeyConfigured: boolean;
}

export function IntegrationsCard() {
  const [status, setStatus] = React.useState<IntegrationsStatus | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/integrations/meta/status")
      .then((res) => res.json())
      .then((json: IntegrationsStatus) => {
        if (alive) setStatus(json);
      })
      .catch(() => {
        if (alive) setStatus({ metaConfigured: false, serverKeyConfigured: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  const ready = status?.metaConfigured && status?.serverKeyConfigured;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Plug className="size-4 text-flare" />
          Integraciones · Meta (Instagram)
        </p>
        {status === null ? (
          <p className="text-xs text-muted-foreground">Comprobando configuración...</p>
        ) : ready ? (
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300/90">
            Integración activa: conecta cuentas desde la ficha del cliente (tab
            Accesos → Cuentas de analytics) y sincroniza métricas con un clic.
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Para que las métricas entren solas desde Instagram falta completar:
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                {status.metaConfigured ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <CircleDashed className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                )}
                Crear una app en developers.facebook.com (caso de uso: Instagram +
                Insights) y poner META_APP_ID y META_APP_SECRET en .env.local.
              </li>
              <li className="flex items-start gap-2">
                {status.serverKeyConfigured ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <CircleDashed className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                )}
                Tener SUPABASE_SECRET_KEY en .env.local (guarda los tokens en el
                servidor).
              </li>
            </ul>
            <p className="text-[11px] text-muted-foreground/80">
              Mientras tanto las cuentas se pueden asociar en modo manual; el botón
              de conectar avisará cuando la integración esté lista.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
