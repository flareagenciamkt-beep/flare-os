"use client";

import { FeedPreview } from "@/components/ideas/feed-preview";
import { usePortalIdeaDialog } from "@/components/portal/idea-dialog";
import { usePortal } from "@/lib/portal-store";

export default function PortalFeedPage() {
  const { client, ideas } = usePortal();
  const { openIdea, dialog } = usePortalIdeaDialog();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Tu feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Así se ve tu contenido publicado y planificado. Toca una pieza para verla.
        </p>
      </div>
      <FeedPreview
        ideas={ideas}
        onEdit={openIdea}
        groupByClient={false}
        singleLabel={client.brand}
      />
      {dialog}
    </div>
  );
}
