"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import { noteSchema, type NoteFormValues } from "@/lib/schemas";
import {
  NOTE_TYPE_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type ClientNote,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  note?: ClientNote | null;
}

const RELATION_TYPE_OPTIONS = [
  { value: "none", label: "Sin relación" },
  { value: "idea", label: "Contenido" },
  { value: "task", label: "Tarea" },
  { value: "meeting", label: "Reunión" },
];

function toValues(note: ClientNote | null | undefined): NoteFormValues {
  if (note) {
    return {
      title: note.title,
      content: note.content,
      type: note.type,
      isPinned: note.isPinned,
      responsible: note.responsible,
      relatedEntityType: note.relatedEntityType || "none",
      relatedEntityId: note.relatedEntityId || "none",
    };
  }
  return {
    title: "",
    content: "",
    type: "general",
    isPinned: false,
    responsible: TEAM_MEMBERS[0],
    relatedEntityType: "none",
    relatedEntityId: "none",
  };
}

export function NoteFormDialog({ open, onOpenChange, clientId, note }: NoteFormDialogProps) {
  const { addClientNote, updateClientNote, ideas, tasks, meetings } = useFlare();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: toValues(note),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(note));
  }, [open, note, reset]);

  const relationType = useWatch({ control, name: "relatedEntityType" });
  const entityOptions = React.useMemo(() => {
    if (relationType === "idea") {
      return ideas
        .filter((i) => i.clientId === clientId)
        .map((i) => ({ value: i.id, label: i.title }));
    }
    if (relationType === "task") {
      return tasks
        .filter((t) => t.clientId === clientId)
        .map((t) => ({ value: t.id, label: t.title }));
    }
    if (relationType === "meeting") {
      return meetings
        .filter((m) => m.clientId === clientId)
        .map((m) => ({ value: m.id, label: `${m.type || "Reunión"} · ${m.meetingDate}` }));
    }
    return [];
  }, [relationType, ideas, tasks, meetings, clientId]);

  const onSubmit = handleSubmit((values) => {
    const noRelation =
      values.relatedEntityType === "none" ||
      values.relatedEntityId === "none" ||
      !values.relatedEntityId;
    const data = {
      ...values,
      relatedEntityType: noRelation ? "" : values.relatedEntityType,
      relatedEntityId: noRelation ? "" : values.relatedEntityId,
    };
    if (note) {
      updateClientNote(note.id, data);
      toast.success("Nota actualizada");
    } else {
      addClientNote({ ...data, clientId });
      toast.success("Nota creada");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={note ? "Editar nota" : "Nueva nota"}
      submitLabel={note ? "Guardar cambios" : "Crear nota"}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Feedback de la reunión" />
        </Field>
        <Field label="Contenido" className="sm:col-span-2">
          <Textarea rows={4} {...register("content")} />
        </Field>
        <RHFSelect
          control={control}
          name="type"
          label="Tipo"
          options={optionsFromLabels(NOTE_TYPE_LABELS)}
        />
        <RHFSelect
          control={control}
          name="responsible"
          label="Responsable"
          options={RESPONSIBLE_OPTIONS}
          error={errors.responsible?.message}
        />
        <RHFSelect
          control={control}
          name="relatedEntityType"
          label="Relacionar con"
          options={RELATION_TYPE_OPTIONS}
        />
        {relationType !== "none" && (
          <RHFSelect
            control={control}
            name="relatedEntityId"
            label="Elemento relacionado"
            options={
              entityOptions.length
                ? entityOptions
                : [{ value: "none", label: "No hay elementos de este tipo" }]
            }
            placeholder="Selecciona..."
          />
        )}
        <Controller
          control={control}
          name="isPinned"
          render={({ field }) => (
            <label className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
              <Label className="cursor-pointer text-xs">
                Fijar como nota importante
              </Label>
            </label>
          )}
        />
      </div>
    </FormDialog>
  );
}
