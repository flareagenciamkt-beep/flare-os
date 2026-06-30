"use client";

// Anillo/donut de progreso (estilo "Time tracker" del bento). Arco con gradiente
// de marca magenta→naranja, valor central y label. Escala con el contenedor.

import * as React from "react";

interface RingStatProps {
  value: number; // 0–100
  label?: string;
  center?: React.ReactNode; // contenido central (por defecto el % grande)
  size?: number;
}

export function RingStat({ value, label, center, size = 168 }: RingStatProps) {
  const id = React.useId();
  const pct = Math.max(0, Math.min(100, value));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F52A6C" />
            <stop offset="55%" stopColor="#FE4E49" />
            <stop offset="100%" stopColor="#FF6A35" />
          </linearGradient>
        </defs>
        {/* Pista */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(241,233,224,0.08)"
          strokeWidth={stroke}
        />
        {/* Arco de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {center ?? (
          <span
            className="text-[34px] font-semibold leading-none tabular-nums"
            style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.5px" }}
          >
            {pct}%
          </span>
        )}
        {label && <span className="mt-1 text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
