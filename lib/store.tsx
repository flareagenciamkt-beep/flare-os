"use client";

// Store global de Flare OS.
// - Sin credenciales en .env.local → modo demo: datos mock en memoria.
// - Con Supabase configurado → carga inicial desde la base y cada mutación
//   se aplica optimista en memoria y se persiste en Supabase.
// La interfaz es la misma en ambos modos: las vistas no cambian.

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Splash } from "@/components/layout/splash";
import { fromRow, getSupabase, isSupabaseConfigured, toRow } from "./supabase";
import {
  MOCK_CLIENTS,
  MOCK_IDEAS,
  MOCK_METRICS,
  MOCK_PROCESSES,
  MOCK_PROMPTS,
  MOCK_RESOURCES,
  MOCK_TASKS,
} from "./mock-data";
import type {
  Client,
  ClientMetric,
  Idea,
  IdeaStatus,
  Process,
  Prompt,
  Resource,
  Task,
} from "./types";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

type WithMeta = { id: string; createdAt: string; updatedAt: string };

interface FlareStore {
  clients: Client[];
  ideas: Idea[];
  tasks: Task[];
  resources: Resource[];
  prompts: Prompt[];
  processes: Process[];
  metrics: ClientMetric[];

  addClient: (data: Omit<Client, keyof WithMeta | "lastUpdate">) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addIdea: (data: Omit<Idea, keyof WithMeta>) => Idea;
  updateIdea: (id: string, data: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  moveIdea: (id: string, status: IdeaStatus) => void;

  addTask: (data: Omit<Task, keyof WithMeta>) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addResource: (data: Omit<Resource, keyof WithMeta>) => Resource;
  updateResource: (id: string, data: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  addPrompt: (data: Omit<Prompt, keyof WithMeta>) => Prompt;
  updatePrompt: (id: string, data: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;

  addProcess: (data: Omit<Process, keyof WithMeta>) => Process;
  updateProcess: (id: string, data: Partial<Process>) => void;
  deleteProcess: (id: string) => void;

  addMetric: (data: Omit<ClientMetric, keyof WithMeta>) => ClientMetric;
  updateMetric: (id: string, data: Partial<ClientMetric>) => void;
  deleteMetric: (id: string) => void;

  getClient: (id: string) => Client | undefined;
  clientName: (clientId: string | null) => string;
}

const FlareContext = React.createContext<FlareStore | null>(null);

type LoadStatus = "loading" | "ready" | "missing-schema" | "error";

function SetupScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Database className="size-4 text-flare" />
          Supabase conectado · falta crear las tablas
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Las credenciales funcionan, pero la base de datos está vacía. Solo falta
          ejecutar dos scripts (una única vez):
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-foreground/85">
          <li>
            En supabase.com abre tu proyecto → <b>SQL Editor</b> → New query.
          </li>
          <li>
            Pega el contenido de <code className="rounded bg-secondary px-1">supabase/schema.sql</code> y ejecútalo (Run).
          </li>
          <li>
            Repite con <code className="rounded bg-secondary px-1">supabase/seed.sql</code> para cargar tus clientes iniciales.
          </li>
          <li>
            En <b>Authentication → Users → Add user</b> crea tu usuario (marca
            &quot;Auto Confirm User&quot;).
          </li>
        </ol>
        <Button className="mt-4 w-full" onClick={onRetry}>
          Ya los ejecuté — reintentar
        </Button>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <AlertTriangle className="mx-auto size-6 text-amber-400" />
        <p className="mt-2 text-sm font-semibold">No se pudo cargar la base de datos</p>
        <p className="mt-1 break-words text-xs text-muted-foreground">{message}</p>
        <Button className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}

export function FlareStoreProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured;

  const [clients, setClients] = React.useState<Client[]>(configured ? [] : MOCK_CLIENTS);
  const [ideas, setIdeas] = React.useState<Idea[]>(configured ? [] : MOCK_IDEAS);
  const [tasks, setTasks] = React.useState<Task[]>(configured ? [] : MOCK_TASKS);
  const [resources, setResources] = React.useState<Resource[]>(
    configured ? [] : MOCK_RESOURCES,
  );
  const [prompts, setPrompts] = React.useState<Prompt[]>(configured ? [] : MOCK_PROMPTS);
  const [processes, setProcesses] = React.useState<Process[]>(
    configured ? [] : MOCK_PROCESSES,
  );
  const [metrics, setMetrics] = React.useState<ClientMetric[]>(
    configured ? [] : MOCK_METRICS,
  );
  const [status, setStatus] = React.useState<LoadStatus>(
    configured ? "loading" : "ready",
  );
  const [errorMsg, setErrorMsg] = React.useState("");

  // No marca "loading" por sí misma: el estado inicial ya es "loading" y los
  // reintentos lo fijan antes de llamar (evita setState síncrono en efectos).
  const fetchAll = React.useCallback(async () => {
    const sb = getSupabase();
    const [c, i, t, r, p, pr, m] = await Promise.all([
      sb.from("clients").select("*").order("created_at"),
      sb.from("ideas").select("*").order("created_at", { ascending: false }),
      sb.from("tasks").select("*").order("created_at", { ascending: false }),
      sb.from("resources").select("*").order("created_at", { ascending: false }),
      sb.from("prompts").select("*").order("created_at", { ascending: false }),
      sb.from("processes").select("*").order("created_at", { ascending: false }),
      sb.from("client_metrics").select("*"),
    ]);
    const failed = [c, i, t, r, p, pr, m].find((res) => res.error);
    if (failed?.error) {
      if (failed.error.code === "PGRST205") {
        setStatus("missing-schema");
      } else {
        setErrorMsg(failed.error.message);
        setStatus("error");
      }
      return;
    }
    setClients((c.data ?? []).map((row) => fromRow<Client>(row)));
    setIdeas((i.data ?? []).map((row) => fromRow<Idea>(row)));
    setTasks((t.data ?? []).map((row) => fromRow<Task>(row)));
    setResources((r.data ?? []).map((row) => fromRow<Resource>(row)));
    setPrompts((p.data ?? []).map((row) => fromRow<Prompt>(row)));
    setProcesses((pr.data ?? []).map((row) => fromRow<Process>(row)));
    setMetrics((m.data ?? []).map((row) => fromRow<ClientMetric>(row)));
    setStatus("ready");
  }, []);

  React.useEffect(() => {
    // Carga inicial desde Supabase: todos los setState ocurren tras los await
    // (la regla no distingue el patrón fetch-on-mount asíncrono).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (configured) void fetchAll();
  }, [configured, fetchAll]);

  const store = React.useMemo<FlareStore>(() => {
    function persist(action: PromiseLike<{ error: { message: string } | null }>) {
      if (!configured) return;
      action.then(({ error }) => {
        if (error) {
          toast.error(`No se pudo guardar en Supabase: ${error.message}`);
          void fetchAll(); // re-sincronizar con la base
        }
      });
    }

    function makeCrud<T extends WithMeta>(
      table: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
    ) {
      return {
        add(data: Omit<T, keyof WithMeta>): T {
          const item = {
            ...data,
            id: newId(),
            createdAt: today(),
            updatedAt: today(),
          } as unknown as T;
          setter((prev) => [item, ...prev]);
          if (configured) {
            persist(getSupabase().from(table).insert(toRow(item)));
          }
          return item;
        },
        update(id: string, data: Partial<T>) {
          const patch = { ...data, updatedAt: today() };
          setter((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
          );
          if (configured) {
            persist(getSupabase().from(table).update(toRow(patch)).eq("id", id));
          }
        },
        remove(id: string) {
          setter((prev) => prev.filter((item) => item.id !== id));
          if (configured) {
            persist(getSupabase().from(table).delete().eq("id", id));
          }
        },
      };
    }

    const clientCrud = makeCrud<Client>("clients", setClients);
    const ideaCrud = makeCrud<Idea>("ideas", setIdeas);
    const taskCrud = makeCrud<Task>("tasks", setTasks);
    const resourceCrud = makeCrud<Resource>("resources", setResources);
    const promptCrud = makeCrud<Prompt>("prompts", setPrompts);
    const processCrud = makeCrud<Process>("processes", setProcesses);
    const metricCrud = makeCrud<ClientMetric>("client_metrics", setMetrics);

    return {
      clients,
      ideas,
      tasks,
      resources,
      prompts,
      processes,
      metrics,

      addClient: (data) =>
        clientCrud.add({ ...data, lastUpdate: today() } as Omit<
          Client,
          keyof WithMeta
        >),
      updateClient: (id, data) =>
        clientCrud.update(id, { ...data, lastUpdate: today() }),
      deleteClient: clientCrud.remove,

      addIdea: ideaCrud.add,
      updateIdea: ideaCrud.update,
      deleteIdea: ideaCrud.remove,
      // Al volver a "en_revision" la aprobación previa queda obsoleta
      // (igual que el trigger reset_idea_approval en la base).
      moveIdea: (id, status) =>
        ideaCrud.update(
          id,
          (status === "en_revision"
            ? { status, clientApproval: "pendiente", clientApprovalAt: null }
            : { status }) as Partial<Idea>,
        ),

      addTask: taskCrud.add,
      updateTask: taskCrud.update,
      deleteTask: taskCrud.remove,

      addResource: resourceCrud.add,
      updateResource: resourceCrud.update,
      deleteResource: resourceCrud.remove,

      addPrompt: promptCrud.add,
      updatePrompt: promptCrud.update,
      deletePrompt: promptCrud.remove,

      addProcess: processCrud.add,
      updateProcess: processCrud.update,
      deleteProcess: processCrud.remove,

      addMetric: metricCrud.add,
      updateMetric: metricCrud.update,
      deleteMetric: metricCrud.remove,

      getClient: (id) => clients.find((c) => c.id === id),
      clientName: (clientId) =>
        clientId
          ? (clients.find((c) => c.id === clientId)?.brand ?? "Cliente eliminado")
          : "Flare (interno)",
    };
  }, [configured, fetchAll, clients, ideas, tasks, resources, prompts, processes, metrics]);

  const retry = () => {
    setStatus("loading");
    void fetchAll();
  };

  if (status === "loading") return <Splash label="Cargando datos..." />;
  if (status === "missing-schema") return <SetupScreen onRetry={retry} />;
  if (status === "error") return <ErrorScreen message={errorMsg} onRetry={retry} />;

  return <FlareContext.Provider value={store}>{children}</FlareContext.Provider>;
}

export function useFlare(): FlareStore {
  const ctx = React.useContext(FlareContext);
  if (!ctx) throw new Error("useFlare debe usarse dentro de FlareStoreProvider");
  return ctx;
}
