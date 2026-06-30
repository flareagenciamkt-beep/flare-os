"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, RHFSelect } from "@/components/shared/form-field";
import { TaskStatusBadge } from "@/components/shared/badges";
import { useClientOptions } from "@/components/shared/use-client-options";
import { useFlare } from "@/lib/store";
import {
  nullableClientId,
  nullableDate,
  taskSchema,
  type TaskFormValues,
} from "@/lib/schemas";
import { TASK_TYPE_OPTIONS } from "@/lib/form-options";
import {
  PRIORITY_LABELS,
  TASK_AREA_OPTIONS,
  TASK_STATUS_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Task,
  type TaskChecklistItem,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultClientId?: string | null;
  defaultIdeaId?: string;
  defaultMeetingId?: string;
}

function toValues(
  task: Task | null | undefined,
  defaultClientId: string | null | undefined,
  defaultIdeaId: string | undefined,
  defaultMeetingId: string | undefined,
): TaskFormValues {
  if (task) {
    return {
      clientId: task.clientId ?? "none",
      ideaId: task.ideaId ?? "none",
      meetingId: task.meetingId ?? "none",
      taskType: task.taskType ?? "",
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      responsible: task.responsible,
      dueDate: task.dueDate ?? "",
      area: task.area,
      notes: task.notes,
      relatedLink: task.relatedLink,
    };
  }
  return {
    clientId: defaultClientId ?? "none",
    ideaId: defaultIdeaId ?? "none",
    meetingId: defaultMeetingId ?? "none",
    taskType: "",
    title: "",
    description: "",
    status: "pendiente",
    priority: "media",
    responsible: TEAM_MEMBERS[0],
    dueDate: "",
    area: "contenido",
    notes: "",
    relatedLink: "",
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultClientId,
  defaultIdeaId,
  defaultMeetingId,
}: TaskFormDialogProps) {
  const { addTask, updateTask, ideas, meetings } = useFlare();
  const clientOptions = useClientOptions();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toValues(task, defaultClientId, defaultIdeaId, defaultMeetingId),
  });
  const { register, control, handleSubmit, reset, setValue, getValues, formState } = form;
  const errors = formState.errors;

  const [checklist, setChecklist] = React.useState<TaskChecklistItem[]>([]);
  const [initialChecklistJson, setInitialChecklistJson] = React.useState("[]");

  React.useEffect(() => {
    if (open) {
      reset(toValues(task, defaultClientId, defaultIdeaId, defaultMeetingId));
      const ck = task?.checklist ?? [];
      /* eslint-disable react-hooks/set-state-in-effect */
      setInitialChecklistJson(JSON.stringify(ck));
      setChecklist(ck);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, task, defaultClientId, defaultIdeaId, defaultMeetingId, reset]);

  const selectedClientId = useWatch({ control, name: "clientId" });
  const taskType = useWatch({ control, name: "taskType" });
  const ideaId = useWatch({ control, name: "ideaId" });
  const title = useWatch({ control, name: "title" });
  const status = useWatch({ control, name: "status" });

  const ideaOptions = React.useMemo(() => {
    const wanted = selectedClientId === "none" ? null : selectedClientId;
    const relevant = ideas.filter((i) => i.clientId === wanted);
    return [
      { value: "none", label: "Sin contenido asociado" },
      ...relevant.map((i) => ({ value: i.id, label: i.title })),
    ];
  }, [ideas, selectedClientId]);

  const meetingOptions = React.useMemo(() => {
    const relevant =
      selectedClientId === "none"
        ? []
        : meetings.filter((m) => m.clientId === selectedClientId);
    return [
      { value: "none", label: "Sin reunión asociada" },
      ...relevant.map((m) => ({
        value: m.id,
        label: `${m.type || "Reunión"} · ${m.meetingDate}`,
      })),
    ];
  }, [meetings, selectedClientId]);

  // Autogenerar título según tipo de tarea + contenido asociado.
  const generateTitle = () => {
    const type = getValues("taskType");
    const idea = ideas.find((i) => i.id === getValues("ideaId"));
    if (!type && !idea) return;
    const generated = idea ? `${type || "Tarea"}: ${idea.title}` : type;
    setValue("title", generated, { shouldDirty: true });
  };

  const checklistChanged = JSON.stringify(checklist) !== initialChecklistJson;
  const isDirty = formState.isDirty || checklistChanged;

  const requestClose = (next: boolean) => {
    if (!next && isDirty) {
      if (!window.confirm("Tienes cambios sin guardar. ¿Cerrar de todas formas?")) return;
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      clientId: nullableClientId(values.clientId),
      ideaId: values.ideaId === "none" ? null : values.ideaId,
      meetingId: values.meetingId === "none" ? null : values.meetingId,
      dueDate: nullableDate(values.dueDate),
      checklist: checklist.filter((c) => c.text.trim()),
    };
    if (task) {
      updateTask(task.id, data);
      toast.success("Tarea actualizada");
    } else {
      addTask(data);
      toast.success("Tarea creada");
    }
    onOpenChange(false);
  });

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b border-border px-5 pb-4 pt-5 pr-12">
          <DialogTitle className="truncate text-lg font-semibold" style={{ fontFamily: "var(--font-display), sans-serif" }}>
            {title || (task ? "Editar tarea" : "Nueva tarea")}
          </DialogTitle>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {taskType && <span className="text-xs text-muted-foreground">{taskType}</span>}
            <TaskStatusBadge status={status as TaskStatus} />
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RHFSelect control={control} name="clientId" label="Cliente" options={clientOptions} />
              <RHFSelect control={control} name="taskType" label="Tipo de tarea" options={TASK_TYPE_OPTIONS} placeholder="Selecciona tipo" />
              <RHFSelect control={control} name="ideaId" label="Contenido asociado" options={ideaOptions} />
              <RHFSelect control={control} name="meetingId" label="Reunión asociada" options={meetingOptions} />
            </div>

            <Field label="Título" required error={errors.title?.message}>
              <div className="flex gap-2">
                <Input {...register("title")} placeholder="Ej: Diseñar carrusel de testimonios" aria-invalid={!!errors.title} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!taskType && (!ideaId || ideaId === "none")}
                  onClick={generateTitle}
                  title="Autogenerar título según tipo y contenido"
                >
                  <Wand2 data-icon="inline-start" />
                  Autogenerar
                </Button>
              </div>
            </Field>

            <Field label="Descripción">
              <Textarea rows={2} {...register("description")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RHFSelect control={control} name="status" label="Estado" options={optionsFromLabels(TASK_STATUS_LABELS)} />
              <RHFSelect control={control} name="priority" label="Prioridad" options={optionsFromLabels(PRIORITY_LABELS)} />
              <RHFSelect control={control} name="area" label="Área" options={TASK_AREA_OPTIONS} />
              <RHFSelect control={control} name="responsible" label="Responsable" required options={RESPONSIBLE_OPTIONS} error={errors.responsible?.message} />
              <Field label="Fecha límite">
                <Input type="date" {...register("dueDate")} />
              </Field>
              <Field label="Link relacionado">
                <Input {...register("relatedLink")} placeholder="https://…" />
              </Field>
            </div>

            {/* Checklist opcional */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="size-3.5 text-flare" />
                  Checklist {checklist.length > 0 && `· ${doneCount}/${checklist.length}`}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setChecklist((p) => [...p, { id: newId(), text: "", done: false }])}
                >
                  <Plus data-icon="inline-start" />
                  Añadir ítem
                </Button>
              </div>
              {checklist.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-secondary/20 px-3 py-3 text-center text-[11px] text-muted-foreground">
                  Sin ítems. Añade pasos para desglosar la tarea.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={item.done ? "Marcar pendiente" : "Marcar hecho"}
                        onClick={() =>
                          setChecklist((p) => p.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)))
                        }
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border",
                          item.done ? "flare-gradient border-transparent text-white" : "border-input",
                        )}
                      >
                        {item.done && <Check className="size-3" />}
                      </button>
                      <Input
                        value={item.text}
                        onChange={(e) =>
                          setChecklist((p) => p.map((c) => (c.id === item.id ? { ...c, text: e.target.value } : c)))
                        }
                        placeholder="Paso de la tarea…"
                        className={cn("h-8 text-xs", item.done && "line-through opacity-60")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Quitar ítem"
                        onClick={() => setChecklist((p) => p.filter((c) => c.id !== item.id))}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Notas">
              <Textarea rows={2} {...register("notes")} />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {isDirty && (
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
              <Button type="submit">{task ? "Guardar cambios" : "Crear tarea"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
