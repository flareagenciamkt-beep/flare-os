"use client";

// Vista read-only de una pieza para el cliente + acciones de aprobación.

import * as React from "react";
import { CalendarDays, Check, MessageSquare, ThumbsUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChannelBadge,
  FormatBadge,
  IdeaStatusBadge,
} from "@/components/shared/badges";
import { PieceImage } from "@/components/shared/piece-image";
import { usePortal } from "@/lib/portal-store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";
import { CLIENT_APPROVAL_LABELS, type Idea } from "@/lib/types";

function ApprovalActions({ idea, onDone }: { idea: Idea; onDone: () => void }) {
  const { approve } = usePortal();
  const [askingChanges, setAskingChanges] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const approval = idea.clientApproval ?? "pendiente";

  if (idea.status !== "en_revision") return null;

  if (approval !== "pendiente") {
    return (
      <div
        className={
          approval === "aprobada"
            ? "rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300/90"
            : "rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90"
        }
      >
        <p className="flex items-center gap-1.5 font-medium">
          <Check className="size-3.5" />
          {CLIENT_APPROVAL_LABELS[approval]}
        </p>
        {idea.clientFeedback && (
          <p className="mt-1 text-muted-foreground">&ldquo;{idea.clientFeedback}&rdquo;</p>
        )}
      </div>
    );
  }

  const send = async (decision: "aprobada" | "cambios_solicitados") => {
    setSending(true);
    const ok = await approve(idea.id, decision, feedback.trim());
    setSending(false);
    if (ok) onDone();
  };

  return (
    <div className="space-y-2.5 rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-xs font-semibold">Esta pieza espera tu aprobación</p>
      {askingChanges ? (
        <>
          <Textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Cuéntanos qué cambios necesitas..."
            className="text-xs"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={sending || !feedback.trim()}
              onClick={() => send("cambios_solicitados")}
            >
              <MessageSquare data-icon="inline-start" />
              Enviar cambios
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={sending}
              onClick={() => setAskingChanges(false)}
            >
              Volver
            </Button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" disabled={sending} onClick={() => send("aprobada")}>
            <ThumbsUp data-icon="inline-start" />
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={sending}
            onClick={() => setAskingChanges(true)}
          >
            <MessageSquare data-icon="inline-start" />
            Solicitar cambios
          </Button>
        </div>
      )}
    </div>
  );
}

interface PortalIdeaDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortalIdeaDialog({ idea, open, onOpenChange }: PortalIdeaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {idea && (
          <>
            <DialogHeader>
              <DialogTitle>{idea.title}</DialogTitle>
              {idea.description && (
                <DialogDescription>{idea.description}</DialogDescription>
              )}
            </DialogHeader>

            {idea.coverImage && (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-zinc-900">
                <PieceImage src={idea.coverImage} alt={idea.title} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <IdeaStatusBadge status={idea.status} />
              <FormatBadge format={idea.format} />
              <ChannelBadge channel={idea.channel} />
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="size-3" />
                {formatDate(ideaDate(idea))}
              </span>
            </div>

            <ApprovalActions idea={idea} onDone={() => onOpenChange(false)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook compartido por las páginas del portal para abrir piezas en el diálogo.
export function usePortalIdeaDialog() {
  const [idea, setIdea] = React.useState<Idea | null>(null);
  const [open, setOpen] = React.useState(false);
  const openIdea = (i: Idea) => {
    setIdea(i);
    setOpen(true);
  };
  const dialog = <PortalIdeaDialog idea={idea} open={open} onOpenChange={setOpen} />;
  return { openIdea, dialog };
}
