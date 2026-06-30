"use client";

// Barras verticales por día (estilo "Progress · Work Time"). Resalta la barra
// de mayor valor con el gradiente de marca y muestra una pill con su valor.

import { cn } from "@/lib/utils";

export interface WeekBarPoint {
  label: string; // inicial del día (L, M, X...)
  value: number;
}

export function WeekBars({
  data,
  unit = "",
}: {
  data: WeekBarPoint[];
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const peakIndex = data.reduce(
    (best, d, i) => (d.value > data[best].value ? i : best),
    0,
  );

  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * 100);
        const isPeak = i === peakIndex && d.value > 0;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            {isPeak && (
              <span className="flare-gradient rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">
                {d.value}
                {unit}
              </span>
            )}
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className={cn(
                  "w-2.5 rounded-full transition-all",
                  isPeak ? "flare-gradient" : "bg-[rgba(241,233,224,0.16)]",
                )}
                style={{ height: `${Math.max(h, 4)}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
