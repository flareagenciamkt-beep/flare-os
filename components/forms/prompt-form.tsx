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
  nullableClientId,
  parseList,
  promptSchema,
  type PromptFormValues,
} from "@/lib/schemas";
import {
  RESOURCE_CATEGORY_LABELS,
  optionsFromLabels,
  type Prompt,
} from "@/lib/types";

interface PromptFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  defaultClientId?: string | null;
}

function toValues(
  prompt: Prompt | null | undefined,
  defaultClientId: string | null | undefined,
): PromptFormValues {
  if (prompt) {
    return {
      clientId: prompt.clientId ?? "none",
      title: prompt.title,
      category: prompt.category,
      promptContent: prompt.promptContent,
      recommendedUse: prompt.recommendedUse,
      variablesText: prompt.requiredVariables.join(", "),
      tagsText: prompt.tags.join(", "),
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    title: "",
    category: "contenido",
    promptContent: "",
    recommendedUse: "",
    variablesText: "",
    tagsText: "",
  };
}

export function PromptFormDialog({
  open,
  onOpenChange,
  prompt,
  defaultClientId,
}: PromptFormDialogProps) {
  const { addPrompt, updatePrompt } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: toValues(prompt, defaultClientId),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(prompt, defaultClientId));
  }, [open, prompt, defaultClientId, reset]);

  const onSubmit = handleSubmit((values) => {
    const { variablesText, tagsText, ...rest } = values;
    const data = {
      ...rest,
      clientId: nullableClientId(values.clientId),
      requiredVariables: parseList(variablesText),
      tags: parseList(tagsText),
    };
    if (prompt) {
      updatePrompt(prompt.id, data);
      toast.success("Prompt actualizado");
    } else {
      addPrompt(data);
      toast.success("Prompt guardado");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={prompt ? "Editar prompt" : "Nuevo prompt"}
      submitLabel={prompt ? "Guardar cambios" : "Guardar prompt"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Generador de hooks para reels" />
        </Field>
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
        <Field
          label="Prompt completo"
          error={errors.promptContent?.message}
          className="sm:col-span-2"
        >
          <Textarea rows={6} {...register("promptContent")} className="font-mono text-xs" />
        </Field>
        <Field label="Uso recomendado" className="sm:col-span-2">
          <Textarea rows={2} {...register("recommendedUse")} />
        </Field>
        <Field label="Variables necesarias (separadas por coma)">
          <Input {...register("variablesText")} placeholder="marca, tema, tono" />
        </Field>
        <Field label="Tags (separados por coma)">
          <Input {...register("tagsText")} placeholder="hooks, reels" />
        </Field>
      </div>
    </FormDialog>
  );
}
