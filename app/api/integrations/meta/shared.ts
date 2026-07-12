// Utilidades compartidas del flujo OAuth de Meta (Instagram/Facebook/Meta Ads).
// Este archivo no es una ruta: solo lo importan connect/ y callback/.
// Credenciales: META_APP_ID y META_APP_SECRET en .env.local (solo servidor).

import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Versión estable del Graph API; las versiones viven años tras su reemplazo.
export const GRAPH_VERSION = "v21.0";

// Permisos mínimos para leer métricas de IG/FB/pauta de las cuentas del cliente.
export const META_SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
  "ads_read",
  "business_management",
].join(",");

export function getMetaEnv() {
  return {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  };
}

export function getAdmin(supabaseUrl: string, secretKey: string): SupabaseClient {
  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// El callback llega por redirect del navegador (sin Authorization), así que el
// state viaja firmado: `accountId.hmac(accountId)` con el app secret de Meta.
export function signState(accountId: string, appSecret: string): string {
  const sig = createHmac("sha256", appSecret).update(accountId).digest("hex");
  return `${accountId}.${sig}`;
}

export function verifyState(state: string, appSecret: string): string | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const accountId = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", appSecret).update(accountId).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return accountId;
}
