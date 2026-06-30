"use client";

// Store del portal de clientes: carga SOLO los datos del cliente vinculado
// vía RPCs security definer (portal_client / portal_ideas / portal_metrics).
// No usa FlareStoreProvider: el portal no tiene acceso a las tablas base.

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Splash } from "@/components/layout/splash";
import { fromRow, getSupabase } from "./supabase";
import type {
  ClientApproval,
  ClientMetric,
  Idea,
  IdeaComment,
  PortalClient,
} from "./types";

interface PortalStore {
  client: PortalClient;
  ideas: Idea[];
  metrics: ClientMetric[];
  comments: IdeaComment[];
  approve: (
    ideaId: string,
    decision: Exclude<ClientApproval, "pendiente">,
    feedback: string,
  ) => Promise<boolean>;
  addComment: (ideaId: string, body: string) => Promise<void>;
}

const PortalContext = React.createContext<PortalStore | null>(null);

type Status = "loading" | "ready" | "unlinked" | "error";

// Las RPCs devuelven un subconjunto de columnas de Idea: completamos el resto
// con valores vacíos para cumplir el tipo (el portal nunca los muestra).
function toPortalIdea(row: Record<string, unknown>): Idea {
  const idea = fromRow<Idea>(row);
  return {
    ...idea,
    responsible: idea.responsible ?? "",
    notes: idea.notes ?? "",
    prompt: idea.prompt ?? "",
    references: idea.references ?? "",
  };
}

function toPortalMetric(row: Record<string, unknown>): ClientMetric {
  const metric = fromRow<ClientMetric>(row);
  return { ...metric, performanceNotes: metric.performanceNotes ?? "" };
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [client, setClient] = React.useState<PortalClient | null>(null);
  const [ideas, setIdeas] = React.useState<Idea[]>([]);
  const [metrics, setMetrics] = React.useState<ClientMetric[]>([]);
  const [comments, setComments] = React.useState<IdeaComment[]>([]);

  const fetchAll = React.useCallback(async () => {
    const sb = getSupabase();
    const [c, i, m, cm] = await Promise.all([
      sb.rpc("portal_client"),
      sb.rpc("portal_ideas"),
      sb.rpc("portal_metrics"),
      sb.rpc("portal_comments"),
    ]);
    // portal_comments es opcional (puede no existir aún): no bloquea la carga.
    const failed = [c, i, m].find((res) => res.error);
    if (failed?.error) {
      setErrorMsg(failed.error.message);
      setStatus("error");
      return;
    }
    const clientRow = (c.data as Record<string, unknown>[] | null)?.[0];
    if (!clientRow) {
      setStatus("unlinked");
      return;
    }
    setClient(fromRow<PortalClient>(clientRow));
    setIdeas(((i.data as Record<string, unknown>[]) ?? []).map(toPortalIdea));
    setMetrics(((m.data as Record<string, unknown>[]) ?? []).map(toPortalMetric));
    setComments(
      ((cm.data as Record<string, unknown>[]) ?? []).map((row) =>
        fromRow<IdeaComment>(row),
      ),
    );
    setStatus("ready");
  }, []);

  React.useEffect(() => {
    // Fetch-on-mount: los setState ocurren tras los await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAll();
  }, [fetchAll]);

  const store = React.useMemo<PortalStore | null>(() => {
    if (!client) return null;
    return {
      client,
      ideas,
      metrics,
      comments,
      async addComment(ideaId, body) {
        const text = body.trim();
        if (!text) return;
        const { data, error } = await getSupabase().rpc("portal_add_comment", {
          p_idea_id: ideaId,
          p_body: text,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        const row = (data as Record<string, unknown>[] | null)?.[0];
        if (row) {
          setComments((prev) => [...prev, fromRow<IdeaComment>(row)]);
        } else {
          void fetchAll();
        }
      },
      async approve(ideaId, decision, feedback) {
        const { error } = await getSupabase().rpc("approve_idea", {
          p_idea_id: ideaId,
          p_decision: decision,
          p_feedback: feedback,
        });
        if (error) {
          toast.error(error.message);
          void fetchAll();
          return false;
        }
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === ideaId
              ? {
                  ...idea,
                  clientApproval: decision,
                  clientFeedback: feedback,
                  // Aprobar avanza la pieza (igual que approve_idea en la base).
                  status: decision === "aprobada" ? "aprobada" : idea.status,
                  // Registro de quién/cuándo aprobó (el cliente de este portal).
                  ...(decision === "aprobada"
                    ? { approvedBy: client.brand, approvedAt: new Date().toISOString() }
                    : {}),
                }
              : idea,
          ),
        );
        toast.success(
          decision === "aprobada"
            ? "¡Pieza aprobada! El equipo de Flare la programará."
            : "Enviamos tu feedback al equipo de Flare.",
        );
        return true;
      },
    };
  }, [client, ideas, metrics, comments, fetchAll]);

  if (status === "loading") return <Splash label="Cargando tu contenido..." />;

  if (status === "unlinked") {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <AlertTriangle className="mx-auto size-6 text-amber-400" />
          <p className="mt-2 text-sm font-semibold">
            Tu acceso aún no está vinculado a una marca
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Escríbele al equipo de Flare para que active tu portal.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error" || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <AlertTriangle className="mx-auto size-6 text-amber-400" />
          <p className="mt-2 text-sm font-semibold">No pudimos cargar tu contenido</p>
          <p className="mt-1 break-words text-xs text-muted-foreground">{errorMsg}</p>
          <Button
            className="mt-4"
            onClick={() => {
              setStatus("loading");
              void fetchAll();
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return <PortalContext.Provider value={store}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalStore {
  const ctx = React.useContext(PortalContext);
  if (!ctx) throw new Error("usePortal debe usarse dentro de PortalProvider");
  return ctx;
}
