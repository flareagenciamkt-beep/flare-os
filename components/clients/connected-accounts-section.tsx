"use client";

// Cuentas de analytics del cliente: qué cuenta de cada plataforma se mide.
// La asociación es manual; "Conectar" inicia el OAuth de Meta si el servidor
// tiene credenciales (META_APP_ID/SECRET) y cae a modo manual si no.

import * as React from "react";
import {
  BarChart3,
  Briefcase,
  Camera,
  ExternalLink,
  Globe,
  LineChart,
  Megaphone,
  MoreHorizontal,
  Music2,
  Pencil,
  Plug,
  Plus,
  RefreshCw,
  SquarePlay,
  ThumbsUp,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/shared/use-confirm";
import { ConnectedAccountFormDialog } from "@/components/forms/connected-account-form";
import { syncConnectedAccount } from "@/lib/integrations";
import { useFlare } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  CONNECTED_ACCOUNT_STATUS_LABELS,
  CONNECTED_PROVIDER_LABELS,
  type ConnectedAccount,
  type ConnectedAccountStatus,
  type ConnectedProvider,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// lucide ya no trae iconos de marca: se usan equivalentes genéricos.
const PROVIDER_ICONS: Record<ConnectedProvider, LucideIcon> = {
  instagram: Camera,
  facebook: ThumbsUp,
  tiktok: Music2,
  youtube: SquarePlay,
  linkedin: Briefcase,
  meta_ads: Megaphone,
  google_analytics: BarChart3,
  otro: Globe,
};

const STATUS_STYLES: Record<ConnectedAccountStatus, string> = {
  asociada: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  conectada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  expirada: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  desconectada: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

// Proveedores cuya conexión pasa por el OAuth de Meta.
const META_PROVIDERS: ConnectedProvider[] = ["instagram", "facebook", "meta_ads"];

// Adivina el proveedor a partir del texto libre de "plataforma" en Accesos,
// para sugerir la asociación con un clic.
function providerFromPlatform(platform: string): ConnectedProvider | null {
  const p = platform.toLowerCase();
  if (/meta ads|facebook ads|business|pauta/.test(p)) return "meta_ads";
  if (/instagram|\big\b/.test(p)) return "instagram";
  if (/facebook|\bfb\b/.test(p)) return "facebook";
  if (/tiktok/.test(p)) return "tiktok";
  if (/youtube/.test(p)) return "youtube";
  if (/linkedin/.test(p)) return "linkedin";
  if (/google analytics|ga4/.test(p)) return "google_analytics";
  return null;
}

export function ConnectedAccountsSection({ clientId }: { clientId: string }) {
  const { connectedAccounts, deleteConnectedAccount, addConnectedAccount, accesses, refresh } =
    useFlare();
  const { confirm, dialog } = useConfirm();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ConnectedAccount | null>(null);
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState<string | null>(null);

  const accounts = connectedAccounts.filter((a) => a.clientId === clientId);

  // Sugerencias: accesos del cliente que parecen cuentas medibles y cuyo
  // proveedor aún no está asociado.
  const suggestions = accesses
    .filter((ac) => ac.clientId === clientId)
    .map((ac) => ({ access: ac, provider: providerFromPlatform(ac.platform) }))
    .filter(
      (s): s is { access: (typeof accesses)[number]; provider: ConnectedProvider } =>
        s.provider !== null && !accounts.some((a) => a.provider === s.provider),
    );

  const associateSuggestion = (s: (typeof suggestions)[number]) => {
    addConnectedAccount({
      clientId,
      provider: s.provider,
      handle: s.access.usernameOrEmail || s.access.platform,
      url: s.access.url,
      externalId: "",
      status: "asociada",
      syncEnabled: false,
      connectedAt: null,
      lastSyncAt: null,
      notes: "Asociada desde el registro de accesos.",
    });
    toast.success(`Cuenta de ${CONNECTED_PROVIDER_LABELS[s.provider]} asociada`);
  };

  const syncNow = async (account: ConnectedAccount) => {
    setSyncing(account.id);
    try {
      const result = await syncConnectedAccount(account.id);
      if (result.ok) toast.success("Métricas sincronizadas");
      else toast.error(result.error ?? "No se pudo sincronizar.");
      await refresh();
    } finally {
      setSyncing(null);
    }
  };

  const openForm = (account: ConnectedAccount | null) => {
    setEditing(account);
    setFormOpen(true);
  };

  const connectMeta = async (account: ConnectedAccount) => {
    if (!isSupabaseConfigured) {
      toast.info("La conexión OAuth está disponible al conectar Supabase (modo demo activo).");
      return;
    }
    setConnecting(account.id);
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(
        `/api/integrations/meta/connect?accountId=${encodeURIComponent(account.id)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      const json = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.status === 501) {
        toast.info(
          json.error ??
            "Falta configurar las credenciales de Meta. Mientras tanto la cuenta queda asociada en modo manual.",
        );
        return;
      }
      if (!res.ok || !json.url) {
        toast.error(json.error ?? "No se pudo iniciar la conexión.");
        return;
      }
      window.location.assign(json.url);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cuentas de analytics
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Las cuentas que se miden para este cliente. Conectarlas habilita el
              sync automático de métricas; sin conexión, el registro sigue manual.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => openForm(null)}>
            <Plus data-icon="inline-start" />
            Asociar cuenta
          </Button>
        </div>

        {accounts.length ? (
          <ul className="divide-y divide-border/60">
            {accounts.map((a) => {
              const Icon = PROVIDER_ICONS[a.provider];
              return (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{a.handle}</p>
                      {a.url && (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-flare-soft"
                          aria-label={`Abrir perfil en ${CONNECTED_PROVIDER_LABELS[a.provider]}`}
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {CONNECTED_PROVIDER_LABELS[a.provider]}
                      {a.notes ? ` · ${a.notes}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      STATUS_STYLES[a.status],
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {CONNECTED_ACCOUNT_STATUS_LABELS[a.status]}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-xs" aria-label="Más opciones" />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {META_PROVIDERS.includes(a.provider) && a.status !== "conectada" && (
                        <>
                          <DropdownMenuItem
                            disabled={connecting === a.id}
                            onClick={() => void connectMeta(a)}
                          >
                            <Plug />
                            {connecting === a.id ? "Conectando..." : "Conectar (OAuth Meta)"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {a.status === "conectada" && (
                        <>
                          <DropdownMenuItem
                            disabled={syncing === a.id}
                            onClick={() => void syncNow(a)}
                          >
                            <RefreshCw />
                            {syncing === a.id ? "Sincronizando..." : "Sincronizar ahora"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => openForm(a)}>
                        <Pencil /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          confirm({
                            title: `¿Quitar la cuenta ${a.handle}?`,
                            description:
                              "Se elimina la asociación (y su conexión si existía). Las métricas registradas no se tocan.",
                            confirmLabel: "Quitar",
                            destructive: true,
                            onConfirm: () => {
                              deleteConnectedAccount(a.id);
                              toast.success("Cuenta quitada");
                            },
                          })
                        }
                      >
                        <Trash2 /> Quitar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            <LineChart className="size-4 shrink-0" />
            Sin cuentas asociadas. Asocia la cuenta de Instagram (u otra plataforma)
            que se mide para este cliente.
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">
              Detectadas en Accesos:
            </span>
            {suggestions.map((s) => (
              <button
                key={s.access.id}
                type="button"
                onClick={() => associateSuggestion(s)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-flare/40 hover:text-foreground"
              >
                <Plus className="size-3" />
                {CONNECTED_PROVIDER_LABELS[s.provider]}
                {s.access.usernameOrEmail ? ` · ${s.access.usernameOrEmail}` : ""}
              </button>
            ))}
          </div>
        )}

        <ConnectedAccountFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          clientId={clientId}
          account={editing}
        />
        {dialog}
      </CardContent>
    </Card>
  );
}
