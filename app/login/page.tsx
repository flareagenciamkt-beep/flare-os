"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getOwnProfile } from "@/lib/profile";

// Configuración determinista (evita desajustes de hidratación SSR/cliente).
const EMBERS = [
  { left: "6%", size: 5, delay: "0s", dur: "8s", drift: "40px" },
  { left: "13%", size: 3, delay: "2.4s", dur: "9.5s", drift: "-30px" },
  { left: "21%", size: 4, delay: "1.1s", dur: "7.5s", drift: "26px" },
  { left: "29%", size: 6, delay: "3.6s", dur: "10s", drift: "-44px" },
  { left: "37%", size: 3, delay: "0.7s", dur: "8.8s", drift: "34px" },
  { left: "45%", size: 5, delay: "4.2s", dur: "9s", drift: "-20px" },
  { left: "53%", size: 4, delay: "1.8s", dur: "7.8s", drift: "48px" },
  { left: "61%", size: 6, delay: "3s", dur: "10.5s", drift: "-36px" },
  { left: "69%", size: 3, delay: "0.4s", dur: "8.2s", drift: "30px" },
  { left: "77%", size: 5, delay: "2.9s", dur: "9.2s", drift: "-42px" },
  { left: "85%", size: 4, delay: "1.4s", dur: "7.6s", drift: "24px" },
  { left: "92%", size: 6, delay: "4.6s", dur: "10.2s", drift: "-28px" },
  { left: "34%", size: 3, delay: "5.5s", dur: "8.4s", drift: "38px" },
  { left: "58%", size: 4, delay: "6s", dur: "9.6s", drift: "-32px" },
];

const STREAKS = [
  { top: "18%", delay: "0s", dur: "6s", tilt: "16deg" },
  { top: "44%", delay: "2.6s", dur: "7.4s", tilt: "-10deg" },
  { top: "68%", delay: "4.3s", dur: "5.6s", tilt: "12deg" },
  { top: "82%", delay: "6.5s", dur: "6.8s", tilt: "-14deg" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
    setLoading(true);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ background: "radial-gradient(140% 100% at 50% 120%, rgba(245,42,108,0.14), transparent 55%), #080606" }}>
      {/* Resplandor base que respira */}
      <div className="pointer-events-none absolute bottom-[-520px] left-1/2 h-[940px] w-[1560px] animate-breathe" style={{ background: "radial-gradient(closest-side, rgba(245,42,108,0.32), rgba(254,78,73,0.12) 48%, rgba(255,106,53,0.04) 66%, transparent 76%)", filter: "blur(8px)" }} />
      <div className="pointer-events-none absolute bottom-[-360px] left-1/2 h-[620px] w-[880px]" style={{ transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(255,106,53,0.24), transparent 70%)", animation: "aurora-shift 12s ease-in-out infinite reverse" }} />
      <div className="pointer-events-none absolute -right-[280px] -top-[300px] h-[760px] w-[760px] animate-aurora" style={{ background: "radial-gradient(closest-side, rgba(142,91,255,0.14), transparent 70%)" }} />
      <div className="pointer-events-none absolute -left-[320px] top-[40%] h-[600px] w-[600px]" style={{ background: "radial-gradient(closest-side, rgba(245,42,108,0.12), transparent 70%)", animation: "aurora-shift 16s ease-in-out infinite" }} />

      {/* Línea de horizonte pulsante */}
      <div className="pointer-events-none absolute bottom-[23%] left-0 right-0 h-px animate-flicker" style={{ background: "linear-gradient(90deg, transparent 6%, rgba(245,42,108,0.5), rgba(255,106,53,0.45) 55%, transparent 94%)", boxShadow: "0 0 24px rgba(245,42,108,0.45)" }} />

      {/* Brasas ascendentes */}
      {EMBERS.map((e, i) => (
        <span
          key={`ember-${i}`}
          className="pointer-events-none absolute bottom-[-24px] rounded-full"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            background: "linear-gradient(180deg, #FF8A4C, #F52A6C)",
            boxShadow: "0 0 8px rgba(255,106,53,0.85)",
            animation: `ember-rise ${e.dur} linear ${e.delay} infinite`,
            "--drift": e.drift,
          } as React.CSSProperties}
        />
      ))}

      {/* Rayos de luz que cruzan */}
      {STREAKS.map((s, i) => (
        <span
          key={`streak-${i}`}
          className="pointer-events-none absolute left-0 h-px w-[220px]"
          style={{
            top: s.top,
            background:
              "linear-gradient(90deg, transparent, rgba(255,138,76,0.95), rgba(245,42,108,0.6), transparent)",
            filter: "blur(0.5px)",
            animation: `streak-cross ${s.dur} ease-in ${s.delay} infinite`,
            "--tilt": s.tilt,
          } as React.CSSProperties}
        />
      ))}

      {/* Destellos parpadeantes */}
      <span className="absolute left-[15%] top-[22%] text-[14px] animate-twinkle" style={{ color: "rgba(245,42,108,0.6)" }}>✦</span>
      <span className="absolute right-[19%] top-[31%] text-[10px]" style={{ color: "rgba(255,106,53,0.5)", animation: "twinkle 5.5s ease-in-out infinite 0.6s" }}>✦</span>
      <span className="absolute bottom-[30%] left-[24%] text-[12px]" style={{ color: "rgba(254,78,73,0.45)", animation: "twinkle 6s ease-in-out infinite 1.4s" }}>✦</span>
      <span className="absolute bottom-[20%] right-[13%] text-[16px]" style={{ color: "rgba(245,42,108,0.4)", animation: "twinkle 5s ease-in-out infinite 0.3s" }}>✦</span>
      <span className="absolute left-[42%] top-[12%] text-[9px]" style={{ color: "rgba(255,106,53,0.4)", animation: "twinkle 7s ease-in-out infinite 2s" }}>✦</span>
      <span className="absolute right-[34%] bottom-[14%] text-[11px]" style={{ color: "rgba(142,91,255,0.4)", animation: "twinkle 6.5s ease-in-out infinite 1s" }}>✦</span>

      {/* Login card */}
      <div className="animate-fade-up relative z-10 flex w-[432px] flex-col items-center">
        {/* Logo */}
        <div className="relative mb-[30px] flex items-center justify-center">
          <div className="animate-glow-pulse absolute h-[200px] w-[320px]" style={{ background: "radial-gradient(closest-side, rgba(245,42,108,0.30), rgba(255,106,53,0.06) 55%, transparent 72%)", filter: "blur(6px)" }} />
          {/* Anillos que emanan del logo */}
          <span className="pointer-events-none absolute h-[120px] w-[120px] rounded-full" style={{ border: "1px solid rgba(245,42,108,0.45)", animation: "flare-ring 3.4s ease-out infinite" }} />
          <span className="pointer-events-none absolute h-[120px] w-[120px] rounded-full" style={{ border: "1px solid rgba(255,106,53,0.4)", animation: "flare-ring 3.4s ease-out 1.7s infinite" }} />
          <Image
            src="/flare-logo-v2.png"
            alt="flare"
            width={240}
            height={160}
            className="relative"
            style={{ filter: "drop-shadow(0 6px 30px rgba(245,42,108,0.35))" }}
            priority
          />
        </div>

        {/* Form card */}
        <div className="relative w-full rounded-3xl p-9 pb-[30px]" style={{ background: "linear-gradient(165deg, rgba(28,22,20,0.72), rgba(14,11,10,0.82))", border: "1px solid rgba(241,233,224,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(241,233,224,0.06)" }}>
          {/* Top gradient line */}
          <div className="absolute left-6 right-6 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,42,108,0.6), rgba(255,106,53,0.5), transparent)" }} />

          <div className="mb-[26px] flex flex-col items-center">
            <span className="mb-3 text-[12px] font-medium" style={{ color: "#8E5BFF" }}>Acceso privado</span>
            <h1 className="mb-2 text-center text-[32px] font-semibold leading-tight" style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.3px" }}>Bienvenido a Flare OS</h1>
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
                <label className="text-[12px] font-medium" style={{ color: "#8a827a" }}>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl px-4 py-3.5 text-[14.5px] text-[#F1E9E0] outline-none transition-all focus:border-[rgba(245,42,108,0.55)] focus:shadow-[0_0_0_3px_rgba(245,42,108,0.14)]"
                  style={{ background: "rgba(8,6,6,0.65)", border: "1px solid rgba(241,233,224,0.12)", fontFamily: "var(--font-hanken), sans-serif" }}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flare-gradient mt-3 w-full rounded-xl px-4 py-[15px] text-[15px] font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_16px_46px_rgba(245,42,108,0.5)]"
                style={{ boxShadow: "0 10px 34px rgba(245,42,108,0.32)", fontFamily: "var(--font-hanken), sans-serif" }}
              >
                {loading ? "Entrando..." : "Entrar a FLARE OS"}
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
            <span className="cursor-pointer transition-colors hover:text-[#F1E9E0]">SSO del equipo</span>
            <span className="h-[3px] w-[3px] rounded-full" style={{ background: "#4a443f" }} />
            <span className="cursor-pointer transition-colors hover:text-[#F1E9E0]">Acceso de clientes</span>
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
