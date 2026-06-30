"use client";

// Card oscura de acento con checklist (estilo "Onboarding Task 2/8"). Cada fila
// tiene icono, texto, fecha y estado (hecho/pendiente) con color + icono.

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  id: string;
  icon: LucideIcon;
  label: string;
  meta?: string; // fecha u otra info secundaria
  done?: boolean;
  href?: string;
}

export function TaskChecklist({
  title,
  items,
  emptyLabel = "Nada pendiente. 🔥",
}: {
  title: string;
  items: ChecklistItem[];
  emptyLabel?: string;
}) {
  const done = items.filter((i) => i.done).length;

  return (
    <div
      className="flex h-full flex-col rounded-[20px] p-4"
      style={{ background: "linear-gradient(165deg, #131110, #0A0807)", border: "1px solid rgba(241,233,224,0.06)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#F1E9E0]">{title}</p>
        {items.length > 0 && (
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {done}/{items.length}
          </span>
        )}
      </div>

      {items.length ? (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const rowClass = cn(
              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors",
              item.href && "hover:bg-[rgba(241,233,224,0.04)]",
            );
            const inner = (
              <>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[rgba(241,233,224,0.06)]">
                  <Icon className="size-3.5 text-[#a39990]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-xs font-medium",
                      item.done ? "text-muted-foreground line-through" : "text-[#F1E9E0]",
                    )}
                  >
                    {item.label}
                  </p>
                  {item.meta && (
                    <p className="truncate text-[10px] text-muted-foreground">{item.meta}</p>
                  )}
                </div>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    item.done
                      ? "flare-gradient text-white"
                      : "border border-[rgba(241,233,224,0.16)]",
                  )}
                  aria-label={item.done ? "Completado" : "Pendiente"}
                >
                  {item.done && <Check className="size-3" />}
                </span>
              </>
            );
            return item.href ? (
              <Link key={item.id} href={item.href} className={rowClass}>
                {inner}
              </Link>
            ) : (
              <div key={item.id} className={rowClass}>
                {inner}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
