"use client";

import Image from "next/image";

export function Splash({ label = "Cargando Flare OS..." }: { label?: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-background">
      <div className="relative flex items-center justify-center">
        {/* Glow detrás del logo */}
        <div
          className="animate-glow-pulse absolute h-[140px] w-[240px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(245,42,108,0.28), rgba(255,106,53,0.06) 55%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        <Image
          src="/flare-logo-v2.png"
          alt="Flare"
          width={210}
          height={140}
          priority
          className="animate-pulse relative"
          style={{ filter: "drop-shadow(0 6px 30px rgba(245,42,108,0.32))" }}
        />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
