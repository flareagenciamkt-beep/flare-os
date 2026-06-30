import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { alertSeverity, type AlertSeverity } from "@/lib/stats";

// Chip de alerta operativa que comunica severidad con icono + color + texto
// (no solo color), para accesibilidad. Acepta el string de clientAlerts().

const STYLES: Record<AlertSeverity, { cls: string; icon: typeof Info }> = {
  info: {
    cls: "border-[rgba(142,91,255,0.3)] bg-[rgba(142,91,255,0.1)] text-[#C798FF]",
    icon: Info,
  },
  warning: {
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    icon: AlertTriangle,
  },
  critical: {
    cls: "border-red-500/30 bg-red-500/10 text-red-400",
    icon: AlertOctagon,
  },
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  info: "Información",
  warning: "Advertencia",
  critical: "Crítico",
};

export function AlertChip({ message }: { message: string }) {
  const severity = alertSeverity(message);
  const { cls, icon: Icon } = STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <Icon className="size-3" aria-hidden />
      <span className="sr-only">{SEVERITY_LABEL[severity]}:</span>
      {message}
    </span>
  );
}
