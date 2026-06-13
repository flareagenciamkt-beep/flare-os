"use client";

// Vista 360 del cliente (V1.1): ficha completa y operativa de cada marca.

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ExternalLink,
  Lightbulb,
  Pencil,
  Plus,
  StickyNote,
  Target,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ClientStatusBadge,
  HealthBadge,
  IdeaStatusBadge,
  PhaseBadge,
  PriorityBadge,
  TaskStatusBadge,
} from "@/components/shared/badges";
import { ClientFormDialog } from "@/components/forms/client-form";
import { IdeaFormDialog } from "@/components/forms/idea-form";
import { TaskFormDialog } from "@/components/forms/task-form";
import { ResourceFormDialog } from "@/components/forms/resource-form";
import { NoteFormDialog } from "@/components/forms/note-form";
import { CalendarView } from "@/components/ideas/calendar-view";
import { TasksTable } from "@/components/tasks/tasks-table";
import { MetricsPanel } from "@/components/metrics/metrics-panel";
import { ResourceCard } from "@/components/library/resource-card";
import { PortalAccessCard } from "@/components/clients/portal-access-card";
import { StrategyTab } from "@/components/clients/strategy-tab";
import { NotesTab } from "@/components/clients/notes-tab";
import { AccessTab } from "@/components/clients/access-tab";
import { MeetingsTab } from "@/components/clients/meetings-tab";
import { BillingTab } from "@/components/clients/billing-tab";
import { ProductionTab } from "@/components/clients/production-tab";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import {
  clientAlerts,
  clientOperationalProgress,
  ideaDate,
  publishedThisMonth,
  summarizeClient,
} from "@/lib/stats";
import {
  PHASE_LABELS,
  RESOURCE_TYPE_LABELS,
  optionsFromLabels,
  type Idea,
  type Resource,
  type Task,
} from "@/lib/types";
import { SimpleSelect } from "@/components/shared/simple-select";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "estrategia", label: "Estrategia" },
  { value: "produccion", label: "Producción" },
  { value: "calendario", label: "Calendario" },
  { value: "tareas", label: "Tareas" },
  { value: "metricas", label: "Métricas" },
  { value: "notas", label: "Notas" },
  { value: "recursos", label: "Recursos" },
  { value: "accesos", label: "Accesos" },
  { value: "reuniones", label: "Reuniones" },
  { value: "facturacion", label: "Facturación" },
];

const fmt = new Intl.NumberFormat("es-CO");

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

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{value}</span>
    </div>
  );
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const store = useFlare();
  const {
    clients,
    ideas,
    tasks,
    resources,
    clientNotes,
    meetings,
    metrics,
    accesses,
    updateClient,
  } = store;
  const client = clients.find((c) => c.id === id);

  const [editClientOpen, setEditClientOpen] = React.useState(false);
  const [ideaFormOpen, setIdeaFormOpen] = React.useState(false);
  const [editingIdea, setEditingIdea] = React.useState<Idea | null>(null);
  const [ideaDefaultDate, setIdeaDefaultDate] = React.useState<string | undefined>();
  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [resourceFormOpen, setResourceFormOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null);
  const [noteFormOpen, setNoteFormOpen] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState<string | null>(null);
  const [resourceType, setResourceType] = React.useState("all");

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
  const clientResources = resources
    .filter((r) => r.clientId === client.id)
    .filter((r) => resourceType === "all" || r.type === resourceType);
  const summary = summarizeClient(client.id, ideas, tasks);
  const alerts = clientAlerts(client, ideas, tasks, metrics, accesses);
  const progress = clientOperationalProgress(client, ideas, tasks, metrics);
  const inProduction = clientIdeas.filter((i) => i.status === "en_produccion").length;
  const inReview = clientIdeas.filter(
    (i) => i.status === "en_revision_interna" || i.status === "en_revision_cliente",
  ).length;
  const publishedMonth = publishedThisMonth(clientIdeas).length;

  const today = new Date().toISOString().slice(0, 10);
  const nextMeeting = meetings
    .filter((m) => m.clientId === client.id)
    .flatMap((m) => [m.meetingDate, m.nextMeetingDate ?? ""])
    .filter((d) => d && d >= today)
    .sort()[0];

  const latestNotes = clientNotes
    .filter((n) => n.clientId === client.id)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const latestTasks = [...clientTasks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  const latestIdeas = [...clientIdeas]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const openIdeaForm = (idea: Idea | null, defaultDate?: string) => {
    setEditingIdea(idea);
    setIdeaDefaultDate(defaultDate);
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
            <Button variant="outline" size="sm" onClick={() => setNoteFormOpen(true)}>
              <StickyNote data-icon="inline-start" />
              Nueva nota
            </Button>
            <Button variant="outline" size="sm" onClick={() => openTaskForm(null)}>
              <CheckSquare data-icon="inline-start" />
              Nueva tarea
            </Button>
            <Button variant="outline" size="sm" onClick={() => openIdeaForm(null)}>
              <Lightbulb data-icon="inline-start" />
              Nueva idea
            </Button>
            <Button size="sm" onClick={() => setEditClientOpen(true)}>
              <Pencil data-icon="inline-start" />
              Editar cliente
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ClientStatusBadge status={client.status} />
        <HealthBadge health={client.healthStatus} />
        <PhaseBadge phase={client.currentPhase} />
        <PriorityBadge priority={client.priority} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          Responsable: {client.owner} · Última actualización: {formatDate(client.lastUpdate)}
        </span>
      </div>

      {/* Cards resumen 360 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Estado operativo">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Progress value={progress.overall} className="flex-1" />
              <span className="text-sm font-semibold tabular-nums">
                {progress.overall}%
              </span>
            </div>
            <SummaryRow label="Producción" value={`${progress.production}%`} />
            <SummaryRow label="Tareas" value={`${progress.tasks}%`} />
            <SummaryRow label="Calendario" value={`${progress.calendar}%`} />
            <SummaryRow label="Fase" value={PHASE_LABELS[client.currentPhase]} />
            <SummaryRow label="Última actualización" value={formatDate(client.lastUpdate)} />
          </div>
        </InfoCard>

        <InfoCard title="Producción">
          <div className="space-y-1.5">
            <SummaryRow label="Ideas activas" value={summary.activeIdeas} />
            <SummaryRow label="En producción" value={inProduction} />
            <SummaryRow label="En revisión" value={inReview} />
            <SummaryRow label="Programados" value={summary.scheduled} />
            <SummaryRow label="Publicados este mes" value={publishedMonth} />
          </div>
        </InfoCard>

        <InfoCard title="Relación comercial">
          <div className="space-y-1.5">
            <SummaryRow
              label="Fee mensual"
              value={
                client.monthlyFee > 0 ? (
                  <span className="text-flare-soft">
                    {fmt.format(client.monthlyFee)} {client.currency}
                  </span>
                ) : (
                  "Sin definir"
                )
              }
            />
            <SummaryRow
              label="Servicios activos"
              value={client.activeServices.length || "—"}
            />
            <SummaryRow label="Inicio" value={formatDate(client.startDate)} />
            <SummaryRow
              label="Próxima reunión"
              value={nextMeeting ? formatDate(nextMeeting) : "Sin agendar"}
            />
          </div>
        </InfoCard>

        <InfoCard title="Alertas">
          {alerts.length ? (
            <div className="flex flex-wrap gap-1.5">
              {alerts.map((alert) => (
                <span
                  key={alert}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400"
                >
                  <AlertTriangle className="size-3" />
                  {alert}
                </span>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Sin alertas. Todo al día.
            </p>
          )}
        </InfoCard>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto border-b border-border"
        >
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen" className="pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard title="Descripción">
              <p className="text-sm text-muted-foreground">
                {client.description || "Sin descripción"}
              </p>
              {client.activeServices.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {client.activeServices.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-foreground/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard title="Objetivo principal">
              <p className="flex items-start gap-2 text-sm">
                <Target className="mt-0.5 size-4 shrink-0 text-flare" />
                {client.mainGoal || "Sin definir"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                KPI principal: {client.mainKpi || "Sin definir"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mes: {client.monthlyGoal || "Sin definir"}
              </p>
            </InfoCard>

            <InfoCard title="Próximos pasos">
              <p className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-amber-400" />
                {client.nextAction || "Sin próxima acción"}
              </p>
              <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
                Próximo entregable: {client.nextDeliverable || "Sin definir"}
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

            <InfoCard title="Relación comercial">
              <p className="flex items-center gap-2 text-sm">
                <Wallet className="size-4 shrink-0 text-flare" />
                {client.monthlyFee > 0
                  ? `${fmt.format(client.monthlyFee)} ${client.currency}/mes`
                  : "Fee sin definir"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Canales: {client.activeChannels.join(", ") || "Sin definir"}
              </p>
            </InfoCard>

            <PortalAccessCard clientId={client.id} />
          </div>

          {/* Últimas notas / tareas / ideas */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Últimas notas">
              {latestNotes.length ? (
                <div className="space-y-2">
                  {latestNotes.map((n) => (
                    <div key={n.id} className="rounded-md border border-border bg-secondary/30 px-2.5 py-2">
                      <p className="truncate text-xs font-medium">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin notas todavía.</p>
              )}
            </InfoCard>

            <InfoCard title="Últimas tareas">
              {latestTasks.length ? (
                <div className="space-y-2">
                  {latestTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-2">
                      <p className="truncate text-xs font-medium">{t.title}</p>
                      <TaskStatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin tareas todavía.</p>
              )}
            </InfoCard>

            <InfoCard title="Últimas ideas">
              {latestIdeas.length ? (
                <div className="space-y-2">
                  {latestIdeas.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{i.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(ideaDate(i), "d MMM")}
                        </p>
                      </div>
                      <IdeaStatusBadge status={i.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin ideas todavía.</p>
              )}
            </InfoCard>
          </div>
        </TabsContent>

        <TabsContent value="estrategia" className="pt-4">
          <StrategyTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="produccion" className="pt-4">
          <ProductionTab
            clientId={client.id}
            brand={client.brand}
            onEdit={openIdeaForm}
            onNew={() => openIdeaForm(null)}
          />
        </TabsContent>

        <TabsContent value="calendario" className="pt-4">
          <CalendarView
            ideas={clientIdeas}
            onEdit={openIdeaForm}
            showClient={false}
            onCreate={(date) => openIdeaForm(null, date)}
          />
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

        <TabsContent value="metricas" className="pt-4">
          <MetricsPanel clientId={client.id} />
        </TabsContent>

        <TabsContent value="notas" className="pt-4">
          <NotesTab clientId={client.id} />
          <Card className="mt-4 gap-0 py-0">
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-semibold">Notas internas rápidas</p>
              <Textarea
                rows={5}
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

        <TabsContent value="recursos" className="pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SimpleSelect
              size="sm"
              className="w-40"
              value={resourceType}
              onChange={setResourceType}
              options={[
                { value: "all", label: "Todos los tipos" },
                ...optionsFromLabels(RESOURCE_TYPE_LABELS),
              ]}
            />
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
              description="Guarda logo, brandbook, plantillas, links de Drive/Canva y referencias."
              action={
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
              }
            />
          )}
        </TabsContent>

        <TabsContent value="accesos" className="pt-4">
          <AccessTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="reuniones" className="pt-4">
          <MeetingsTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="facturacion" className="pt-4">
          <BillingTab client={client} />
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
        defaultDate={ideaDefaultDate}
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
      <NoteFormDialog
        open={noteFormOpen}
        onOpenChange={setNoteFormOpen}
        clientId={client.id}
      />
    </div>
  );
}
