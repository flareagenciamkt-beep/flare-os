"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { FormDialog } from "./form-dialog";
import { useFlare } from "@/lib/store";
import { accessSchema, type AccessFormValues } from "@/lib/schemas";
import {
  ACCESS_STATUS_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type ClientAccess,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface AccessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  access?: ClientAccess | null;
}

function toValues(access: ClientAccess | null | undefined): AccessFormValues {
  if (access) {
    return {
      platform: access.platform,
      usernameOrEmail: access.usernameOrEmail,
      url: access.url,
      status: access.status,
      responsible: access.responsible,
      requiresSensitiveAccess: access.requiresSensitiveAccess,
      notes: access.notes,
    };
  }
  return {
    platform: "",
    usernameOrEmail: "",
    url: "",
    status: "pendiente",
    responsible: TEAM_MEMBERS[0],
    requiresSensitiveAccess: false,
    notes: "",
  };
}

export function AccessFormDialog({
  open,
  onOpenChange,
  clientId,
  access,
}: AccessFormDialogProps) {
  const { addAccess, updateAccess } = useFlare();

  const form = useForm<AccessFormValues>({
    resolver: zodResolver(accessSchema),
    defaultValues: toValues(access),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) reset(toValues(access));
  }, [open, access, reset]);

  const onSubmit = handleSubmit((values) => {
    if (access) {
      updateAccess(access.id, values);
      toast.success("Acceso actualizado");
    } else {
      addAccess({ ...values, clientId });
      toast.success("Acceso registrado");
    }
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={access ? "Editar acceso" : "Registrar acceso"}
      submitLabel={access ? "Guardar cambios" : "Registrar"}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90 sm:col-span-2">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
          Por seguridad, guarda contraseñas en un gestor externo. Aquí solo registra
          el estado del acceso.
        </div>
        <Field label="Plataforma" error={errors.platform?.message}>
          <Input {...register("platform")} placeholder="Ej: Instagram, Meta Ads, Drive" />
        </Field>
        <Field label="Usuario / email">
          <Input {...register("usernameOrEmail")} placeholder="usuario o email de la cuenta" />
        </Field>
        <Field label="URL" className="sm:col-span-2">
          <Input {...register("url")} placeholder="https://..." />
        </Field>
        <RHFSelect
          control={control}
          name="status"
          label="Estado"
          options={optionsFromLabels(ACCESS_STATUS_LABELS)}
        />
        <RHFSelect
          control={control}
          name="responsible"
          label="Responsable"
          options={RESPONSIBLE_OPTIONS}
          error={errors.responsible?.message}
        />
        <Controller
          control={control}
          name="requiresSensitiveAccess"
          render={({ field }) => (
            <label className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
              <Label className="cursor-pointer text-xs">
                Requiere acceso sensible (pauta, facturación, datos de clientes)
              </Label>
            </label>
          )}
        />
        <Field label="Notas" className="sm:col-span-2">
          <Textarea rows={2} {...register("notes")} />
        </Field>
      </div>
    </FormDialog>
  );
}
