"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { IdeasTable } from "@/components/ideas/ideas-table";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

export default function IdeasPage() {
  const { ideas } = useFlare();
  const filterHook = useIdeaFilters();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Idea | null>(null);

  const filtered = applyIdeaFilters(ideas, filterHook.filters);

  return (
    <div>
      <PageHeader
        title="Ideas"
        description="Ideas y contenidos para clientes o internos de Flare."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nueva idea
          </Button>
        }
      />
      <IdeaFilterBar hook={filterHook} />
      <IdeasTable
        ideas={filtered}
        onEdit={(idea) => {
          setEditing(idea);
          setFormOpen(true);
        }}
      />
      <IdeaFormDialog open={formOpen} onOpenChange={setFormOpen} idea={editing} />
    </div>
  );
}
