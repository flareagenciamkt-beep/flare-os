"use client";

// Tab Producción: todo el contenido del cliente con filtros y 3 vistas
// (tabla, feed, kanban) reutilizando los componentes de Agencia.

import * as React from "react";
import { Kanban, LayoutGrid, Plus, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeasTable } from "@/components/ideas/ideas-table";
import { FeedView } from "@/components/ideas/feed-view";
import { KanbanBoard } from "@/components/ideas/kanban-board";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

type ProductionMode = "tabla" | "feed" | "kanban";

const MODES: { value: ProductionMode; label: string; icon: typeof Table2 }[] = [
  { value: "tabla", label: "Tabla", icon: Table2 },
  { value: "feed", label: "Feed", icon: LayoutGrid },
  { value: "kanban", label: "Kanban", icon: Kanban },
];

interface ProductionTabProps {
  clientId: string;
  brand: string;
  onEdit: (idea: Idea) => void;
  onNew: () => void;
}

export function ProductionTab({ clientId, brand, onEdit, onNew }: ProductionTabProps) {
  const { ideas } = useFlare();
  const filterHook = useIdeaFilters();
  const [mode, setMode] = React.useState<ProductionMode>("tabla");

  const clientIdeas = applyIdeaFilters(
    ideas.filter((i) => i.clientId === clientId),
    filterHook.filters,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <Button
                key={m.value}
                variant={mode === m.value ? "secondary" : "ghost"}
                size="sm"
                className="rounded-md"
                onClick={() => setMode(m.value)}
              >
                <Icon data-icon="inline-start" />
                {m.label}
              </Button>
            );
          })}
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus data-icon="inline-start" />
          Nueva idea
        </Button>
      </div>

      <IdeaFilterBar
        hook={filterHook}
        hide={mode === "kanban" ? ["clientId", "status"] : ["clientId"]}
      />

      {mode === "tabla" && (
        <IdeasTable ideas={clientIdeas} onEdit={onEdit} showClient={false} />
      )}
      {mode === "feed" && (
        <FeedView
          ideas={clientIdeas}
          onEdit={onEdit}
          showClient={false}
          defaultMode="preview"
          previewLabel={brand}
        />
      )}
      {mode === "kanban" && (
        <KanbanBoard ideas={clientIdeas} onEdit={onEdit} showClient={false} />
      )}
    </div>
  );
}
