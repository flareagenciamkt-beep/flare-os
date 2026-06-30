"use client";

// Módulo Contenido unificado: una sola entrada con vistas intercambiables
// (Lista, Kanban, Calendario, Feed) sobre el mismo set de ideas y filtros.
// Reemplaza las antiguas rutas /agency/{ideas,feed,kanban,calendar}.

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Kanban, LayoutGrid, ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { IdeasTable } from "@/components/ideas/ideas-table";
import { KanbanBoard } from "@/components/ideas/kanban-board";
import { CalendarView } from "@/components/ideas/calendar-view";
import { FeedView } from "@/components/ideas/feed-view";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useFlare } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/types";

type ContentView = "lista" | "kanban" | "calendario" | "feed";

const VIEWS: { value: ContentView; label: string; icon: typeof ListChecks }[] = [
  { value: "lista", label: "Lista", icon: ListChecks },
  { value: "kanban", label: "Kanban", icon: Kanban },
  { value: "calendario", label: "Calendario", icon: CalendarDays },
  { value: "feed", label: "Feed", icon: LayoutGrid },
];

function isContentView(v: string | null): v is ContentView {
  return v === "lista" || v === "kanban" || v === "calendario" || v === "feed";
}

function ContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view");

  const { ideas, clientName } = useFlare();
  const filterHook = useIdeaFilters();
  const [view, setView] = React.useState<ContentView>(
    isContentView(initialView) ? initialView : "lista",
  );
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Idea | null>(null);
  const [defaultDate, setDefaultDate] = React.useState<string | undefined>();

  const filtered = applyIdeaFilters(ideas, filterHook.filters);

  const openForm = (idea: Idea | null, date?: string) => {
    setEditing(idea);
    setDefaultDate(date);
    setFormOpen(true);
  };

  const changeView = (next: ContentView) => {
    setView(next);
    // Refleja la vista en la URL sin recargar (para compartir/recordar).
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`/agency/content?${params.toString()}`, { scroll: false });
  };

  // Qué filtros ocultar según la vista (igual que las páginas originales).
  const hiddenFilters =
    view === "kanban"
      ? (["status"] as const)
      : view === "calendario"
        ? (["format", "priority"] as const)
        : [];

  return (
    <div>
      <PageHeader
        title="Contenido"
        description="Ideas y contenidos para clientes o internos de Flare, en la vista que prefieras."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus data-icon="inline-start" />
            Nueva idea
          </Button>
        }
      />

      {/* Selector de vista */}
      <div className="mb-4 inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-[rgba(241,233,224,0.06)] bg-[rgba(0,0,0,0.25)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIEWS.map((v) => {
          const active = view === v.value;
          const Icon = v.icon;
          return (
            <button
              key={v.value}
              onClick={() => changeView(v.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-[rgba(241,233,224,0.08)] text-foreground shadow-[inset_0_0_0_1px_rgba(241,233,224,0.1)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {v.label}
            </button>
          );
        })}
      </div>

      <IdeaFilterBar hook={filterHook} hide={[...hiddenFilters]} />

      {view === "lista" && (
        <IdeasTable ideas={filtered} onEdit={(idea) => openForm(idea)} />
      )}
      {view === "kanban" && (
        <KanbanBoard ideas={filtered} onEdit={(idea) => openForm(idea)} />
      )}
      {view === "calendario" && (
        <CalendarView
          ideas={filtered}
          clientName={clientName}
          onEdit={(idea) => openForm(idea)}
          onCreate={(date) => openForm(null, date)}
        />
      )}
      {view === "feed" && (
        <FeedView ideas={filtered} onEdit={(idea) => openForm(idea)} defaultMode="preview" />
      )}

      <IdeaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        idea={editing}
        defaultDate={defaultDate}
      />
    </div>
  );
}

export default function ContentPage() {
  return (
    <React.Suspense fallback={null}>
      <ContentInner />
    </React.Suspense>
  );
}
