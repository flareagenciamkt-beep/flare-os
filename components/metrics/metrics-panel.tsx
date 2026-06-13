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
import { Card, CardContent } from "@/components/ui/card";
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
import { StackedBarChart, TrendChart } from "@/components/shared/charts";
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

// Cards del último mes con delta vs. el anterior (las usa también el portal).
export function MetricsCards({ metrics }: { metrics: ClientMetric[] }) {
  const sorted = [...metrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  const latest = sorted[0];
  const previous = sorted[1];
  if (!latest) return null;

  return (
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
  );
}

// Gráficos de evolución mensual (los usan el equipo y el portal).
const CONTENT_SERIES = [
  { label: "Posts", color: "#FF704D" },
  { label: "Reels", color: "#38bdf8" },
  { label: "Carruseles", color: "#a78bfa" },
  { label: "Historias", color: "#facc15" },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

export function MetricsCharts({ metrics }: { metrics: ClientMetric[] }) {
  // Cronológico (viejo → nuevo), máximo último año.
  const chrono = [...metrics]
    .sort((a, b) => a.periodYear - b.periodYear || a.periodMonth - b.periodMonth)
    .slice(-12);
  if (!chrono.length) return null;

  const monthLabel = (m: ClientMetric) =>
    `${MONTH_LABELS[m.periodMonth - 1].slice(0, 3)} ${String(m.periodYear).slice(2)}`;
  const series = (pick: (m: ClientMetric) => number) =>
    chrono.map((m) => ({ label: monthLabel(m), value: pick(m) }));
  const hasAdSpend = chrono.some((m) => m.adSpend > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard title="Seguidores en Instagram">
          <TrendChart points={series((m) => m.instagramFollowers)} color="#FF4D2E" />
        </ChartCard>
        <ChartCard title="Alcance mensual">
          <TrendChart points={series((m) => m.monthlyReach)} color="#38bdf8" />
        </ChartCard>
        <ChartCard title="Interacciones">
          <TrendChart points={series((m) => m.interactions)} color="#a78bfa" />
        </ChartCard>
        <ChartCard title="Leads generados">
          <TrendChart points={series((m) => m.leadsGenerated)} color="#34d399" />
        </ChartCard>
      </div>

      <ChartCard title="Contenido publicado por mes">
        <StackedBarChart
          data={chrono.map((m) => ({
            label: monthLabel(m),
            values: [
              m.postsPublished,
              m.reelsPublished,
              m.carouselsPublished,
              m.storiesPublished,
            ],
          }))}
          series={CONTENT_SERIES}
        />
      </ChartCard>

      {hasAdSpend && (
        <ChartCard title="Inversión en pauta (USD)">
          <TrendChart
            points={series((m) => m.adSpend)}
            color="#f59e0b"
            valueFormatter={(n) => `$${fmt.format(n)}`}
          />
        </ChartCard>
      )}
    </div>
  );
}

// Tabla de registros mensuales (la usa también el portal en modo readOnly).
export function MetricsTable({
  metrics,
  readOnly = false,
  onEdit,
  onDelete,
}: MetricsDisplayProps) {
  const sorted = [...metrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  if (!sorted.length) return null;

  return (
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
              <TableHead className="text-right">CPL</TableHead>
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
                <TableCell className="text-right text-xs tabular-nums">
                  {m.leadsGenerated > 0 && m.adSpend > 0
                    ? `$${(m.adSpend / m.leadsGenerated).toFixed(1)}`
                    : "—"}
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
  );
}

// Cards + tabla, sin dependencia del store.
export function MetricsDisplay(props: MetricsDisplayProps) {
  if (!props.metrics.length) {
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
      <MetricsCards metrics={props.metrics} />
      <MetricsCharts metrics={props.metrics} />
      <MetricsTable {...props} />
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
