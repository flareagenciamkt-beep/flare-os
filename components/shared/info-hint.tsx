"use client";

// Pequeño icono de ayuda con tooltip. Para aclarar métricas y cálculos
// (progreso promedio, health, fórmula de progreso, etc.) sin saturar la UI.

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InfoHint({ text, label = "Más información" }: { text: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            className="inline-flex items-center text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
          />
        }
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] text-pretty">{text}</TooltipContent>
    </Tooltip>
  );
}
