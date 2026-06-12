"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { CalendarView } from "@/components/ideas/calendar-view";
import {
  IdeaFilterBar,
  applyIdeaFilters,
  useIdeaFilters,
} from "@/components/ideas/idea-filters";
import { useFlare } from "@/lib/store";
import type { Idea } from "@/lib/types";

export default function CalendarPage() {
  const { ideas, clientName } = useFlare();
  const filterHook = useIdeaFilters();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Idea | null>(null);

  const filtered = applyIdeaFilters(ideas, filterHook.filters);

  return (
    <div>
      <PageHeader
        title="Calendario editorial"
        description="Contenidos según su fecha sugerida o de publicación."
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
      <IdeaFilterBar hook={filterHook} hide={["format", "priority"]} />
      <CalendarView
        ideas={filtered}
        clientName={clientName}
        onEdit={(idea) => {
          setEditing(idea);
          setFormOpen(true);
        }}
      />
      <IdeaFormDialog open={formOpen} onOpenChange={setFormOpen} idea={editing} />
    </div>
  );
}
