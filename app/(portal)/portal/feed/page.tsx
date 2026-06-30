"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { FeedPreview } from "@/components/ideas/feed-preview";
import { EmptyState } from "@/components/shared/empty-state";
import { usePortalIdeaDialog } from "@/components/portal/idea-dialog";
import { usePortal } from "@/lib/portal-store";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/types";

type FeedFilter = "todas" | "por_aprobar" | "aprobadas" | "programadas" | "publicadas";

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "por_aprobar", label: "Por aprobar" },
  { value: "aprobadas", label: "Aprobadas" },
  { value: "programadas", label: "Programadas" },
  { value: "publicadas", label: "Publicadas" },
];

function matchesFilter(idea: Idea, filter: FeedFilter): boolean {
  switch (filter) {
    case "todas":
      return true;
    case "por_aprobar":
      return (
        idea.status === "en_revision_cliente" &&
        (idea.clientApproval ?? "pendiente") === "pendiente"
      );
    case "aprobadas":
      return idea.status === "aprobada" || idea.clientApproval === "aprobada";
    case "programadas":
      return idea.status === "programada";
    case "publicadas":
      return idea.status === "publicada";
  }
}

export default function PortalFeedPage() {
  const { client, ideas } = usePortal();
  const { openIdea, dialog } = usePortalIdeaDialog();
  const [filter, setFilter] = React.useState<FeedFilter>("todas");

  const count = (f: FeedFilter) => ideas.filter((i) => matchesFilter(i, f)).length;
  const filtered = ideas.filter((i) => matchesFilter(i, filter));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Tu feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Así se ve tu contenido publicado y planificado. Toca una pieza para verla.
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const n = count(f.value);
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-flare/40 bg-flare/10 text-flare-soft"
                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  active ? "bg-flare/20" : "bg-secondary",
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <FeedPreview
          ideas={filtered}
          onEdit={openIdea}
          groupByClient={false}
          singleLabel={client.brand}
        />
      ) : (
        <EmptyState
          icon={Inbox}
          title="No hay piezas en esta vista"
          description={
            filter === "por_aprobar"
              ? "El equipo Flare todavía no ha enviado piezas para tu revisión."
              : "Aún no hay contenido en este estado. Prueba con otro filtro."
          }
        />
      )}
      {dialog}
    </div>
  );
}
