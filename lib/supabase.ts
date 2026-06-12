"use client";

// Cliente de Supabase + helpers de conversión filas (snake_case) ↔ app (camelCase).
// Si .env.local no tiene credenciales, Flare OS corre en modo demo (mock).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase no está configurado. Completa .env.local.");
  }
  if (!client) client = createClient(url, anonKey);
  return client;
}

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toRow(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), v ?? null]),
  );
}

export function fromRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [toCamel(k), v]),
  ) as T;
}
