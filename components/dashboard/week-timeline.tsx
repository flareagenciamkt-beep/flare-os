"use client";

// Timeline semanal (estilo el calendario inferior del bento). Muestra la semana
// actual en 7 columnas (día + fecha) con chips de evento por día. En pantallas
// chicas las columnas hacen scroll horizontal.

import {
  addDays,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  sub?: string;
  date: string; // ISO yyyy-MM-dd
  href?: string;
}

const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

export function WeekTimeline({
  events,
  weekStart,
}: {
  events: TimelineEvent[];
  weekStart?: Date;
}) {
  const start = startOfWeek(weekStart ?? new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div>
      <p className="mb-3 text-sm font-semibold capitalize">
        {format(start, "MMMM yyyy", { locale: es })}
      </p>
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dayEvents = events.filter((e) => isSameDay(parseISO(e.date), day));
            const today = isToday(day);
            return (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={cn(
                    "rounded-xl px-2 py-1.5 text-center",
                    today ? "flare-gradient text-white" : "bg-[rgba(241,233,224,0.04)]",
                  )}
                >
                  <p className="text-[10px] uppercase tracking-wide opacity-80">{WEEKDAYS[i]}</p>
                  <p className="text-sm font-semibold tabular-nums">{format(day, "d")}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {dayEvents.map((e) => {
                    const cls =
                      "block rounded-lg border border-border bg-secondary/40 px-2 py-1.5 transition-colors hover:bg-secondary/70";
                    const inner = (
                      <>
                        <p className="truncate text-[11px] font-medium">{e.title}</p>
                        {e.sub && (
                          <p className="truncate text-[10px] text-muted-foreground">{e.sub}</p>
                        )}
                      </>
                    );
                    return e.href ? (
                      <Link key={e.id} href={e.href} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={e.id} className={cls}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
