"use client";

// Tab Notas: notas estructuradas del cliente (pineadas arriba) + filtro por tipo.

import * as React from "react";
import { Link2, MoreHorizontal, Pencil, Pin, Plus, StickyNote, Trash2 } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { NoteFormDialog } from "@/components/forms/note-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import {
  NOTE_TYPE_LABELS,
  optionsFromLabels,
  type ClientNote,
  type NoteType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const TYPE_STYLES: Record<NoteType, string> = {
  general: "bg-zinc-500/10 text-zinc-300",
  reunion: "bg-sky-500/10 text-sky-400",
  feedback: "bg-violet-500/10 text-violet-400",
  problema: "bg-red-500/10 text-red-400",
  decision: "bg-emerald-500/10 text-emerald-400",
  recordatorio: "bg-amber-500/10 text-amber-400",
  estrategia: "bg-flare/10 text-flare-soft",
};

function NoteCard({
  note,
  onEdit,
}: {
  note: ClientNote;
  onEdit: (n: ClientNote) => void;
}) {
  const { deleteClientNote, updateClientNote, ideas, tasks, meetings } = useFlare();

  const relatedLabel = React.useMemo(() => {
    if (!note.relatedEntityType || !note.relatedEntityId) return null;
    if (note.relatedEntityType === "idea")
      return ideas.find((i) => i.id === note.relatedEntityId)?.title ?? null;
    if (note.relatedEntityType === "task")
      return tasks.find((t) => t.id === note.relatedEntityId)?.title ?? null;
    if (note.relatedEntityType === "meeting") {
      const m = meetings.find((mt) => mt.id === note.relatedEntityId);
      return m ? `${m.type || "Reunión"} · ${m.meetingDate}` : null;
    }
    return null;
  }, [note.relatedEntityType, note.relatedEntityId, ideas, tasks, meetings]);

  return (
    <Card className={cn("gap-0 py-0", note.isPinned && "border-flare/30")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {note.isPinned && <Pin className="size-3.5 shrink-0 text-flare" />}
            <h3 className="truncate text-sm font-semibold">{note.title}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                TYPE_STYLES[note.type],
              )}
            >
              {NOTE_TYPE_LABELS[note.type]}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Pencil /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateClientNote(note.id, { isPinned: !note.isPinned })}
                >
                  <Pin /> {note.isPinned ? "Quitar pin" : "Fijar nota"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    deleteClientNote(note.id);
                    toast.success("Nota eliminada");
                  }}
                >
                  <Trash2 /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {note.content && (
          <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
            {note.content}
          </p>
        )}
        {relatedLabel && (
          <p className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-foreground/70">
            <Link2 className="size-3 shrink-0" />
            <span className="truncate">{relatedLabel}</span>
          </p>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>{note.responsible}</span>
          <span>{formatDate(note.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesTab({ clientId }: { clientId: string }) {
  const { clientNotes } = useFlare();
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientNote | null>(null);

  const notes = clientNotes
    .filter((n) => n.clientId === clientId)
    .filter((n) => typeFilter === "all" || n.type === typeFilter)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt));

  const openForm = (note: ClientNote | null) => {
    setEditing(note);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SimpleSelect
          size="sm"
          className="w-40"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "Todos los tipos" },
            ...optionsFromLabels(NOTE_TYPE_LABELS),
          ]}
        />
        <Button size="sm" onClick={() => openForm(null)}>
          <Plus data-icon="inline-start" />
          Nueva nota
        </Button>
      </div>

      {notes.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openForm} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={StickyNote}
          title="Este cliente no tiene notas"
          description="Registra decisiones, feedback y acuerdos para no perder contexto."
          action={
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus data-icon="inline-start" />
              Nueva nota
            </Button>
          }
        />
      )}

      <NoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={clientId}
        note={editing}
      />
    </div>
  );
}
