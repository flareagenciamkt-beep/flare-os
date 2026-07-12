"use client";

import * as React from "react";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { MetricsPanel } from "@/components/metrics/metrics-panel";
import { useFlare } from "@/lib/store";

export default function ClientMetricsPage() {
  const { clients } = useFlare();
  const [clientId, setClientId] = React.useState<string>(clients[0]?.id ?? "");

  const options = clients.map((c) => ({ value: c.id, label: c.brand }));
  const selected = clients.find((c) => c.id === clientId) ?? clients[0];

  if (!clients.length) {
    return (
      <EmptyState
        icon={LineChart}
        title="No hay clientes"
        description="Crea un cliente para ver sus métricas."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Métricas por cliente"
        description="Rendimiento mensual de cada marca, alimentado por sus cuentas de analytics."
        actions={
          <SimpleSelect
            className="w-56"
            value={selected?.id ?? ""}
            onChange={setClientId}
            options={options}
            placeholder="Selecciona un cliente"
          />
        }
      />
      {selected && <MetricsPanel clientId={selected.id} />}
    </div>
  );
}
