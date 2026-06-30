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
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-medium tracking-[0.6px]",
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
    prospecto: "border-[rgba(142,91,255,0.26)] bg-[rgba(142,91,255,0.08)] text-[#C798FF]",
    onboarding: "border-[rgba(80,160,255,0.26)] bg-[rgba(80,160,255,0.08)] text-[#7FB4FF]",
    activo: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
    pausado: "border-[rgba(255,194,71,0.26)] bg-[rgba(255,194,71,0.08)] text-[#FFC247]",
    cerrado: "border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#6e665f]",
    perdido: "border-[rgba(255,92,92,0.28)] bg-[rgba(255,92,92,0.08)] text-[#FF5C5C]",
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
    bien: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
    observacion: "border-[rgba(255,194,71,0.26)] bg-[rgba(255,194,71,0.08)] text-[#FFC247]",
    riesgo: "border-[rgba(255,106,53,0.26)] bg-[rgba(255,106,53,0.08)] text-[#FF6A35]",
    critico: "border-[rgba(255,92,92,0.28)] bg-[rgba(255,92,92,0.08)] text-[#FF5C5C]",
    pausado: "border-[rgba(241,233,224,0.12)] bg-[rgba(241,233,224,0.04)] text-[#a39990]",
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
    baja: "border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#A39A91]",
    media: "border-[rgba(142,91,255,0.26)] bg-[rgba(142,91,255,0.08)] text-[#C798FF]",
    alta: "border-[rgba(255,106,53,0.26)] bg-[rgba(255,106,53,0.08)] text-[#FF6A35]",
    urgente: "border-[rgba(255,92,92,0.28)] bg-[rgba(255,92,92,0.08)] text-[#FF5C5C]",
  };
  return <Pill className={styles[priority]}>{PRIORITY_LABELS[priority]}</Pill>;
}

export function PhaseBadge({ phase }: { phase: ClientPhase }) {
  return (
    <Pill className="border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#D8CFC5]">
      {PHASE_LABELS[phase]}
    </Pill>
  );
}

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  const styles: Record<IdeaStatus, string> = {
    idea: "border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#A39A91]",
    en_produccion: "border-[rgba(245,42,108,0.3)] bg-[rgba(245,42,108,0.08)] text-[#ff7da4]",
    en_revision_interna: "border-[rgba(142,91,255,0.26)] bg-[rgba(142,91,255,0.08)] text-[#C798FF]",
    en_revision_cliente: "border-[rgba(255,194,71,0.26)] bg-[rgba(255,194,71,0.08)] text-[#FFC247]",
    aprobada: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
    programada: "border-[rgba(255,106,53,0.26)] bg-[rgba(255,106,53,0.08)] text-[#FF6A35]",
    publicada: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
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
    pendiente: "border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#A39A91]",
    en_progreso: "border-[rgba(245,42,108,0.3)] bg-[rgba(245,42,108,0.08)] text-[#ff7da4]",
    bloqueada: "border-[rgba(255,92,92,0.28)] bg-[rgba(255,92,92,0.08)] text-[#FF5C5C]",
    en_revision: "border-[rgba(142,91,255,0.26)] bg-[rgba(142,91,255,0.08)] text-[#C798FF]",
    completada: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
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
    activo: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
    borrador: "border-[rgba(255,194,71,0.26)] bg-[rgba(255,194,71,0.08)] text-[#FFC247]",
    archivado: "border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#6e665f]",
  };
  return <Pill className={styles[status]}>{PROCESS_STATUS_LABELS[status]}</Pill>;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <Pill className="border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#A39A91]">
      {CHANNEL_LABELS[channel]}
    </Pill>
  );
}

export function FormatBadge({ format }: { format: IdeaFormat }) {
  return (
    <Pill className="border-[rgba(241,233,224,0.1)] bg-[rgba(241,233,224,0.03)] text-[#A39A91]">
      {FORMAT_LABELS[format]}
    </Pill>
  );
}

export function ApprovalBadge({ approval }: { approval?: ClientApproval }) {
  if (!approval || approval === "pendiente") return null;
  const styles: Record<Exclude<ClientApproval, "pendiente">, string> = {
    aprobada: "border-[rgba(61,214,140,0.26)] bg-[rgba(61,214,140,0.08)] text-[#3DD68C]",
    cambios_solicitados: "border-[rgba(255,194,71,0.26)] bg-[rgba(255,194,71,0.08)] text-[#FFC247]",
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
    <Pill className="border-[rgba(241,233,224,0.08)] bg-[rgba(241,233,224,0.02)] text-[#8a827a]">
      #{tag}
    </Pill>
  );
}
