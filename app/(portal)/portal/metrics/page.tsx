"use client";

import { LineChart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MetricsCards,
  MetricsCharts,
  MetricsInsights,
  MetricsTable,
} from "@/components/metrics/metrics-panel";
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

      {metrics.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Sin métricas registradas"
          description="Cuando haya registros mensuales aparecerán aquí."
        />
      ) : (
        <div className="space-y-4">
          <MetricsCards metrics={metrics} />
          <MetricsInsights metrics={metrics} />
          <MetricsCharts metrics={metrics} />
          <div>
            <p className="mb-2 text-sm font-semibold">Detalle mes a mes</p>
            <MetricsTable metrics={metrics} readOnly />
          </div>
        </div>
      )}
    </div>
  );
}
