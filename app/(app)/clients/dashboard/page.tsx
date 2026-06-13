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
import {
  averageProgress,
  clientAlerts,
  ideaDate,
  isClientAtRisk,
  isTaskOverdue,
} from "@/lib/stats";
import { formatDate } from "@/lib/dates";
import { IdeaStatusBadge } from "@/components/shared/badges";

export default function ClientsDashboardPage() {
  const { clients, ideas, tasks, metrics, accesses, clientName } = useFlare();

  const active = clients.filter((c) => c.status === "activo");
  const paused = clients.filter((c) => c.status === "pausado");
  const atRisk = clients.filter((c) => c.status === "activo" && isClientAtRisk(c));
  const withAlerts = active
    .map((c) => ({ client: c, alerts: clientAlerts(c, ideas, tasks, metrics, accesses) }))
    .filter((entry) => entry.alerts.length > 0);
  const ranking = [...active].sort(
    (a, b) => b.progressPercentage - a.progressPercentage,
  );

  // Tareas vencidas agrupadas por cliente
  const overdueByClient = active
    .map((c) => ({
      client: c,
      count: tasks.filter((t) => t.clientId === c.id && isTaskOverdue(t)).length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);

  // Contenidos a publicar en los próximos 7 días
  const today = new Date();
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const todayISO = today.toISOString().slice(0, 10);
  const upcomingContent = ideas
    .map((i) => ({ idea: i, date: ideaDate(i) }))
    .filter(
      (x): x is { idea: (typeof ideas)[number]; date: string } =>
        Boolean(x.date) &&
        x.date! >= todayISO &&
        x.date! <= inSevenDays &&
        !["publicada", "pausada", "archivada"].includes(x.idea.status),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  // Próximos entregables comprometidos
  const deliverables = active.filter((c) => c.nextDeliverable.trim());

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
              {withAlerts.map(({ client: c, alerts }) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="block rounded-md border border-border bg-secondary/30 px-3 py-2 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{c.brand}</p>
                    <HealthBadge health={c.healthStatus} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {alerts.map((alert) => (
                      <span
                        key={alert}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"
                      >
                        {alert}
                      </span>
                    ))}
                  </div>
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

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Próximos entregables</p>
            <div className="space-y-2">
              {deliverables.map((c) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="block rounded-md border border-border bg-secondary/30 px-3 py-2 transition-colors hover:bg-secondary/60"
                >
                  <p className="truncate text-xs font-semibold">{c.brand}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {c.nextDeliverable}
                  </p>
                </Link>
              ))}
              {!deliverables.length && (
                <p className="text-xs text-muted-foreground">
                  Sin entregables comprometidos.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Tareas vencidas por cliente</p>
            <div className="space-y-2">
              {overdueByClient.map(({ client: c, count }) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 transition-colors hover:bg-red-500/10"
                >
                  <p className="truncate text-xs font-medium">{c.brand}</p>
                  <span className="shrink-0 text-xs font-semibold text-red-400">
                    {count} vencida{count > 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
              {!overdueByClient.length && (
                <p className="text-xs text-muted-foreground">
                  Sin tareas vencidas. 🔥
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">A publicar esta semana</p>
            <div className="space-y-2">
              {upcomingContent.map(({ idea, date }) => (
                <div
                  key={idea.id}
                  className="rounded-md border border-border bg-secondary/30 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium">{idea.title}</p>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatDate(date, "d MMM")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] text-muted-foreground">
                      {clientName(idea.clientId)}
                    </p>
                    <IdeaStatusBadge status={idea.status} />
                  </div>
                </div>
              ))}
              {!upcomingContent.length && (
                <p className="text-xs text-muted-foreground">
                  Nada programado para los próximos 7 días.
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
