"use client";

// Gráficos SVG livianos del design system (sin librerías externas).
// Escalan con el contenedor vía viewBox; tooltips nativos con <title>.

import * as React from "react";

const W = 600;
const H = 190;
const PAD_LEFT = 46;
const PAD_RIGHT = 14;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

const compact = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const full = new Intl.NumberFormat("es-CO");

// Paleta de gráficos alineada al sistema visual Flare (warm dark premium).
export const CHART_COLORS = {
  magenta: "#F52A6C",
  coral: "#FE4E49",
  orange: "#FF6A35",
  green: "#3DD68C",
  purple: "#8E5BFF",
  amber: "#FFC247",
} as const;

export interface ChartPoint {
  label: string;
  value: number;
}

function xAt(i: number, count: number) {
  if (count === 1) return PAD_LEFT + PLOT_W / 2;
  return PAD_LEFT + (i * PLOT_W) / (count - 1);
}

function GridAndAxis({ max }: { max: number }) {
  const rows = [0, 0.5, 1];
  return (
    <>
      {rows.map((r) => {
        const y = PAD_TOP + PLOT_H * (1 - r);
        return (
          <g key={r}>
            <line
              x1={PAD_LEFT}
              x2={W - PAD_RIGHT}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={PAD_LEFT - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="currentColor"
              fillOpacity={0.45}
            >
              {compact.format(max * r)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function XLabels({ labels }: { labels: string[] }) {
  // Si hay muchos puntos, etiquetar alternados para no encimar.
  const every = labels.length > 8 ? 2 : 1;
  return (
    <>
      {labels.map((label, i) =>
        i % every === 0 ? (
          <text
            key={i}
            x={xAt(i, labels.length)}
            y={H - 8}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {label}
          </text>
        ) : null,
      )}
    </>
  );
}

// ─── Línea con área (evolución mensual) ─────────────────────────────────────

export function TrendChart({
  points,
  color = CHART_COLORS.magenta,
  valueFormatter = (n: number) => full.format(n),
}: {
  points: ChartPoint[];
  color?: string;
  valueFormatter?: (n: number) => string;
}) {
  const gradientId = React.useId();
  if (!points.length) return null;

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const yAt = (v: number) => PAD_TOP + PLOT_H * (1 - v / max);

  const coords = points.map((p, i) => [xAt(i, points.length), yAt(p.value)] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0]},${PAD_TOP + PLOT_H} L${coords[0][0]},${PAD_TOP + PLOT_H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-foreground">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <GridAndAxis max={max} />
      {points.length > 1 && <path d={area} fill={`url(#${gradientId})`} />}
      {points.length > 1 && (
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      )}
      {coords.map(([x, y], i) => (
        <g key={i}>
          <title>{`${points[i].label}: ${valueFormatter(points[i].value)}`}</title>
          {/* Zona de hover generosa para el tooltip nativo */}
          <rect
            x={x - PLOT_W / points.length / 2}
            y={PAD_TOP}
            width={PLOT_W / points.length}
            height={PLOT_H}
            fill="transparent"
          />
          <circle cx={x} cy={y} r={3.5} fill="var(--card, #14110F)" stroke={color} strokeWidth={2} />
        </g>
      ))}
      {/* Valor del último punto siempre visible */}
      <text
        x={Math.min(coords[coords.length - 1][0], W - PAD_RIGHT - 2)}
        y={Math.max(coords[coords.length - 1][1] - 9, 10)}
        textAnchor="end"
        fontSize={10}
        fontWeight={600}
        fill={color}
      >
        {valueFormatter(points[points.length - 1].value)}
      </text>
      <XLabels labels={points.map((p) => p.label)} />
    </svg>
  );
}

// ─── Barras apiladas (mix de contenido por mes) ─────────────────────────────

export interface StackedSeries {
  label: string;
  color: string;
}

export function StackedBarChart({
  data,
  series,
}: {
  data: { label: string; values: number[] }[];
  series: StackedSeries[];
}) {
  if (!data.length) return null;

  const totals = data.map((d) => d.values.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals, 1);
  const step = PLOT_W / data.length;
  const barWidth = Math.min(step * 0.55, 42);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-foreground">
        <GridAndAxis max={max} />
        {data.map((d, i) => {
          const cx = PAD_LEFT + step * i + step / 2;
          let yCursor = PAD_TOP + PLOT_H;
          return (
            <g key={d.label + i}>
              {d.values.map((v, s) => {
                const h = (v / max) * PLOT_H;
                yCursor -= h;
                return v > 0 ? (
                  <rect
                    key={s}
                    x={cx - barWidth / 2}
                    y={yCursor}
                    width={barWidth}
                    height={h}
                    rx={2}
                    fill={series[s].color}
                    fillOpacity={0.9}
                  >
                    <title>{`${d.label} · ${series[s].label}: ${full.format(v)}`}</title>
                  </rect>
                ) : null;
              })}
              {totals[i] > 0 && (
                <text
                  x={cx}
                  y={yCursor - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill="currentColor"
                  fillOpacity={0.7}
                >
                  {full.format(totals[i])}
                </text>
              )}
              <text
                x={cx}
                y={H - 8}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                fillOpacity={0.45}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
