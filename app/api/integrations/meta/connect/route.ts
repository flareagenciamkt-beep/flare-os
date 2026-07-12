// Inicia el OAuth de Meta para una cuenta asociada (connected_accounts).
// Responde { url } con el diálogo de autorización; el navegador redirige allí.
// Sin credenciales de Meta (Ajustes o env) responde 501 y la UI mantiene el
// modo manual.

import type { NextRequest } from "next/server";
import {
  getAdmin,
  getMetaConfig,
  getServerEnv,
  GRAPH_VERSION,
  META_SCOPES,
  requireRole,
  signState,
} from "../shared";

export async function GET(request: NextRequest) {
  const { supabaseUrl, secretKey } = getServerEnv();
  if (!supabaseUrl || !secretKey) {
    return Response.json(
      { error: "Falta SUPABASE_SECRET_KEY en el servidor: el flujo OAuth necesita guardar tokens." },
      { status: 501 },
    );
  }

  const admin = getAdmin(supabaseUrl, secretKey);
  const auth = await requireRole(admin, request, ["admin", "team"]);
  if (!auth.ok) return auth.res;

  const config = await getMetaConfig(admin);
  if (!config) {
    return Response.json(
      {
        error:
          "La integración de Meta no está configurada. Un admin puede pegar el App ID y App Secret en Ajustes → Integraciones; mientras tanto la cuenta queda asociada en modo manual.",
      },
      { status: 501 },
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
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", META_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", signState(accountId, config.appSecret));

  return Response.json({ url: url.toString() });
}
