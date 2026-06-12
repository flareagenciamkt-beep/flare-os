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
  processSchema,
  type ProcessFormValues,
} from "@/lib/schemas";
import {
  AREA_LABELS,
  PROCESS_STATUS_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Process,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface ProcessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process?: Process | null;
}

function toValues(process: Process | null | undefined): ProcessFormValues {
  if (process) {
    return {
      clientId: process.clientId ?? "none",
      title: process.title,
      area: process.area,
      description: process.description,
      stepsText: process.steps.join("\n"),
      responsible: process.responsible,
      frequency: process.frequency,
      status: process.status,
    };
  }
  return {
    clientId: "none",
    title: "",
    area: "contenido",
    description: "",
    stepsText: "",
    responsible: TEAM_MEMBERS[0],
    frequency: "",
    status: "borrador",
  };
}

export function ProcessFormDialog({ open, onOpenChange, process }: ProcessFormDialogProps) {
  const { addProcess, updateProcess } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: toValues(process),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(process));
  }, [open, process, reset]);

  const onSubmit = handleSubmit((values) => {
    const { stepsText, ...rest } = values;
    const data = {
      ...rest,
      clientId: nullableClientId(values.clientId),
      steps: parseList(stepsText, "\n"),
    };
    if (process) {
      updateProcess(process.id, data);
      toast.success("Proceso actualizado");
    } else {
      addProcess(data);
      toast.success("Proceso creado");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={process ? "Editar proceso" : "Nuevo proceso / SOP"}
      submitLabel={process ? "Guardar cambios" : "Crear proceso"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} placeholder="Ej: Onboarding de cliente" />
        </Field>
        <RHFSelect
          control={control}
          name="area"
          label="Área"
          options={optionsFromLabels(AREA_LABELS)}
        />
        <RHFSelect
          control={control}
          name="status"
          label="Estado"
          options={optionsFromLabels(PROCESS_STATUS_LABELS)}
        />
        <RHFSelect
          control={control}
          name="responsible"
          label="Responsable"
          options={RESPONSIBLE_OPTIONS}
          error={errors.responsible?.message}
        />
        <Field label="Frecuencia">
          <Input {...register("frequency")} placeholder="Ej: Mensual, por cliente nuevo..." />
        </Field>
        <RHFSelect
          control={control}
          name="clientId"
          label="Cliente"
          options={clientOptions}
          className="sm:col-span-2"
        />
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={2} {...register("description")} />
        </Field>
        <Field
          label="Pasos (uno por línea)"
          error={errors.stepsText?.message}
          className="sm:col-span-2"
        >
          <Textarea rows={6} {...register("stepsText")} placeholder={"Agendar llamada de kickoff\nRecopilar accesos y brand kit\nDefinir objetivos del primer mes"} />
        </Field>
      </div>
    </FormDialog>
  );
}
