// Callback del OAuth de Meta: canjea el code por un token de larga duración,
// lo guarda en connected_account_tokens (tabla server-only) y marca la cuenta
// como conectada. Llega por redirect del navegador; la autenticidad viene del
// state firmado que emitió /connect.

import type { NextRequest } from "next/server";
import { getAdmin, getMetaEnv, GRAPH_VERSION, verifyState } from "../shared";

export async function GET(request: NextRequest) {
  const { appId, appSecret, supabaseUrl, secretKey } = getMetaEnv();
  if (!appId || !appSecret || !supabaseUrl || !secretKey) {
    return Response.json({ error: "Integración de Meta no configurada." }, { status: 501 });
  }

  const params = request.nextUrl.searchParams;
  const state = params.get("state") ?? "";
  const accountId = verifyState(state, appSecret);
  if (!accountId) {
    return Response.json({ error: "State inválido." }, { status: 400 });
  }

  const admin = getAdmin(supabaseUrl, secretKey);
  const { data: account } = await admin
    .from("connected_accounts")
    .select("id, client_id")
    .eq("id", accountId)
    .single();
  if (!account) {
    return Response.json({ error: "La cuenta no existe." }, { status: 404 });
  }
  const backToClient = new URL(`/clients/${account.client_id}`, request.nextUrl.origin);

  // El usuario canceló el diálogo de Meta: volver sin tocar nada.
  const code = params.get("code");
  if (!code) {
    return Response.redirect(backToClient, 302);
  }

  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URL ??
    `${request.nextUrl.origin}/api/integrations/meta/callback`;

  async function markError(detail: string) {
    await admin
      .from("connected_accounts")
      .update({ status: "error", notes: detail.slice(0, 300) })
      .eq("id", accountId);
  }

  try {
    // 1) code → token de corta duración
    const tokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);
    const shortRes = await fetch(tokenUrl);
    const short = (await shortRes.json()) as {
      access_token?: string;
      error?: { message?: string };
    };
    if (!shortRes.ok || !short.access_token) {
      await markError(`OAuth Meta falló: ${short.error?.message ?? shortRes.status}`);
      return Response.redirect(backToClient, 302);
    }

    // 2) corta → larga duración (~60 días)
    const longUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
    longUrl.searchParams.set("grant_type", "fb_exchange_token");
    longUrl.searchParams.set("client_id", appId);
    longUrl.searchParams.set("client_secret", appSecret);
    longUrl.searchParams.set("fb_exchange_token", short.access_token);
    const longRes = await fetch(longUrl);
    const long = (await longRes.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message?: string };
    };
    const accessToken = long.access_token ?? short.access_token;
    const expiresAt = long.expires_in
      ? new Date(Date.now() + long.expires_in * 1000).toISOString()
      : null;

    // 3) guardar token (server-only) y marcar la cuenta como conectada
    const { error: tokenError } = await admin
      .from("connected_account_tokens")
      .upsert({
        account_id: accountId,
        access_token: accessToken,
        expires_at: expiresAt,
        meta: { provider: "meta", graph_version: GRAPH_VERSION },
        updated_at: new Date().toISOString(),
      });
    if (tokenError) {
      await markError(`No se pudo guardar el token: ${tokenError.message}`);
      return Response.redirect(backToClient, 302);
    }

    await admin
      .from("connected_accounts")
      .update({
        status: "conectada",
        sync_enabled: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString().slice(0, 10),
      })
      .eq("id", accountId);
  } catch (err) {
    await markError(
      `OAuth Meta falló: ${err instanceof Error ? err.message : "error desconocido"}`,
    );
  }

  return Response.redirect(backToClient, 302);
}
