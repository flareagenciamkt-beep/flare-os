"use client";

// Fila de segmentos proporcionales con label arriba y % dentro (estilo
// Interviews/Hired/Project time/Output). Tonos en marca dark.

import { cn } from "@/lib/utils";

export interface Segment {
  label: string;
  value: number; // peso relativo (se normaliza a %)
  tone?: "fill" | "dark" | "ghost" | "outline";
}

const TONE: Record<NonNullable<Segment["tone"]>, string> = {
  fill: "flare-gradient text-white",
  dark: "bg-[#1a1614] text-[#F1E9E0]",
  ghost:
    "text-[#a39990] [background:repeating-linear-gradient(135deg,rgba(241,233,224,0.06)_0_6px,transparent_6px_12px)] border border-[rgba(241,233,224,0.08)]",
  outline: "border border-[rgba(241,233,224,0.16)] text-[#a39990]",
};

export function SegmentedBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="mb-1.5 flex gap-1.5">
        {segments.map((s) => (
          <span
            key={s.label}
            className="truncate text-[11px] text-muted-foreground"
            style={{ width: `${(s.value / total) * 100}%`, minWidth: "fit-content" }}
          >
            {s.label}
          </span>
        ))}
      </div>
      {/* Segmentos */}
      <div className="flex h-9 gap-1.5">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <div
              key={s.label}
              className={cn(
                "flex h-full min-w-9 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                TONE[s.tone ?? "dark"],
              )}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${pct}%`}
            >
              {pct}%
            </div>
          );
        })}
      </div>
    </div>
  );
}
