"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { useClientOptions } from "@/components/shared/use-client-options";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import {
  ideaSchema,
  nullableClientId,
  nullableDate,
  type IdeaFormValues,
} from "@/lib/schemas";
import {
  CHANNEL_LABELS,
  FORMAT_LABELS,
  IDEA_CATEGORY_LABELS,
  IDEA_STATUS_LABELS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Idea,
  type IdeaStatus,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface IdeaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: Idea | null;
  defaultClientId?: string | null;
  defaultStatus?: IdeaStatus;
}

function toValues(
  idea: Idea | null | undefined,
  defaultClientId: string | null | undefined,
  defaultStatus: IdeaStatus | undefined,
): IdeaFormValues {
  if (idea) {
    return {
      clientId: idea.clientId ?? "none",
      title: idea.title,
      description: idea.description,
      category: idea.category,
      status: idea.status,
      priority: idea.priority,
      format: idea.format,
      channel: idea.channel,
      suggestedDate: idea.suggestedDate ?? "",
      publishDate: idea.publishDate ?? "",
      responsible: idea.responsible,
      notes: idea.notes,
      prompt: idea.prompt,
      references: idea.references,
      coverImage: idea.coverImage ?? "",
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    title: "",
    description: "",
    category: "contenido",
    status: defaultStatus ?? "idea",
    priority: "media",
    format: "carrusel",
    channel: "instagram",
    suggestedDate: "",
    publishDate: "",
    responsible: TEAM_MEMBERS[0],
    notes: "",
    prompt: "",
    references: "",
    coverImage: "",
  };
}

export function IdeaFormDialog({
  open,
  onOpenChange,
  idea,
  defaultClientId,
  defaultStatus,
}: IdeaFormDialogProps) {
  const { addIdea, updateIdea } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: toValues(idea, defaultClientId, defaultStatus),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(idea, defaultClientId, defaultStatus));
  }, [open, idea, defaultClientId, defaultStatus, reset]);

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      clientId: nullableClientId(values.clientId),
      suggestedDate: nullableDate(values.suggestedDate),
      publishDate: nullableDate(values.publishDate),
    };
    if (idea) {
      updateIdea(idea.id, data);
      toast.success("Idea actualizada");
    } else {
      addIdea(data);
      toast.success("Idea creada");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={idea ? "Editar idea" : "Nueva idea"}
      description={
        idea ? undefined : "Asóciala a un cliente o déjala como interna de Flare."
      }
      submitLabel={idea ? "Guardar cambios" : "Crear idea"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {idea?.clientApproval === "cambios_solicitados" && idea.clientFeedback && (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90 sm:col-span-2">
            <p className="font-semibold">El cliente solicitó cambios:</p>
            <p className="mt-1">&ldquo;{idea.clientFeedback}&rdquo;</p>
          </div>
        )}
        {idea?.clientApproval === "aprobada" && (
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300/90 sm:col-span-2">
            Aprobada por el cliente — lista para programar.
          </div>
        )}
        <RHFSelect
          control={control}
          name="clientId"
          label="Cliente"
          options={clientOptions}
          className="sm:col-span-2"
        />
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Carrusel 5 mitos del seguro" />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={2} {...register("description")} />
        </Field>
        <RHFSelect
          control={control}
          name="category"
          label="Categoría"
          options={optionsFromLabels(IDEA_CATEGORY_LABELS)}
        />
        <RHFSelect
          control={control}
          name="status"
          label="Estado"
          options={optionsFromLabels(IDEA_STATUS_LABELS)}
        />
        <RHFSelect
          control={control}
          name="priority"
          label="Prioridad"
          options={optionsFromLabels(PRIORITY_LABELS)}
        />
        <RHFSelect
          control={control}
          name="format"
          label="Formato"
          options={optionsFromLabels(FORMAT_LABELS)}
        />
        <RHFSelect
          control={control}
          name="channel"
          label="Canal"
          options={optionsFromLabels(CHANNEL_LABELS)}
        />
        <RHFSelect
          control={control}
          name="responsible"
          label="Responsable"
          options={RESPONSIBLE_OPTIONS}
          error={errors.responsible?.message}
        />
        <Field label="Fecha sugerida">
          <Input type="date" {...register("suggestedDate")} />
        </Field>
        <Field label="Fecha de publicación">
          <Input type="date" {...register("publishDate")} />
        </Field>
        <Field label="Imagen de la pieza (URL para la vista previa del feed)" className="sm:col-span-2">
          <Input
            {...register("coverImage")}
            placeholder="URL directa de imagen o link de compartir de Google Drive (público)"
          />
        </Field>
        <Field label="Notas" className="sm:col-span-2">
          <Textarea rows={2} {...register("notes")} />
        </Field>
        <Field label="Prompt asociado" className="sm:col-span-2">
          <Textarea rows={2} {...register("prompt")} />
        </Field>
        <Field label="Referencias" className="sm:col-span-2">
          <Textarea rows={2} {...register("references")} placeholder="Links o notas de referencia" />
        </Field>
      </div>
    </FormDialog>
  );
}
