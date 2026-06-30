"use client";

// Contador grande con chip de icono (estilo 78 Employee / 56 Hirings / 203
// Projects). Número en font-display, label debajo.

import type { LucideIcon } from "lucide-react";

export function BigCounter({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[rgba(241,233,224,0.06)]">
        <Icon className="size-3.5 text-flare-soft" />
      </span>
      <div className="flex flex-col">
        <span
          className="text-[40px] font-semibold leading-[0.9] tabular-nums"
          style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-1px" }}
        >
          {value}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
