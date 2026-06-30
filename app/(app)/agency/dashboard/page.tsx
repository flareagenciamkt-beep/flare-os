"use client";

import {
  CalendarDays,
  Clapperboard,
  Eye,
  Lightbulb,
  Send,
} from "lucide-react";
import { IdeaStatusBadge } from "@/components/shared/badges";
import { PieceImage } from "@/components/shared/piece-image";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { SegmentedBar } from "@/components/dashboard/segmented-bar";
import { BigCounter } from "@/components/dashboard/big-counter";
import { BentoCard } from "@/components/dashboard/bento-card";
import { WeekBars } from "@/components/dashboard/week-bars";
import { RingStat } from "@/components/dashboard/ring-stat";
import { TaskChecklist } from "@/components/dashboard/task-checklist";
import { WeekTimeline } from "@/components/dashboard/week-timeline";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import {
  countBy,
  ideaDate,
  ideasPerWeekday,
  isIdeaActive,
  publishedThisMonth,
} from "@/lib/stats";
import { IDEA_STATUS_LABELS } from "@/lib/types";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function AgencyDashboardPage() {
  const { ideas, clientName } = useFlare();

  const activeIdeas = ideas.filter(isIdeaActive);
  const inProduction = ideas.filter((i) => i.status === "en_produccion");
  const inReviewInternal = ideas.filter((i) => i.status === "en_revision_interna");
  const awaitingClient = ideas.filter((i) => i.status === "en_revision_cliente");
  const scheduled = ideas.filter((i) => i.status === "programada");
  const published = publishedThisMonth(ideas);

  // Funnel de producción para la barra segmentada.
  const funnelSegments = [
    { label: "Activas", value: activeIdeas.length, tone: "fill" as const },
    { label: "Producción", value: Math.max(inProduction.length, 0), tone: "dark" as const },
    { label: "Revisión", value: Math.max(inReviewInternal.length + awaitingClient.length, 0), tone: "outline" as const },
    { label: "Programadas", value: Math.max(scheduled.length, 0), tone: "ghost" as const },
  ].filter((s) => s.value > 0);

  // Producción completada (anillo).
  const completion = activeIdeas.length + published.length
    ? Math.round((published.length / (activeIdeas.length + published.length)) * 100)
    : 0;

  // Producción por responsable (mini barras del card destacado).
  const byResponsible = Object.entries(
    countBy(activeIdeas, (i) => i.responsible),
  ).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxResp = byResponsible[0]?.[1] ?? 1;

  // Barras por día.
  const weekData = ideasPerWeekday(ideas).map((value, i) => ({
    label: WEEKDAY_LABELS[i],
    value,
  }));

  // Próximos entregables (con fecha, no publicados).
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = ideas
    .map((i) => ({ idea: i, date: ideaDate(i) }))
    .filter(
      (x): x is { idea: (typeof ideas)[number]; date: string } =>
        Boolean(x.date) && x.date! >= today && x.idea.status !== "publicada",
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  // Pieza destacada: el próximo entregable.
  const featured = upcoming[0]?.idea;

  // Checklist: piezas recientes con su estado (done = publicada).
  const checklistItems = [...ideas]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)
    .map((i) => ({
      id: i.id,
      icon: Lightbulb,
      label: i.title,
      meta: `${clientName(i.clientId)} · ${IDEA_STATUS_LABELS[i.status]}`,
      done: i.status === "publicada",
      href: "/agency/content?view=lista",
    }));

  // Eventos del calendario semanal.
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
        title={<>Vista agencia</>}
        segmented={funnelSegments.length ? <SegmentedBar segments={funnelSegments} /> : undefined}
        counters={
          <>
            <BigCounter icon={Lightbulb} value={activeIdeas.length} label="Ideas activas" />
            <BigCounter icon={Clapperboard} value={inProduction.length} label="En producción" />
            <BigCounter icon={Send} value={published.length} label="Publicadas este mes" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pieza destacada */}
        {featured ? (
          <BentoCard
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
            contentClassName="gap-0"
            title="Próximo entregable"
            href="/agency/content?view=feed"
          >
            <div className="relative mt-1 aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-900">
              <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <Eye className="size-5" />
                <span className="text-[11px]">Preview pendiente</span>
              </div>
              {featured.coverImage && <PieceImage src={featured.coverImage} alt={featured.title} />}
            </div>
            <p className="mt-3 truncate text-sm font-semibold">{featured.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {clientName(featured.clientId)} · {featured.responsible}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <IdeaStatusBadge status={featured.status} />
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {formatDate(ideaDate(featured), "d MMM")}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <p className="text-[11px] font-medium text-muted-foreground">Producción por responsable</p>
              {byResponsible.map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{name}</span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="flare-gradient h-full rounded-full"
                      style={{ width: `${Math.round((count / maxResp) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        ) : (
          <BentoCard className="sm:col-span-2 lg:col-span-1 lg:row-span-2" title="Próximo entregable">
            <p className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
              No hay entregables próximos con fecha.
            </p>
          </BentoCard>
        )}

        {/* Producción por día */}
        <BentoCard title="Producción por día" href="/agency/content?view=calendario">
          <WeekBars data={weekData} />
        </BentoCard>

        {/* Anillo de completitud */}
        <BentoCard
          title="Producción completada"
          href="/agency/metrics"
          contentClassName="items-center justify-center"
        >
          <RingStat value={completion} label="publicadas vs. activas" />
        </BentoCard>

        {/* Checklist (acento) */}
        <TaskChecklist title="Piezas recientes" items={checklistItems} />

        {/* Funnel por etapa */}
        <BentoCard className="sm:col-span-2 lg:col-span-2" title="Pipeline de producción" href="/agency/metrics">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <RingStat value={completion} label="completado" size={120} />
            <div className="flex-1">
              {funnelSegments.length ? (
                <SegmentedBar segments={funnelSegments} />
              ) : (
                <p className="text-xs text-muted-foreground">Sin producción registrada.</p>
              )}
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Calendario semanal */}
      <div className="mt-4">
        <BentoCard title="Calendario editorial" href="/agency/content?view=calendario">
          {timelineEvents.length ? (
            <WeekTimeline events={timelineEvents} />
          ) : (
            <p className="flex items-center gap-1.5 py-8 text-center text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              No hay contenidos con fecha esta semana.
            </p>
          )}
        </BentoCard>
      </div>
    </div>
  );
}
