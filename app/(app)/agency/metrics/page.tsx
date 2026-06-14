"use client";

import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clapperboard,
  Eye,
  Lightbulb,
  Send,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CHART_COLORS, StackedBarChart } from "@/components/shared/charts";
import { useFlare } from "@/lib/store";
import {
  averageProgress,
  isClientAtRisk,
  isIdeaActive,
  isTaskOpen,
  isTaskOverdue,
  publishedThisMonth,
  summarizeClient,
} from "@/lib/stats";
import { countBy } from "@/lib/stats";

export default function AgencyMetricsPage() {
  const { clients, ideas, tasks } = useFlare();

  const activeClients = clients.filter((c) => c.status === "activo");
  const activeIdeas = ideas.filter(isIdeaActive);
  const inProduction = ideas.filter((i) => i.status === "en_produccion");
  const inReview = ideas.filter(
    (i) => i.status === "en_revision_interna" || i.status === "en_revision_cliente",
  );
  const scheduled = ideas.filter((i) => i.status === "programada");
  const published = publishedThisMonth(ideas);
  const openTasks = tasks.filter(isTaskOpen);
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));
  const atRisk = activeClients.filter(isClientAtRisk);
  const onTrack = activeClients.filter((c) => c.healthStatus === "bien");

  const byResponsible = Object.entries(countBy(activeIdeas, (i) => i.responsible)).sort(
    (a, b) => b[1] - a[1],
  );

  // Mix de producción por cliente (barras apiladas).
  const mixSeries = [
    { label: "Ideas activas", color: CHART_COLORS.magenta },
    { label: "Programados", color: CHART_COLORS.amber },
    { label: "Publicados", color: CHART_COLORS.green },
  ];
  const productionMix = activeClients
    .map((c) => {
      const s = summarizeClient(c.id, ideas, tasks);
      return { label: c.brand, values: [s.activeIdeas, s.scheduled, s.published] };
    })
    .filter((d) => d.values.some((v) => v > 0));

  // Embudo del pipeline editorial (barras horizontales).
  const pipeline = [
    { label: "Ideas activas", value: activeIdeas.length, color: CHART_COLORS.magenta },
    { label: "En producción", value: inProduction.length, color: CHART_COLORS.coral },
    { label: "En revisión", value: inReview.length, color: CHART_COLORS.orange },
    { label: "Programados", value: scheduled.length, color: CHART_COLORS.amber },
    { label: "Publicados (mes)", value: published.length, color: CHART_COLORS.green },
  ];
  const pipeMax = Math.max(...pipeline.map((p) => p.value), 1);

  return (
    <div>
      <PageHeader
        title="Métricas operativas"
        description="Cómo va la operación global de Flare en números."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clientes activos"
          value={activeClients.length}
          icon={Building2}
          tone="flare"
        />
        <StatCard label="Ideas activas" value={activeIdeas.length} icon={Lightbulb} />
        <StatCard label="En producción" value={inProduction.length} icon={Clapperboard} />
        <StatCard label="En revisión" value={inReview.length} icon={Eye} />
        <StatCard label="Programados" value={scheduled.length} icon={CalendarDays} />
        <StatCard
          label="Publicados este mes"
          value={published.length}
          icon={Send}
          tone="success"
        />
        <StatCard label="Tareas pendientes" value={openTasks.length} icon={CheckSquare} />
        <StatCard
          label="Tareas atrasadas"
          value={overdueTasks.length}
          icon={AlertTriangle}
          tone={overdueTasks.length ? "danger" : "success"}
        />
        <StatCard
          label="Progreso promedio"
          value={`${averageProgress(clients)}%`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard label="Clientes al día" value={onTrack.length} icon={CheckCircle2} />
        <StatCard
          label="Clientes en riesgo"
          value={atRisk.length}
          icon={AlertTriangle}
          tone={atRisk.length ? "warning" : "success"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Mix de producción por cliente</p>
            {productionMix.length ? (
              <StackedBarChart data={productionMix} series={mixSeries} />
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Sin producción registrada todavía.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 self-start">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Pipeline editorial</p>
            <div className="space-y-3">
              {pipeline.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{p.label}</span>
                    <span className="tabular-nums text-muted-foreground">{p.value}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((p.value / pipeMax) * 100)}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Producción por cliente</p>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table className="min-w-[56rem]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Ideas activas</TableHead>
                    <TableHead className="text-right">Programados</TableHead>
                    <TableHead className="text-right">Publicados</TableHead>
                    <TableHead className="text-right">Tareas abiertas</TableHead>
                    <TableHead className="text-right">Atrasadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeClients.map((c) => {
                    const s = summarizeClient(c.id, ideas, tasks);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm font-medium">{c.brand}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {s.activeIdeas}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {s.scheduled}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {s.published}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {s.openTasks}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {s.overdueTasks > 0 ? (
                            <span className="font-medium text-red-400">
                              {s.overdueTasks}
                            </span>
                          ) : (
                            s.overdueTasks
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 self-start">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Producción por responsable</p>
            <div className="space-y-2.5">
              {byResponsible.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count} ideas activas
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-flare"
                      style={{
                        width: `${
                          activeIdeas.length
                            ? Math.round((count / activeIdeas.length) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {!byResponsible.length && (
                <p className="text-xs text-muted-foreground">Sin ideas activas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
