"use client";

// Subida de archivos a Supabase Storage (bucket "media", lectura pública).
// Requiere la migración 005_storage.sql y un usuario del equipo autenticado.

import { getSupabase, isSupabaseConfigured } from "./supabase";

const BUCKET = "media";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "bin";
}

// Sube un archivo y devuelve su URL pública. `folder` agrupa por tipo (pieces, resources...).
export async function uploadToStorage(file: File, folder = "pieces"): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado: la subida solo funciona con la base conectada.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }
  const sb = getSupabase();
  // Nombre único, sin caracteres problemáticos.
  const path = `${folder}/${crypto.randomUUID()}.${extOf(file.name)}`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
