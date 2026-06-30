"use client";

import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { TagBadge } from "@/components/shared/badges";
import { PieceImage } from "@/components/shared/piece-image";
import { useConfirm } from "@/components/shared/use-confirm";
import { useFlare } from "@/lib/store";
import {
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_TYPE_LABELS,
  type Resource,
  type ResourceType,
} from "@/lib/types";

// Tipos visuales: si tienen link (Drive, CDN...) se intenta previsualizar.
const VISUAL_TYPES: ResourceType[] = ["logo", "brandbook", "foto", "referencia"];

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  showClient?: boolean;
}

export function ResourceCard({ resource, onEdit, showClient = true }: ResourceCardProps) {
  const { clientName, deleteResource } = useFlare();
  const { confirm, dialog } = useConfirm();

  return (
    <>
    <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
      <CardContent className="flex h-full flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-flare/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-flare-soft">
              {RESOURCE_TYPE_LABELS[resource.type]}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {RESOURCE_CATEGORY_LABELS[resource.category]}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-xs" className="shrink-0" aria-label="Más opciones" />}
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  confirm({
                    title: `¿Eliminar "${resource.title}"?`,
                    description: "Esta acción no se puede deshacer.",
                    confirmLabel: "Eliminar",
                    destructive: true,
                    onConfirm: () => {
                      deleteResource(resource.id);
                      toast.success("Recurso eliminado");
                    },
                  })
                }
              >
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {resource.externalLink && VISUAL_TYPES.includes(resource.type) && (
          <a
            href={resource.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-video overflow-hidden rounded-md border border-border bg-zinc-900"
          >
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              Vista previa no disponible
            </div>
            <PieceImage src={resource.externalLink} alt={resource.title} />
          </a>
        )}

        <div>
          <h3 className="text-sm font-semibold leading-snug">{resource.title}</h3>
          {showClient && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {clientName(resource.clientId)}
            </p>
          )}
        </div>

        {resource.content && (
          <p className="line-clamp-3 whitespace-pre-line text-xs text-muted-foreground">
            {resource.content}
          </p>
        )}

        <div className="mt-auto space-y-2 pt-1">
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          {resource.externalLink && (
            <a
              href={resource.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-flare-soft hover:underline"
            >
              <ExternalLink className="size-3" />
              Abrir link
            </a>
          )}
        </div>
      </CardContent>
    </Card>
    {dialog}
    </>
  );
}
