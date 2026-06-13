"use client";

// Tab Accesos: registro del estado de los accesos del cliente (sin contraseñas).

import * as React from "react";
import {
  ExternalLink,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/shared/empty-state";
import { AccessFormDialog } from "@/components/forms/access-form";
import { useFlare } from "@/lib/store";
import {
  ACCESS_STATUS_LABELS,
  type AccessStatus,
  type ClientAccess,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<AccessStatus, string> = {
  pendiente: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  solicitado: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  recibido: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  validado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  problema: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function AccessTab({ clientId }: { clientId: string }) {
  const { accesses, deleteAccess } = useFlare();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientAccess | null>(null);

  const clientAccesses = accesses.filter((a) => a.clientId === clientId);

  const openForm = (access: ClientAccess | null) => {
    setEditing(access);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldAlert className="size-3.5 text-amber-400" />
          Por seguridad, las contraseñas viven en un gestor externo. Aquí solo se
          registra el estado de cada acceso.
        </p>
        <Button size="sm" onClick={() => openForm(null)}>
          <Plus data-icon="inline-start" />
          Registrar acceso
        </Button>
      </div>

      {clientAccesses.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Plataforma</TableHead>
                <TableHead>Usuario / email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientAccesses.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">{a.platform}</p>
                      {a.requiresSensitiveAccess && (
                        <ShieldAlert className="size-3.5 text-amber-400" aria-label="Acceso sensible" />
                      )}
                      {a.url && (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-flare-soft"
                          aria-label={`Abrir ${a.platform}`}
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.usernameOrEmail || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        STATUS_STYLES[a.status],
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {ACCESS_STATUS_LABELS[a.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{a.responsible}</TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                    {a.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openForm(a)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteAccess(a.id);
                            toast.success("Acceso eliminado");
                          }}
                        >
                          <Trash2 /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={KeyRound}
          title="Sin accesos registrados"
          description="Registra qué accesos tiene Flare y en qué estado están."
          action={
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus data-icon="inline-start" />
              Registrar acceso
            </Button>
          }
        />
      )}

      <AccessFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={clientId}
        access={editing}
      />
    </div>
  );
}
