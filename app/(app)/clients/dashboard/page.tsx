"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckSquare,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthBadge, PhaseBadge } from "@/components/shared/badges";
import { InfoHint } from "@/components/shared/info-hint";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { SegmentedBar } from "@/components/dashboard/segmented-bar";
import { BigCounter } from "@/components/dashboard/big-counter";
import { BentoCard } from "@/components/dashboard/bento-card";
import { WeekBars } from "@/components/dashboard/week-bars";
import { RingStat } from "@/components/dashboard/ring-stat";
import { TaskChecklist } from "@/components/dashboard/task-checklist";
import { WeekTimeline } from "@/components/dashboard/week-timeline";
import { useFlare } from "@/lib/store";
import {
  averageProgress,
  clientOperationalProgress,
  ideaDate,
  ideasPerWeekday,
  isClientAtRisk,
  isIdeaActive,
  isTaskOpen,
} from "@/lib/stats";
import { formatDate } from "@/lib/dates";
import { HEALTH_LABELS, type HealthStatus } from "@/lib/types";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const feeFmt = new Intl.NumberFormat("es-CO");

export default function ClientsDashboardPage() {
  const { clients, ideas, tasks, metrics, clientName } = useFlare();

  const active = clients.filter((c) => c.status === "activo");
  const atRisk = active.filter(isClientAtRisk);
  const activeIdeas = ideas.filter(isIdeaActive);
  const openTasks = tasks.filter(isTaskOpen);

  const ranking = [...active].sort(
    (a, b) => b.progressPercentage - a.progressPercentage,
  );

  // Distribución de health (clientes activos) para la barra segmentada.
  const HEALTH_ORDER: HealthStatus[] = ["bien", "observacion", "riesgo", "critico", "pausado"];
  const HEALTH_TONE = {
    bien: "fill",
    observacion: "dark",
    riesgo: "outline",
    critico: "ghost",
    pausado: "dark",
  } as const;
  const healthSegments = HEALTH_ORDER.map((h) => ({
    label: HEALTH_LABELS[h],
    value: active.filter((c) => c.healthStatus === h).length,
    tone: HEALTH_TONE[h],
  })).filter((s) => s.value > 0);

  // Cliente destacado: el que más requiere atención.
  const featured = atRisk[0] ?? ranking[0];
  const featuredProgress = featured
    ? clientOperationalProgress(featured, ideas, tasks, metrics)
    : null;

  // Barras por día (entregables/contenidos con fecha).
  const weekData = ideasPerWeekday(ideas).map((value, i) => ({
    label: WEEKDAY_LABELS[i],
    value,
  }));

  // Checklist: tareas recientes con su estado (done = completada).
  const checklistItems = [...tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)
    .map((t) => ({
      id: t.id,
      icon: CheckSquare,
      label: t.title,
      meta: `${clientName(t.clientId)} · ${formatDate(t.dueDate, "d MMM")}`,
      done: t.status === "completada",
      href: t.clientId ? `/clients/${t.clientId}` : "/agency/tasks",
    }));

  // Eventos del calendario semanal (piezas con fecha).
  const timelineEvents = ideas
    .map((i) => ({ idea: i, date: ideaDate(i) }))
    .filter((x): x is { idea: (typeof ideas)[number]; date: string } => Boolean(x.date))
    .map((x) => ({
      id: x.idea.id,
      title: x.idea.title,
      sub: clientName(x.idea.clientId),
      date: x.date,
      href: "/agency/content?view=calendario",
    }));

  return (
    <div>
      <WelcomeHeader
        title={<>Bienvenido a Flare OS</>}
        segmented={
          healthSegments.length ? (
            <SegmentedBar segments={healthSegments} />
          ) : undefined
        }
        counters={
          <>
            <BigCounter icon={Building2} value={active.length} label="Clientes activos" />
            <BigCounter icon={Lightbulb} value={activeIdeas.length} label="Ideas activas" />
            <BigCounter icon={CheckSquare} value={openTasks.length} label="Tareas abiertas" />
          </>
        }
      />

      {/* Bento principal */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cliente destacado */}
        {featured && (
          <BentoCard
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
            contentClassName="gap-0"
            title="Requiere atención"
            href={`/clients/${featured.id}`}
          >
            <div className="mt-1 flex items-center gap-3">
              <span
                className="flare-gradient flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {featured.brand.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{featured.brand}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {featured.industry} · {featured.owner}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <HealthBadge health={featured.healthStatus} />
              <PhaseBadge phase={featured.currentPhase} />
              {featured.monthlyFee > 0 && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium tabular-nums">
                  {feeFmt.format(featured.monthlyFee)} {featured.currency}/mes
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-border pt-3 text-xs">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Próxima acción</p>
                <p className="mt-0.5">{featured.nextAction || "Sin definir"}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Próximo entregable</p>
                <p className="mt-0.5">{featured.nextDeliverable || "—"}</p>
              </div>
              {featured.activeServices.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Servicios activos</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {featured.activeServices.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-foreground/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-full"
              render={<Link href={`/clients/${featured.id}`} />}
            >
              Ver detalle del cliente
              <ArrowRight data-icon="inline-end" />
            </Button>
          </BentoCard>
        )}

        {/* Progreso semanal */}
        <BentoCard title="Contenido por día" href="/agency/content?view=calendario">
          <WeekBars data={weekData} />
        </BentoCard>

        {/* Anillo de progreso promedio */}
        <BentoCard
          title={
            <span className="flex items-center gap-1.5">
              Progreso promedio
              <InfoHint text="Promedio del % de avance de los clientes activos. Combina producción, tareas, calendario y el progreso manual de cada cuenta." />
            </span>
          }
          href="/clients/progress"
          contentClassName="items-center justify-center"
        >
          <RingStat value={averageProgress(clients)} label="clientes activos" />
        </BentoCard>

        {/* Checklist (card de acento) */}
        <TaskChecklist title="Tareas del equipo" items={checklistItems} />

        {/* Estado operativo del cliente destacado */}
        {featuredProgress && (
          <BentoCard
            className="sm:col-span-2 lg:col-span-2"
            title={`Avance operativo · ${featured!.brand}`}
            href={`/clients/${featured!.id}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <RingStat value={featuredProgress.overall} label="general" size={120} />
              <div className="flex-1 space-y-3">
                <SegmentedBar
                  segments={[
                    { label: "Producción", value: Math.max(featuredProgress.production, 1), tone: "fill" },
                    { label: "Tareas", value: Math.max(featuredProgress.tasks, 1), tone: "dark" },
                    { label: "Calendario", value: Math.max(featuredProgress.calendar, 1), tone: "outline" },
                  ]}
                />
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="size-3 text-flare" />
                  Combina producción, tareas y calendario del cliente.
                </p>
              </div>
            </div>
          </BentoCard>
        )}
      </div>

      {/* Calendario semanal */}
      <div className="mt-4">
        <BentoCard title="Calendario de contenido" href="/agency/content?view=calendario">
          {timelineEvents.length ? (
            <WeekTimeline events={timelineEvents} />
          ) : (
            <p className="flex items-center gap-1.5 py-8 text-center text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              No hay contenidos programados esta semana.
            </p>
          )}
        </BentoCard>
      </div>
    </div>
  );
}
