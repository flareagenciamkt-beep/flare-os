"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleDot, Package, Target } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { ChipSelect } from "@/components/shared/chip-select";
import {
  ClientStatusBadge,
  HealthBadge,
  PhaseBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { PortalAccessCard } from "@/components/clients/portal-access-card";
import { useFlare } from "@/lib/store";
import { clientOperationalProgress } from "@/lib/stats";
import {
  clientSchema,
  linksToText,
  nullableDate,
  parseLinks,
  parseList,
} from "@/lib/schemas";
import {
  INDUSTRY_OPTIONS,
  MAIN_GOAL_OPTIONS,
  GOAL_TYPE_OPTIONS,
  KPI_OPTIONS,
  DELIVERABLE_OPTIONS,
  REVIEW_FREQUENCY_OPTIONS,
  SERVICE_CHIPS,
  CHANNEL_CHIPS,
  FORMAT_CHIPS,
  PUBLISH_FREQUENCY_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  CLIENT_PAYMENT_STATUS_OPTIONS,
  PORTAL_ROLE_OPTIONS,
  PORTAL_VISIBILITY_OPTIONS,
} from "@/lib/form-options";
import {
  CLIENT_STATUS_LABELS,
  CURRENCY_OPTIONS,
  HEALTH_LABELS,
  PHASE_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Client,
  type ClientPhase,
  type ClientPriority,
  type ClientStatus,
  type HealthStatus,
} from "@/lib/types";

const CURRENCY_SELECT_OPTIONS = ["COP", "USD", "EUR", ...CURRENCY_OPTIONS]
  .filter((c, i, a) => a.indexOf(c) === i)
  .map((c) => ({ value: c, label: c }));
const OWNER_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));
const CLIENT_PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const PERMS = [
  ["permMetrics", "Puede ver métricas"],
  ["permCalendar", "Puede ver calendario"],
  ["permComment", "Puede comentar piezas"],
  ["permApprove", "Puede aprobar piezas"],
  ["permCreateTasks", "Puede crear tareas"],
  ["permReports", "Puede ver reportes"],
  ["permDownload", "Puede descargar archivos"],
] as const;

const TAB_FIELDS = {
  general: ["name", "brand", "industry", "description", "mainGoal", "mainKpi"],
  operacion: ["status", "owner", "priority", "currentPhase", "healthStatus", "nextAction", "nextDeliverable", "reviewFrequency"],
  servicios: ["servicesText", "channelsText", "formatsText", "publishFrequency"],
  contrato: ["monthlyFee", "currency", "contractType", "paymentMethod", "clientPaymentStatus", "startDate", "renewalDate", "linksText", "internalNotes"],
  portal: ["portalContactName", "portalAccessEmail", "portalRole", "portalVisibility"],
} as const;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

function toValues(client: Client | null | undefined) {
  const p = client?.portalPermissions;
  return {
    name: client?.name ?? "",
    brand: client?.brand ?? "",
    industry: client?.industry ?? "",
    status: client?.status ?? ("prospecto" as const),
    owner: client?.owner ?? (TEAM_MEMBERS[0] as string),
    priority: client?.priority ?? ("media" as const),
    currentPhase: client?.currentPhase ?? ("onboarding" as const),
    healthStatus: client?.healthStatus ?? ("bien" as const),
    progressPercentage: client?.progressPercentage ?? 0,
    description: client?.description ?? "",
    mainGoal: client?.mainGoal ?? "",
    mainKpi: client?.mainKpi ?? "",
    nextAction: client?.nextAction ?? "",
    linksText: client ? linksToText(client.importantLinks) : "",
    internalNotes: client?.internalNotes ?? "",
    monthlyFee: client?.monthlyFee ?? 0,
    currency: client?.currency ?? "USD",
    startDate: client?.startDate ?? "",
    servicesText: client?.activeServices.join(", ") ?? "",
    channelsText: client?.activeChannels.join(", ") ?? "",
    nextDeliverable: client?.nextDeliverable ?? "",
    monthlyGoalType: client?.monthlyGoalType ?? "",
    monthlyGoalValue: client?.monthlyGoalValue ?? 0,
    contentGoalType: client?.contentGoalType ?? "",
    contentGoalValue: client?.contentGoalValue ?? 0,
    reviewFrequency: client?.reviewFrequency ?? "",
    formatsText: client?.mainFormats?.join(", ") ?? "",
    publishFrequency: client?.publishFrequency ?? "",
    contractType: client?.contractType ?? "",
    paymentMethod: client?.paymentMethod ?? "",
    clientPaymentStatus: client?.clientPaymentStatus ?? "",
    renewalDate: client?.renewalDate ?? "",
    portalContactName: client?.portalContactName ?? "",
    portalAccessEmail: client?.portalAccessEmail ?? "",
    portalRole: client?.portalRole ?? "",
    portalVisibility: client?.portalVisibility ?? "",
    permMetrics: p?.metrics ?? false,
    permCalendar: p?.calendar ?? false,
    permComment: p?.comment ?? false,
    permApprove: p?.approve ?? false,
    permCreateTasks: p?.createTasks ?? false,
    permReports: p?.reports ?? false,
    permDownload: p?.download ?? false,
  };
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { addClient, updateClient, ideas, tasks, metrics } = useFlare();
  const router = useRouter();
  const [tab, setTab] = React.useState("general");

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: toValues(client),
  });
  const { register, control, handleSubmit, reset, setValue, getValues, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) {
      reset(toValues(client));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab("general");
    }
  }, [open, client, reset]);

  const v = useWatch({ control });

  const computedProgress = client
    ? clientOperationalProgress(client, ideas, tasks, metrics).overall
    : 0;

  // Cerrar pidiendo confirmación si hay cambios sin guardar.
  const requestClose = (next: boolean) => {
    if (!next && formState.isDirty) {
      if (!window.confirm("Tienes cambios sin guardar. ¿Cerrar de todas formas?")) return;
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit((values) => {
    const {
      linksText, servicesText, channelsText, formatsText, startDate, renewalDate,
      monthlyGoalType, monthlyGoalValue, contentGoalType, contentGoalValue,
      permMetrics, permCalendar, permComment, permApprove, permCreateTasks, permReports, permDownload,
      ...rest
    } = values;
    const data = {
      ...rest,
      importantLinks: parseLinks(linksText),
      activeServices: parseList(servicesText),
      activeChannels: parseList(channelsText),
      mainFormats: parseList(formatsText),
      startDate: nullableDate(startDate),
      renewalDate: nullableDate(renewalDate),
      monthlyGoalType,
      monthlyGoalValue,
      contentGoalType,
      contentGoalValue,
      // Compuestos legibles (para portal y dashboards que leen texto)
      monthlyGoal: monthlyGoalValue && monthlyGoalType ? `${monthlyGoalValue} ${monthlyGoalType.toLowerCase()}/mes` : "",
      contentGoal: contentGoalValue && contentGoalType ? `${contentGoalValue} ${contentGoalType.toLowerCase()}/mes` : "",
      portalPermissions: {
        metrics: permMetrics, calendar: permCalendar, comment: permComment,
        approve: permApprove, createTasks: permCreateTasks, reports: permReports,
        download: permDownload,
      },
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

  const tabHasError = (key: keyof typeof TAB_FIELDS) =>
    TAB_FIELDS[key].some((f) => Boolean(errors[f as keyof typeof errors]));

  const TABS: { value: keyof typeof TAB_FIELDS; label: string }[] = [
    { value: "general", label: "Información general" },
    { value: "operacion", label: "Operación" },
    { value: "servicios", label: "Servicios y canales" },
    { value: "contrato", label: "Contrato" },
    { value: "portal", label: "Portal cliente" },
  ];

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Header estratégico */}
        <div className="border-b border-border px-5 pb-4 pt-5">
          <div className="flex items-start gap-3 pr-8">
            <span
              className="flare-gradient flex size-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {(v.brand || v.name || "CL").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-lg font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
                {v.name || (client ? "Editar cliente" : "Nuevo cliente")}
              </DialogTitle>
              <p className="truncate text-xs text-muted-foreground">
                {[v.brand, v.industry].filter(Boolean).join(" · ") || "Sin marca · Sin industria"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ClientStatusBadge status={v.status as ClientStatus} />
                <PhaseBadge phase={v.currentPhase as ClientPhase} />
                <HealthBadge health={v.healthStatus as HealthStatus} />
                <PriorityBadge priority={v.priority as ClientPriority} />
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Package className="size-3.5 text-flare-soft" />
            <span className="font-medium text-foreground/80">Próximo entregable:</span>
            {v.nextDeliverable || "Sin definir"}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList
              variant="line"
              className="w-full flex-nowrap justify-start gap-1 overflow-x-auto border-b border-border px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="min-h-11 shrink-0 grow-0 gap-1.5 px-3 data-active:text-flare after:bg-[var(--flare)] sm:min-h-10"
                >
                  {t.label}
                  {tabHasError(t.value) && <span className="size-1.5 rounded-full bg-destructive" aria-label="Tiene errores" />}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {/* Información general */}
              <TabsContent value="general" className="mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombre del cliente" required error={errors.name?.message}>
                  <Input {...register("name")} placeholder="Ej: Universal Solutions LLC" aria-invalid={!!errors.name} />
                </Field>
                <Field label="Marca" required error={errors.brand?.message}>
                  <Input {...register("brand")} placeholder="Ej: Universal Solutions" aria-invalid={!!errors.brand} />
                  <button
                    type="button"
                    onClick={() => setValue("brand", getValues("name"), { shouldDirty: true })}
                    className="mt-1 text-[11px] font-medium text-flare-soft hover:underline"
                  >
                    Usar mismo nombre del cliente
                  </button>
                </Field>
                <RHFSelect control={control} name="industry" label="Industria" required options={INDUSTRY_OPTIONS} placeholder="Selecciona industria" error={errors.industry?.message} className="sm:col-span-2" />
                <Field label="Descripción" className="sm:col-span-2">
                  <Textarea rows={2} {...register("description")} placeholder="Una línea sobre la marca y su contexto." />
                </Field>
                <RHFSelect control={control} name="mainGoal" label="Objetivo principal" options={MAIN_GOAL_OPTIONS} placeholder="Selecciona objetivo" className="sm:col-span-2" />
                <Field label="Objetivo mensual">
                  <div className="flex gap-2">
                    <Controller control={control} name="monthlyGoalType" render={({ field }) => (
                      <select value={field.value} onChange={field.onChange} className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                        <option value="">Tipo…</option>
                        {GOAL_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
                      </select>
                    )} />
                    <Input type="number" min={0} className="w-24" {...register("monthlyGoalValue")} placeholder="0" />
                  </div>
                </Field>
                <Field label="Objetivo de contenido">
                  <div className="flex gap-2">
                    <Controller control={control} name="contentGoalType" render={({ field }) => (
                      <select value={field.value} onChange={field.onChange} className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                        <option value="">Tipo…</option>
                        {GOAL_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
                      </select>
                    )} />
                    <Input type="number" min={0} className="w-24" {...register("contentGoalValue")} placeholder="0" />
                  </div>
                </Field>
                <RHFSelect control={control} name="mainKpi" label="KPI principal" options={KPI_OPTIONS} placeholder="Selecciona KPI" className="sm:col-span-2" />
              </TabsContent>

              {/* Operación */}
              <TabsContent value="operacion" className="mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RHFSelect control={control} name="owner" label="Responsable interno" required options={OWNER_OPTIONS} error={errors.owner?.message} />
                <RHFSelect control={control} name="status" label="Estado del cliente" options={optionsFromLabels(CLIENT_STATUS_LABELS)} />
                <RHFSelect control={control} name="currentPhase" label="Fase actual" options={optionsFromLabels(PHASE_LABELS)} />
                <RHFSelect control={control} name="healthStatus" label="Estado operativo" options={optionsFromLabels(HEALTH_LABELS)} />
                <RHFSelect control={control} name="priority" label="Prioridad" options={CLIENT_PRIORITY_OPTIONS} />
                <RHFSelect control={control} name="nextDeliverable" label="Próximo entregable" options={DELIVERABLE_OPTIONS} placeholder="Selecciona entregable" />
                <RHFSelect control={control} name="reviewFrequency" label="Frecuencia de revisión" options={REVIEW_FREQUENCY_OPTIONS} placeholder="Selecciona frecuencia" />
                <Field label="Próxima acción" className="sm:col-span-2">
                  <Input {...register("nextAction")} placeholder="Ej: Enviar calendario de junio" />
                </Field>
                <div className="rounded-xl border border-border bg-secondary/20 p-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      <Target className="size-3.5 text-flare" />
                      Progreso general
                    </p>
                    <span className="text-sm font-semibold tabular-nums">{computedProgress}%</span>
                  </div>
                  <Progress value={computedProgress} className="mt-2" />
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Se calcula automáticamente con producción, tareas, calendario e
                    higiene operativa. No es editable.
                  </p>
                </div>
              </TabsContent>

              {/* Servicios y canales */}
              <TabsContent value="servicios" className="mt-0 space-y-5">
                <Field label="Servicios activos">
                  <Controller control={control} name="servicesText" render={({ field }) => (
                    <ChipSelect value={parseList(field.value)} onChange={(arr) => field.onChange(arr.join(", "))} suggestions={SERVICE_CHIPS} placeholder="Agregar servicio…" emptyLabel="Sin servicios activos todavía." ariaLabel="Servicios activos" />
                  )} />
                </Field>
                <Field label="Canales activos">
                  <Controller control={control} name="channelsText" render={({ field }) => (
                    <ChipSelect value={parseList(field.value)} onChange={(arr) => field.onChange(arr.join(", "))} suggestions={CHANNEL_CHIPS} placeholder="Agregar canal…" emptyLabel="Sin canales activos todavía." ariaLabel="Canales activos" />
                  )} />
                </Field>
                <Field label="Formatos principales">
                  <Controller control={control} name="formatsText" render={({ field }) => (
                    <ChipSelect value={parseList(field.value)} onChange={(arr) => field.onChange(arr.join(", "))} suggestions={FORMAT_CHIPS} placeholder="Agregar formato…" emptyLabel="Sin formatos definidos todavía." ariaLabel="Formatos principales" />
                  )} />
                </Field>
                <RHFSelect control={control} name="publishFrequency" label="Frecuencia de publicación" options={PUBLISH_FREQUENCY_OPTIONS} placeholder="Selecciona frecuencia" />
              </TabsContent>

              {/* Contrato */}
              <TabsContent value="contrato" className="mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fee mensual" error={errors.monthlyFee?.message as string | undefined}>
                  <Input type="number" min={0} step="any" {...register("monthlyFee")} aria-invalid={!!errors.monthlyFee} />
                </Field>
                <RHFSelect control={control} name="currency" label="Moneda" options={CURRENCY_SELECT_OPTIONS} />
                <RHFSelect control={control} name="contractType" label="Tipo de contrato" options={CONTRACT_TYPE_OPTIONS} placeholder="Selecciona tipo" />
                <RHFSelect control={control} name="paymentMethod" label="Método de pago" options={PAYMENT_METHOD_OPTIONS} placeholder="Selecciona método" />
                <RHFSelect control={control} name="clientPaymentStatus" label="Estado de pago" options={CLIENT_PAYMENT_STATUS_OPTIONS} placeholder="Selecciona estado" />
                <div className="hidden sm:block" />
                <Field label="Fecha de inicio">
                  <Input type="date" {...register("startDate")} />
                </Field>
                <Field label="Fecha de renovación" hint="Déjala vacía si se calcula según el contrato.">
                  <Input type="date" {...register("renewalDate")} />
                </Field>
                <Field label="Links importantes" hint="Uno por línea: Etiqueta | https://url" className="sm:col-span-2">
                  <Textarea rows={3} {...register("linksText")} placeholder={"Instagram | https://instagram.com/...\nDrive | https://drive.google.com/..."} />
                </Field>
                <Field label="Notas internas" className="sm:col-span-2">
                  <Textarea rows={3} {...register("internalNotes")} placeholder="Contexto privado del equipo (no visible al cliente)." />
                </Field>
              </TabsContent>

              {/* Portal cliente */}
              <TabsContent value="portal" className="mt-0 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Contacto principal">
                    <Input {...register("portalContactName")} placeholder="Ej: María González" />
                  </Field>
                  <Field label="Email de acceso">
                    <Input type="email" {...register("portalAccessEmail")} placeholder="cliente@empresa.com" />
                  </Field>
                  <RHFSelect control={control} name="portalRole" label="Rol del cliente" options={PORTAL_ROLE_OPTIONS} placeholder="Selecciona rol" />
                  <RHFSelect control={control} name="portalVisibility" label="Nivel de visibilidad" options={PORTAL_VISIBILITY_OPTIONS} placeholder="Selecciona visibilidad" />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Permisos del cliente</p>
                  <div className="space-y-1.5">
                    {PERMS.map(([name, label]) => (
                      <div key={name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2">
                        <span className="text-xs">{label}</span>
                        <Controller control={control} name={name} render={({ field }) => (
                          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} aria-label={label} />
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                {client ? (
                  <div className="border-t border-border pt-4">
                    <PortalAccessCard clientId={client.id} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-8 text-center">
                    <CircleDot className="size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Crea accesos al guardar</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Guarda el cliente primero; luego podrás crear y vincular sus
                      usuarios del portal desde aquí.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer fijo */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {formState.isDirty && (
                <>
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Cambios sin guardar
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => requestClose(false)}>
                Cancelar
              </Button>
              <Button type="submit">{client ? "Guardar cambios" : "Crear cliente"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
