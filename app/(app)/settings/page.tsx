"use client";

import { Database, FileText, Flame, LifeBuoy, Lock, Palette, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useRole } from "@/components/layout/role-provider";
import { TEAM_MEMBERS } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

const PALETTE = [
  { name: "Fondo", value: "#0A0808" },
  { name: "Cards", value: "#14110F" },
  { name: "Texto", value: "#F1E9E0" },
  { name: "Magenta", value: "#F52A6C" },
  { name: "Coral", value: "#FE4E49" },
  { name: "Naranja", value: "#FF6A35" },
];

export default function SettingsPage() {
  const { can } = useRole();

  if (!can("manageSettings")) {
    return (
      <div>
        <PageHeader title="Ajustes" description="Configuración de Flare OS." />
        <EmptyState
          icon={Lock}
          title="Acceso restringido"
          description="Solo los administradores pueden ver y editar los ajustes de Flare OS."
        />
      </div>
    );
  }

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
              Crea usuarios del portal desde la ficha de cada cliente (tab
              Resumen → Acceso al portal).
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
              Branding · Paleta Flare
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
              <ShieldCheck className="size-4 text-flare" />
              Seguridad
            </p>
            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-flare" />
                Acceso por sesión de Supabase con Row Level Security: cada usuario
                solo ve lo que su rol permite (equipo vs. cliente).
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-flare" />
                Las contraseñas nunca se muestran en la interfaz. Al crear un acceso
                de portal se copian al portapapeles y deben guardarse en un gestor
                de contraseñas externo.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-flare" />
                Recuperación de contraseña por enlace al email desde la pantalla de
                login.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <LifeBuoy className="size-4 text-flare" />
              Soporte y legal
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" render={<a href="mailto:soporte@flare.agency" />}>
                <LifeBuoy data-icon="inline-start" />
                Contactar soporte
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-disabled="true"
                      className="cursor-not-allowed opacity-60"
                      onClick={(e) => e.preventDefault()}
                    />
                  }
                >
                  <FileText data-icon="inline-start" />
                  Privacidad
                </TooltipTrigger>
                <TooltipContent>Próximamente</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-disabled="true"
                      className="cursor-not-allowed opacity-60"
                      onClick={(e) => e.preventDefault()}
                    />
                  }
                >
                  <FileText data-icon="inline-start" />
                  Términos
                </TooltipTrigger>
                <TooltipContent>Próximamente</TooltipContent>
              </Tooltip>
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
              Sistema operativo interno de la agencia Flare: base de clientes con
              vista 360, progreso operativo y métricas con gráficos, ideas, feed,
              kanban, calendario editorial, tareas, facturación, biblioteca,
              prompts y procesos, más el portal de aprobaciones para clientes.
              Construido con Next.js, TypeScript, Tailwind y Shadcn UI sobre
              Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
