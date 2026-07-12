// Crea usuarios del portal de clientes (solo equipo).
// Usa la secret key de Supabase, que vive SOLO en el servidor (.env.local sin
// prefijo NEXT_PUBLIC_): nunca llega al navegador. Sin ella, responde 501 y la
// UI muestra las instrucciones de creación manual.

import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  clientId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    return Response.json(
      {
        error:
          "Falta SUPABASE_SECRET_KEY en .env.local (solo servidor). Mientras tanto, crea el usuario en Supabase → Authentication → Add user y vincúlalo por email.",
      },
      { status: 501 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return Response.json({ error: "Sesión no válida." }, { status: 401 });
  }

  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // El caller debe ser un usuario autenticado del equipo Flare.
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
      { error: "Solo el equipo Flare puede crear usuarios del portal." },
      { status: 403 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }
  const { name, email, password, clientId } = parsed.data;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createError || !created.user) {
    const exists =
      createError?.code === "email_exists" ||
      /already.*registered|exists/i.test(createError?.message ?? "");
    return Response.json(
      {
        error: exists
          ? "Ya existe un usuario con ese email. Vincúlalo con el campo de abajo."
          : `No se pudo crear el usuario: ${createError?.message ?? "error desconocido"}`,
      },
      { status: exists ? 409 : 500 },
    );
  }

  // El trigger handle_new_user ya creó el perfil con role='client'; aquí solo
  // se vincula a la marca y se fija el nombre visible.
  const { error: linkError } = await admin
    .from("profiles")
    .update({ name, role: "client", client_id: clientId })
    .eq("id", created.user.id);
  if (linkError) {
    return Response.json(
      {
        error: `Usuario creado pero no se pudo vincular (${linkError.message}). Vincúlalo por email con el campo de abajo.`,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, email });
}
