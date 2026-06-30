"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  Building2,
  Eye,
  Lightbulb,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SimpleSelect } from "@/components/shared/simple-select";
import {
  ClientStatusBadge,
  HealthBadge,
  PhaseBadge,
  PriorityBadge,
} from "@/components/shared/badges";
import { ClientFormDialog } from "@/components/forms/client-form";
import { useFlare } from "@/lib/store";
import { clientAlerts, isIdeaActive, isTaskOverdue } from "@/lib/stats";
import {
  CLIENT_STATUS_LABELS,
  HEALTH_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
  type Client,
} from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...optionsFromLabels(CLIENT_STATUS_LABELS),
];
const OWNER_OPTIONS = [
  { value: "all", label: "Responsable" },
  ...TEAM_MEMBERS.map((m) => ({ value: m, label: m })),
];
const PRIORITY_OPTIONS = [
  { value: "all", label: "Prioridad" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];
const HEALTH_OPTIONS = [
  { value: "all", label: "Health" },
  ...optionsFromLabels(HEALTH_LABELS),
];

const feeFmt = new Intl.NumberFormat("es-CO");

export default function ClientsPage() {
  const { clients, deleteClient, updateClient, ideas, tasks, metrics, accesses } =
    useFlare();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [owner, setOwner] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [health, setHealth] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);
  const [deleting, setDeleting] = React.useState<Client | null>(null);

  const askDelete = (c: Client) => setDeleting(c);

  const isFiltered =
    search.trim() !== "" ||
    [status, owner, priority, health].some((v) => v !== "all");

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !c.name.toLowerCase().includes(q) &&
      !c.brand.toLowerCase().includes(q) &&
      !c.industry.toLowerCase().includes(q)
    )
      return false;
    if (status !== "all" && c.status !== status) return false;
    if (owner !== "all" && c.owner !== owner) return false;
    if (priority !== "all" && c.priority !== priority) return false;
    if (health !== "all" && c.healthStatus !== health) return false;
    return true;
  });

  // Menú de acciones por fila, reutilizado en tabla (desktop) y cards (mobile).
  const renderRowMenu = (c: Client) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Acciones de ${c.brand}`} />}>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => {
            setEditing(c);
            setFormOpen(true);
          }}
        >
          <Pencil /> Editar
        </DropdownMenuItem>
        {c.status === "pausado" ? (
          <DropdownMenuItem
            onClick={() => {
              updateClient(c.id, { status: "activo" });
              toast.success(`${c.brand} reactivado`);
            }}
          >
            <Play /> Reactivar
          </DropdownMenuItem>
        ) : (
          c.status !== "cerrado" && (
            <DropdownMenuItem
              onClick={() => {
                updateClient(c.id, { status: "pausado" });
                toast.success(`${c.brand} pausado`);
              }}
            >
              <Pause /> Pausar
            </DropdownMenuItem>
          )
        )}
        {c.status !== "cerrado" && (
          <DropdownMenuItem
            onClick={() => {
              updateClient(c.id, { status: "cerrado" });
              toast.success(`${c.brand} archivado`);
            }}
          >
            <Archive /> Archivar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => askDelete(c)}
        >
          <Trash2 /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Valores derivados por cliente, calculados una vez y reutilizados en la tabla
  // (desktop) y en las cards (mobile).
  const rows = filtered.map((c) => ({
    c,
    alerts:
      c.status === "activo"
        ? clientAlerts(c, ideas, tasks, metrics, accesses)
        : [],
    overdueCount: tasks.filter((t) => t.clientId === c.id && isTaskOverdue(t))
      .length,
    activeContent: ideas.filter((i) => i.clientId === c.id && isIdeaActive(i))
      .length,
  }));

  return (
    <div>
      <PageHeader
        title="Clientes / Marcas"
        description={`${clients.length} clientes en la base de Flare.`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, marca o industria"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <SimpleSelect size="sm" className="w-40" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <SimpleSelect size="sm" className="w-36" value={owner} onChange={setOwner} options={OWNER_OPTIONS} />
        <SimpleSelect size="sm" className="w-32" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
        <SimpleSelect size="sm" className="w-32" value={health} onChange={setHealth} options={HEALTH_OPTIONS} />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setOwner("all");
              setPriority("all");
              setHealth("all");
            }}
          >
            <X data-icon="inline-start" />
            Limpiar
          </Button>
        )}
      </div>

      {rows.length ? (
        <>
        {/* Desktop: tabla */}
        <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
          <Table className="min-w-[72rem]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>Próximo entregable</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead className="w-36">Progreso</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ c, alerts, overdueCount, activeContent }) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/clients/${c.id}`} className="group block">
                      <p className="flex items-center gap-1.5 text-sm font-medium underline-offset-2 transition-colors group-hover:text-flare-soft group-hover:underline">
                        {c.brand}
                        {alerts.length > 0 && (
                          <AlertTriangle
                            className="size-3.5 shrink-0 text-amber-400"
                            aria-label={alerts.join(" · ")}
                          >
                            <title>{alerts.join(" · ")}</title>
                          </AlertTriangle>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.name}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.industry}
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <HealthBadge health={c.healthStatus} />
                  </TableCell>
                  <TableCell>
                    <PhaseBadge phase={c.currentPhase} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={c.priority} />
                  </TableCell>
                  <TableCell className="text-xs">{c.owner}</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {c.monthlyFee > 0
                      ? `${feeFmt.format(c.monthlyFee)} ${c.currency}`
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                    {c.nextDeliverable || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {overdueCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                          <AlertTriangle className="size-2.5" />
                          {overdueCount}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        <Lightbulb className="size-2.5" />
                        {activeContent}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.progressPercentage} className="flex-1" />
                      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                        {c.progressPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Ver detalle de ${c.brand}`}
                        render={<Link href={`/clients/${c.id}`} />}
                      >
                        <Eye />
                      </Button>
                      {renderRowMenu(c)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: cards */}
        <div className="space-y-2.5 md:hidden">
          {rows.map(({ c, alerts, overdueCount, activeContent }) => (
            <div
              key={c.id}
              className="rounded-lg border border-border bg-card p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/clients/${c.id}`} className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {c.brand}
                    {alerts.length > 0 && (
                      <AlertTriangle
                        className="size-3.5 shrink-0 text-amber-400"
                        aria-label={alerts.join(" · ")}
                      />
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {c.name} · {c.industry}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ver detalle de ${c.brand}`}
                    render={<Link href={`/clients/${c.id}`} />}
                  >
                    <Eye />
                  </Button>
                  {renderRowMenu(c)}
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <ClientStatusBadge status={c.status} />
                <HealthBadge health={c.healthStatus} />
                <PhaseBadge phase={c.currentPhase} />
                <PriorityBadge priority={c.priority} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Progress value={c.progressPercentage} className="flex-1" />
                <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                  {c.progressPercentage}%
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{c.owner}</span>
                <div className="flex items-center gap-1.5">
                  {overdueCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-semibold text-red-400">
                      <AlertTriangle className="size-2.5" />
                      {overdueCount}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary px-1.5 py-0.5">
                    <Lightbulb className="size-2.5" />
                    {activeContent}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      ) : (
        <EmptyState
          icon={Building2}
          title={isFiltered ? "Sin resultados con estos filtros" : "Aún no hay clientes"}
          description={
            isFiltered
              ? "Ajusta la búsqueda o limpia los filtros."
              : "Crea el primer cliente para empezar a operar."
          }
          action={
            !isFiltered ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus data-icon="inline-start" />
                Nuevo cliente
              </Button>
            ) : undefined
          }
        />
      )}

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} client={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`¿Eliminar a ${deleting?.brand}?`}
        description="Esta acción no se puede deshacer. Se quitará el cliente y dejará de aparecer en los listados y dashboards."
        confirmLabel="Eliminar cliente"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          deleteClient(deleting.id);
          toast.success(`Cliente ${deleting.brand} eliminado`);
        }}
      />
    </div>
  );
}
