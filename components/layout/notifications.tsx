"use client";

// Campana de notificaciones: una entrada por alerta operativa de cada cliente
// activo + cobros vencidos. Extraída del header para el nuevo top-nav.

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFlare } from "@/lib/store";
import { clientAlerts } from "@/lib/stats";

const NUM_FMT = new Intl.NumberFormat("es-CO");

export function Notifications() {
  const router = useRouter();
  const { clients, ideas, tasks, metrics, accesses, billing } = useFlare();

  const notifs = React.useMemo(() => {
    const items: {
      id: string;
      brand: string;
      detail: string;
      href: string;
      danger: boolean;
    }[] = [];
    for (const c of clients) {
      if (c.status !== "activo") continue;
      for (const detail of clientAlerts(c, ideas, tasks, metrics, accesses)) {
        items.push({
          id: `${c.id}-${detail}`,
          brand: c.brand,
          detail,
          href: `/clients/${c.id}`,
          danger: /atrasad|cr[ií]tico|vencid/i.test(detail),
        });
      }
    }
    for (const b of billing) {
      if (b.paymentStatus !== "vencido") continue;
      const brand = clients.find((c) => c.id === b.clientId)?.brand ?? "Cliente";
      items.push({
        id: `bill-${b.id}`,
        brand,
        detail: `Cobro vencido — ${NUM_FMT.format(b.monthlyFee)} ${b.currency}`,
        href: "/clients/billing",
        danger: true,
      });
    }
    return items.sort((a, z) => Number(z.danger) - Number(a.danger));
  }, [clients, ideas, tasks, metrics, accesses, billing]);

  const alertCount = notifs.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={
              alertCount > 0 ? `${alertCount} notificaciones` : "Sin notificaciones"
            }
            className="relative flex size-9 cursor-pointer items-center justify-center rounded-full bg-[rgba(241,233,224,0.05)] outline-none transition-colors hover:bg-[rgba(241,233,224,0.1)] focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Bell className="size-[17px]" style={{ color: "#A39A91" }} />
        {alertCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold text-white"
            style={{
              background: "linear-gradient(90deg, #F52A6C, #FF6A35)",
              border: "2px solid #14110F",
            }}
          >
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-[13px] font-semibold">Notificaciones</span>
          {alertCount > 0 && (
            <span className="text-[11px] text-muted-foreground">{alertCount}</span>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        {notifs.length === 0 ? (
          <div className="px-3 py-8 text-center text-[12px] text-muted-foreground">
            Todo en orden — sin alertas operativas.
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto py-1">
            {notifs.slice(0, 12).map((n) => (
              <button
                key={n.id}
                onClick={() => router.push(n.href)}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[rgba(241,233,224,0.04)]"
              >
                <span
                  className="mt-[5px] size-1.5 shrink-0 rounded-full"
                  style={{ background: n.danger ? "#FF5C5C" : "#FFC247" }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-[#F1E9E0]">
                    {n.brand}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {n.detail}
                  </span>
                </span>
              </button>
            ))}
            {notifs.length > 12 && (
              <p className="px-3 pb-1 pt-2 text-center text-[11px] text-muted-foreground">
                +{notifs.length - 12} más
              </p>
            )}
          </div>
        )}
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem
          onClick={() => router.push("/clients/dashboard")}
          className="justify-center text-[12px] font-medium text-flare-soft"
        >
          Ver dashboard de clientes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
