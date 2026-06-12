import { Card, CardContent } from "@/components/ui/card";
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
  default: "text-foreground",
  flare: "text-flare-soft",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <p className={cn("mt-2 text-2xl font-semibold tracking-tight", TONE_STYLES[tone])}>
          {value}
        </p>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
