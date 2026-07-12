// Sync de métricas: lee el Graph API con el token guardado y actualiza el
// registro mensual del cliente en client_metrics (crea el del mes si no
// existe). Hoy soporta cuentas de Instagram; para otros proveedores responde
// que aún no hay sync. POST { accountId } — solo equipo/admin.

import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAdmin, getMetaEnv, GRAPH_VERSION } from "../shared";

const bodySchema = z.object({ accountId: z.string().min(1) });

// Métricas de insights del mes en curso (metric_type=total_value agrega solo).
async function fetchInsights(igId: string, token: string) {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth(), 1);
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${igId}/insights`);
  url.searchParams.set("metric", "reach,views,total_interactions");
  url.searchParams.set("metric_type", "total_value");
  url.searchParams.set("period", "day");
  url.searchParams.set("since", String(Math.floor(since.getTime() / 1000)));
  url.searchParams.set("until", String(Math.floor(now.getTime() / 1000)));
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const json = (await res.json()) as {
    data?: { name: string; total_value?: { value?: number } }[];
  };
  const get = (name: string) =>
    json.data?.find((m) => m.name === name)?.total_value?.value;
  return {
    reach: get("reach"),
    views: get("views"),
    interactions: get("total_interactions"),
  };
}

// Piezas publicadas este mes, contadas por tipo desde /media.
async function fetchPublished(igId: string, token: string) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${igId}/media`);
  url.searchParams.set("fields", "timestamp,media_type,media_product_type");
  url.searchParams.set("limit", "100");
  url.searchParams.set("access_token", token);
  const res = await fetch(url);
  const json = (await res.json()) as {
    data?: { timestamp?: string; media_type?: string; media_product_type?: string }[];
  };
  const now = new Date();
  const counts = { posts: 0, reels: 0, carousels: 0 };
  for (const m of json.data ?? []) {
    const t = m.timestamp ? new Date(m.timestamp) : null;
    if (!t || t.getMonth() !== now.getMonth() || t.getFullYear() !== now.getFullYear())
      continue;
    if (m.media_type === "CAROUSEL_ALBUM") counts.carousels += 1;
    else if (m.media_product_type === "REELS" || m.media_type === "VIDEO")
      counts.reels += 1;
    else counts.posts += 1;
  }
  return counts;
}

export async function POST(request: NextRequest) {
  const { appId, appSecret, supabaseUrl, secretKey } = getMetaEnv();
  if (!appId || !appSecret || !supabaseUrl || !secretKey) {
    return Response.json(
      { error: "Integración de Meta no configurada (META_APP_ID/META_APP_SECRET en .env.local)." },
      { status: 501 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Sesión no válida." }, { status: 401 });

  const admin = getAdmin(supabaseUrl, secretKey);
  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !callerData.user) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerData.user.id)
    .single();
  if (callerProfile?.role !== "team" && callerProfile?.role !== "admin") {
    return Response.json({ error: "Solo el equipo Flare puede sincronizar." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Falta accountId." }, { status: 400 });
  }

  const { data: account } = await admin
    .from("connected_accounts")
    .select("id, client_id, provider, external_id, status")
    .eq("id", parsed.data.accountId)
    .single();
  if (!account) return Response.json({ error: "La cuenta no existe." }, { status: 404 });
  if (account.provider !== "instagram") {
    return Response.json(
      { error: `El sync de ${account.provider} aún no está soportado (por ahora solo Instagram).` },
      { status: 501 },
    );
  }

  const { data: tokenRow } = await admin
    .from("connected_account_tokens")
    .select("access_token, expires_at")
    .eq("account_id", account.id)
    .single();
  if (!tokenRow?.access_token) {
    return Response.json(
      { error: "La cuenta no está conectada: inicia el OAuth primero." },
      { status: 409 },
    );
  }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    await admin
      .from("connected_accounts")
      .update({ status: "expirada" })
      .eq("id", account.id);
    return Response.json(
      { error: "El token expiró: reconecta la cuenta (Conectar con Meta)." },
      { status: 409 },
    );
  }

  try {
    // La página de FB usa un page token para los insights de su IG; el token
    // de usuario funciona para followers/media del IG business vinculado.
    const igId = account.external_id;
    if (!igId) {
      return Response.json(
        { error: "La cuenta no tiene id externo: reconecta para autodetectarlo." },
        { status: 409 },
      );
    }

    const profileRes = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${igId}?fields=followers_count,username&access_token=${encodeURIComponent(tokenRow.access_token)}`,
    );
    const profile = (await profileRes.json()) as {
      followers_count?: number;
      error?: { message?: string };
    };
    if (!profileRes.ok || profile.followers_count === undefined) {
      const detail = profile.error?.message ?? `HTTP ${profileRes.status}`;
      await admin
        .from("connected_accounts")
        .update({ status: "error" })
        .eq("id", account.id);
      return Response.json({ error: `Graph API rechazó la consulta: ${detail}` }, { status: 502 });
    }

    const [insights, published] = await Promise.all([
      fetchInsights(igId, tokenRow.access_token),
      fetchPublished(igId, tokenRow.access_token),
    ]);

    // Upsert del registro del mes en curso.
    const now = new Date();
    const period = { period_month: now.getMonth() + 1, period_year: now.getFullYear() };
    const patch: Record<string, unknown> = {
      instagram_followers: profile.followers_count,
      posts_published: published.posts,
      reels_published: published.reels,
      carousels_published: published.carousels,
      updated_at: now.toISOString().slice(0, 10),
    };
    if (insights.reach !== undefined) patch.monthly_reach = insights.reach;
    if (insights.views !== undefined) patch.impressions = insights.views;
    if (insights.interactions !== undefined) patch.interactions = insights.interactions;

    const { data: existing } = await admin
      .from("client_metrics")
      .select("id")
      .eq("client_id", account.client_id)
      .eq("period_month", period.period_month)
      .eq("period_year", period.period_year)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from("client_metrics")
        .update(patch)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("client_metrics").insert({
        id: crypto.randomUUID(),
        client_id: account.client_id,
        ...period,
        instagram_followers: 0,
        monthly_reach: 0,
        impressions: 0,
        clicks: 0,
        interactions: 0,
        leads_generated: 0,
        whatsapp_clicks: 0,
        posts_published: 0,
        reels_published: 0,
        carousels_published: 0,
        stories_published: 0,
        ad_spend: 0,
        relevant_results: "",
        performance_notes: "",
        created_at: now.toISOString().slice(0, 10),
        ...patch,
      });
      if (error) throw new Error(error.message);
    }

    await admin
      .from("connected_accounts")
      .update({ status: "conectada", last_sync_at: now.toISOString() })
      .eq("id", account.id);

    return Response.json({
      ok: true,
      synced: {
        followers: profile.followers_count,
        reach: insights.reach ?? null,
        interactions: insights.interactions ?? null,
        published,
      },
    });
  } catch (err) {
    await admin.from("connected_accounts").update({ status: "error" }).eq("id", account.id);
    return Response.json(
      { error: `El sync falló: ${err instanceof Error ? err.message : "error desconocido"}` },
      { status: 502 },
    );
  }
}
