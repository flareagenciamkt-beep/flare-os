"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import {
  meetingSchema,
  nullableDate,
  type MeetingFormValues,
} from "@/lib/schemas";
import type { ClientMeeting } from "@/lib/types";

interface MeetingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  meeting?: ClientMeeting | null;
}

function toValues(meeting: ClientMeeting | null | undefined): MeetingFormValues {
  if (meeting) {
    return {
      meetingDate: meeting.meetingDate,
      type: meeting.type,
      participants: meeting.participants,
      topics: meeting.topics,
      decisions: meeting.decisions,
      pendingItems: meeting.pendingItems,
      nextMeetingDate: meeting.nextMeetingDate ?? "",
    };
  }
  return {
    meetingDate: new Date().toISOString().slice(0, 10),
    type: "",
    participants: "",
    topics: "",
    decisions: "",
    pendingItems: "",
    nextMeetingDate: "",
  };
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  clientId,
  meeting,
}: MeetingFormDialogProps) {
  const { addMeeting, updateMeeting } = useFlare();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: toValues(meeting),
  });
  const { register, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(meeting));
  }, [open, meeting, reset]);

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      nextMeetingDate: nullableDate(values.nextMeetingDate),
    };
    if (meeting) {
      updateMeeting(meeting.id, data);
      toast.success("Reunión actualizada");
    } else {
      addMeeting({ ...data, clientId });
      toast.success("Reunión registrada");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={meeting ? "Editar reunión" : "Registrar reunión"}
      submitLabel={meeting ? "Guardar cambios" : "Registrar"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha" error={errors.meetingDate?.message}>
          <Input type="date" {...register("meetingDate")} />
        </Field>
        <Field label="Tipo de reunión">
          <Input {...register("type")} placeholder="Ej: Revisión mensual, kickoff" />
        </Field>
        <Field label="Participantes" className="sm:col-span-2">
          <Input {...register("participants")} placeholder="Ej: Juan, Sara, María (cliente)" />
        </Field>
        <Field label="Temas tratados" className="sm:col-span-2">
          <Textarea rows={3} {...register("topics")} />
        </Field>
        <Field label="Decisiones" className="sm:col-span-2">
          <Textarea rows={2} {...register("decisions")} />
        </Field>
        <Field label="Pendientes" className="sm:col-span-2">
          <Textarea rows={2} {...register("pendingItems")} />
        </Field>
        <Field label="Próxima reunión">
          <Input type="date" {...register("nextMeetingDate")} />
        </Field>
      </div>
    </FormDialog>
  );
}
