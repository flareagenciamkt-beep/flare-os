"use client";

// Tab Facturación básica: registro simple de cobros por período.

import * as React from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
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
import { useConfirm } from "@/components/shared/use-confirm";
import { BillingFormDialog } from "@/components/forms/billing-form";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import {
  PAYMENT_STATUS_LABELS,
  type Client,
  type ClientBilling,
  type PaymentStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pendiente: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  pagado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  vencido: "border-red-500/30 bg-red-500/10 text-red-400",
  parcial: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const fmt = new Intl.NumberFormat("es-CO");

export function BillingTab({ client }: { client: Client }) {
  const { billing, deleteBilling } = useFlare();
  const { confirm, dialog } = useConfirm();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientBilling | null>(null);

  const records = billing
    .filter((b) => b.clientId === client.id)
    .sort((a, b) => (b.billingDate ?? b.createdAt).localeCompare(a.billingDate ?? a.createdAt));

  const openForm = (record: ClientBilling | null) => {
    setEditing(record);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Fee acordado:{" "}
          <span className="font-semibold text-foreground">
            {client.monthlyFee > 0
              ? `${fmt.format(client.monthlyFee)} ${client.currency}/mes`
              : "Sin definir"}
          </span>
        </p>
        <Button size="sm" onClick={() => openForm(null)}>
          <Plus data-icon="inline-start" />
          Registrar cobro
        </Button>
      </div>

      {records.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Fecha de cobro</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>Estado de pago</TableHead>
                <TableHead>Servicios incluidos</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs font-medium">
                    {formatDate(b.billingDate)}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {fmt.format(b.monthlyFee)} {b.currency}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        STATUS_STYLES[b.paymentStatus],
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {PAYMENT_STATUS_LABELS[b.paymentStatus]}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-xs text-muted-foreground">
                    {b.includedServices || "—"}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                    {b.observations || "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Más opciones" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openForm(b)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            confirm({
                              title: "¿Eliminar este registro de cobro?",
                              description: "Esta acción no se puede deshacer.",
                              confirmLabel: "Eliminar",
                              destructive: true,
                              onConfirm: () => {
                                deleteBilling(b.id);
                                toast.success("Registro eliminado");
                              },
                            })
                          }
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
          icon={Receipt}
          title="Sin registros de facturación"
          description="Registra los cobros mensuales para seguir el estado de pago."
          action={
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus data-icon="inline-start" />
              Registrar cobro
            </Button>
          }
        />
      )}

      <BillingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={client}
        record={editing}
      />
      {dialog}
    </div>
  );
}
