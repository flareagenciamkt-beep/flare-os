"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { useClientOptions } from "@/components/shared/use-client-options";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import {
  nullableClientId,
  nullableDate,
  taskSchema,
  type TaskFormValues,
} from "@/lib/schemas";
import {
  AREA_LABELS,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Task,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultClientId?: string | null;
}

function toValues(
  task: Task | null | undefined,
  defaultClientId: string | null | undefined,
): TaskFormValues {
  if (task) {
    return {
      clientId: task.clientId ?? "none",
      ideaId: task.ideaId ?? "none",
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      responsible: task.responsible,
      dueDate: task.dueDate ?? "",
      area: task.area,
      notes: task.notes,
      relatedLink: task.relatedLink,
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    ideaId: "none",
    title: "",
    description: "",
    status: "pendiente",
    priority: "media",
    responsible: TEAM_MEMBERS[0],
    dueDate: "",
    area: "contenido",
    notes: "",
    relatedLink: "",
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultClientId,
}: TaskFormDialogProps) {
  const { addTask, updateTask, ideas } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toValues(task, defaultClientId),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(task, defaultClientId));
  }, [open, task, defaultClientId, reset]);

  const selectedClientId = useWatch({ control, name: "clientId" });
  const ideaOptions = React.useMemo(() => {
    const wanted = selectedClientId === "none" ? null : selectedClientId;
    const relevant = ideas.filter((i) => i.clientId === wanted);
    return [
      { value: "none", label: "Sin idea asociada" },
      ...relevant.map((i) => ({ value: i.id, label: i.title })),
    ];
  }, [ideas, selectedClientId]);

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      clientId: nullableClientId(values.clientId),
      ideaId: values.ideaId === "none" ? null : values.ideaId,
      dueDate: nullableDate(values.dueDate),
    };
    if (task) {
      updateTask(task.id, data);
      toast.success("Tarea actualizada");
    } else {
      addTask(data);
      toast.success("Tarea creada");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Editar tarea" : "Nueva tarea"}
      submitLabel={task ? "Guardar cambios" : "Crear tarea"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RHFSelect
          control={control}
          name="clientId"
          label="Cliente"
          options={clientOptions}
        />
        <RHFSelect
          control={control}
          name="ideaId"
          label="Idea asociada"
          options={ideaOptions}
        />
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Diseñar carrusel de testimonios" />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={2} {...register("description")} />
        </Field>
        <RHFSelect
          control={control}
          name="status"
          label="Estado"
          options={optionsFromLabels(TASK_STATUS_LABELS)}
        />
        <RHFSelect
          control={control}
          name="priority"
          label="Prioridad"
          options={optionsFromLabels(PRIORITY_LABELS)}
        />
        <RHFSelect
          control={control}
          name="area"
          label="Área"
          options={optionsFromLabels(AREA_LABELS)}
        />
        <RHFSelect
          control={control}
          name="responsible"
          label="Responsable"
          options={RESPONSIBLE_OPTIONS}
          error={errors.responsible?.message}
        />
        <Field label="Fecha límite">
          <Input type="date" {...register("dueDate")} />
        </Field>
        <Field label="Link relacionado">
          <Input {...register("relatedLink")} placeholder="https://..." />
        </Field>
        <Field label="Notas" className="sm:col-span-2">
          <Textarea rows={2} {...register("notes")} />
        </Field>
      </div>
    </FormDialog>
  );
}
