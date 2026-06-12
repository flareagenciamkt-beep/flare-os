"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ExternalLink,
  Pencil,
  Plus,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ClientStatusBadge,
  HealthBadge,
  PhaseBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { ClientFormDialog } from "@/components/forms/client-form";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { TaskFormDialog } from "@/components/forms/task-form";
import { ResourceFormDialog } from "@/components/forms/resource-form";
import { FeedView } from "@/components/ideas/feed-view";
import { IdeasTable } from "@/components/ideas/ideas-table";
import { KanbanBoard } from "@/components/ideas/kanban-board";
import { CalendarView } from "@/components/ideas/calendar-view";
import { TasksTable } from "@/components/tasks/tasks-table";
import { MetricsPanel } from "@/components/metrics/metrics-panel";
import { ResourceCard } from "@/components/library/resource-card";
import { PortalAccessCard } from "@/components/clients/portal-access-card";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { summarizeClient } from "@/lib/stats";
import { PHASE_LABELS, type Idea, type Resource, type Task } from "@/lib/types";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "metricas", label: "Métricas" },
  { value: "ideas", label: "Ideas" },
  { value: "feed", label: "Feed" },
  { value: "kanban", label: "Kanban" },
  { value: "calendario", label: "Calendario" },
  { value: "tareas", label: "Tareas" },
  { value: "recursos", label: "Recursos" },
  { value: "notas", label: "Notas" },
];

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const store = useFlare();
  const { clients, ideas, tasks, resources, updateClient } = store;
  const client = clients.find((c) => c.id === id);

  const [editClientOpen, setEditClientOpen] = React.useState(false);
  const [ideaFormOpen, setIdeaFormOpen] = React.useState(false);
  const [editingIdea, setEditingIdea] = React.useState<Idea | null>(null);
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [resourceFormOpen, setResourceFormOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null);
  const [notesDraft, setNotesDraft] = React.useState<string | null>(null);

  if (!client) {
    return (
      <EmptyState
        icon={Building2}
        title="Cliente no encontrado"
        description="Puede que haya sido eliminado."
        action={
          <Button variant="outline" size="sm" render={<Link href="/clients" />}>
            <ArrowLeft data-icon="inline-start" />
            Volver a clientes
          </Button>
        }
      />
    );
  }

  const clientIdeas = ideas.filter((i) => i.clientId === client.id);
  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const clientResources = resources.filter((r) => r.clientId === client.id);
  const summary = summarizeClient(client.id, ideas, tasks);

  const openIdeaForm = (idea: Idea | null) => {
    setEditingIdea(idea);
    setIdeaFormOpen(true);
  };
  const openTaskForm = (task: Task | null) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={client.brand}
        description={`${client.name} · ${client.industry}`}
        actions={
          <>
            <Button variant="outline" size="sm" render={<Link href="/clients" />}>
              <ArrowLeft data-icon="inline-start" />
              Clientes
            </Button>
            <Button size="sm" onClick={() => setEditClientOpen(true)}>
              <Pencil data-icon="inline-start" />
              Editar cliente
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ClientStatusBadge status={client.status} />
        <HealthBadge health={client.healthStatus} />
        <PhaseBadge phase={client.currentPhase} />
        <PriorityBadge priority={client.priority} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          Última actualización: {formatDate(client.lastUpdate)}
        </span>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen" className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Ideas activas" value={summary.activeIdeas} tone="flare" />
            <StatCard label="Programados" value={summary.scheduled} />
            <StatCard label="Publicados" value={summary.published} tone="success" />
            <StatCard label="Tareas pendientes" value={summary.openTasks} />
            <StatCard
              label="Tareas atrasadas"
              value={summary.overdueTasks}
              tone={summary.overdueTasks ? "danger" : "default"}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Progreso general">
              <div className="flex items-center gap-3">
                <Progress value={client.progressPercentage} className="flex-1" />
                <span className="text-lg font-semibold tabular-nums">
                  {client.progressPercentage}%
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Fase actual: {PHASE_LABELS[client.currentPhase]}
              </p>
            </InfoCard>

            <InfoCard title="Objetivo principal">
              <p className="flex items-start gap-2 text-sm">
                <Target className="mt-0.5 size-4 shrink-0 text-flare" />
                {client.mainGoal || "Sin definir"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                KPI principal: {client.mainKpi || "Sin definir"}
              </p>
            </InfoCard>

            <InfoCard title="Próxima acción">
              <p className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-amber-400" />
                {client.nextAction || "Sin definir"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Responsable: {client.owner}
              </p>
            </InfoCard>

            <InfoCard title="Objetivos del mes">
              <p className="text-sm">{client.monthlyGoal || "Sin definir"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Contenido: {client.contentGoal || "Sin definir"}
              </p>
            </InfoCard>

            <InfoCard title="Descripción">
              <p className="text-sm text-muted-foreground">
                {client.description || "Sin descripción"}
              </p>
            </InfoCard>

            <InfoCard title="Links importantes">
              {client.importantLinks.length ? (
                <div className="space-y-1.5">
                  {client.importantLinks.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-flare-soft hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin links guardados.</p>
              )}
            </InfoCard>

            <PortalAccessCard clientId={client.id} />
          </div>
        </TabsContent>

        <TabsContent value="metricas" className="pt-4">
          <MetricsPanel clientId={client.id} />
        </TabsContent>

        <TabsContent value="ideas" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button size="sm" onClick={() => openIdeaForm(null)}>
              <Plus data-icon="inline-start" />
              Nueva idea
            </Button>
          </div>
          <IdeasTable ideas={clientIdeas} onEdit={openIdeaForm} showClient={false} />
        </TabsContent>

        <TabsContent value="feed" className="pt-4">
          <FeedView
            ideas={clientIdeas}
            onEdit={openIdeaForm}
            showClient={false}
            defaultMode="preview"
            previewLabel={client.brand}
          />
        </TabsContent>

        <TabsContent value="kanban" className="pt-4">
          <KanbanBoard ideas={clientIdeas} onEdit={openIdeaForm} showClient={false} />
        </TabsContent>

        <TabsContent value="calendario" className="pt-4">
          <CalendarView ideas={clientIdeas} onEdit={openIdeaForm} showClient={false} />
        </TabsContent>

        <TabsContent value="tareas" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button size="sm" onClick={() => openTaskForm(null)}>
              <Plus data-icon="inline-start" />
              Nueva tarea
            </Button>
          </div>
          <TasksTable tasks={clientTasks} onEdit={openTaskForm} showClient={false} />
        </TabsContent>

        <TabsContent value="recursos" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setEditingResource(null);
                setResourceFormOpen(true);
              }}
            >
              <Plus data-icon="inline-start" />
              Nuevo recurso
            </Button>
          </div>
          {clientResources.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clientResources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  showClient={false}
                  onEdit={(res) => {
                    setEditingResource(res);
                    setResourceFormOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin recursos para este cliente"
              description="Guarda prompts, referencias y materiales del cliente."
            />
          )}
        </TabsContent>

        <TabsContent value="notas" className="pt-4">
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-semibold">Notas internas</p>
              <Textarea
                rows={10}
                value={notesDraft ?? client.internalNotes}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Notas internas del equipo sobre este cliente..."
              />
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  disabled={notesDraft === null || notesDraft === client.internalNotes}
                  onClick={() => {
                    updateClient(client.id, { internalNotes: notesDraft ?? "" });
                    setNotesDraft(null);
                    toast.success("Notas guardadas");
                  }}
                >
                  Guardar notas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClientFormDialog
        open={editClientOpen}
        onOpenChange={setEditClientOpen}
        client={client}
      />
      <IdeaFormDialog
        open={ideaFormOpen}
        onOpenChange={setIdeaFormOpen}
        idea={editingIdea}
        defaultClientId={client.id}
      />
      <TaskFormDialog
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        task={editingTask}
        defaultClientId={client.id}
      />
      <ResourceFormDialog
        open={resourceFormOpen}
        onOpenChange={setResourceFormOpen}
        resource={editingResource}
        defaultClientId={client.id}
      />
    </div>
  );
}
