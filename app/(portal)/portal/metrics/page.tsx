"use client";

import { MetricsDisplay } from "@/components/metrics/metrics-panel";
import { usePortal } from "@/lib/portal-store";

export default function PortalMetricsPage() {
  const { metrics } = usePortal();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Tus métricas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resultados mensuales registrados por el equipo de Flare.
        </p>
      </div>
      <MetricsDisplay metrics={metrics} readOnly />
    </div>
  );
}
