"use client";

// Carrusel de imágenes de una pieza. Si hay una sola imagen, la muestra fija;
// si hay varias (carrusel), permite navegar con flechas + puntos. Placeholder
// elegante cuando no hay imágenes.

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { PieceImage } from "@/components/shared/piece-image";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/types";

export function pieceImages(idea: Pick<Idea, "images" | "coverImage">): string[] {
  if (idea.images?.length) return idea.images;
  return idea.coverImage ? [idea.coverImage] : [];
}

export function PieceCarousel({
  idea,
  alt,
}: {
  idea: Pick<Idea, "images" | "coverImage" | "title">;
  alt?: string;
}) {
  const images = pieceImages(idea);
  const [index, setIndex] = React.useState(0);

  // Mantener el índice dentro de rango si cambian las imágenes.
  const safeIndex = Math.min(index, Math.max(images.length - 1, 0));
  const go = (dir: number) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-zinc-900">
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <ImageOff className="size-6" />
        <span className="text-xs">La vista previa aún no está disponible</span>
      </div>

      {images.length > 0 && (
        <PieceImage src={images[safeIndex]} alt={alt ?? idea.title} />
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Contador */}
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {safeIndex + 1}/{images.length}
          </span>

          {/* Puntos */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a la imagen ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  i === safeIndex ? "w-4 bg-white" : "bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
