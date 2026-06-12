"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  PauseCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { HealthBadge, PhaseBadge } from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { averageProgress, isClientAtRisk } from "@/lib/stats";

export default function ClientsDashboardPage() {
  const { clients } = useFlare();

  const active = clients.filter((c) => c.status === "activo");
  const paused = clients.filter((c) => c.status === "pausado");
  const atRisk = clients.filter((c) => c.status === "activo" && isClientAtRisk(c));
  const withAlerts = clients.filter(
    (c) => c.status === "activo" && c.healthStatus !== "bien",
  );
  const ranking = [...active].sort(
    (a, b) => b.progressPercentage - a.progressPercentage,
  );

  return (
    <div>
      <PageHeader
        title="Dashboard de clientes"
        description="Vista general del estado y progreso de las marcas que atiende Flare."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes activos" value={active.length} icon={Building2} tone="flare" />
        <StatCard label="Clientes pausados" value={paused.length} icon={PauseCircle} />
        <StatCard
          label="Clientes en riesgo"
          value={atRisk.length}
          icon={AlertTriangle}
          tone={atRisk.length ? "danger" : "success"}
          hint="Health atrasado o crítico"
        />
        <StatCard
          label="Progreso promedio"
          value={`${averageProgress(clients)}%`}
          icon={TrendingUp}
          tone="success"
          hint="Solo clientes activos"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Ranking de progreso</p>
            <div className="space-y-3">
              {ranking.map((c) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="block rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{c.brand}</p>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {c.progressPercentage}%
                    </span>
                  </div>
                  <Progress value={c.progressPercentage} className="mt-1.5" />
                </Link>
              ))}
              {!ranking.length && (
                <p className="text-xs text-muted-foreground">No hay clientes activos.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-400" />
              Clientes con alertas
            </p>
            <div className="space-y-2">
              {withAlerts.map((c) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2 transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.brand}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {c.nextAction || "Sin próxima acción definida"}
                    </p>
                  </div>
                  <HealthBadge health={c.healthStatus} />
                </Link>
              ))}
              {!withAlerts.length && (
                <p className="text-xs text-muted-foreground">
                  Todo en orden: ningún cliente con alertas. 🔥
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 gap-0 py-0">
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold">Próximas acciones por cliente</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => (
              <Link
                key={c.id}
                href={`/clients/${c.id}`}
                className="group rounded-md border border-border bg-secondary/30 px-3 py-2.5 transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold">{c.brand}</p>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-flare" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {c.nextAction || "Sin próxima acción definida"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <PhaseBadge phase={c.currentPhase} />
                  <span className="text-[10px] text-muted-foreground">{c.owner}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
