"use client";

import * as React from "react";
import {
  Eye,
  Heart,
  LineChart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricFormDialog } from "@/components/forms/metric-form";
import { useFlare } from "@/lib/store";
import { MONTH_LABELS, type ClientMetric } from "@/lib/types";

const fmt = new Intl.NumberFormat("es-CO");

function delta(current: number, previous: number | undefined) {
  if (previous === undefined || previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs mes anterior`;
}

export function periodLabel(m: ClientMetric) {
  return `${MONTH_LABELS[m.periodMonth - 1]} ${m.periodYear}`;
}

interface MetricsDisplayProps {
  metrics: ClientMetric[]; // ya filtradas por cliente
  readOnly?: boolean;
  onEdit?: (metric: ClientMetric) => void;
  onDelete?: (metric: ClientMetric) => void;
}

// Cards + tabla de métricas, sin dependencia del store (la usa también el portal).
export function MetricsDisplay({
  metrics,
  readOnly = false,
  onEdit,
  onDelete,
}: MetricsDisplayProps) {
  const sorted = [...metrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  const latest = sorted[0];
  const previous = sorted[1];

  if (!latest) {
    return (
      <EmptyState
        icon={LineChart}
        title="Sin métricas registradas"
        description="Cuando haya registros mensuales aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Seguidores Instagram"
          value={fmt.format(latest.instagramFollowers)}
          hint={delta(latest.instagramFollowers, previous?.instagramFollowers)}
          icon={Users}
          tone="flare"
        />
        <StatCard
          label="Alcance mensual"
          value={fmt.format(latest.monthlyReach)}
          hint={delta(latest.monthlyReach, previous?.monthlyReach)}
          icon={Eye}
        />
        <StatCard
          label="Interacciones"
          value={fmt.format(latest.interactions)}
          hint={delta(latest.interactions, previous?.interactions)}
          icon={Heart}
        />
        <StatCard
          label="Leads generados"
          value={fmt.format(latest.leadsGenerated)}
          hint={delta(latest.leadsGenerated, previous?.leadsGenerated)}
          icon={MessageCircle}
          tone="success"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Seguidores</TableHead>
              <TableHead className="text-right">Alcance</TableHead>
              <TableHead className="text-right">Interacciones</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">WhatsApp</TableHead>
              <TableHead className="text-right">Posts</TableHead>
              <TableHead className="text-right">Reels</TableHead>
              <TableHead className="text-right">Pauta (USD)</TableHead>
              {!readOnly && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-xs font-medium">
                  {periodLabel(m)}
                  {m.relevantResults && (
                    <p className="max-w-48 truncate text-[11px] font-normal text-muted-foreground">
                      {m.relevantResults}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.instagramFollowers)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.monthlyReach)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.interactions)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.leadsGenerated)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.whatsappClicks)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.postsPublished)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {fmt.format(m.reelsPublished)}
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  ${fmt.format(m.adSpend)}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-xs" />}
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEdit?.(m)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(m)}
                        >
                          <Trash2 /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Panel interno (equipo): MetricsDisplay + registro/edición vía store.
export function MetricsPanel({ clientId }: { clientId: string }) {
  const { metrics, deleteMetric } = useFlare();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientMetric | null>(null);

  const clientMetrics = metrics.filter((m) => m.clientId === clientId);
  const sorted = [...clientMetrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {sorted[0]
            ? `Último registro: ${periodLabel(sorted[0])}`
            : "Sin métricas registradas"}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Registrar métricas
        </Button>
      </div>

      <MetricsDisplay
        metrics={clientMetrics}
        onEdit={(m) => {
          setEditing(m);
          setFormOpen(true);
        }}
        onDelete={(m) => {
          deleteMetric(m.id);
          toast.success("Registro eliminado");
        }}
      />

      <MetricFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        metric={editing}
        defaultClientId={clientId}
      />
    </div>
  );
}
