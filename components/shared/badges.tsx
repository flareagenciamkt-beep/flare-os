import { cn } from "@/lib/utils";
import {
  CHANNEL_LABELS,
  CLIENT_APPROVAL_LABELS,
  CLIENT_STATUS_LABELS,
  FORMAT_LABELS,
  HEALTH_LABELS,
  IDEA_STATUS_LABELS,
  PHASE_LABELS,
  PRIORITY_LABELS,
  PROCESS_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type Channel,
  type ClientApproval,
  type ClientPhase,
  type ClientStatus,
  type HealthStatus,
  type IdeaFormat,
  type IdeaStatus,
  type Priority,
  type ProcessStatus,
  type TaskStatus,
} from "@/lib/types";

function Pill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

const DOT = <span className="size-1.5 rounded-full bg-current" />;

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const styles: Record<ClientStatus, string> = {
    activo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    pausado: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    prospecto: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    cerrado: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };
  return (
    <Pill className={styles[status]}>
      {DOT}
      {CLIENT_STATUS_LABELS[status]}
    </Pill>
  );
}

export function HealthBadge({ health }: { health: HealthStatus }) {
  const styles: Record<HealthStatus, string> = {
    bien: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    atencion: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    atrasado: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    critico: "border-red-500/30 bg-red-500/10 text-red-400",
  };
  return (
    <Pill className={styles[health]}>
      {DOT}
      {HEALTH_LABELS[health]}
    </Pill>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    baja: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    media: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    alta: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    urgente: "border-red-500/30 bg-red-500/10 text-red-400",
  };
  return <Pill className={styles[priority]}>{PRIORITY_LABELS[priority]}</Pill>;
}

export function PhaseBadge({ phase }: { phase: ClientPhase }) {
  return (
    <Pill className="border-border bg-secondary text-foreground/80">
      {PHASE_LABELS[phase]}
    </Pill>
  );
}

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  const styles: Record<IdeaStatus, string> = {
    idea: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    validada: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    en_produccion: "border-flare/40 bg-flare/10 text-flare-soft",
    en_revision: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    programada: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    publicada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    archivada: "border-zinc-600/30 bg-zinc-600/10 text-zinc-500",
  };
  return (
    <Pill className={styles[status]}>
      {DOT}
      {IDEA_STATUS_LABELS[status]}
    </Pill>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    pendiente: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
    en_progreso: "border-flare/40 bg-flare/10 text-flare-soft",
    bloqueada: "border-red-500/30 bg-red-500/10 text-red-400",
    en_revision: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    completada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };
  return (
    <Pill className={styles[status]}>
      {DOT}
      {TASK_STATUS_LABELS[status]}
    </Pill>
  );
}

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const styles: Record<ProcessStatus, string> = {
    activo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    borrador: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    archivado: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };
  return <Pill className={styles[status]}>{PROCESS_STATUS_LABELS[status]}</Pill>;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <Pill className="border-border bg-secondary text-foreground/70">
      {CHANNEL_LABELS[channel]}
    </Pill>
  );
}

export function FormatBadge({ format }: { format: IdeaFormat }) {
  return (
    <Pill className="border-border bg-secondary text-foreground/70">
      {FORMAT_LABELS[format]}
    </Pill>
  );
}

// No muestra nada en "pendiente": solo señales accionables para el equipo.
export function ApprovalBadge({ approval }: { approval?: ClientApproval }) {
  if (!approval || approval === "pendiente") return null;
  const styles: Record<Exclude<ClientApproval, "pendiente">, string> = {
    aprobada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    cambios_solicitados: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };
  return (
    <Pill className={styles[approval]}>
      {DOT}
      {CLIENT_APPROVAL_LABELS[approval]}
    </Pill>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Pill className="border-border bg-secondary text-muted-foreground">#{tag}</Pill>
  );
}
