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
import {
  connectedAccountSchema,
  type ConnectedAccountFormValues,
} from "@/lib/schemas";
import {
  CONNECTED_PROVIDER_LABELS,
  optionsFromLabels,
  type ConnectedAccount,
} from "@/lib/types";

interface ConnectedAccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  account?: ConnectedAccount | null;
}

function toValues(
  account: ConnectedAccount | null | undefined,
): ConnectedAccountFormValues {
  if (account) {
    return {
      provider: account.provider,
      handle: account.handle,
      url: account.url,
      notes: account.notes,
    };
  }
  return { provider: "instagram", handle: "", url: "", notes: "" };
}

export function ConnectedAccountFormDialog({
  open,
  onOpenChange,
  clientId,
  account,
}: ConnectedAccountFormDialogProps) {
  const { addConnectedAccount, updateConnectedAccount } = useFlare();

  const form = useForm<ConnectedAccountFormValues>({
    resolver: zodResolver(connectedAccountSchema),
    defaultValues: toValues(account),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(account));
  }, [open, account, reset]);

  const onSubmit = handleSubmit((values) => {
    if (account) {
      updateConnectedAccount(account.id, values);
      toast.success("Cuenta actualizada");
    } else {
      addConnectedAccount({
        ...values,
        clientId,
        externalId: "",
        status: "asociada",
        syncEnabled: false,
        connectedAt: null,
        lastSyncAt: null,
      });
      toast.success("Cuenta asociada al cliente");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={account ? "Editar cuenta" : "Asociar cuenta de analytics"}
      submitLabel={account ? "Guardar cambios" : "Asociar"}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RHFSelect
          control={control}
          name="provider"
          label="Plataforma"
          options={optionsFromLabels(CONNECTED_PROVIDER_LABELS)}
        />
        <Field label="Usuario / cuenta" error={errors.handle?.message}>
          <Input {...register("handle")} placeholder="@marca o nombre de la cuenta" />
        </Field>
        <Field label="URL del perfil" className="sm:col-span-2">
          <Input {...register("url")} placeholder="https://instagram.com/marca" />
        </Field>
        <Field label="Notas" className="sm:col-span-2">
          <Textarea
            rows={2}
            {...register("notes")}
            placeholder="Ej: cuenta principal de la marca, de aquí salen las métricas mensuales"
          />
        </Field>
      </div>
    </FormDialog>
  );
}
