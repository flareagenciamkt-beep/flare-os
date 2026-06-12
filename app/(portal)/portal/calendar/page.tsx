"use client";

import { CalendarView } from "@/components/ideas/calendar-view";
import { usePortalIdeaDialog } from "@/components/portal/idea-dialog";
import { usePortal } from "@/lib/portal-store";

export default function PortalCalendarPage() {
  const { ideas } = usePortal();
  const { openIdea, dialog } = usePortalIdeaDialog();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Calendario de contenido</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fechas sugeridas y de publicación de tus piezas.
        </p>
      </div>
      <CalendarView ideas={ideas} onEdit={openIdea} showClient={false} />
      {dialog}
    </div>
  );
}
