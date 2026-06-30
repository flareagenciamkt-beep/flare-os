"use client";

// Hilo de comentarios de una pieza, reutilizable en agencia y portal.
// Recibe los comentarios ya filtrados por pieza y callbacks para añadir/borrar.

import * as React from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { CommentAuthorRole, IdeaComment } from "@/lib/types";

const ROLE_LABEL: Record<CommentAuthorRole, string> = {
  admin: "Admin",
  team: "Equipo Flare",
  client: "Cliente",
};

const ROLE_DOT: Record<CommentAuthorRole, string> = {
  admin: "bg-flare",
  team: "bg-violet-400",
  client: "bg-amber-400",
};

interface CommentsThreadProps {
  comments: IdeaComment[];
  onAdd: (body: string) => void;
  onDelete?: (id: string) => void;
}

export function CommentsThread({ comments, onAdd, onDelete }: CommentsThreadProps) {
  const [body, setBody] = React.useState("");

  const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    onAdd(text);
    setBody("");
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Comentarios {sorted.length > 0 && `(${sorted.length})`}
      </p>

      {sorted.length ? (
        <div className="mb-3 space-y-2">
          {sorted.map((c) => (
            <div
              key={c.id}
              className="group rounded-md border border-border bg-secondary/30 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className={cn("size-1.5 rounded-full", ROLE_DOT[c.authorRole])} />
                  {c.author}
                  <span className="text-muted-foreground">· {ROLE_LABEL[c.authorRole]}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(c.createdAt, "d MMM")}
                  </span>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Eliminar comentario"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => onDelete(c.id)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-xs text-foreground/90">{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted-foreground">
          Aún no hay comentarios en esta pieza.
        </p>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un comentario..."
          className="text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <Button size="sm" disabled={!body.trim()} onClick={submit} aria-label="Enviar comentario">
          <Send data-icon="inline-start" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
