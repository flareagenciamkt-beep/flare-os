"use client";

import { Flame } from "lucide-react";

export function Splash({ label = "Cargando Flare OS..." }: { label?: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
      <div className="flex size-12 animate-pulse items-center justify-center rounded-xl bg-flare">
        <Flame className="size-6 text-white" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
