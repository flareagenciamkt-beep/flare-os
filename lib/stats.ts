import { isBefore, isSameMonth, parseISO, startOfDay } from "date-fns";
import type { Client, Idea, Task } from "./types";

// Estados de idea que cuentan como "activas" en dashboards.
export const ACTIVE_IDEA_STATUSES = [
  "idea",
  "validada",
  "en_produccion",
  "en_revision",
  "programada",
] as const;

export function isIdeaActive(idea: Idea) {
  return (ACTIVE_IDEA_STATUSES as readonly string[]).includes(idea.status);
}

export function isTaskOpen(task: Task) {
  return task.status !== "completada";
}

export function isTaskOverdue(task: Task, now = new Date()) {
  if (!task.dueDate || task.status === "completada") return false;
  return isBefore(parseISO(task.dueDate), startOfDay(now));
}

export function publishedThisMonth(ideas: Idea[], now = new Date()) {
  return ideas.filter(
    (i) =>
      i.status === "publicada" &&
      i.publishDate &&
      isSameMonth(parseISO(i.publishDate), now),
  );
}

export function ideaDate(idea: Idea): string | null {
  return idea.publishDate ?? idea.suggestedDate;
}

export function isClientAtRisk(client: Client) {
  return client.healthStatus === "atrasado" || client.healthStatus === "critico";
}

export interface ClientSummary {
  activeIdeas: number;
  scheduled: number;
  published: number;
  openTasks: number;
  overdueTasks: number;
}

export function summarizeClient(
  clientId: string,
  ideas: Idea[],
  tasks: Task[],
): ClientSummary {
  const clientIdeas = ideas.filter((i) => i.clientId === clientId);
  const clientTasks = tasks.filter((t) => t.clientId === clientId);
  return {
    activeIdeas: clientIdeas.filter(isIdeaActive).length,
    scheduled: clientIdeas.filter((i) => i.status === "programada").length,
    published: clientIdeas.filter((i) => i.status === "publicada").length,
    openTasks: clientTasks.filter(isTaskOpen).length,
    overdueTasks: clientTasks.filter((t) => isTaskOverdue(t)).length,
  };
}

export function averageProgress(clients: Client[]) {
  const active = clients.filter((c) => c.status === "activo");
  if (!active.length) return 0;
  return Math.round(
    active.reduce((sum, c) => sum + c.progressPercentage, 0) / active.length,
  );
}

export function countBy<T>(items: T[], key: (item: T) => string) {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
