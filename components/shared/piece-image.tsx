"use client";

// Imagen de pieza tolerante a URLs arbitrarias (Drive, CDNs, etc.).
// Usa <img> nativo en vez de next/image: las URLs las pega el usuario y
// next/image lanza un error fatal con dominios no configurados.
// Si la imagen no carga, desaparece y deja ver el placeholder de fondo.

import * as React from "react";
import { directImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface PieceImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function PieceImage({ src, alt, className }: PieceImageProps) {
  const url = directImageUrl(src);
  const [failed, setFailed] = React.useState(false);
  const [lastUrl, setLastUrl] = React.useState(url);

  // Si cambia la URL, reintentar (ajuste de estado durante el render).
  if (url !== lastUrl) {
    setLastUrl(url);
    setFailed(false);
  }

  if (!url || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
