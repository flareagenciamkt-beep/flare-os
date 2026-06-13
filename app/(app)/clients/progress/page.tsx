"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { HealthBadge, PhaseBadge } from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import {
  clientAlerts,
  clientOperationalProgress,
  isClientAtRisk,
} from "@/lib/stats";

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <Progress value={value} className="h-1" />
    </div>
  );
}

export default function ClientsProgressPage() {
  const { clients, ideas, tasks, metrics, accesses } = useFlare();
  const active = clients.filter((c) => c.status === "activo");

  const rows = active
    .map((c) => ({
      client: c,
      progress: clientOperationalProgress(c, ideas, tasks, metrics),
      alerts: clientAlerts(c, ideas, tasks, metrics, accesses),
    }))
    .sort((a, b) => b.progress.overall - a.progress.overall);

  const avgOverall = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.progress.overall, 0) / rows.length)
    : 0;
  const onTrack = active.filter((c) => c.healthStatus === "bien");
  const atRisk = active.filter(isClientAtRisk);

  return (
    <div>
      <PageHeader
        title="Progreso por cliente"
        description="Avance operativo de cada marca activa: producción, tareas y calendario."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Operación promedio"
          value={`${avgOverall}%`}
          icon={TrendingUp}
          tone="flare"
        />
        <StatCard
          label="Clientes al día"
          value={onTrack.length}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Clientes en riesgo"
          value={atRisk.length}
          icon={AlertTriangle}
          tone={atRisk.length ? "danger" : "default"}
        />
      </div>

      <div className="mt-6 space-y-3">
        {rows.map(({ client: c, progress, alerts }) => (
          <Link key={c.id} href={`/clients/${c.id}`} className="block">
            <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                      {c.brand}
                      {alerts.length > 0 && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                          <AlertTriangle className="size-2.5" />
                          {alerts.length}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Próxima acción: {c.nextAction || "Sin definir"}
                      {c.nextDeliverable && ` · Entregable: ${c.nextDeliverable}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhaseBadge phase={c.currentPhase} />
                    <HealthBadge health={c.healthStatus} />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Progress value={progress.overall} className="flex-1" />
                  <span className="w-10 text-right text-sm font-semibold tabular-nums">
                    {progress.overall}%
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <MiniBar label="Producción" value={progress.production} />
                  <MiniBar label="Tareas" value={progress.tasks} />
                  <MiniBar label="Calendario" value={progress.calendar} />
                  <MiniBar label="Manual" value={c.progressPercentage} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!rows.length && (
          <EmptyState
            title="No hay clientes activos"
            description="Activa o crea clientes para ver su progreso aquí."
          />
        )}
      </div>
    </div>
  );
}
