"use client";

// Tab Producción: todo el contenido del cliente con filtros y 3 vistas
// (tabla, feed, kanban) reutilizando los componentes de Agencia.

import * as React from "react";
import { Kanban, LayoutGrid, Plus, Send, Table2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IdeasTable } from "@/components/ideas/ideas-table";
import { FeedView } from "@/components/ideas/feed-view";
import { KanbanBoard } from "@/components/ideas/kanban-board";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useConfirm } from "@/components/shared/use-confirm";
import { ImportGridDialog } from "@/components/clients/import-grid-dialog";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

// Piezas que se pueden "subir" a revisión del cliente (parrilla lista, aún no
// enviada ni publicada).
const SENDABLE_STATUSES = ["idea", "en_produccion", "en_revision_interna"] as const;

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
  const { ideas, moveIdea, getClient } = useFlare();
  const { confirm, dialog } = useConfirm();
  const filterHook = useIdeaFilters();
  const [mode, setMode] = React.useState<ProductionMode>("tabla");
  const [importOpen, setImportOpen] = React.useState(false);
  const owner = getClient(clientId)?.owner ?? "";

  const allClientIdeas = ideas.filter((i) => i.clientId === clientId);
  const clientIdeas = applyIdeaFilters(allClientIdeas, filterHook.filters);

  // Toda la parrilla lista para enviar a aprobación del cliente.
  const sendable = allClientIdeas.filter((i) =>
    (SENDABLE_STATUSES as readonly string[]).includes(i.status),
  );

  const sendGrid = () =>
    confirm({
      title: `¿Enviar ${sendable.length} pieza${sendable.length > 1 ? "s" : ""} a revisión del cliente?`,
      description:
        "Las piezas pasarán a “Revisión cliente” y aparecerán en el portal de la marca para que las apruebe o pida cambios.",
      confirmLabel: "Enviar parrilla",
      onConfirm: () => {
        sendable.forEach((i) => moveIdea(i.id, "en_revision_cliente"));
        toast.success(
          `${sendable.length} pieza${sendable.length > 1 ? "s enviadas" : " enviada"} a revisión del cliente`,
        );
      },
    });

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
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            <Upload data-icon="inline-start" />
            Importar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={sendable.length === 0}
            onClick={sendGrid}
            title={
              sendable.length === 0
                ? "No hay piezas listas para enviar"
                : "Enviar la parrilla a revisión del cliente"
            }
          >
            <Send data-icon="inline-start" />
            Enviar a revisión {sendable.length > 0 && `(${sendable.length})`}
          </Button>
          <Button size="sm" onClick={onNew}>
            <Plus data-icon="inline-start" />
            Nueva idea
          </Button>
        </div>
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
      {dialog}
      <ImportGridDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        clientId={clientId}
        defaultResponsible={owner}
      />
    </div>
  );
}
