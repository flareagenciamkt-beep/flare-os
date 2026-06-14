"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { useClientOptions } from "@/components/shared/use-client-options";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import {
  nullableClientId,
  parseList,
  resourceSchema,
  type ResourceFormValues,
} from "@/lib/schemas";
import {
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_TYPE_LABELS,
  optionsFromLabels,
  type Resource,
} from "@/lib/types";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource | null;
  defaultClientId?: string | null;
}

function toValues(
  resource: Resource | null | undefined,
  defaultClientId: string | null | undefined,
): ResourceFormValues {
  if (resource) {
    return {
      clientId: resource.clientId ?? "none",
      title: resource.title,
      type: resource.type,
      category: resource.category,
      content: resource.content,
      externalLink: resource.externalLink,
      tagsText: resource.tags.join(", "),
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    title: "",
    type: "nota",
    category: "contenido",
    content: "",
    externalLink: "",
    tagsText: "",
  };
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  defaultClientId,
}: ResourceFormDialogProps) {
  const { addResource, updateResource } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: toValues(resource, defaultClientId),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(resource, defaultClientId));
  }, [open, resource, defaultClientId, reset]);

  const onSubmit = handleSubmit((values) => {
    const { tagsText, ...rest } = values;
    const data = {
      ...rest,
      clientId: nullableClientId(values.clientId),
      tags: parseList(tagsText),
    };
    if (resource) {
      updateResource(resource.id, data);
      toast.success("Recurso actualizado");
    } else {
      addResource(data);
      toast.success("Recurso guardado");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={resource ? "Editar recurso" : "Nuevo recurso"}
      submitLabel={resource ? "Guardar cambios" : "Guardar recurso"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Plantilla de reporte mensual" />
        </Field>
        <RHFSelect
          control={control}
          name="type"
          label="Tipo"
          options={optionsFromLabels(RESOURCE_TYPE_LABELS)}
        />
        <RHFSelect
          control={control}
          name="category"
          label="Categoría"
          options={optionsFromLabels(RESOURCE_CATEGORY_LABELS)}
        />
        <RHFSelect
          control={control}
          name="clientId"
          label="Cliente"
          options={clientOptions}
        />
        <Field label="Archivo / imagen (sube o pega un link)" className="sm:col-span-2">
          <Controller
            control={control}
            name="externalLink"
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} folder="resources" />
            )}
          />
        </Field>
        <Field label="Contenido" className="sm:col-span-2">
          <Textarea rows={5} {...register("content")} />
        </Field>
        <Field label="Tags (separados por coma)" className="sm:col-span-2">
          <Input {...register("tagsText")} placeholder="reporte, mensual, cliente" />
        </Field>
      </div>
    </FormDialog>
  );
}
