"use client";

// Cabecera tipo "Welcome in, Nixtio": título grande + banda con la barra
// segmentada (izquierda) y los contadores grandes (derecha).

import * as React from "react";

export function WelcomeHeader({
  title,
  segmented,
  counters,
}: {
  title: React.ReactNode;
  segmented?: React.ReactNode;
  counters?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1
        className="text-[34px] font-semibold leading-tight sm:text-[44px]"
        style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.5px" }}
      >
        {title}
      </h1>

      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {segmented && <div className="w-full max-w-xl">{segmented}</div>}
        {counters && (
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">{counters}</div>
        )}
      </div>
    </div>
  );
}
