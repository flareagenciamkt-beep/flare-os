"use client";

// Campo de credencial sensible: enmascarado por defecto, con revelado temporal
// y copia al portapapeles. Nunca persiste el valor en el DOM cuando está oculto.
// Pensado para contraseñas, tokens y accesos (ClientAccess, portal, etc.).

import * as React from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SecretFieldProps {
  value: string;
  /** Etiqueta corta para los aria-label y el toast (ej: "Contraseña"). */
  label?: string;
  /** Segundos que permanece visible al revelar antes de re-ocultarse. */
  revealSeconds?: number;
  className?: string;
}

export function SecretField({
  value,
  label = "Credencial",
  revealSeconds = 10,
  className,
}: SecretFieldProps) {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Auto-ocultar tras el tiempo configurado.
  React.useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setRevealed(false), revealSeconds * 1000);
    return () => clearTimeout(t);
  }, [revealed, revealSeconds]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copiada`);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-1.5",
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
        {revealed ? value : "•".repeat(Math.min(value.length, 14) || 8)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={revealed ? `Ocultar ${label.toLowerCase()}` : `Revelar ${label.toLowerCase()}`}
        onClick={() => setRevealed((v) => !v)}
      >
        {revealed ? <EyeOff /> : <Eye />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Copiar ${label.toLowerCase()}`}
        onClick={copy}
      >
        {copied ? <Check className="text-[#3DD68C]" /> : <Copy />}
      </Button>
    </div>
  );
}
