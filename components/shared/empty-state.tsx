import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
