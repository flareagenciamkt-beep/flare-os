"use client";

import { CalendarDays } from "lucide-react";
import { CalendarView } from "@/components/ideas/calendar-view";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaStatusBadge, ChannelBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { usePortalIdeaDialog } from "@/components/portal/idea-dialog";
import { usePortal } from "@/lib/portal-store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";

export default function PortalCalendarPage() {
  const { ideas } = usePortal();
  const { openIdea, dialog } = usePortalIdeaDialog();

  // Lista cronológica de todas las piezas con fecha.
  const dated = ideas
    .map((idea) => ({ idea, date: ideaDate(idea) }))
    .filter((x): x is { idea: (typeof ideas)[number]; date: string } => Boolean(x.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Calendario de contenido</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fechas sugeridas y de publicación de tus piezas.
        </p>
      </div>

      <CalendarView ideas={ideas} onEdit={openIdea} showClient={false} />

      <div className="mt-6">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <CalendarDays className="size-4 text-flare" />
          Todos tus contenidos
        </p>
        {dated.length ? (
          <Card className="gap-0 py-0">
            <CardContent className="divide-y divide-border p-0">
              {dated.map(({ idea, date }) => (
                <button
                  key={idea.id}
                  onClick={() => openIdea(idea)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                >
                  <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {formatDate(date, "d MMM")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {idea.title}
                  </span>
                  <ChannelBadge channel={idea.channel} />
                  <IdeaStatusBadge status={idea.status} />
                </button>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Aún no hay contenidos con fecha"
            description="Cuando el equipo Flare programe tus piezas aparecerán aquí ordenadas por fecha."
          />
        )}
      </div>

      {dialog}
    </div>
  );
}
