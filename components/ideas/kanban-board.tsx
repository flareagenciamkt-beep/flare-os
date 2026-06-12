"use client";

// V1: movimiento entre columnas con flechas y menú (sin drag and drop).
// La arquitectura por columnas deja listo el terreno para DnD más adelante.

import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ApprovalBadge,
  ChannelBadge,
  FormatBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";
import {
  IDEA_STATUS_LABELS,
  KANBAN_COLUMNS,
  type Idea,
  type IdeaStatus,
} from "@/lib/types";

interface KanbanBoardProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  showClient?: boolean;
}

function KanbanCard({
  idea,
  onEdit,
  showClient,
}: {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  showClient: boolean;
}) {
  const { clientName, deleteIdea, moveIdea } = useFlare();
  const col = KANBAN_COLUMNS.indexOf(idea.status);
  const prev = col > 0 ? KANBAN_COLUMNS[col - 1] : null;
  const next = col < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[col + 1] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/15">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          {showClient && (
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-flare-soft">
              {clientName(idea.clientId)}
            </p>
          )}
          <p className="mt-0.5 text-[13px] font-medium leading-snug">{idea.title}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" className="shrink-0" />}
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(idea)}>
              <Pencil /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Mover a</DropdownMenuLabel>
            {KANBAN_COLUMNS.filter((s) => s !== idea.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => moveIdea(idea.id, s)}>
                {IDEA_STATUS_LABELS[s]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                deleteIdea(idea.id);
                toast.success("Idea eliminada");
              }}
            >
              <Trash2 /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <FormatBadge format={idea.format} />
        <ChannelBadge channel={idea.channel} />
        <PriorityBadge priority={idea.priority} />
        <ApprovalBadge approval={idea.clientApproval} />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{formatDate(ideaDate(idea), "d MMM")}</span>
        <span>{idea.responsible}</span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={!prev}
          onClick={() => prev && moveIdea(idea.id, prev)}
          aria-label="Mover a la columna anterior"
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={!next}
          onClick={() => next && moveIdea(idea.id, next)}
          aria-label="Mover a la siguiente columna"
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export function KanbanBoard({ ideas, onEdit, showClient = true }: KanbanBoardProps) {
  const byStatus = (status: IdeaStatus) => ideas.filter((i) => i.status === status);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((status) => {
        const items = byStatus(status);
        return (
          <div
            key={status}
            className="flex w-64 shrink-0 flex-col rounded-lg bg-secondary/40 p-2"
          >
            <div className="flex items-center justify-between px-1.5 py-1.5">
              <p className="text-xs font-semibold text-foreground/80">
                {IDEA_STATUS_LABELS[status]}
              </p>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((idea) => (
                <KanbanCard
                  key={idea.id}
                  idea={idea}
                  onEdit={onEdit}
                  showClient={showClient}
                />
              ))}
              {!items.length && (
                <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                  Sin contenidos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
