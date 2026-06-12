"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleSelect, type Option } from "@/components/shared/simple-select";
import { useClientOptions } from "@/components/shared/use-client-options";
import {
  CHANNEL_LABELS,
  FORMAT_LABELS,
  IDEA_STATUS_LABELS,
  PRIORITY_LABELS,
  TEAM_MEMBERS,
  optionsFromLabels,
} from "@/lib/types";
import type { Idea } from "@/lib/types";

export interface IdeaFilters {
  clientId: string;
  status: string;
  channel: string;
  format: string;
  priority: string;
  responsible: string;
}

export const EMPTY_IDEA_FILTERS: IdeaFilters = {
  clientId: "all",
  status: "all",
  channel: "all",
  format: "all",
  priority: "all",
  responsible: "all",
};

export function useIdeaFilters() {
  const [filters, setFilters] = React.useState<IdeaFilters>(EMPTY_IDEA_FILTERS);
  const set = (key: keyof IdeaFilters) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY_IDEA_FILTERS);
  const isFiltered = Object.values(filters).some((v) => v !== "all");
  return { filters, set, reset, isFiltered };
}

export function applyIdeaFilters(ideas: Idea[], filters: IdeaFilters): Idea[] {
  return ideas.filter((idea) => {
    if (filters.clientId !== "all") {
      const wanted = filters.clientId === "none" ? null : filters.clientId;
      if (idea.clientId !== wanted) return false;
    }
    if (filters.status !== "all" && idea.status !== filters.status) return false;
    if (filters.channel !== "all" && idea.channel !== filters.channel) return false;
    if (filters.format !== "all" && idea.format !== filters.format) return false;
    if (filters.priority !== "all" && idea.priority !== filters.priority) return false;
    if (filters.responsible !== "all" && idea.responsible !== filters.responsible)
      return false;
    return true;
  });
}

function withAll(label: string, options: Option[]): Option[] {
  return [{ value: "all", label }, ...options];
}

const RESPONSIBLE_OPTIONS = TEAM_MEMBERS.map((m) => ({ value: m, label: m }));

interface IdeaFilterBarProps {
  hook: ReturnType<typeof useIdeaFilters>;
  hide?: Array<keyof IdeaFilters>;
}

export function IdeaFilterBar({ hook, hide = [] }: IdeaFilterBarProps) {
  const { filters, set, reset, isFiltered } = hook;
  const clientOptions = useClientOptions();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {!hide.includes("clientId") && (
        <SimpleSelect
          size="sm"
          className="w-44"
          value={filters.clientId}
          onChange={set("clientId")}
          options={withAll("Todos los clientes", clientOptions)}
        />
      )}
      {!hide.includes("status") && (
        <SimpleSelect
          size="sm"
          className="w-36"
          value={filters.status}
          onChange={set("status")}
          options={withAll("Estado", optionsFromLabels(IDEA_STATUS_LABELS))}
        />
      )}
      {!hide.includes("channel") && (
        <SimpleSelect
          size="sm"
          className="w-32"
          value={filters.channel}
          onChange={set("channel")}
          options={withAll("Canal", optionsFromLabels(CHANNEL_LABELS))}
        />
      )}
      {!hide.includes("format") && (
        <SimpleSelect
          size="sm"
          className="w-32"
          value={filters.format}
          onChange={set("format")}
          options={withAll("Formato", optionsFromLabels(FORMAT_LABELS))}
        />
      )}
      {!hide.includes("priority") && (
        <SimpleSelect
          size="sm"
          className="w-32"
          value={filters.priority}
          onChange={set("priority")}
          options={withAll("Prioridad", optionsFromLabels(PRIORITY_LABELS))}
        />
      )}
      {!hide.includes("responsible") && (
        <SimpleSelect
          size="sm"
          className="w-36"
          value={filters.responsible}
          onChange={set("responsible")}
          options={withAll("Responsable", RESPONSIBLE_OPTIONS)}
        />
      )}
      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={reset}>
          <X data-icon="inline-start" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
