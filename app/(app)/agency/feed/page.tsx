"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { FeedView } from "@/components/ideas/feed-view";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

export default function FeedPage() {
  const { ideas } = useFlare();
  const filterHook = useIdeaFilters();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Idea | null>(null);

  const filtered = applyIdeaFilters(ideas, filterHook.filters);

  const openForm = (idea: Idea | null) => {
    setEditing(idea);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Feed"
        description="Cards operativas o vista previa real del feed por cliente."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus data-icon="inline-start" />
            Nueva idea
          </Button>
        }
      />
      <IdeaFilterBar hook={filterHook} />
      <FeedView ideas={filtered} onEdit={openForm} defaultMode="preview" />
      <IdeaFormDialog open={formOpen} onOpenChange={setFormOpen} idea={editing} />
    </div>
  );
}
