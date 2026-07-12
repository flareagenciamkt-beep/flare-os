// Inicia el OAuth de Meta para una cuenta asociada (connected_accounts).
// Responde { url } con el diálogo de autorización; el navegador redirige allí.
// Sin META_APP_ID/SECRET responde 501 y la UI mantiene el modo manual.

import type { NextRequest } from "next/server";
import { getAdmin, getMetaEnv, GRAPH_VERSION, META_SCOPES, signState } from "../shared";

export async function GET(request: NextRequest) {
  const { appId, appSecret, supabaseUrl, secretKey } = getMetaEnv();
  if (!appId || !appSecret) {
    return Response.json(
      {
        error:
          "Faltan META_APP_ID y META_APP_SECRET en .env.local (solo servidor). Crea una app en developers.facebook.com para habilitar la conexión; mientras tanto la cuenta queda asociada en modo manual.",
      },
      { status: 501 },
    );
  }
  if (!supabaseUrl || !secretKey) {
    return Response.json(
      { error: "Falta SUPABASE_SECRET_KEY en .env.local: el callback la necesita para guardar los tokens." },
      { status: 501 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

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
    return Response.json(
      { error: "Solo el equipo Flare puede conectar cuentas." },
      { status: 403 },
    );
  }

  const accountId = request.nextUrl.searchParams.get("accountId") ?? "";
  if (!accountId) {
    return Response.json({ error: "Falta accountId." }, { status: 400 });
  }
  const { data: account } = await admin
    .from("connected_accounts")
    .select("id")
    .eq("id", accountId)
    .single();
  if (!account) {
    return Response.json({ error: "La cuenta no existe." }, { status: 404 });
  }

  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URL ??
    `${request.nextUrl.origin}/api/integrations/meta/callback`;

  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", META_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", signState(accountId, appSecret));

  return Response.json({ url: url.toString() });
}
