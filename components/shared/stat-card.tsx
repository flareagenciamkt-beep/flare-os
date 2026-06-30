import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { InfoHint } from "@/components/shared/info-hint";

export interface StatTrend {
  label: string;
  direction: "up" | "down" | "flat";
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "flare" | "success" | "warning" | "danger";
  /** Texto de ayuda contextual (muestra un icono de info junto al label). */
  info?: string;
  /** Variación vs período anterior, con dirección (icono + color). */
  trend?: StatTrend;
}

const TREND_STYLES: Record<StatTrend["direction"], { cls: string; icon: LucideIcon }> = {
  up: { cls: "text-[#3DD68C]", icon: ArrowUpRight },
  down: { cls: "text-[#FF5C5C]", icon: ArrowDownRight },
  flat: { cls: "text-[#A39A91]", icon: Minus },
};

const TONE_STYLES = {
  default: "text-[#F1E9E0]",
  flare: "flare-gradient-text",
  success: "text-[#3DD68C]",
  warning: "text-[#FFC247]",
  danger: "text-[#FF5C5C]",
};

const ACCENT_BARS: Record<string, string> = {
  default: "linear-gradient(90deg, rgba(241,233,224,0.15), transparent)",
  flare: "linear-gradient(90deg, #F52A6C, #FF6A35)",
  success: "linear-gradient(90deg, #3DD68C, rgba(61,214,140,0.2))",
  warning: "linear-gradient(90deg, #FFC247, rgba(255,194,71,0.2))",
  danger: "linear-gradient(90deg, #FF5C5C, rgba(255,92,92,0.2))",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default", info, trend }: StatCardProps) {
  const TrendIcon = trend ? TREND_STYLES[trend.direction].icon : null;
  return (
    <div
      className="animate-fade-up relative overflow-hidden rounded-[18px] px-[22px] pb-[18px] pt-5 transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
      style={{
        background: "linear-gradient(165deg, #14110F, #0E0C0B)",
        border: "1px solid rgba(241,233,224,0.08)",
      }}
    >
      <div className="absolute left-[22px] right-[22px] top-0 h-[2px]" style={{ background: ACCENT_BARS[tone] }} />
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#a39990" }}>
          {label}
          {info && <InfoHint text={info} />}
        </span>
        {Icon && <Icon className="size-4" style={{ color: "#6e665f" }} />}
      </div>
      <p
        className={cn(
          "mt-3.5 text-[40px] font-semibold leading-[0.95]",
          TONE_STYLES[tone],
        )}
        style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.5px" }}
      >
        {value}
      </p>
      {trend && TrendIcon && (
        <p className={cn("mt-3 flex items-center gap-1 text-xs font-medium", TREND_STYLES[trend.direction].cls)}>
          <TrendIcon className="size-3.5" aria-hidden />
          {trend.label}
        </p>
      )}
      {hint && (
        <p className={cn("text-xs", trend ? "mt-1" : "mt-3")} style={{ color: "#A39A91" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
