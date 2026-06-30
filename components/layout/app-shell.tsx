"use client";

// Cascarón de la app interna: superficie flotante redondeada sobre un fondo
// neutro, con el nav superior tipo pill y el contenido scrollable.

import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-screen overflow-hidden p-0 sm:p-3 md:p-4"
      style={{ background: "#070606" }}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-none sm:rounded-[28px]"
        style={{
          background:
            "radial-gradient(1100px 520px at 80% -240px, rgba(245,42,108,0.06), transparent 70%), linear-gradient(180deg, #100D0C, #0A0807)",
          border: "1px solid rgba(241,233,224,0.07)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(241,233,224,0.04)",
        }}
      >
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1480px] px-4 pb-8 pt-2 md:px-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
