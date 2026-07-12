// Estado de configuración de la integración de Meta (sin exponer secretos):
// la UI de Ajustes lo usa para guiar el setup.

export async function GET() {
  return Response.json({
    metaConfigured: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
    serverKeyConfigured: Boolean(process.env.SUPABASE_SECRET_KEY),
  });
}
