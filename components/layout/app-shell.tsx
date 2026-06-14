"use client";

// Cascarón de la app interna: maneja el drawer del sidebar en móvil y
// distribuye sidebar + header + contenido.

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  // El drawer se cierra al tocar un enlace del sidebar o el backdrop (onClose).
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen((v) => !v)} />
        <main
          className="flex-1 overflow-y-auto"
          style={{
            background:
              "radial-gradient(1100px 480px at 72% -220px, rgba(245,42,108,0.05), transparent 70%), #0A0808",
          }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-7 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
