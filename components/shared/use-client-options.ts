"use client";

import { useFlare } from "@/lib/store";
import type { Option } from "./simple-select";

// "none" representa contenido interno de Flare (clientId = null).
export function useClientOptions(includeNone = true): Option[] {
  const { clients } = useFlare();
  const options = clients.map((c) => ({ value: c.id, label: c.brand }));
  return includeNone
    ? [{ value: "none", label: "Flare (interno)" }, ...options]
    : options;
}
