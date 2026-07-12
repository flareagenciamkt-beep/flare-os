"use client";

// Llamadas del navegador a las integraciones (con la sesión de Supabase).

import { getSupabase, isSupabaseConfigured } from "./supabase";

export interface SyncResult {
  ok: boolean;
  error?: string;
}

// Dispara el sync server-side de una cuenta conectada.
export async function syncConnectedAccount(accountId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "El sync está disponible al conectar Supabase (modo demo activo)." };
  }
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch("/api/integrations/meta/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ accountId }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return { ok: false, error: json.error ?? "No se pudo sincronizar." };
  return { ok: true };
}
