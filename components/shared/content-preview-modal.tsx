"use client";

// Modal de vista completa de una pieza de contenido. Reutilizable en el feed de
// agencia y en el portal del cliente. Muestra preview real o placeholder claro,
// copy/caption, formato, canal, estado, fecha y responsable. Las acciones del
// pie (aprobar, solicitar cambios, comentar) se inyectan vía `actions`.

import * as React from "react";
import { CalendarDays, CheckCircle2, MessageSquareWarning, Plus, ThumbsUp, User } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChannelBadge,
  FormatBadge,
  IdeaStatusBadge,
  PriorityBadge,
  TaskStatusBadge,
} from "@/components/shared/badges";
import { PieceCarousel, pieceImages } from "@/components/shared/piece-carousel";
import { CommentsThread } from "@/components/shared/comments-thread";
import { TaskFormDialog } from "@/components/forms/task-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";
import type { Idea } from "@/lib/types";

// Colaboración del lado equipo: estado de aprobación (quién/cuándo), botón de
// aprobación interna y el hilo de comentarios. Usa el store, así que solo se
// monta dentro de FlareStoreProvider (módulo agencia).
function IdeaCollaboration({ idea }: { idea: Idea }) {
  const { comments, addComment, deleteComment, approveIdea, updateIdea, tasks } = useFlare();
  const ideaComments = comments.filter((c) => c.ideaId === idea.id);
  const ideaTasks = tasks.filter((t) => t.ideaId === idea.id);
  const approval = idea.clientApproval ?? "pendiente";
  const isApproved = approval === "aprobada" || idea.status === "aprobada" || Boolean(idea.approvedBy);
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [rejecting, setRejecting] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");

  const approve = () => {
    approveIdea(idea.id, idea.responsible || "Equipo Flare");
    updateIdea(idea.id, { clientApproval: "aprobada", clientFeedback: "" });
    setRejecting(false);
    toast.success("Pieza aprobada");
  };

  const reject = () => {
    updateIdea(idea.id, {
      clientApproval: "cambios_solicitados",
      clientFeedback: feedback.trim(),
      status: idea.status === "aprobada" ? "en_produccion" : idea.status,
      approvedBy: null,
      approvedAt: null,
    });
    setRejecting(false);
    setFeedback("");
    toast.success("Se solicitaron cambios al equipo");
  };

  return (
    <div className="space-y-4 border-t border-border pt-3">
      {/* Tareas vinculadas a esta pieza */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tareas {ideaTasks.length > 0 && `(${ideaTasks.length})`}
          </p>
          <Button variant="ghost" size="xs" onClick={() => setTaskFormOpen(true)}>
            <Plus data-icon="inline-start" />
            Nueva tarea
          </Button>
        </div>
        {ideaTasks.length ? (
          <div className="space-y-1.5">
            {ideaTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate text-xs">{t.title}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {t.responsible}
                </span>
                <TaskStatusBadge status={t.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sin tareas vinculadas.</p>
        )}
        <TaskFormDialog
          open={taskFormOpen}
          onOpenChange={setTaskFormOpen}
          defaultClientId={idea.clientId}
          defaultIdeaId={idea.id}
        />
      </div>

      {/* Aprobación */}
      <div className="rounded-lg border border-border bg-secondary/20 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Aprobación
        </p>

        {/* Estado actual */}
        {isApproved ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300/90">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Aprobada{idea.approvedBy && <> por <b>{idea.approvedBy}</b></>}
              {idea.approvedAt && ` · ${formatDate(idea.approvedAt, "d MMM yyyy")}`}
            </span>
          </div>
        ) : approval === "cambios_solicitados" ? (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300/90">
            <p className="flex items-center gap-1.5 font-medium">
              <MessageSquareWarning className="size-3.5" />
              Cambios solicitados
            </p>
            {idea.clientFeedback && <p className="mt-1">&ldquo;{idea.clientFeedback}&rdquo;</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Pendiente de revisión.</p>
        )}

        {/* Acciones */}
        {rejecting ? (
          <div className="mt-2.5 space-y-2">
            <Textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="¿Qué cambios necesita esta pieza?"
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={reject}>
                <MessageSquareWarning data-icon="inline-start" />
                Enviar solicitud
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {!isApproved && (
              <Button size="sm" onClick={approve}>
                <ThumbsUp data-icon="inline-start" />
                Aprobar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setRejecting(true)}>
              <MessageSquareWarning data-icon="inline-start" />
              {isApproved ? "Solicitar cambios" : "Rechazar"}
            </Button>
          </div>
        )}
      </div>

      <CommentsThread
        comments={ideaComments}
        onAdd={(text) => addComment(idea.id, text, "Equipo Flare", "team")}
        onDelete={deleteComment}
      />
    </div>
  );
}

interface ContentPreviewModalProps {
  idea: Idea | null;
  onOpenChange: (open: boolean) => void;
  clientLabel?: string;
  /** Acciones del pie (ej. aprobar / solicitar cambios en el portal). */
  actions?: React.ReactNode;
  /** Muestra aprobación interna + hilo de comentarios (solo módulo agencia). */
  collaboration?: boolean;
}

export function ContentPreviewModal({
  idea,
  onOpenChange,
  clientLabel,
  actions,
  collaboration = false,
}: ContentPreviewModalProps) {
  return (
    <Dialog open={Boolean(idea)} onOpenChange={onOpenChange}>
      {idea && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {clientLabel && (
              <p className="text-[11px] font-medium uppercase tracking-wide text-flare-soft">
                {clientLabel}
              </p>
            )}
            <DialogTitle>{idea.title}</DialogTitle>
          </DialogHeader>

          {/* Preview real o placeholder elegante (carrusel si hay varias) */}
          <PieceCarousel idea={idea} />
          {pieceImages(idea).length > 1 && (
            <p className="-mt-2 text-center text-[11px] text-muted-foreground">
              Carrusel · {pieceImages(idea).length} imágenes
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <IdeaStatusBadge status={idea.status} />
            <ChannelBadge channel={idea.channel} />
            <FormatBadge format={idea.format} />
            <PriorityBadge priority={idea.priority} />
          </div>

          {idea.description && (
            <p className="text-sm text-muted-foreground">{idea.description}</p>
          )}

          {idea.copy && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Copy / Caption
              </p>
              <p className="whitespace-pre-wrap rounded-md border border-border bg-secondary/30 p-2.5 text-xs leading-relaxed">
                {idea.copy}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(ideaDate(idea))}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" />
              {idea.responsible}
            </span>
          </div>

          {collaboration && (
            <div className="max-h-[40vh] overflow-y-auto">
              <IdeaCollaboration idea={idea} />
            </div>
          )}

          {actions && (
            <div className="-mx-4 -mb-4 flex flex-col gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
              {actions}
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
