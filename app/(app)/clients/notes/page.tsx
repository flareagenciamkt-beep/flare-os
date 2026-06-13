"use client";

// Vista global de las notas estructuradas de todos los clientes (las mismas
// del tab Notas de la Vista 360), con filtros por cliente y tipo.

import * as React from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { TYPE_STYLES } from "@/components/clients/notes-tab";
import { NoteFormDialog } from "@/components/forms/note-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  NOTE_TYPE_LABELS,
  optionsFromLabels,
  type ClientNote,
} from "@/lib/types";

export default function ClientNotesPage() {
  const { clients, clientNotes, deleteClientNote } = useFlare();
  const [clientFilter, setClientFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientNote | null>(null);

  const clientOptions = [
    { value: "all", label: "Todos los clientes" },
    ...clients.map((c) => ({ value: c.id, label: c.brand })),
  ];
  const typeOptions = [
    { value: "all", label: "Todos los tipos" },
    ...optionsFromLabels(NOTE_TYPE_LABELS),
  ];

  const brandOf = React.useMemo(
    () => new Map(clients.map((c) => [c.id, c.brand])),
    [clients],
  );

  const isFiltered = clientFilter !== "all" || typeFilter !== "all";
  const filtered = clientNotes
    .filter((n) => clientFilter === "all" || n.clientId === clientFilter)
    .filter((n) => typeFilter === "all" || n.type === typeFilter)
    .sort(
      (a, b) =>
        Number(b.isPinned) - Number(a.isPinned) ||
        b.updatedAt.localeCompare(a.updatedAt),
    );

  // Crear requiere saber a qué cliente pertenece la nota: usa el filtro activo.
  const formClientId = editing?.clientId ?? (clientFilter !== "all" ? clientFilter : "");

  const openCreate = () => {
    if (clientFilter === "all") {
      toast.info("Primero filtra por un cliente para crear su nota.");
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Notas de clientes"
        description="Todas las notas operativas de tus marcas en un solo lugar."
        actions={
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" />
            Nueva nota
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SimpleSelect
          size="sm"
          className="w-48"
          value={clientFilter}
          onChange={setClientFilter}
          options={clientOptions}
        />
        <SimpleSelect
          size="sm"
          className="w-44"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setClientFilter("all");
              setTypeFilter("all");
            }}
          >
            <X data-icon="inline-start" />
            Limpiar
          </Button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <Card key={note.id} className="gap-0 py-0">
              <CardContent className="flex h-full flex-col p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {note.isPinned && (
                      <Pin className="size-3 shrink-0 text-flare" />
                    )}
                    <Link
                      href={`/clients/${note.clientId}`}
                      className="truncate text-[11px] font-medium text-muted-foreground transition-colors hover:text-flare-soft"
                    >
                      {brandOf.get(note.clientId) ?? "Cliente"}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        TYPE_STYLES[note.type],
                      )}
                    >
                      {NOTE_TYPE_LABELS[note.type]}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-xs" />}
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(note);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil /> Editar
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
                <p className="text-sm font-medium">{note.title}</p>
                {note.content && (
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                    {note.content}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2.5 text-[10px] text-muted-foreground">
                  <span>{note.responsible}</span>
                  <span>{formatDate(note.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={StickyNote}
          title={isFiltered ? "Sin notas con estos filtros" : "Aún no hay notas"}
          description={
            isFiltered
              ? "Ajusta los filtros o crea una nota nueva."
              : "Crea notas desde aquí o desde el tab Notas de cada cliente."
          }
        />
      )}

      {formClientId && (
        <NoteFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          clientId={formClientId}
          note={editing}
        />
      )}
    </div>
  );
}
