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
import { averageProgress, isClientAtRisk } from "@/lib/stats";

export default function ClientsProgressPage() {
  const { clients } = useFlare();
  const active = clients.filter((c) => c.status === "activo");
  const atRisk = active.filter(isClientAtRisk);
  const onTrack = active.filter((c) => c.healthStatus === "bien");
  const sorted = [...active].sort((a, b) => b.progressPercentage - a.progressPercentage);

  return (
    <div>
      <PageHeader
        title="Progreso por cliente"
        description="Avance general de cada marca activa, ordenado de mayor a menor."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Progreso promedio"
          value={`${averageProgress(clients)}%`}
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
        {sorted.map((c) => (
          <Link key={c.id} href={`/clients/${c.id}`} className="block">
            <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.brand}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Próxima acción: {c.nextAction || "Sin definir"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhaseBadge phase={c.currentPhase} />
                    <HealthBadge health={c.healthStatus} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={c.progressPercentage} className="flex-1" />
                  <span className="w-10 text-right text-sm font-semibold tabular-nums">
                    {c.progressPercentage}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!sorted.length && (
          <EmptyState
            title="No hay clientes activos"
            description="Activa o crea clientes para ver su progreso aquí."
          />
        )}
      </div>
    </div>
  );
}
