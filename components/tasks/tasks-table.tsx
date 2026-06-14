"use client";

import { Check, Circle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
}

export function TasksTable({ tasks, onEdit, showClient = true }: TasksTableProps) {
  const { clientName, deleteTask, updateTask, ideas } = useFlare();

  if (!tasks.length) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No hay tareas"
        description="Crea una tarea y asóciala a un cliente o a una idea."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                    onClick={() =>
                      updateTask(task.id, {
                        status: done ? "pendiente" : "completada",
                      })
                    }
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
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-xs" />}
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Pencil /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          deleteTask(task.id);
                          toast.success("Tarea eliminada");
                        }}
                      >
                        <Trash2 /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
