"use client";

// Vista global de facturación: fees acordados, servicios activos y estado de
// cobros de todas las marcas (los registros viven en el tab Facturación de
// cada cliente; aquí se consolidan).

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus, Receipt, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
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

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export default function ClientsBillingPage() {
  const { clients, billing } = useFlare();
  const [billingClient, setBillingClient] = React.useState<Client | null>(null);

  const active = clients.filter((c) => c.status === "activo");

  // Ingreso mensual acordado, desglosado por moneda.
  const feeByCurrency = new Map<string, number>();
  for (const c of active) {
    if (c.monthlyFee > 0) {
      feeByCurrency.set(c.currency, (feeByCurrency.get(c.currency) ?? 0) + c.monthlyFee);
    }
  }
  // Ingreso desglosado por divisa, la de mayor monto primero.
  const feeEntries = [...feeByCurrency.entries()].sort((a, z) => z[1] - a[1]);

  const lastByClient = new Map<string, ClientBilling>();
  for (const b of [...billing].sort((a, z) =>
    (a.billingDate ?? a.createdAt).localeCompare(z.billingDate ?? z.createdAt),
  )) {
    lastByClient.set(b.clientId, b); // queda el más reciente
  }

  const overdue = billing.filter((b) => b.paymentStatus === "vencido");
  const pending = billing.filter(
    (b) => b.paymentStatus === "pendiente" || b.paymentStatus === "parcial",
  );
  const month = new Date().toISOString().slice(0, 7);
  const paidThisMonth = billing.filter(
    (b) => b.paymentStatus === "pagado" && (b.billingDate ?? "").startsWith(month),
  );

  const recent = [...billing]
    .sort((a, z) =>
      (z.billingDate ?? z.createdAt).localeCompare(a.billingDate ?? a.createdAt),
    )
    .slice(0, 8);

  const brandOf = (id: string) => clients.find((c) => c.id === id)?.brand ?? "—";

  return (
    <div>
      <PageHeader
        title="Facturación"
        description="Fees, servicios activos y estado de cobros de todas las marcas."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="animate-fade-up relative overflow-hidden rounded-[18px] px-[22px] pb-[18px] pt-5 transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
          style={{
            background: "linear-gradient(165deg, #14110F, #0E0C0B)",
            border: "1px solid rgba(241,233,224,0.08)",
          }}
        >
          <div
            className="absolute left-[22px] right-[22px] top-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #F52A6C, #FF6A35)" }}
          />
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[12px] font-medium" style={{ color: "#a39990" }}>
              Ingreso mensual acordado
            </span>
            <Wallet className="size-4" style={{ color: "#6e665f" }} />
          </div>
          {feeEntries.length ? (
            <div className="mt-3.5 space-y-0.5">
              {feeEntries.map(([currency, total], i) => (
                <div key={currency} className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "font-semibold leading-[1.05] tabular-nums",
                      i === 0
                        ? "flare-gradient-text text-[34px]"
                        : "text-[20px] text-foreground/60",
                    )}
                    style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.5px" }}
                  >
                    {fmt.format(total)}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: "#a39990" }}>
                    {currency}/mes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="mt-3.5 text-[40px] font-semibold leading-[0.95] text-[#F1E9E0]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              —
            </p>
          )}
        </div>
        <StatCard
          label="Cobros vencidos"
          value={overdue.length}
          icon={AlertTriangle}
          tone={overdue.length ? "danger" : "default"}
        />
        <StatCard
          label="Pendientes / parciales"
          value={pending.length}
          icon={Receipt}
          tone={pending.length ? "warning" : "default"}
        />
        <StatCard
          label="Pagados este mes"
          value={paidThisMonth.length}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold">Clientes activos</p>
      {active.length ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Fee acordado</TableHead>
                <TableHead>Servicios activos</TableHead>
                <TableHead>Último cobro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-36" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.map((c) => {
                const last = lastByClient.get(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-sm font-medium transition-colors hover:text-flare-soft"
                      >
                        {c.brand}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {c.monthlyFee > 0
                        ? `${fmt.format(c.monthlyFee)} ${c.currency}/mes`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {c.activeServices.length ? (
                        <div className="flex max-w-72 flex-wrap gap-1">
                          {c.activeServices.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-foreground/70"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {last ? formatDate(last.billingDate) : "Sin cobros registrados"}
                    </TableCell>
                    <TableCell>
                      {last ? (
                        <StatusBadge status={last.paymentStatus} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setBillingClient(c)}
                      >
                        <Plus data-icon="inline-start" />
                        Registrar cobro
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No hay clientes activos"
          description="Activa o crea clientes para gestionar su facturación."
        />
      )}

      {recent.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold">Cobros recientes</p>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table className="min-w-[56rem]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Servicios incluidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs font-medium">
                      {brandOf(b.clientId)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(b.billingDate)}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {fmt.format(b.monthlyFee)} {b.currency}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.paymentStatus} />
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-xs text-muted-foreground">
                      {b.includedServices || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {billingClient && (
        <BillingFormDialog
          open={billingClient !== null}
          onOpenChange={(open) => {
            if (!open) setBillingClient(null);
          }}
          client={billingClient}
          record={null}
        />
      )}
    </div>
  );
}
