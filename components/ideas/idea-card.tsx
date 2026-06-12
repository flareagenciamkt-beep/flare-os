"use client";

import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChannelBadge,
  FormatBadge,
  IdeaStatusBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";
import type { Idea } from "@/lib/types";

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  showClient?: boolean;
}

export function IdeaCard({ idea, onEdit, showClient = true }: IdeaCardProps) {
  const { clientName, deleteIdea } = useFlare();
  const date = ideaDate(idea);

  return (
    <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {showClient && (
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-flare-soft">
                {clientName(idea.clientId)}
              </p>
            )}
            <h3 className="mt-0.5 truncate text-sm font-semibold">{idea.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-xs" className="shrink-0" />}
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(idea)}>
                <Pencil /> Editar
              </DropdownMenuItem>
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

        {idea.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {idea.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <IdeaStatusBadge status={idea.status} />
          <ChannelBadge channel={idea.channel} />
          <FormatBadge format={idea.format} />
          <PriorityBadge priority={idea.priority} />
        </div>

        {idea.notes && (
          <p className="line-clamp-1 text-[11px] italic text-muted-foreground/80">
            {idea.notes}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDate(date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4.5 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-foreground/80">
              {idea.responsible.slice(0, 2).toUpperCase()}
            </span>
            {idea.responsible}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
