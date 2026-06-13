import {
  differenceInCalendarDays,
  isBefore,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  HEALTH_LABELS,
  MONTH_LABELS,
  type Client,
  type ClientAccess,
  type ClientMetric,
  type Idea,
  type Task,
} from "./types";

// Estados de idea que cuentan como "activas" en dashboards.
// "pausada" y "archivada" NO son activas.
export const ACTIVE_IDEA_STATUSES = [
  "idea",
  "validada",
  "en_produccion",
  "en_revision_interna",
  "en_revision_cliente",
  "aprobada",
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

// Pieza vencida: tiene fecha pasada y aún no se publicó (ni pausó/archivó).
export function isIdeaOverdue(idea: Idea, now = new Date()): boolean {
  const date = ideaDate(idea);
  if (!date) return false;
  if (!isIdeaActive(idea) || idea.status === "publicada") return false;
  return isBefore(parseISO(date), startOfDay(now));
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

// Alertas operativas derivadas de un cliente (Vista 360 + dashboard + lista).
export function clientAlerts(
  client: Client,
  ideas: Idea[],
  tasks: Task[],
  metrics: ClientMetric[] = [],
  accesses: ClientAccess[] = [],
  now = new Date(),
): string[] {
  const alerts: string[] = [];
  if (client.healthStatus === "critico" || client.healthStatus === "atrasado") {
    alerts.push(`Health ${HEALTH_LABELS[client.healthStatus].toLowerCase()}`);
  }
  if (!client.nextAction.trim()) {
    alerts.push("Sin próxima acción definida");
  }
  const daysSinceUpdate = differenceInCalendarDays(now, parseISO(client.lastUpdate));
  if (daysSinceUpdate > 7) {
    alerts.push(`Sin actualización hace ${daysSinceUpdate} días`);
  }
  const overdue = tasks.filter(
    (t) => t.clientId === client.id && isTaskOverdue(t, now),
  ).length;
  if (overdue > 0) {
    alerts.push(`${overdue} tarea${overdue > 1 ? "s" : ""} atrasada${overdue > 1 ? "s" : ""}`);
  }
  const undated = ideas.filter(
    (i) => i.clientId === client.id && isIdeaActive(i) && !ideaDate(i),
  ).length;
  if (undated > 0) {
    alerts.push(`${undated} contenido${undated > 1 ? "s" : ""} sin fecha`);
  }
  // Piezas esperando al cliente hace más de 5 días
  const stuckInClientReview = ideas.filter(
    (i) =>
      i.clientId === client.id &&
      i.status === "en_revision_cliente" &&
      differenceInCalendarDays(now, parseISO(i.updatedAt)) > 5,
  ).length;
  if (stuckInClientReview > 0) {
    alerts.push(
      `${stuckInClientReview} pieza${stuckInClientReview > 1 ? "s" : ""} en revisión cliente hace +5 días`,
    );
  }
  // Métricas del mes actual sin registrar (solo clientes activos)
  if (client.status === "activo" && metrics.length >= 0) {
    const hasCurrentMonth = metrics.some(
      (m) =>
        m.clientId === client.id &&
        m.periodMonth === now.getMonth() + 1 &&
        m.periodYear === now.getFullYear(),
    );
    if (!hasCurrentMonth) {
      alerts.push(`Métricas de ${MONTH_LABELS[now.getMonth()].toLowerCase()} sin registrar`);
    }
  }
  // Accesos sin resolver
  const pendingAccess = accesses.filter(
    (a) =>
      a.clientId === client.id &&
      (a.status === "pendiente" || a.status === "solicitado" || a.status === "problema"),
  ).length;
  if (pendingAccess > 0) {
    alerts.push(`${pendingAccess} acceso${pendingAccess > 1 ? "s" : ""} pendiente${pendingAccess > 1 ? "s" : ""}`);
  }
  return alerts;
}

// Progreso operativo semiautomático (Vista 360).
export interface OperationalProgress {
  production: number; // % piezas activas que ya están programadas/publicadas/aprobadas
  tasks: number; // % tareas completadas
  calendar: number; // % piezas activas con fecha
  overall: number; // combinado con el progreso manual del cliente
}

export function clientOperationalProgress(
  client: Client,
  ideas: Idea[],
  tasks: Task[],
  metrics: ClientMetric[],
  now = new Date(),
): OperationalProgress {
  const clientIdeas = ideas.filter((i) => i.clientId === client.id);
  const active = clientIdeas.filter(isIdeaActive);
  const advanced = active.filter((i) =>
    ["aprobada", "programada"].includes(i.status),
  ).length;
  const published = clientIdeas.filter((i) => i.status === "publicada").length;
  const production = active.length + published
    ? Math.round(((advanced + published) / (active.length + published)) * 100)
    : 0;

  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const tasksPct = clientTasks.length
    ? Math.round(
        (clientTasks.filter((t) => t.status === "completada").length /
          clientTasks.length) *
          100,
      )
    : 0;

  const calendar = active.length
    ? Math.round((active.filter((i) => Boolean(ideaDate(i))).length / active.length) * 100)
    : 0;

  const metricsUpToDate = metrics.some(
    (m) =>
      m.clientId === client.id &&
      m.periodMonth === now.getMonth() + 1 &&
      m.periodYear === now.getFullYear(),
  );

  // Combinado: progreso manual 40%, producción 25%, tareas 15%, calendario 10%,
  // higiene operativa 10% (métricas al día + próxima acción definida).
  const hygiene =
    (metricsUpToDate ? 50 : 0) + (client.nextAction.trim() ? 50 : 0);
  const overall = Math.round(
    client.progressPercentage * 0.4 +
      production * 0.25 +
      tasksPct * 0.15 +
      calendar * 0.1 +
      hygiene * 0.1,
  );

  return { production, tasks: tasksPct, calendar, overall };
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
