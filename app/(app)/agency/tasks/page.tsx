"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useClientOptions } from "@/components/shared/use-client-options";
import { TaskFormDialog } from "@/components/forms/task-form";
import { TasksTable } from "@/components/tasks/tasks-table";
import { useFlare } from "@/lib/store";
import {
  AREA_LABELS,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Task,
} from "@/lib/types";

export default function TasksPage() {
  const { tasks } = useFlare();
  const clientOptions = useClientOptions();
  const [clientId, setClientId] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [area, setArea] = React.useState("all");
  const [responsible, setResponsible] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);

  const isFiltered = [clientId, status, priority, area, responsible].some(
    (v) => v !== "all",
  );

  const filtered = tasks.filter((t) => {
    if (clientId !== "all") {
      const wanted = clientId === "none" ? null : clientId;
      if (t.clientId !== wanted) return false;
    }
    if (status !== "all" && t.status !== status) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (area !== "all" && t.area !== area) return false;
    if (responsible !== "all" && t.responsible !== responsible) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Trabajo operativo de Flare, asociado a clientes e ideas."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nueva tarea
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SimpleSelect
          size="sm"
          className="w-44"
          value={clientId}
          onChange={setClientId}
          options={[{ value: "all", label: "Todos los clientes" }, ...clientOptions]}
        />
        <SimpleSelect
          size="sm"
          className="w-36"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Estado" },
            ...optionsFromLabels(TASK_STATUS_LABELS),
          ]}
        />
        <SimpleSelect
          size="sm"
          className="w-32"
          value={priority}
          onChange={setPriority}
          options={[
            { value: "all", label: "Prioridad" },
            ...optionsFromLabels(PRIORITY_LABELS),
          ]}
        />
        <SimpleSelect
          size="sm"
          className="w-36"
          value={area}
          onChange={setArea}
          options={[{ value: "all", label: "Área" }, ...optionsFromLabels(AREA_LABELS)]}
        />
        <SimpleSelect
          size="sm"
          className="w-36"
          value={responsible}
          onChange={setResponsible}
          options={[
            { value: "all", label: "Responsable" },
            ...TEAM_MEMBERS.map((m) => ({ value: m, label: m })),
          ]}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setClientId("all");
              setStatus("all");
              setPriority("all");
              setArea("all");
              setResponsible("all");
            }}
          >
            <X data-icon="inline-start" />
            Limpiar
          </Button>
        )}
      </div>

      <TasksTable
        tasks={filtered}
        isFiltered={isFiltered}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onEdit={(task) => {
          setEditing(task);
          setFormOpen(true);
        }}
      />
      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editing} />
    </div>
  );
}
