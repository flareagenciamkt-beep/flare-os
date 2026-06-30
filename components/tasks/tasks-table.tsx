"use client";

import { Check, Circle, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge, TaskStatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { useConfirm } from "@/components/shared/use-confirm";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { isTaskOverdue } from "@/lib/stats";
import { AREA_LABELS, type Task } from "@/lib/types";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasksTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  showClient?: boolean;
  isFiltered?: boolean;
  onCreate?: () => void;
}

export function TasksTable({
  tasks,
  onEdit,
  showClient = true,
  isFiltered = false,
  onCreate,
}: TasksTableProps) {
  const { clientName, deleteTask, updateTask, ideas } = useFlare();
  const { confirm, dialog } = useConfirm();

  const renderMenu = (task: Task) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Acciones de la tarea" />}>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onEdit(task)}>
          <Pencil /> Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            confirm({
              title: `¿Eliminar "${task.title}"?`,
              description: "Esta acción no se puede deshacer.",
              confirmLabel: "Eliminar",
              destructive: true,
              onConfirm: () => {
                deleteTask(task.id);
                toast.success("Tarea eliminada");
              },
            })
          }
        >
          <Trash2 /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const toggleDone = (task: Task) =>
    updateTask(task.id, {
      status: task.status === "completada" ? "pendiente" : "completada",
    });

  if (!tasks.length) {
    return (
      <EmptyState
        icon={CheckSquare}
        title={isFiltered ? "Sin tareas con estos filtros" : "No hay tareas"}
        description={
          isFiltered
            ? "Ajusta los filtros o límpialos para ver más tareas."
            : "Crea una tarea y asóciala a un cliente o a una idea para empezar a operar."
        }
        action={
          !isFiltered && onCreate ? (
            <Button size="sm" onClick={onCreate}>
              <Plus data-icon="inline-start" />
              Nueva tarea
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
    {/* Desktop: tabla */}
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
      <Table className="min-w-[56rem]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10" />
            <TableHead>Tarea</TableHead>
            {showClient && <TableHead>Cliente</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Fecha límite</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const done = task.status === "completada";
            const overdue = isTaskOverdue(task);
            const idea = task.ideaId ? ideas.find((i) => i.id === task.ideaId) : null;
            return (
              <TableRow key={task.id} className={cn(done && "opacity-55")}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={done ? "Marcar como pendiente" : "Marcar como completada"}
                    onClick={() => toggleDone(task)}
                  >
                    {done ? (
                      <Check className="text-emerald-400" />
                    ) : (
                      <Circle className="text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="max-w-64">
                  <p className={cn("truncate text-sm font-medium", done && "line-through")}>
                    {task.title}
                  </p>
                  {idea && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      Idea: {idea.title}
                    </p>
                  )}
                </TableCell>
                {showClient && (
                  <TableCell className="text-xs text-muted-foreground">
                    {clientName(task.clientId)}
                  </TableCell>
                )}
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {AREA_LABELS[task.area]}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-xs",
                    overdue ? "font-medium text-red-400" : "text-muted-foreground",
                  )}
                >
                  {formatDate(task.dueDate)}
                  {overdue && " · atrasada"}
                </TableCell>
                <TableCell className="text-xs">{task.responsible}</TableCell>
                <TableCell>{renderMenu(task)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    {/* Mobile: cards */}
    <div className="space-y-2.5 md:hidden">
      {tasks.map((task) => {
        const done = task.status === "completada";
        const overdue = isTaskOverdue(task);
        const idea = task.ideaId ? ideas.find((i) => i.id === task.ideaId) : null;
        return (
          <div
            key={task.id}
            className={cn(
              "rounded-lg border border-border bg-card p-3.5",
              done && "opacity-60",
            )}
          >
            <div className="flex items-start gap-2.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="-ml-1 shrink-0"
                aria-label={done ? "Marcar como pendiente" : "Marcar como completada"}
                onClick={() => toggleDone(task)}
              >
                {done ? (
                  <Check className="text-emerald-400" />
                ) : (
                  <Circle className="text-muted-foreground" />
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", done && "line-through")}>
                  {task.title}
                </p>
                {showClient && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {clientName(task.clientId)}
                    {idea && ` · Idea: ${idea.title}`}
                  </p>
                )}
              </div>
              {renderMenu(task)}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <span className="text-[11px] text-muted-foreground">
                {AREA_LABELS[task.area]}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className={cn(overdue ? "font-medium text-red-400" : "text-muted-foreground")}>
                {formatDate(task.dueDate)}
                {overdue && " · atrasada"}
              </span>
              <span className="text-muted-foreground">{task.responsible}</span>
            </div>
          </div>
        );
      })}
    </div>
    {dialog}
    </>
  );
}
