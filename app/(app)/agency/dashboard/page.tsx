"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  Clapperboard,
  Eye,
  Lightbulb,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { HealthBadge, IdeaStatusBadge } from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import {
  countBy,
  ideaDate,
  isClientAtRisk,
  isIdeaActive,
  isTaskOpen,
  isTaskOverdue,
  publishedThisMonth,
} from "@/lib/stats";

function BarList({ data, total }: { data: [string, number][]; total: number }) {
  return (
    <div className="space-y-2.5">
      {data.map(([label, count]) => (
        <div key={label}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium">{label}</span>
            <span className="tabular-nums text-muted-foreground">{count}</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-flare"
              style={{ width: `${total ? Math.round((count / total) * 100) : 0}%` }}
            />
          </div>
        </div>
      ))}
      {!data.length && <p className="text-xs text-muted-foreground">Sin datos.</p>}
    </div>
  );
}

export default function AgencyDashboardPage() {
  const { ideas, tasks, clients, clientName } = useFlare();

  const activeIdeas = ideas.filter(isIdeaActive);
  const inProduction = ideas.filter((i) => i.status === "en_produccion");
  const inReviewInternal = ideas.filter((i) => i.status === "en_revision_interna");
  const awaitingClient = ideas.filter((i) => i.status === "en_revision_cliente");
  const scheduled = ideas.filter((i) => i.status === "programada");
  const published = publishedThisMonth(ideas);
  const openTasks = tasks.filter(isTaskOpen);
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));
  const clientsAtRisk = clients.filter(
    (c) => c.status === "activo" && isClientAtRisk(c),
  );

  const byClient = Object.entries(
    countBy(activeIdeas, (i) => clientName(i.clientId)),
  ).sort((a, b) => b[1] - a[1]);
  const byResponsible = Object.entries(
    countBy(activeIdeas, (i) => i.responsible),
  ).sort((a, b) => b[1] - a[1]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = ideas
    .map((i) => ({ idea: i, date: ideaDate(i) }))
    .filter(
      (x): x is { idea: (typeof ideas)[number]; date: string } =>
        Boolean(x.date) &&
        x.date! >= today &&
        !["publicada", "pausada", "archivada"].includes(x.idea.status),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard de agencia"
        description="Pulso operativo de Flare: producción, entregables y alertas."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ideas activas" value={activeIdeas.length} icon={Lightbulb} tone="flare" />
        <StatCard label="En producción" value={inProduction.length} icon={Clapperboard} />
        <StatCard label="Revisión interna" value={inReviewInternal.length} icon={Eye} />
        <StatCard
          label="Esperando cliente"
          value={awaitingClient.length}
          icon={Eye}
          tone={awaitingClient.length ? "warning" : "default"}
        />
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
          label="Clientes en riesgo"
          value={clientsAtRisk.length}
          icon={AlertTriangle}
          tone={clientsAtRisk.length ? "warning" : "success"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Producción por cliente</p>
            <BarList data={byClient} total={activeIdeas.length} />
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold">Producción por responsable</p>
            <BarList data={byResponsible} total={activeIdeas.length} />
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="size-4 text-flare" />
              Próximos entregables
            </p>
            <div className="space-y-2">
              {upcoming.map(({ idea, date }) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{idea.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {clientName(idea.clientId)} · {idea.responsible}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <IdeaStatusBadge status={idea.status} />
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {formatDate(date, "d MMM")}
                    </span>
                  </div>
                </div>
              ))}
              {!upcoming.length && (
                <p className="text-xs text-muted-foreground">
                  No hay entregables próximos con fecha.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-400" />
              Alertas operativas
            </p>
            <div className="space-y-2">
              {overdueTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{t.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {clientName(t.clientId)} · {t.responsible}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-red-400">
                    Venció {formatDate(t.dueDate, "d MMM")}
                  </span>
                </div>
              ))}
              {clientsAtRisk.map((c) => (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 transition-colors hover:bg-amber-500/10"
                >
                  <p className="truncate text-xs font-medium">{c.brand}</p>
                  <HealthBadge health={c.healthStatus} />
                </Link>
              ))}
              {!overdueTasks.length && !clientsAtRisk.length && (
                <p className="text-xs text-muted-foreground">
                  Sin alertas operativas. Todo al día. 🔥
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
