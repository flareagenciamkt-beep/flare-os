"use client";

// Tab Reuniones: historial cronológico de reuniones del cliente.

import * as React from "react";
import {
  CalendarClock,
  CheckSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
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
import { EmptyState } from "@/components/shared/empty-state";
import { MeetingFormDialog } from "@/components/forms/meeting-form";
import { TaskFormDialog } from "@/components/forms/task-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import type { ClientMeeting } from "@/lib/types";

function MeetingRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-line text-xs text-foreground/85">{value}</p>
    </div>
  );
}

export function MeetingsTab({ clientId }: { clientId: string }) {
  const { meetings, deleteMeeting } = useFlare();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientMeeting | null>(null);
  const [taskFromMeeting, setTaskFromMeeting] = React.useState<ClientMeeting | null>(null);

  const clientMeetings = meetings
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));

  const openForm = (meeting: ClientMeeting | null) => {
    setEditing(meeting);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => openForm(null)}>
          <Plus data-icon="inline-start" />
          Registrar reunión
        </Button>
      </div>

      {clientMeetings.length ? (
        <div className="space-y-3">
          {clientMeetings.map((m) => (
            <Card key={m.id} className="gap-0 py-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {m.type || "Reunión"} · {formatDate(m.meetingDate)}
                    </p>
                    {m.participants && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Users className="size-3" />
                        {m.participants}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {m.nextMeetingDate && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400">
                        <CalendarClock className="size-3" />
                        Próxima: {formatDate(m.nextMeetingDate, "d MMM")}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openForm(m)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTaskFromMeeting(m)}>
                          <CheckSquare /> Crear tarea
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteMeeting(m.id);
                            toast.success("Reunión eliminada");
                          }}
                        >
                          <Trash2 /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
                  <MeetingRow label="Temas tratados" value={m.topics} />
                  <MeetingRow label="Decisiones" value={m.decisions} />
                  <MeetingRow label="Pendientes" value={m.pendingItems} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title="Sin reuniones registradas"
          description="Registra cada reunión para tener historial de decisiones y pendientes."
          action={
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus data-icon="inline-start" />
              Registrar reunión
            </Button>
          }
        />
      )}

      <MeetingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={clientId}
        meeting={editing}
      />
      <TaskFormDialog
        open={taskFromMeeting !== null}
        onOpenChange={(open) => {
          if (!open) setTaskFromMeeting(null);
        }}
        defaultClientId={clientId}
        defaultMeetingId={taskFromMeeting?.id}
      />
    </div>
  );
}
