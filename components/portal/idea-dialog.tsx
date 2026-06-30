"use client";

// Vista read-only de una pieza para el cliente + acciones de aprobación.

import * as React from "react";
import { CalendarDays, Check, Clock, MessageSquare, ThumbsUp } from "lucide-react";
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
import { PieceCarousel } from "@/components/shared/piece-carousel";
import { CommentsThread } from "@/components/shared/comments-thread";
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

  // Visible mientras espera revisión del cliente, y también justo después de
  // aprobar (la pieza pasa a estado "aprobada" y mostramos la confirmación).
  const inClientReview = idea.status === "en_revision_cliente";
  const justApproved = idea.status === "aprobada" && approval === "aprobada";
  if (!inClientReview && !justApproved) {
    // No está en tu revisión: explicamos por qué no hay botones (en vez de nada).
    const message =
      idea.status === "publicada"
        ? "Esta pieza ya fue publicada. 🎉"
        : idea.status === "programada"
          ? "Esta pieza ya está aprobada y programada para publicarse."
          : "El equipo de Flare todavía está preparando esta pieza. Podrás aprobarla cuando pase a tu revisión.";
    return (
      <div className="rounded-md border border-border bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-flare-soft" />
          {message}
        </p>
      </div>
    );
  }

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
  const { comments, addComment } = usePortal();
  const ideaComments = idea ? comments.filter((c) => c.ideaId === idea.id) : [];

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

            <PieceCarousel idea={idea} />

            <div className="flex flex-wrap items-center gap-1.5">
              <IdeaStatusBadge status={idea.status} />
              <FormatBadge format={idea.format} />
              <ChannelBadge channel={idea.channel} />
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="size-3" />
                {formatDate(ideaDate(idea))}
              </span>
            </div>

            {idea.copy && (
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Copy
                </p>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-2.5 text-xs leading-relaxed">
                  {idea.copy}
                </p>
              </div>
            )}

            <ApprovalActions idea={idea} onDone={() => onOpenChange(false)} />

            {idea.approvedBy && (
              <p className="text-[11px] text-emerald-400">
                Aprobada por {idea.approvedBy}
                {idea.approvedAt && ` · ${formatDate(idea.approvedAt, "d MMM yyyy")}`}
              </p>
            )}

            <div className="max-h-[35vh] overflow-y-auto border-t border-border pt-3">
              <CommentsThread
                comments={ideaComments}
                onAdd={(text) => void addComment(idea.id, text)}
              />
            </div>
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
