"use client";

// Selector de chips: muestra los elementos seleccionados como pills removibles,
// permite agregar desde sugerencias o escribir uno propio. Para servicios,
// canales, etiquetas, etc.

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChipSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  emptyLabel?: string;
  ariaLabel?: string;
}

export function ChipSelect({
  value,
  onChange,
  suggestions = [],
  placeholder = "Agregar…",
  emptyLabel = "Ninguno seleccionado todavía.",
  ariaLabel = "Elementos",
}: ChipSelectProps) {
  const [draft, setDraft] = React.useState("");

  const add = (raw: string) => {
    const item = raw.trim();
    if (!item) return;
    if (value.some((v) => v.toLowerCase() === item.toLowerCase())) return;
    onChange([...value, item]);
    setDraft("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  const available = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-2.5">
      {/* Seleccionados */}
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent p-1.5"
        role="list"
        aria-label={ariaLabel}
      >
        {value.length ? (
          value.map((item) => (
            <span
              key={item}
              role="listitem"
              className="flare-gradient inline-flex items-center gap-1 rounded-full py-0.5 pl-2.5 pr-1 text-[11px] font-medium text-white"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`Quitar ${item}`}
                className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-black/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="px-1.5 text-[11px] text-muted-foreground">{emptyLabel}</span>
        )}
      </div>

      {/* Agregar propio */}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!draft.trim()}
          onClick={() => add(draft)}
        >
          <Plus data-icon="inline-start" />
          Agregar
        </Button>
      </div>

      {/* Sugerencias */}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <Plus className="size-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
