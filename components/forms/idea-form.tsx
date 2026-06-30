"use client";

import * as React from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { GalleryUpload } from "@/components/shared/gallery-upload";
import { SimpleSelect } from "@/components/shared/simple-select";
import { IdeaStatusBadge } from "@/components/shared/badges";
import { useClientOptions } from "@/components/shared/use-client-options";
import { useFlare } from "@/lib/store";
import {
  ideaSchema,
  nullableClientId,
  nullableDate,
  type IdeaFormValues,
} from "@/lib/schemas";
import { IDEA_TYPE_OPTIONS, IDEA_TEMPLATES } from "@/lib/form-options";
import {
  CHANNEL_LABELS,
  FORMAT_LABELS,
  IDEA_CATEGORY_LABELS,
  IDEA_STATUS_LABELS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Channel,
  type Idea,
  type IdeaStatus,
} from "@/lib/types";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));
const CHANNEL_OPTIONS_ALL = optionsFromLabels(CHANNEL_LABELS);

// label (Instagram, WhatsApp…) → valor de Channel (instagram, whatsapp…).
const CHANNEL_BY_LABEL = new Map(
  (Object.entries(CHANNEL_LABELS) as [Channel, string][]).map(([k, label]) => [
    label.toLowerCase(),
    k,
  ]),
);

const TAB_FIELDS = {
  basico: ["clientId", "ideaType", "title", "description", "format", "channel", "status", "priority", "responsible"],
  produccion: ["copy", "references", "script", "designNotes", "notes", "externalUrl"],
  programacion: ["suggestedDate", "publishDate"],
  avanzado: ["prompt", "category", "coverImage"],
} as const;

interface IdeaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: Idea | null;
  defaultClientId?: string | null;
  defaultStatus?: IdeaStatus;
  defaultDate?: string;
}

function toValues(
  idea: Idea | null | undefined,
  defaultClientId: string | null | undefined,
  defaultStatus: IdeaStatus | undefined,
  defaultDate: string | undefined,
): IdeaFormValues {
  if (idea) {
    return {
      clientId: idea.clientId ?? "none",
      title: idea.title,
      description: idea.description,
      category: idea.category,
      ideaType: idea.ideaType ?? "",
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
      images: idea.images?.length ? idea.images : idea.coverImage ? [idea.coverImage] : [],
      copy: idea.copy ?? "",
      script: idea.script ?? "",
      designNotes: idea.designNotes ?? "",
      externalUrl: idea.externalUrl ?? "",
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    title: "",
    description: "",
    category: "contenido",
    ideaType: "",
    status: defaultStatus ?? "idea",
    priority: "media",
    format: "carrusel",
    channel: "instagram",
    suggestedDate: defaultDate ?? "",
    publishDate: "",
    responsible: TEAM_MEMBERS[0],
    notes: "",
    prompt: "",
    references: "",
    coverImage: "",
    images: [],
    copy: "",
    script: "",
    designNotes: "",
    externalUrl: "",
  };
}

export function IdeaFormDialog({
  open,
  onOpenChange,
  idea,
  defaultClientId,
  defaultStatus,
  defaultDate,
}: IdeaFormDialogProps) {
  const { addIdea, updateIdea, clients, clientName } = useFlare();
  const clientOptions = useClientOptions();
  const [tab, setTab] = React.useState("basico");

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: toValues(idea, defaultClientId, defaultStatus, defaultDate),
  });
  const { register, control, handleSubmit, reset, setValue, formState } = form;
  const errors = formState.errors;

  React.useEffect(() => {
    if (open) {
      reset(toValues(idea, defaultClientId, defaultStatus, defaultDate));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab("basico");
    }
  }, [open, idea, defaultClientId, defaultStatus, defaultDate, reset]);

  const clientId = useWatch({ control, name: "clientId" });
  const title = useWatch({ control, name: "title" });
  const status = useWatch({ control, name: "status" });

  // Canal dependiente: opciones según los canales activos del cliente.
  const channelOptions = React.useMemo(() => {
    const c = clients.find((x) => x.id === clientId);
    if (!c || c.activeChannels.length === 0) return CHANNEL_OPTIONS_ALL;
    const allowed = new Set(
      c.activeChannels.map((label) => CHANNEL_BY_LABEL.get(label.toLowerCase())).filter(Boolean),
    );
    const filtered = CHANNEL_OPTIONS_ALL.filter((o) => allowed.has(o.value as Channel));
    return filtered.length ? filtered : CHANNEL_OPTIONS_ALL;
  }, [clients, clientId]);

  // Regla inteligente: al elegir cliente, autocompletar responsable, prioridad y
  // canal (primer canal activo). Solo en cambios del usuario.
  const onClientChange = (next: string) => {
    setValue("clientId", next, { shouldDirty: true });
    const c = clients.find((x) => x.id === next);
    if (!c) return;
    setValue("responsible", c.owner, { shouldDirty: true });
    if (c.priority) setValue("priority", c.priority, { shouldDirty: true });
    const firstChannel = c.activeChannels
      .map((l) => CHANNEL_BY_LABEL.get(l.toLowerCase()))
      .find(Boolean) as Channel | undefined;
    if (firstChannel) setValue("channel", firstChannel, { shouldDirty: true });
  };

  const applyTemplate = (t: (typeof IDEA_TEMPLATES)[number]) => {
    setValue("ideaType", t.ideaType, { shouldDirty: true });
    setValue("title", t.title, { shouldDirty: true });
    setValue("description", t.description, { shouldDirty: true });
    setValue("format", t.format as IdeaFormValues["format"], { shouldDirty: true });
  };

  const requestClose = (next: boolean) => {
    if (!next && formState.isDirty) {
      if (!window.confirm("Tienes cambios sin guardar. ¿Cerrar de todas formas?")) return;
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      clientId: nullableClientId(values.clientId),
      suggestedDate: nullableDate(values.suggestedDate),
      publishDate: nullableDate(values.publishDate),
      // La portada es la primera imagen de la galería.
      coverImage: values.images[0] ?? "",
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

  const tabHasError = (key: keyof typeof TAB_FIELDS) =>
    TAB_FIELDS[key].some((f) => Boolean(errors[f as keyof typeof errors]));

  const TABS: { value: keyof typeof TAB_FIELDS; label: string }[] = [
    { value: "basico", label: "Básico" },
    { value: "produccion", label: "Producción" },
    { value: "programacion", label: "Programación" },
    { value: "avanzado", label: "Avanzado" },
  ];

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b border-border px-5 pb-4 pt-5 pr-12">
          <DialogTitle className="truncate text-lg font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
            {title || (idea ? "Editar idea" : "Nueva idea")}
          </DialogTitle>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{clientName(nullableClientId(clientId ?? "none"))}</span>
            <IdeaStatusBadge status={status as IdeaStatus} />
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList
              variant="line"
              className="w-full flex-nowrap justify-start gap-1 overflow-x-auto border-b border-border px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="min-h-11 shrink-0 grow-0 gap-1.5 px-3 data-active:text-flare after:bg-[var(--flare)] sm:min-h-10">
                  {t.label}
                  {tabHasError(t.value) && <span className="size-1.5 rounded-full bg-destructive" aria-label="Tiene errores" />}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {/* Básico */}
              <TabsContent value="basico" className="mt-0 space-y-4">
                {idea?.clientApproval === "cambios_solicitados" && idea.clientFeedback && (
                  <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300/90">
                    <p className="font-semibold">El cliente solicitó cambios:</p>
                    <p className="mt-1">&ldquo;{idea.clientFeedback}&rdquo;</p>
                  </div>
                )}
                {idea?.clientApproval === "aprobada" && (
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-emerald-300/90">
                    Aprobada por el cliente — lista para programar.
                  </div>
                )}
                {/* Plantillas rápidas */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Sparkles className="size-3.5 text-flare" />
                    Plantillas rápidas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {IDEA_TEMPLATES.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Cliente" className="sm:col-span-2">
                    <SimpleSelect value={clientId ?? "none"} onChange={onClientChange} options={clientOptions} />
                  </Field>
                  <RHFSelect control={control} name="ideaType" label="Tipo de idea" options={IDEA_TYPE_OPTIONS} placeholder="Selecciona tipo" className="sm:col-span-2" />
                  <Field label="Título" required error={errors.title?.message} className="sm:col-span-2">
                    <Input {...register("title")} placeholder="Ej: Carrusel 5 mitos del seguro" aria-invalid={!!errors.title} />
                  </Field>
                  <Field label="Descripción" className="sm:col-span-2">
                    <Textarea rows={2} {...register("description")} />
                  </Field>
                  <RHFSelect control={control} name="format" label="Formato" options={optionsFromLabels(FORMAT_LABELS)} />
                  <RHFSelect control={control} name="channel" label="Canal" options={channelOptions} />
                  <RHFSelect control={control} name="status" label="Estado" options={optionsFromLabels(IDEA_STATUS_LABELS)} />
                  <RHFSelect control={control} name="priority" label="Prioridad" options={optionsFromLabels(PRIORITY_LABELS)} />
                  <RHFSelect control={control} name="responsible" label="Responsable" required options={RESPONSIBLE_OPTIONS} error={errors.responsible?.message} className="sm:col-span-2" />
                </div>
              </TabsContent>

              {/* Producción */}
              <TabsContent value="produccion" className="mt-0 grid grid-cols-1 gap-4">
                <Field label="Copy">
                  <Textarea rows={3} {...register("copy")} placeholder="Texto final de la pieza…" />
                </Field>
                <Field label="Referencias">
                  <Textarea rows={2} {...register("references")} placeholder="Links o notas de referencia" />
                </Field>
                <Field label="Guion">
                  <Textarea rows={3} {...register("script")} placeholder="Guion para reel/video…" />
                </Field>
                <Field label="Visual direction">
                  <Textarea rows={2} {...register("designNotes")} placeholder="Dirección visual / notas de diseño" />
                </Field>
                <Field label="Notas internas">
                  <Textarea rows={2} {...register("notes")} />
                </Field>
                <Field label="Link de referencia (Canva, Figma, Drive…)">
                  <Input {...register("externalUrl")} placeholder="https://…" />
                </Field>
              </TabsContent>

              {/* Programación */}
              <TabsContent value="programacion" className="mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fecha sugerida">
                  <Input type="date" {...register("suggestedDate")} />
                </Field>
                <Field label="Fecha de publicación">
                  <Input type="date" {...register("publishDate")} />
                </Field>
              </TabsContent>

              {/* Avanzado */}
              <TabsContent value="avanzado" className="mt-0 grid grid-cols-1 gap-4">
                <RHFSelect control={control} name="category" label="Categoría" options={optionsFromLabels(IDEA_CATEGORY_LABELS)} />
                <Field label="Prompt asociado">
                  <Textarea rows={2} {...register("prompt")} />
                </Field>
                <Field label="Imágenes de la pieza" hint="La primera es la portada. Para carruseles, agrega varias.">
                  <Controller control={control} name="images" render={({ field }) => (
                    <GalleryUpload value={field.value} onChange={field.onChange} folder="pieces" />
                  )} />
                </Field>
              </TabsContent>
            </div>
          </Tabs>

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
              <Button type="submit">{idea ? "Guardar cambios" : "Crear idea"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
