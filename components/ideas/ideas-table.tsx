"use client";

import * as React from "react";
import { CheckSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ApprovalBadge,
  ChannelBadge,
  FormatBadge,
  IdeaStatusBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { useConfirm } from "@/components/shared/use-confirm";
import { TaskFormDialog } from "@/components/forms/task-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { ideaDate, isIdeaOverdue } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { IDEA_STATUS_LABELS, optionsFromLabels, type Idea } from "@/lib/types";
import { Lightbulb } from "lucide-react";

const ALL_STATUSES = optionsFromLabels(IDEA_STATUS_LABELS);

interface IdeasTableProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  showClient?: boolean;
}

export function IdeasTable({ ideas, onEdit, showClient = true }: IdeasTableProps) {
  const { clientName, deleteIdea, moveIdea } = useFlare();
  const { confirm, dialog } = useConfirm();
  // "Crear tarea desde contenido": el diálogo vive aquí para que funcione
  // en todas las vistas que usan esta tabla sin tocar cada página.
  const [taskFromIdea, setTaskFromIdea] = React.useState<Idea | null>(null);

  if (!ideas.length) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No hay ideas"
        description="Crea la primera idea para empezar a producir contenido."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table className="min-w-[56rem]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Idea</TableHead>
            {showClient && <TableHead>Cliente</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Formato · Canal</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <TableRow key={idea.id}>
              <TableCell className="max-w-64">
                <p className="truncate text-sm font-medium">{idea.title}</p>
                {idea.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {idea.description}
                  </p>
                )}
              </TableCell>
              {showClient && (
                <TableCell className="text-xs text-muted-foreground">
                  {clientName(idea.clientId)}
                </TableCell>
              )}
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <IdeaStatusBadge status={idea.status} />
                  <ApprovalBadge approval={idea.clientApproval} />
                </div>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={idea.priority} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <FormatBadge format={idea.format} />
                  <ChannelBadge channel={idea.channel} />
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "text-xs",
                  isIdeaOverdue(idea)
                    ? "font-medium text-red-400"
                    : "text-muted-foreground",
                )}
              >
                {formatDate(ideaDate(idea))}
                {isIdeaOverdue(idea) && " · vencida"}
              </TableCell>
              <TableCell className="text-xs">{idea.responsible}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-xs" aria-label="Más opciones" />}
                  >
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(idea)}>
                      <Pencil /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTaskFromIdea(idea)}>
                      <CheckSquare /> Crear tarea
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Mover a</DropdownMenuLabel>
                      {ALL_STATUSES.filter((s) => s.value !== idea.status).map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => moveIdea(idea.id, s.value)}
                        >
                          {s.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        confirm({
                          title: `¿Eliminar "${idea.title}"?`,
                          description: "Esta acción no se puede deshacer.",
                          confirmLabel: "Eliminar",
                          destructive: true,
                          onConfirm: () => {
                            deleteIdea(idea.id);
                            toast.success("Idea eliminada");
                          },
                        })
                      }
                    >
                      <Trash2 /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TaskFormDialog
        open={taskFromIdea !== null}
        onOpenChange={(open) => {
          if (!open) setTaskFromIdea(null);
        }}
        defaultClientId={taskFromIdea?.clientId ?? null}
        defaultIdeaId={taskFromIdea?.id}
      />
      {dialog}
    </div>
  );
}
