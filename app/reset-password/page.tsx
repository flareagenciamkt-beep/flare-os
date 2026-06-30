"use client";

// Página de destino del enlace "¿Olvidaste tu contraseña?". Supabase abre esta
// ruta con una sesión de recuperación activa; aquí el usuario define su nueva
// contraseña vía updateUser({ password }).

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Confirmar que llegamos con una sesión de recuperación válida.
  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setReady(true);
      if (!data.session) {
        setError("El enlace expiró o no es válido. Solicita uno nuevo desde el login.");
      }
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await getSupabase().auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }
    toast.success("Contraseña actualizada. Inicia sesión con la nueva.");
    router.replace("/login");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "radial-gradient(140% 100% at 50% 120%, rgba(245,42,108,0.14), transparent 55%), #080606" }}
    >
      <div className="animate-fade-up relative z-10 flex w-full max-w-[432px] flex-col items-center">
        <div className="relative mb-[30px] flex items-center justify-center">
          <Image
            src="/flare-logo-v2.png"
            alt="flare"
            width={240}
            height={160}
            className="relative h-auto w-[170px] sm:w-[210px]"
            style={{ filter: "drop-shadow(0 6px 30px rgba(245,42,108,0.35))" }}
            priority
          />
        </div>

        <div
          className="relative w-full rounded-3xl p-6 pb-[26px] sm:p-9 sm:pb-[30px]"
          style={{ background: "linear-gradient(165deg, rgba(28,22,20,0.72), rgba(14,11,10,0.82))", border: "1px solid rgba(241,233,224,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(241,233,224,0.06)" }}
        >
          <div className="mb-[26px] flex flex-col items-center">
            <h1 className="mb-2 text-center text-[24px] font-semibold leading-tight sm:text-[28px]" style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.3px" }}>
              Define tu nueva contraseña
            </h1>
            <p className="text-center text-[14px]" style={{ color: "#B8AFA5" }}>
              Elige una contraseña segura para tu cuenta de Flare OS.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex w-full flex-col gap-[15px]">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                required
                className="w-full rounded-xl px-4 py-3.5 pr-12 text-[14.5px] text-[#F1E9E0] outline-none transition-all focus:border-[rgba(245,42,108,0.55)] focus:shadow-[0_0_0_3px_rgba(245,42,108,0.14)]"
                style={{ background: "rgba(8,6,6,0.65)", border: "1px solid rgba(241,233,224,0.12)", fontFamily: "var(--font-hanken), sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a827a] transition-colors hover:text-[#F1E9E0]"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
              required
              className="w-full rounded-xl px-4 py-3.5 text-[14.5px] text-[#F1E9E0] outline-none transition-all focus:border-[rgba(245,42,108,0.55)] focus:shadow-[0_0_0_3px_rgba(245,42,108,0.14)]"
              style={{ background: "rgba(8,6,6,0.65)", border: "1px solid rgba(241,233,224,0.12)", fontFamily: "var(--font-hanken), sans-serif" }}
            />
            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !ready}
              className="flare-gradient mt-3 w-full rounded-xl px-4 py-[15px] text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_16px_46px_rgba(245,42,108,0.5)] disabled:opacity-70"
              style={{ boxShadow: "0 10px 34px rgba(245,42,108,0.32)", fontFamily: "var(--font-hanken), sans-serif" }}
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="text-center text-[12.5px] transition-colors hover:text-[#F1E9E0]"
              style={{ color: "#8a827a" }}
            >
              Volver al login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
