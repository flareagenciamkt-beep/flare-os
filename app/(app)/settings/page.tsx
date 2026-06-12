"use client";

import { Database, Flame, Palette, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { TEAM_MEMBERS } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

const PALETTE = [
  { name: "Fondo", value: "#0F1115" },
  { name: "Cards", value: "#171A21" },
  { name: "Bordes", value: "#272A32" },
  { name: "Acento", value: "#FF4D2E" },
  { name: "Acento suave", value: "#FF704D" },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Ajustes"
        description="Configuración de Flare OS V1."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Users className="size-4 text-flare" />
              Equipo
            </p>
            <div className="space-y-2">
              {TEAM_MEMBERS.map((m) => (
                <div
                  key={m}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-secondary/30 px-3 py-2"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-flare/15 text-xs font-semibold text-flare-soft">
                    {m.slice(0, 2).toUpperCase()}
                  </span>
                  <p className="text-sm font-medium">{m}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              La gestión real de usuarios llega con Supabase Auth en Fase 6.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Database className="size-4 text-flare" />
              Datos y persistencia
            </p>
            {isSupabaseConfigured ? (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300/90">
                Supabase conectado: los datos se guardan en la base real (tablas
                clients, ideas, tasks, resources, prompts, processes, client_metrics y
                profiles) con Row Level Security para el equipo autenticado.
              </div>
            ) : (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90">
                Modo demo: datos mock en memoria, los cambios se pierden al recargar.
                Para conectar Supabase completa las credenciales en .env.local y
                ejecuta supabase/schema.sql + seed.sql.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Palette className="size-4 text-flare" />
              Paleta Flare
            </p>
            <div className="flex flex-wrap gap-3">
              {PALETTE.map((c) => (
                <div key={c.name} className="text-center">
                  <div
                    className="size-12 rounded-lg border border-border"
                    style={{ backgroundColor: c.value }}
                  />
                  <p className="mt-1 text-[10px] font-medium">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="size-4 text-flare" />
              Acerca de Flare OS
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Sistema operativo interno de la agencia Flare. V1: base de clientes,
              progreso y métricas por cliente, ideas, feed, kanban, calendario
              editorial, tareas, biblioteca, prompts y procesos. Construido con
              Next.js, TypeScript, Tailwind y Shadcn UI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
