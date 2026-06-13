"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import { billingSchema, nullableDate } from "@/lib/schemas";
import {
  CURRENCY_OPTIONS,
  PAYMENT_STATUS_LABELS,
  optionsFromLabels,
  type Client,
  type ClientBilling,
} from "@/lib/types";

const CURRENCY_SELECT_OPTIONS = CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }));

interface BillingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  record?: ClientBilling | null;
}

function toValues(record: ClientBilling | null | undefined, client: Client) {
  if (record) {
    return {
      monthlyFee: record.monthlyFee,
      currency: record.currency,
      paymentStatus: record.paymentStatus,
      billingDate: record.billingDate ?? "",
      includedServices: record.includedServices,
      observations: record.observations,
    };
  }
  return {
    monthlyFee: client.monthlyFee,
    currency: client.currency,
    paymentStatus: "pendiente" as const,
    billingDate: "",
    includedServices: client.activeServices.join(", "),
    observations: "",
  };
}

export function BillingFormDialog({
  open,
  onOpenChange,
  client,
  record,
}: BillingFormDialogProps) {
  const { addBilling, updateBilling } = useFlare();

  const form = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: toValues(record, client),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(record, client));
  }, [open, record, client, reset]);

  const onSubmit = handleSubmit((values) => {
    const data = { ...values, billingDate: nullableDate(values.billingDate) };
    if (record) {
      updateBilling(record.id, data);
      toast.success("Registro de facturación actualizado");
    } else {
      addBilling({ ...data, clientId: client.id });
      toast.success("Cobro registrado");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Editar cobro" : "Registrar cobro"}
      description="Facturación básica V1.1: registro simple por período."
      submitLabel={record ? "Guardar cambios" : "Registrar"}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <RHFSelect
          control={control}
          name="paymentStatus"
          label="Estado de pago"
          options={optionsFromLabels(PAYMENT_STATUS_LABELS)}
        />
        <Field label="Fecha de cobro">
          <Input type="date" {...register("billingDate")} />
        </Field>
        <Field label="Servicios incluidos" className="sm:col-span-2">
          <Input {...register("includedServices")} placeholder="Ej: Contenido, pauta y email" />
        </Field>
        <Field label="Observaciones" className="sm:col-span-2">
          <Textarea rows={2} {...register("observations")} />
        </Field>
      </div>
    </FormDialog>
  );
}
