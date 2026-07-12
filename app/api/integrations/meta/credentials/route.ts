// Credenciales de la integración de Meta gestionadas desde Ajustes (solo
// admin). El secreto nunca vuelve al navegador: GET responde estados y el app
// id enmascarado; POST guarda; DELETE desconecta la integración.

import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAdmin, getMetaConfig, getServerEnv, requireRole } from "../shared";

const bodySchema = z.object({
  appId: z.string().min(3, "App ID inválido").regex(/^\d+$/, "El App ID de Meta es numérico"),
  appSecret: z.string().min(10, "App secret inválido"),
});

function mask(value: string) {
  if (value.length <= 6) return "•••";
  return `${value.slice(0, 4)}…${value.slice(-2)}`;
}

export async function GET(request: NextRequest) {
  const { supabaseUrl, secretKey } = getServerEnv();
  if (!supabaseUrl || !secretKey) {
    return Response.json({
      serverKeyConfigured: false,
      metaConfigured: false,
      source: null,
      appIdMasked: null,
    });
  }
  const admin = getAdmin(supabaseUrl, secretKey);
  const auth = await requireRole(admin, request, ["admin", "team"]);
  if (!auth.ok) return auth.res;

  const config = await getMetaConfig(admin);
  return Response.json({
    serverKeyConfigured: true,
    metaConfigured: Boolean(config),
    source: config?.source ?? null,
    appIdMasked: config ? mask(config.appId) : null,
  });
}

export async function POST(request: NextRequest) {
  const { supabaseUrl, secretKey } = getServerEnv();
  if (!supabaseUrl || !secretKey) {
    return Response.json(
      { error: "Falta SUPABASE_SECRET_KEY en el servidor (variable de infraestructura, una sola vez)." },
      { status: 501 },
    );
  }
  const admin = getAdmin(supabaseUrl, secretKey);
  const auth = await requireRole(admin, request, ["admin"]);
  if (!auth.ok) return auth.res;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const { error } = await admin.from("integration_settings").upsert({
    id: "meta",
    settings: { appId: parsed.data.appId, appSecret: parsed.data.appSecret },
    updated_by: auth.userId,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return Response.json({ error: `No se pudo guardar: ${error.message}` }, { status: 500 });
  }
  return Response.json({ ok: true, appIdMasked: mask(parsed.data.appId) });
}

export async function DELETE(request: NextRequest) {
  const { supabaseUrl, secretKey } = getServerEnv();
  if (!supabaseUrl || !secretKey) {
    return Response.json({ error: "Integración no configurada." }, { status: 501 });
  }
  const admin = getAdmin(supabaseUrl, secretKey);
  const auth = await requireRole(admin, request, ["admin"]);
  if (!auth.ok) return auth.res;

  const { error } = await admin.from("integration_settings").delete().eq("id", "meta");
  if (error) {
    return Response.json({ error: `No se pudo eliminar: ${error.message}` }, { status: 500 });
  }
  return Response.json({ ok: true });
}
