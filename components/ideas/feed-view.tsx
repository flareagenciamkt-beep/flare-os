"use client";

import * as React from "react";
import { LayoutGrid, Pencil, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ContentPreviewModal } from "@/components/shared/content-preview-modal";
import { IdeaCard } from "./idea-card";
import { FeedPreview } from "./feed-preview";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

type FeedMode = "cards" | "preview";

interface FeedViewProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  showClient?: boolean;
  defaultMode?: FeedMode;
  previewLabel?: string;
}

export function FeedView({
  ideas,
  onEdit,
  showClient = true,
  defaultMode = "cards",
  previewLabel,
}: FeedViewProps) {
  const [mode, setMode] = React.useState<FeedMode>(defaultMode);
  const [preview, setPreview] = React.useState<Idea | null>(null);
  const { clientName } = useFlare();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5">
          <Button
            variant={mode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-md"
            onClick={() => setMode("cards")}
          >
            <LayoutGrid data-icon="inline-start" />
            Cards
          </Button>
          <Button
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-md"
            onClick={() => setMode("preview")}
          >
            <Smartphone data-icon="inline-start" />
            Vista previa
          </Button>
        </div>
      </div>

      {!ideas.length ? (
        <EmptyState
          icon={LayoutGrid}
          title="No hay contenidos en el feed"
          description="Crea ideas o ajusta los filtros."
        />
      ) : mode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={onEdit}
              onPreview={setPreview}
              showClient={showClient}
            />
          ))}
        </div>
      ) : (
        <FeedPreview
          ideas={ideas}
          onEdit={setPreview}
          groupByClient={showClient}
          singleLabel={previewLabel}
          clientName={clientName}
        />
      )}

      <ContentPreviewModal
        idea={preview}
        onOpenChange={(o) => !o && setPreview(null)}
        collaboration
        clientLabel={preview && showClient ? clientName(preview.clientId) : undefined}
        actions={
          preview ? (
            <Button
              variant="outline"
              onClick={() => {
                const current = preview;
                setPreview(null);
                onEdit(current);
              }}
            >
              <Pencil data-icon="inline-start" />
              Editar pieza
            </Button>
          ) : null
        }
      />
    </div>
  );
}
