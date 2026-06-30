"use client";

// Importar parrilla: pega filas desde Google Sheets/Excel (TSV) o CSV y crea
// las ideas del cliente en bloque. Cabeceras flexibles; muestra vista previa.

import * as React from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChannelBadge,
  FormatBadge,
  IdeaStatusBadge,
} from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { parseGrid } from "@/lib/import-grid";
import { formatDate } from "@/lib/dates";

const PLACEHOLDER = `Título\tDescripción\tTipo\tFormato\tCanal\tEstado\tPrioridad\tResponsable\tFecha\tPublicación\tCopy
5 mitos del seguro de vida\tCarrusel educativo\tPost educativo\tCarrusel\tInstagram\tIdea\tAlta\tJuan\t2026-07-03\t\tTexto del copy…
Reel detrás de cámaras\t\tBehind the scenes\tReel\tInstagram\tIdea\tMedia\tSara\t2026-07-05\t\t`;

interface ImportGridDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  defaultResponsible: string;
}

export function ImportGridDialog({
  open,
  onOpenChange,
  clientId,
  defaultResponsible,
}: ImportGridDialogProps) {
  const { addIdea } = useFlare();
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText("");
    }
  }, [open]);

  const result = React.useMemo(
    () => parseGrid(text, { responsible: defaultResponsible }),
    [text, defaultResponsible],
  );

  const doImport = () => {
    if (!result.rows.length) return;
    for (const row of result.rows) {
      addIdea({
        clientId,
        title: row.title,
        description: row.description,
        category: "contenido",
        ideaType: row.ideaType,
        status: row.status,
        priority: row.priority,
        format: row.format,
        channel: row.channel,
        suggestedDate: row.suggestedDate,
        publishDate: row.publishDate,
        responsible: row.responsible,
        notes: "",
        prompt: "",
        references: "",
        copy: row.copy,
        script: "",
        designNotes: "",
        externalUrl: "",
        coverImage: "",
        images: [],
      });
    }
    toast.success(`${result.rows.length} pieza${result.rows.length > 1 ? "s" : ""} importada${result.rows.length > 1 ? "s" : ""}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="border-b border-border px-5 pb-3.5 pt-5 pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
            <FileSpreadsheet className="size-5 text-flare" />
            Importar parrilla
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Copia las filas desde Google Sheets o Excel y pégalas aquí. La primera
            fila puede ser de cabeceras.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Info className="size-3.5" />
              Columnas reconocidas (en cualquier orden)
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Título · Descripción · Tipo · Formato · Canal · Estado · Prioridad ·
              Responsable · Fecha · Publicación · Copy. Solo <b>Título</b> es
              obligatorio; el resto toma valores por defecto.
            </p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={8}
            className="font-mono text-[11px]"
          />

          {/* Vista previa */}
          {text.trim() && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                {result.rows.length} pieza{result.rows.length === 1 ? "" : "s"} detectada
                {result.rows.length === 1 ? "" : "s"}
                {result.skipped > 0 && ` · ${result.skipped} omitida${result.skipped === 1 ? "" : "s"} (sin título)`}
              </p>
              {result.rows.length > 0 && (
                <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
                  {result.rows.slice(0, 30).map((r, i) => (
                    <div key={i} className="rounded-md bg-secondary/30 px-2.5 py-1.5">
                      <p className="truncate text-xs font-medium">{r.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <IdeaStatusBadge status={r.status} />
                        <FormatBadge format={r.format} />
                        <ChannelBadge channel={r.channel} />
                        <span className="text-[10px] text-muted-foreground">
                          {r.responsible}
                          {r.suggestedDate && ` · ${formatDate(r.suggestedDate, "d MMM")}`}
                        </span>
                      </div>
                    </div>
                  ))}
                  {result.rows.length > 30 && (
                    <p className="px-1 pt-1 text-center text-[10px] text-muted-foreground">
                      +{result.rows.length - 30} más
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3.5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!result.rows.length} onClick={doImport}>
            Importar {result.rows.length > 0 && `(${result.rows.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
