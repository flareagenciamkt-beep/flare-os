import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "flare" | "success" | "warning" | "danger";
}

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

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
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
        <span className="font-mono text-[9.5px] uppercase tracking-[1.6px]" style={{ color: "#8a827a" }}>
          {label}
        </span>
        {Icon && <Icon className="size-4" style={{ color: "#6e665f" }} />}
      </div>
      <p
        className={cn(
          "mt-3.5 text-[40px] font-extrabold leading-[0.9] tracking-tight",
          TONE_STYLES[tone],
        )}
        style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-1.5px" }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-3 text-xs" style={{ color: "#A39A91" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
