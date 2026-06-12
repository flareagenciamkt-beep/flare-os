"use client";

import * as React from "react";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { TagBadge } from "@/components/shared/badges";
import { useClientOptions } from "@/components/shared/use-client-options";
import { PromptFormDialog } from "@/components/forms/prompt-form";
import { useFlare } from "@/lib/store";
import {
  RESOURCE_CATEGORY_LABELS,
  optionsFromLabels,
  type Prompt,
} from "@/lib/types";

function PromptCard({
  prompt,
  onEdit,
}: {
  prompt: Prompt;
  onEdit: (p: Prompt) => void;
}) {
  const { clientName, deletePrompt } = useFlare();

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.promptContent);
    toast.success("Prompt copiado al portapapeles");
  };

  return (
    <Card className="gap-0 py-0 transition-colors hover:border-foreground/15">
      <CardContent className="flex h-full flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-flare-soft">
              {RESOURCE_CATEGORY_LABELS[prompt.category]} ·{" "}
              {clientName(prompt.clientId)}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold leading-snug">
              {prompt.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={copy} aria-label="Copiar prompt">
              <Copy />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(prompt)}>
                  <Pencil /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    deletePrompt(prompt.id);
                    toast.success("Prompt eliminado");
                  }}
                >
                  <Trash2 /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <pre className="line-clamp-5 overflow-hidden whitespace-pre-wrap rounded-md bg-secondary/50 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {prompt.promptContent}
        </pre>

        {prompt.recommendedUse && (
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/70">Uso:</span>{" "}
            {prompt.recommendedUse}
          </p>
        )}

        <div className="mt-auto space-y-1.5 pt-1">
          {prompt.requiredVariables.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/70">Variables:</span>{" "}
              {prompt.requiredVariables.map((v) => `{${v}}`).join(", ")}
            </p>
          )}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PromptsPage() {
  const { prompts } = useFlare();
  const clientOptions = useClientOptions();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [clientId, setClientId] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prompt | null>(null);

  const isFiltered =
    search.trim() !== "" || category !== "all" || clientId !== "all";

  const filtered = prompts.filter((p) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !p.title.toLowerCase().includes(q) &&
      !p.promptContent.toLowerCase().includes(q) &&
      !p.tags.some((t) => t.toLowerCase().includes(q))
    )
      return false;
    if (category !== "all" && p.category !== category) return false;
    if (clientId !== "all") {
      const wanted = clientId === "none" ? null : clientId;
      if (p.clientId !== wanted) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Prompts"
        description="Acceso rápido a los prompts de Flare. Copia y usa."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo prompt
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prompt..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <SimpleSelect
          size="sm"
          className="w-36"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "Categoría" },
            ...optionsFromLabels(RESOURCE_CATEGORY_LABELS),
          ]}
        />
        <SimpleSelect
          size="sm"
          className="w-44"
          value={clientId}
          onChange={setClientId}
          options={[{ value: "all", label: "Todos los clientes" }, ...clientOptions]}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setClientId("all");
            }}
          >
            <X data-icon="inline-start" />
            Limpiar
          </Button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onEdit={(pr) => {
                setEditing(pr);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No hay prompts"
          description="Guarda el primer prompt para tenerlo siempre a mano."
        />
      )}

      <PromptFormDialog open={formOpen} onOpenChange={setFormOpen} prompt={editing} />
    </div>
  );
}
