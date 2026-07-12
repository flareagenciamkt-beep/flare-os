// Utilidades compartidas del flujo OAuth de Meta (Instagram/Facebook/Meta Ads).
// Este archivo no es una ruta: solo lo importan las rutas de integrations/.
//
// Credenciales de Meta: el admin las pega en Ajustes (tabla server-only
// integration_settings) o, como fallback, META_APP_ID/META_APP_SECRET en env.
// El único secreto que sí exige env es SUPABASE_SECRET_KEY (bootstrap).

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
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

export function getServerEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  };
}

export function getAdmin(supabaseUrl: string, secretKey: string): SupabaseClient {
  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface MetaConfig {
  appId: string;
  appSecret: string;
  source: "db" | "env";
}

// Primero lo configurado desde Ajustes (base), luego variables de entorno.
export async function getMetaConfig(admin: SupabaseClient): Promise<MetaConfig | null> {
  const { data } = await admin
    .from("integration_settings")
    .select("settings")
    .eq("id", "meta")
    .maybeSingle();
  const s = (data?.settings ?? {}) as { appId?: string; appSecret?: string };
  if (s.appId && s.appSecret) {
    return { appId: s.appId, appSecret: s.appSecret, source: "db" };
  }
  if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
    return {
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
      source: "env",
    };
  }
  return null;
}

// Autentica al caller por su JWT de Supabase y exige uno de los roles dados.
export async function requireRole(
  admin: SupabaseClient,
  request: NextRequest,
  roles: string[],
): Promise<{ ok: true; userId: string } | { ok: false; res: Response }> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { ok: false, res: Response.json({ error: "Sesión no válida." }, { status: 401 }) };
  }
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, res: Response.json({ error: "Sesión no válida." }, { status: 401 }) };
  }
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (!profile?.role || !roles.includes(profile.role)) {
    return {
      ok: false,
      res: Response.json({ error: "No tienes permisos para esta acción." }, { status: 403 }),
    };
  }
  return { ok: true, userId: data.user.id };
}

// Descubre la cuenta real detrás del token para no pedirle nada al usuario:
// páginas de FB (con su IG business vinculado) o cuentas publicitarias.
export async function discoverAccount(
  accessToken: string,
  provider: string,
): Promise<{ externalId: string; handle: string } | null> {
  try {
    if (provider === "meta_ads") {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts?fields=name,account_id&access_token=${encodeURIComponent(accessToken)}`,
      );
      const json = (await res.json()) as {
        data?: { account_id?: string; name?: string }[];
      };
      const ad = json.data?.[0];
      if (!ad?.account_id) return null;
      return { externalId: ad.account_id, handle: ad.name ?? "" };
    }

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`,
    );
    const json = (await res.json()) as {
      data?: {
        id: string;
        name?: string;
        instagram_business_account?: { id: string; username?: string };
      }[];
    };
    const pages = json.data ?? [];
    if (provider === "instagram") {
      const page = pages.find((p) => p.instagram_business_account);
      const ig = page?.instagram_business_account;
      if (!ig) return null;
      return { externalId: ig.id, handle: ig.username ? `@${ig.username}` : "" };
    }
    const page = pages[0];
    if (!page) return null;
    return { externalId: page.id, handle: page.name ?? "" };
  } catch {
    return null;
  }
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
