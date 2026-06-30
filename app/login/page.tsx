"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  const routeByRole = React.useCallback(async () => {
    const profile = await getOwnProfile();
    router.replace(profile?.role === "client" ? "/portal" : "/clients/dashboard");
  }, [router]);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) void routeByRole();
      });
  }, [routeByRole]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Validación previa antes de molestar a Supabase.
    if (!EMAIL_RE.test(email.trim())) {
      setError("Ingresa un email válido.");
      return;
    }
    if (password.length < 1) {
      setError("Ingresa tu contraseña.");
      return;
    }
    setLoading(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : authError.message,
      );
      return;
    }
    await routeByRole();
  };

  const onForgotPassword = async () => {
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError("Escribe tu email arriba para enviarte el enlace de recuperación.");
      return;
    }
    setResetting(true);
    const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    setResetting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    toast.success("Te enviamos un enlace para restablecer tu contraseña.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "radial-gradient(140% 100% at 50% 120%, rgba(245,42,108,0.14), transparent 55%), #080606" }}>
      {/* Destellos parpadeantes (chispas dinámicas) */}
      <span className="absolute left-[15%] top-[22%] text-[14px] animate-twinkle" style={{ color: "rgba(245,42,108,0.6)" }}>✦</span>
      <span className="absolute right-[19%] top-[31%] text-[10px]" style={{ color: "rgba(255,106,53,0.5)", animation: "twinkle 5.5s ease-in-out infinite 0.6s" }}>✦</span>
      <span className="absolute bottom-[30%] left-[24%] text-[12px]" style={{ color: "rgba(254,78,73,0.45)", animation: "twinkle 6s ease-in-out infinite 1.4s" }}>✦</span>
      <span className="absolute bottom-[20%] right-[13%] text-[16px]" style={{ color: "rgba(245,42,108,0.4)", animation: "twinkle 5s ease-in-out infinite 0.3s" }}>✦</span>
      <span className="absolute left-[42%] top-[12%] text-[9px]" style={{ color: "rgba(255,106,53,0.4)", animation: "twinkle 7s ease-in-out infinite 2s" }}>✦</span>
      <span className="absolute right-[34%] bottom-[14%] text-[11px]" style={{ color: "rgba(142,91,255,0.4)", animation: "twinkle 6.5s ease-in-out infinite 1s" }}>✦</span>

      {/* Login card */}
      <div className="animate-fade-up relative z-10 flex w-full max-w-[432px] flex-col items-center">
        {/* Logo */}
        <div className="relative mb-[30px] flex items-center justify-center">
          <div className="animate-glow-pulse absolute h-[200px] w-[320px]" style={{ background: "radial-gradient(closest-side, rgba(245,42,108,0.30), rgba(255,106,53,0.06) 55%, transparent 72%)", filter: "blur(6px)" }} />
          <Image
            src="/flare-logo-v2.png"
            alt="flare"
            width={240}
            height={160}
            className="relative h-auto w-[170px] sm:w-[240px]"
            style={{ filter: "drop-shadow(0 6px 30px rgba(245,42,108,0.35))" }}
            priority
          />
        </div>

        {/* Form card */}
        <div className="relative w-full rounded-3xl p-6 pb-[26px] sm:p-9 sm:pb-[30px]" style={{ background: "linear-gradient(165deg, rgba(28,22,20,0.72), rgba(14,11,10,0.82))", border: "1px solid rgba(241,233,224,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(241,233,224,0.06)" }}>
          {/* Top gradient line */}
          <div className="absolute left-6 right-6 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,42,108,0.6), rgba(255,106,53,0.5), transparent)" }} />

          <div className="mb-[26px] flex flex-col items-center">
            <span className="mb-3 text-[12px] font-medium" style={{ color: "#8E5BFF" }}>Acceso privado</span>
            <h1 className="mb-2 text-center text-[26px] font-semibold leading-tight sm:text-[32px]" style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.3px" }}>Bienvenido a Flare OS</h1>
            <p className="text-[15px]" style={{ color: "#B8AFA5" }}>Tu centro de operaciones creativo.</p>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-[15px]">
              <div className="flex flex-col gap-[7px]">
                <label className="text-[12px] font-medium" style={{ color: "#8a827a" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@flare.agency"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl px-4 py-3.5 text-[14.5px] text-[#F1E9E0] outline-none transition-all focus:border-[rgba(245,42,108,0.55)] focus:shadow-[0_0_0_3px_rgba(245,42,108,0.14)]"
                  style={{ background: "rgba(8,6,6,0.65)", border: "1px solid rgba(241,233,224,0.12)", fontFamily: "var(--font-hanken), sans-serif" }}
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium" style={{ color: "#8a827a" }}>Contraseña</label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    disabled={resetting}
                    className="text-[12px] font-medium text-[#8E5BFF] transition-colors hover:text-[#C798FF] disabled:opacity-60"
                  >
                    {resetting ? "Enviando..." : "¿Olvidaste tu contraseña?"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl px-4 py-3.5 pr-12 text-[14.5px] text-[#F1E9E0] outline-none transition-all focus:border-[rgba(245,42,108,0.55)] focus:shadow-[0_0_0_3px_rgba(245,42,108,0.14)]"
                    style={{ background: "rgba(8,6,6,0.65)", border: "1px solid rgba(241,233,224,0.12)", fontFamily: "var(--font-hanken), sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a827a] transition-colors hover:text-[#F1E9E0] focus-visible:text-[#F1E9E0] focus-visible:outline-none"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flare-gradient mt-3 w-full rounded-xl px-4 py-[15px] text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_16px_46px_rgba(245,42,108,0.5)] disabled:opacity-70"
                style={{ boxShadow: "0 10px 34px rgba(245,42,108,0.32)", fontFamily: "var(--font-hanken), sans-serif" }}
              >
                {loading ? "Entrando..." : "Entrar a Flare OS"}
              </button>
            </form>
          ) : (
            <div className="flex w-full flex-col gap-[15px]">
              <div className="text-center">
                <p className="text-sm font-medium text-[#F1E9E0]">Modo demo activo</p>
                <p className="mt-1 text-xs" style={{ color: "#8a827a" }}>
                  Sin Supabase — Flare OS corre con datos de ejemplo.
                </p>
              </div>
              <button
                onClick={() => router.replace("/clients/dashboard")}
                className="flare-gradient w-full rounded-xl px-4 py-[15px] text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_16px_46px_rgba(245,42,108,0.5)]"
                style={{ boxShadow: "0 10px 34px rgba(245,42,108,0.32)", fontFamily: "var(--font-hanken), sans-serif" }}
              >
                Entrar a FLARE OS
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-4 text-[12.5px]" style={{ color: "#8a827a" }}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                    className="cursor-not-allowed opacity-60"
                  />
                }
              >
                SSO del equipo
              </TooltipTrigger>
              <TooltipContent>Próximamente</TooltipContent>
            </Tooltip>
            <span className="h-[3px] w-[3px] rounded-full" style={{ background: "#4a443f" }} />
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-disabled="true"
                    onClick={(e) => e.preventDefault()}
                    className="cursor-not-allowed opacity-60"
                  />
                }
              >
                Acceso de clientes
              </TooltipTrigger>
              <TooltipContent>Próximamente</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[26px] left-0 right-0 flex items-center justify-center gap-2.5 text-[12px]" style={{ color: "#5a534d" }}>
        <span>Flare OS · V1.0</span>
        <span>—</span>
        <span>Lo que se mide, se controla</span>
      </div>
    </div>
  );
}
