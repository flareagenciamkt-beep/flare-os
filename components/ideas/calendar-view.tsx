"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaStatusBadge } from "@/components/shared/badges";
import { formatDate } from "@/lib/dates";
import { ideaDate, isIdeaOverdue } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS, type Idea, type IdeaStatus } from "@/lib/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const STATUS_DOT: Record<IdeaStatus, string> = {
  idea: "bg-zinc-400",
  validada: "bg-sky-400",
  en_produccion: "bg-flare",
  en_revision_interna: "bg-violet-400",
  en_revision_cliente: "bg-fuchsia-400",
  aprobada: "bg-teal-400",
  programada: "bg-amber-400",
  publicada: "bg-emerald-400",
  pausada: "bg-orange-400",
  archivada: "bg-zinc-600",
};

interface CalendarViewProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  showClient?: boolean;
  // Inyectada para no depender del store (el portal no monta FlareStoreProvider).
  clientName?: (clientId: string | null) => string;
  // Crear contenido desde un día (botón + en cada celda). Opcional: el portal no lo usa.
  onCreate?: (dateISO: string) => void;
}

export function CalendarView({
  ideas,
  onEdit,
  showClient = true,
  clientName = () => "",
  onCreate,
}: CalendarViewProps) {
  const [month, setMonth] = React.useState(() => startOfMonth(new Date()));

  const dated = ideas
    .map((idea) => ({ idea, date: ideaDate(idea) }))
    .filter((x): x is { idea: Idea; date: string } => Boolean(x.date));

  const days = eachDayOfInterval({
    start: startOfWeek(month, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const today = new Date();
  const upcoming = dated
    .filter((x) => parseISO(x.date) >= today || isSameDay(parseISO(x.date), today))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold capitalize">
              {format(month, "MMMM yyyy", { locale: es })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                aria-label="Mes anterior"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonth(startOfMonth(new Date()))}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                aria-label="Mes siguiente"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="bg-card px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {days.map((day) => {
              const dayIdeas = dated.filter((x) => isSameDay(parseISO(x.date), day));
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "group/day min-h-24 bg-card p-1.5",
                    !isSameMonth(day, month) && "bg-card/40 text-muted-foreground/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex size-5 items-center justify-center rounded-full text-[11px]",
                        isToday(day)
                          ? "bg-flare font-semibold text-white"
                          : "text-muted-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {onCreate && (
                      <button
                        onClick={() => onCreate(format(day, "yyyy-MM-dd"))}
                        className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover/day:opacity-100"
                        aria-label={`Crear contenido el ${format(day, "d 'de' MMMM", { locale: es })}`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayIdeas.slice(0, 3).map(({ idea }) => (
                      <button
                        key={idea.id}
                        onClick={() => onEdit(idea)}
                        className="flex w-full items-center gap-1 rounded bg-secondary/70 px-1.5 py-1 text-left text-[10px] leading-tight hover:bg-secondary"
                        title={`${
                          clientName(idea.clientId)
                            ? `${clientName(idea.clientId)} · `
                            : ""
                        }${idea.title} · ${FORMAT_LABELS[idea.format]}`}
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_DOT[idea.status],
                          )}
                        />
                        <span
                          className={cn(
                            "truncate",
                            isIdeaOverdue(idea) && "text-red-400",
                          )}
                        >
                          {showClient
                            ? `${clientName(idea.clientId)} · ${idea.title}`
                            : idea.title}
                        </span>
                        <span className="ml-auto shrink-0 text-[8px] uppercase tracking-wide text-muted-foreground/70">
                          {FORMAT_LABELS[idea.format].slice(0, 4)}
                        </span>
                      </button>
                    ))}
                    {dayIdeas.length > 3 && (
                      <p className="px-1 text-[10px] text-muted-foreground">
                        +{dayIdeas.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 self-start">
        <CardContent className="p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <CalendarDays className="size-4 text-flare" />
            Próximos contenidos
          </p>
          {upcoming.length ? (
            <div className="space-y-2.5">
              {upcoming.map(({ idea, date }) => (
                <button
                  key={idea.id}
                  onClick={() => onEdit(idea)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
                >
                  {showClient && (
                    <p className="truncate text-[10px] font-medium uppercase tracking-wide text-flare-soft">
                      {clientName(idea.clientId)}
                    </p>
                  )}
                  <p className="truncate text-xs font-medium">{idea.title}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <IdeaStatusBadge status={idea.status} />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(date, "d MMM")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No hay contenidos próximos con fecha.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
