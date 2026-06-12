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
import { metricSchema } from "@/lib/schemas";
import { MONTH_LABELS, type ClientMetric } from "@/lib/types";

const MONTH_OPTIONS = MONTH_LABELS.map((label, i) => ({
  value: String(i + 1),
  label,
}));

interface MetricFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric?: ClientMetric | null;
  defaultClientId?: string;
}

function toValues(
  metric: ClientMetric | null | undefined,
  defaultClientId: string | undefined,
) {
  const now = new Date();
  if (metric) {
    return {
      clientId: metric.clientId,
      periodMonth: metric.periodMonth,
      periodYear: metric.periodYear,
      instagramFollowers: metric.instagramFollowers,
      monthlyReach: metric.monthlyReach,
      interactions: metric.interactions,
      leadsGenerated: metric.leadsGenerated,
      whatsappClicks: metric.whatsappClicks,
      postsPublished: metric.postsPublished,
      reelsPublished: metric.reelsPublished,
      carouselsPublished: metric.carouselsPublished,
      storiesPublished: metric.storiesPublished,
      adSpend: metric.adSpend,
      relevantResults: metric.relevantResults,
      performanceNotes: metric.performanceNotes,
    };
  }
  return {
    clientId: defaultClientId ?? "",
    periodMonth: now.getMonth() + 1,
    periodYear: now.getFullYear(),
    instagramFollowers: 0,
    monthlyReach: 0,
    interactions: 0,
    leadsGenerated: 0,
    whatsappClicks: 0,
    postsPublished: 0,
    reelsPublished: 0,
    carouselsPublished: 0,
    storiesPublished: 0,
    adSpend: 0,
    relevantResults: "",
    performanceNotes: "",
  };
}

const NUMBER_FIELDS: { name: keyof ReturnType<typeof toValues>; label: string }[] = [
  { name: "instagramFollowers", label: "Seguidores Instagram" },
  { name: "monthlyReach", label: "Alcance mensual" },
  { name: "interactions", label: "Interacciones" },
  { name: "leadsGenerated", label: "Leads generados" },
  { name: "whatsappClicks", label: "Clics a WhatsApp" },
  { name: "postsPublished", label: "Contenidos publicados" },
  { name: "reelsPublished", label: "Reels publicados" },
  { name: "carouselsPublished", label: "Carruseles publicados" },
  { name: "storiesPublished", label: "Historias publicadas" },
  { name: "adSpend", label: "Inversión en pauta (USD)" },
];

export function MetricFormDialog({
  open,
  onOpenChange,
  metric,
  defaultClientId,
}: MetricFormDialogProps) {
  const { addMetric, updateMetric } = useFlare();
  const clientOptions = useClientOptions(false);

  const form = useForm({
    resolver: zodResolver(metricSchema),
    defaultValues: toValues(metric, defaultClientId),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(metric, defaultClientId));
  }, [open, metric, defaultClientId, reset]);

  const onSubmit = handleSubmit((values) => {
    if (metric) {
      updateMetric(metric.id, values);
      toast.success("Métricas actualizadas");
    } else {
      addMetric(values);
      toast.success("Métricas registradas");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={metric ? "Editar métricas" : "Registrar métricas mensuales"}
      description="Registro manual por cliente y mes (V1)."
      submitLabel={metric ? "Guardar cambios" : "Registrar"}
      onSubmit={onSubmit}
      wide
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RHFSelect
          control={control}
          name="clientId"
          label="Cliente"
          options={clientOptions}
          placeholder="Selecciona un cliente"
          error={errors.clientId?.message as string | undefined}
        />
        <RHFSelect
          control={control}
          name="periodMonth"
          label="Mes"
          options={MONTH_OPTIONS}
        />
        <Field label="Año">
          <Input type="number" {...register("periodYear")} />
        </Field>
        {NUMBER_FIELDS.map((f) => (
          <Field key={f.name} label={f.label}>
            <Input type="number" min={0} {...register(f.name as "instagramFollowers")} />
          </Field>
        ))}
        <Field label="Resultados relevantes" className="sm:col-span-3">
          <Textarea rows={2} {...register("relevantResults")} />
        </Field>
        <Field label="Notas de rendimiento" className="sm:col-span-3">
          <Textarea rows={2} {...register("performanceNotes")} />
        </Field>
      </div>
    </FormDialog>
  );
}
