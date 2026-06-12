"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { ProcessStatusBadge } from "@/components/shared/badges";
import { ProcessFormDialog } from "@/components/forms/process-form";
import { useFlare } from "@/lib/store";
import {
  AREA_LABELS,
  PROCESS_STATUS_LABELS,
  optionsFromLabels,
  type Process,
} from "@/lib/types";

function ProcessCard({
  process,
  onEdit,
}: {
  process: Process;
  onEdit: (p: Process) => void;
}) {
  const { clientName, deleteProcess } = useFlare();

  return (
    <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
      <CardContent className="flex h-full flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {AREA_LABELS[process.area]}
              {process.clientId ? ` · ${clientName(process.clientId)}` : ""}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold leading-snug">
              {process.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ProcessStatusBadge status={process.status} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(process)}>
                  <Pencil /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    deleteProcess(process.id);
                    toast.success("Proceso eliminado");
                  }}
                >
                  <Trash2 /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {process.description && (
          <p className="text-xs text-muted-foreground">{process.description}</p>
        )}

        <ol className="space-y-1.5">
          {process.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-foreground/85">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Repeat className="size-3" />
            {process.frequency || "Sin frecuencia"}
          </span>
          <span>{process.responsible}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProcessesPage() {
  const { processes } = useFlare();
  const [area, setArea] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Process | null>(null);

  const isFiltered = area !== "all" || status !== "all";

  const filtered = processes.filter((p) => {
    if (area !== "all" && p.area !== area) return false;
    if (status !== "all" && p.status !== status) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Procesos / SOPs"
        description="Cómo se hacen las cosas en Flare, paso a paso."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo proceso
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SimpleSelect
          size="sm"
          className="w-36"
          value={area}
          onChange={setArea}
          options={[{ value: "all", label: "Área" }, ...optionsFromLabels(AREA_LABELS)]}
        />
        <SimpleSelect
          size="sm"
          className="w-32"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Estado" },
            ...optionsFromLabels(PROCESS_STATUS_LABELS),
          ]}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setArea("all");
              setStatus("all");
            }}
          >
            <X data-icon="inline-start" />
            Limpiar
          </Button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProcessCard
              key={p.id}
              process={p}
              onEdit={(pr) => {
                setEditing(pr);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Workflow}
          title="No hay procesos"
          description="Documenta el primer SOP para estandarizar la operación."
        />
      )}

      <ProcessFormDialog open={formOpen} onOpenChange={setFormOpen} process={editing} />
    </div>
  );
}
