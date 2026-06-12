"use client";

import * as React from "react";
import { BookOpen, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useClientOptions } from "@/components/shared/use-client-options";
import { ResourceFormDialog } from "@/components/forms/resource-form";
import { ResourceCard } from "@/components/library/resource-card";
import { useFlare } from "@/lib/store";
import {
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_TYPE_LABELS,
  optionsFromLabels,
  type Resource,
} from "@/lib/types";

export default function LibraryPage() {
  const { resources } = useFlare();
  const clientOptions = useClientOptions();
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [clientId, setClientId] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Resource | null>(null);

  const isFiltered =
    search.trim() !== "" || [type, category, clientId].some((v) => v !== "all");

  const filtered = resources.filter((r) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !r.title.toLowerCase().includes(q) &&
      !r.content.toLowerCase().includes(q) &&
      !r.tags.some((t) => t.toLowerCase().includes(q))
    )
      return false;
    if (type !== "all" && r.type !== type) return false;
    if (category !== "all" && r.category !== category) return false;
    if (clientId !== "all") {
      const wanted = clientId === "none" ? null : clientId;
      if (r.clientId !== wanted) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Biblioteca"
        description="Prompts, SOPs, plantillas, referencias y recursos de Flare."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo recurso
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, contenido o tag..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <SimpleSelect
          size="sm"
          className="w-32"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "Tipo" },
            ...optionsFromLabels(RESOURCE_TYPE_LABELS),
          ]}
        />
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
              setType("all");
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
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onEdit={(res) => {
                setEditing(res);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No hay recursos"
          description="Guarda el primer recurso útil para operar la agencia."
        />
      )}

      <ResourceFormDialog open={formOpen} onOpenChange={setFormOpen} resource={editing} />
    </div>
  );
}
