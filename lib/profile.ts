"use client";

// Perfil propio (rol team/client + vínculo a cliente) para el ruteo por rol.

import { fromRow, getSupabase, isSupabaseConfigured } from "./supabase";
import type { Profile } from "./types";

// Devuelve null si no hay sesión, no hay configuración o la migración 002 aún
// no se ejecutó. Los callers tratan null como comportamiento de equipo:
// solo afecta el ruteo — el acceso a datos lo protege RLS de todas formas.
export async function getOwnProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const sb = getSupabase();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, name, email, role, client_id")
    .eq("id", userData.user.id)
    .single();
  if (error || !data) return null;
  return fromRow<Profile>(data);
}
