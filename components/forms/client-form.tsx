"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import {
  clientSchema,
  linksToText,
  nullableDate,
  parseLinks,
  parseList,
} from "@/lib/schemas";
import {
  CLIENT_STATUS_LABELS,
  CURRENCY_OPTIONS,
  HEALTH_LABELS,
  PHASE_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Client,
} from "@/lib/types";

const CURRENCY_SELECT_OPTIONS = CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }));

const OWNER_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));
const CLIENT_PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

function toValues(client: Client | null | undefined) {
  if (client) {
    return {
      name: client.name,
      brand: client.brand,
      industry: client.industry,
      status: client.status,
      owner: client.owner,
      priority: client.priority,
      currentPhase: client.currentPhase,
      healthStatus: client.healthStatus,
      progressPercentage: client.progressPercentage,
      description: client.description,
      mainGoal: client.mainGoal,
      monthlyGoal: client.monthlyGoal,
      contentGoal: client.contentGoal,
      mainKpi: client.mainKpi,
      nextAction: client.nextAction,
      linksText: linksToText(client.importantLinks),
      internalNotes: client.internalNotes,
      monthlyFee: client.monthlyFee,
      currency: client.currency,
      startDate: client.startDate ?? "",
      servicesText: client.activeServices.join(", "),
      channelsText: client.activeChannels.join(", "),
      nextDeliverable: client.nextDeliverable,
    };
  }
  return {
    name: "",
    brand: "",
    industry: "",
    status: "prospecto" as const,
    owner: TEAM_MEMBERS[0] as string,
    priority: "media" as const,
    currentPhase: "onboarding" as const,
    healthStatus: "bien" as const,
    progressPercentage: 0,
    description: "",
    mainGoal: "",
    monthlyGoal: "",
    contentGoal: "",
    mainKpi: "",
    nextAction: "",
    linksText: "",
    internalNotes: "",
    monthlyFee: 0,
    currency: "USD",
    startDate: "",
    servicesText: "",
    channelsText: "",
    nextDeliverable: "",
  };
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { addClient, updateClient } = useFlare();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: toValues(client),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(client));
  }, [open, client, reset]);

  const onSubmit = handleSubmit((values) => {
    const { linksText, servicesText, channelsText, startDate, ...rest } = values;
    const data = {
      ...rest,
      importantLinks: parseLinks(linksText),
      activeServices: parseList(servicesText),
      activeChannels: parseList(channelsText),
      startDate: nullableDate(startDate),
    };
    if (client) {
      updateClient(client.id, data);
      toast.success("Cliente actualizado");
    } else {
      const created = addClient(data);
      toast.success("Cliente creado");
      router.push(`/clients/${created.id}`);
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={client ? "Editar cliente" : "Nuevo cliente"}
      description={
        client ? undefined : "Centraliza la información de la marca que atiende Flare."
      }
      submitLabel={client ? "Guardar cambios" : "Crear cliente"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre del cliente" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Ej: Universal Solutions LLC" />
        </Field>
        <Field label="Marca" error={errors.brand?.message}>
          <Input {...register("brand")} placeholder="Ej: Universal Solutions" />
        </Field>
        <Field label="Industria" error={errors.industry?.message}>
          <Input {...register("industry")} placeholder="Ej: Seguros" />
        </Field>
        <RHFSelect
          control={control}
          name="status"
          label="Estado"
          options={optionsFromLabels(CLIENT_STATUS_LABELS)}
        />
        <RHFSelect
          control={control}
          name="owner"
          label="Responsable interno"
          options={OWNER_OPTIONS}
          error={errors.owner?.message}
        />
        <RHFSelect
          control={control}
          name="priority"
          label="Prioridad"
          options={CLIENT_PRIORITY_OPTIONS}
        />
        <RHFSelect
          control={control}
          name="currentPhase"
          label="Fase actual"
          options={optionsFromLabels(PHASE_LABELS)}
        />
        <RHFSelect
          control={control}
          name="healthStatus"
          label="Health status"
          options={optionsFromLabels(HEALTH_LABELS)}
        />
        <Field
          label="Progreso general (%)"
          error={errors.progressPercentage?.message as string | undefined}
        >
          <Input type="number" min={0} max={100} {...register("progressPercentage")} />
        </Field>
        <Field label="KPI principal">
          <Input {...register("mainKpi")} placeholder="Ej: Leads por WhatsApp" />
        </Field>
        <Field
          label="Fee mensual"
          error={errors.monthlyFee?.message as string | undefined}
        >
          <Input type="number" min={0} step="any" {...register("monthlyFee")} />
        </Field>
        <RHFSelect
          control={control}
          name="currency"
          label="Moneda"
          options={CURRENCY_SELECT_OPTIONS}
        />
        <Field label="Fecha de inicio">
          <Input type="date" {...register("startDate")} />
        </Field>
        <Field label="Próximo entregable">
          <Input {...register("nextDeliverable")} placeholder="Ej: Calendario de julio" />
        </Field>
        <Field label="Servicios activos (separados por coma)">
          <Input {...register("servicesText")} placeholder="Contenido, Pauta, Email" />
        </Field>
        <Field label="Canales activos (separados por coma)">
          <Input {...register("channelsText")} placeholder="Instagram, Facebook" />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={2} {...register("description")} />
        </Field>
        <Field label="Objetivo principal" className="sm:col-span-2">
          <Input {...register("mainGoal")} />
        </Field>
        <Field label="Objetivo mensual">
          <Input {...register("monthlyGoal")} />
        </Field>
        <Field label="Objetivo de contenido">
          <Input {...register("contentGoal")} />
        </Field>
        <Field label="Próxima acción" className="sm:col-span-2">
          <Input {...register("nextAction")} placeholder="Ej: Enviar calendario de junio" />
        </Field>
        <Field
          label="Links importantes (uno por línea: Etiqueta | https://url)"
          className="sm:col-span-2"
        >
          <Textarea rows={3} {...register("linksText")} placeholder={"Instagram | https://instagram.com/...\nDrive | https://drive.google.com/..."} />
        </Field>
        <Field label="Notas internas" className="sm:col-span-2">
          <Textarea rows={3} {...register("internalNotes")} />
        </Field>
      </div>
    </FormDialog>
  );
}
