"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Heart,
  LineChart,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Sparkles,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard, type StatTrend } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useConfirm } from "@/components/shared/use-confirm";
import { CHART_COLORS, StackedBarChart, TrendChart } from "@/components/shared/charts";
import { useFlare } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  CONNECTED_PROVIDER_LABELS,
  MONTH_LABELS,
  type ClientMetric,
} from "@/lib/types";

const fmt = new Intl.NumberFormat("es-CO");

// Variación vs período anterior, con dirección para color + icono.
// Umbral de ±1% para considerar "estable".
function trend(current: number, previous: number | undefined): StatTrend | undefined {
  if (previous === undefined || previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  const direction: StatTrend["direction"] =
    pct > 1 ? "up" : pct < -1 ? "down" : "flat";
  const sign = pct >= 0 ? "+" : "";
  return { label: `${sign}${pct.toFixed(1)}% vs mes anterior`, direction };
}

export function periodLabel(m: ClientMetric) {
  return `${MONTH_LABELS[m.periodMonth - 1]} ${m.periodYear}`;
}

interface MetricsDisplayProps {
  metrics: ClientMetric[]; // ya filtradas por cliente
  readOnly?: boolean;
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

  const noHistory = !previous;

  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Seguidores Instagram"
          value={fmt.format(latest.instagramFollowers)}
          hint={noHistory ? `Mes: ${periodLabel(latest)}` : undefined}
          trend={trend(latest.instagramFollowers, previous?.instagramFollowers)}
          icon={Users}
          tone="flare"
        />
        <StatCard
          label="Alcance mensual"
          value={fmt.format(latest.monthlyReach)}
          trend={trend(latest.monthlyReach, previous?.monthlyReach)}
          icon={Eye}
        />
        <StatCard
          label="Interacciones"
          value={fmt.format(latest.interactions)}
          trend={trend(latest.interactions, previous?.interactions)}
          icon={Heart}
        />
        <StatCard
          label="Leads generados"
          value={fmt.format(latest.leadsGenerated)}
          trend={trend(latest.leadsGenerated, previous?.leadsGenerated)}
          icon={MessageCircle}
          tone="success"
        />
      </div>
      {noHistory && (
        <p className="text-[11px] text-muted-foreground">
          Aún no hay suficiente histórico para mostrar variación vs. el mes
          anterior. Registra otro mes para ver tendencias.
        </p>
      )}
    </div>
  );
}

// Mini insights automáticos: comparan el último mes con el anterior y resumen
// la evolución en lenguaje claro (con color + icono). Los usa el portal.
const INSIGHT_METRICS: { key: keyof ClientMetric; noun: string }[] = [
  { key: "monthlyReach", noun: "alcance" },
  { key: "leadsGenerated", noun: "número de leads" },
  { key: "interactions", noun: "interacciones" },
  { key: "instagramFollowers", noun: "comunidad en Instagram" },
];

export function MetricsInsights({ metrics }: { metrics: ClientMetric[] }) {
  const sorted = [...metrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  const latest = sorted[0];
  const previous = sorted[1];
  if (!latest) return null;

  if (!previous) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-3 text-xs text-muted-foreground">
        Aún no hay suficiente histórico para comparar meses. Con el próximo
        registro te mostraremos cómo evolucionan tus resultados.
      </div>
    );
  }

  const insights = INSIGHT_METRICS.map(({ key, noun }) => {
    const current = latest[key] as number;
    const prev = previous[key] as number;
    if (typeof current !== "number" || typeof prev !== "number" || prev === 0) {
      return null;
    }
    const pct = ((current - prev) / prev) * 100;
    const abs = Math.abs(pct);
    const direction: StatTrend["direction"] = pct > 1 ? "up" : pct < -1 ? "down" : "flat";
    let text: string;
    if (direction === "flat") {
      text = `Tu ${noun} se mantiene estable (${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%).`;
    } else if (direction === "up") {
      text = `Tu ${noun} creció ${abs.toFixed(0)}% respecto al mes anterior.`;
    } else {
      text = `Tu ${noun} bajó ${abs.toFixed(0)}% respecto al mes anterior.`;
    }
    return { text, direction };
  }).filter((x): x is { text: string; direction: StatTrend["direction"] } => x !== null);

  if (!insights.length) return null;

  const ICON: Record<StatTrend["direction"], { Icon: typeof ArrowUpRight; cls: string }> = {
    up: { Icon: ArrowUpRight, cls: "text-[#3DD68C]" },
    down: { Icon: ArrowDownRight, cls: "text-[#FF5C5C]" },
    flat: { Icon: Minus, cls: "text-[#A39A91]" },
  };

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="size-4 text-flare" />
          Resumen del mes
        </p>
        <ul className="space-y-2">
          {insights.map(({ text, direction }, idx) => {
            const { Icon, cls } = ICON[direction];
            return (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <Icon className={cn("mt-0.5 size-3.5 shrink-0", cls)} aria-hidden />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

// Gráficos de evolución mensual (los usan el equipo y el portal).
const CONTENT_SERIES = [
  { label: "Posts", color: CHART_COLORS.magenta },
  { label: "Reels", color: CHART_COLORS.orange },
  { label: "Carruseles", color: CHART_COLORS.purple },
  { label: "Historias", color: CHART_COLORS.amber },
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
  const singlePoint = chrono.length < 2;

  return (
    <div className="space-y-4">
      {singlePoint && (
        <p className="rounded-md border border-dashed border-border bg-card/50 px-3 py-2 text-[11px] text-muted-foreground">
          Aún no hay suficiente histórico para dibujar una tendencia. Mostramos el
          único registro disponible; con dos o más meses verás la evolución.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard title="Seguidores en Instagram">
          <TrendChart points={series((m) => m.instagramFollowers)} color={CHART_COLORS.magenta} />
        </ChartCard>
        <ChartCard title="Alcance mensual">
          <TrendChart points={series((m) => m.monthlyReach)} color={CHART_COLORS.purple} />
        </ChartCard>
        <ChartCard title="Interacciones">
          <TrendChart points={series((m) => m.interactions)} color={CHART_COLORS.orange} />
        </ChartCard>
        <ChartCard title="Leads generados">
          <TrendChart points={series((m) => m.leadsGenerated)} color={CHART_COLORS.green} />
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
            color={CHART_COLORS.amber}
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
  onDelete,
}: MetricsDisplayProps) {
  const sorted = [...metrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  if (!sorted.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="min-w-[64rem]">
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
                        render={<Button variant="ghost" size="icon-xs" aria-label="Más opciones" />}
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
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
        title="Sin métricas todavía"
        description="Asocia y conecta las cuentas de analytics del cliente (tab Accesos) para alimentar sus métricas."
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

// Panel interno (equipo). El registro manual se retiró: las métricas entran
// por el sync de las cuentas de analytics conectadas; aquí solo se consultan
// (y se pueden eliminar registros erróneos).
export function MetricsPanel({ clientId }: { clientId: string }) {
  const { metrics, deleteMetric, connectedAccounts } = useFlare();
  const { confirm, dialog } = useConfirm();

  const clientMetrics = metrics.filter((m) => m.clientId === clientId);
  const sorted = [...clientMetrics].sort(
    (a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth,
  );
  const accounts = connectedAccounts.filter((a) => a.clientId === clientId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {sorted[0]
              ? `Último registro: ${periodLabel(sorted[0])}`
              : "Sin métricas registradas"}
          </p>
          {accounts.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
              title={`${CONNECTED_PROVIDER_LABELS[a.provider]} · ${a.handle}`}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  a.status === "conectada"
                    ? "bg-emerald-400"
                    : a.status === "error" || a.status === "expirada"
                      ? "bg-amber-400"
                      : "bg-zinc-400",
                )}
              />
              {a.handle}
            </span>
          ))}
        </div>
      </div>

      <MetricsDisplay
        metrics={clientMetrics}
        onDelete={(m) =>
          confirm({
            title: `¿Eliminar el registro de ${periodLabel(m)}?`,
            description: "Esta acción no se puede deshacer.",
            confirmLabel: "Eliminar",
            destructive: true,
            onConfirm: () => {
              deleteMetric(m.id);
              toast.success("Registro eliminado");
            },
          })
        }
      />
      {dialog}
    </div>
  );
}
