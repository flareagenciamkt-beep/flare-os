"use client";

// Galería de imágenes para piezas multi-imagen (carruseles). Sube varios
// archivos a Storage o agrega URLs; la primera imagen es la portada.

import * as React from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieceImage } from "@/components/shared/piece-image";
import { uploadToStorage } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function GalleryUpload({ value, onChange, folder = "pieces" }: GalleryUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        added.push(await uploadToStorage(file, folder));
      }
      if (added.length) {
        onChange([...value, ...added]);
        toast.success(added.length > 1 ? `${added.length} imágenes subidas` : "Imagen subida");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const u = url.trim();
    if (!u) return;
    onChange([...value, u]);
    setUrl("");
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2.5">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40"
            >
              <PieceImage src={img} alt={`Imagen ${i + 1}`} />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                  Portada
                </span>
              )}
              <button
                type="button"
                aria-label={`Quitar imagen ${i + 1}`}
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
              >
                <X className="size-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isSupabaseConfigured ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <ImagePlus data-icon="inline-start" />
            )}
            {uploading ? "Subiendo…" : "Subir imágenes"}
          </Button>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Conecta Supabase para subir archivos. Mientras tanto, pega URLs.
        </p>
      )}

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…o pega una URL de imagen"
          className="text-xs"
        />
        <Button type="button" variant="outline" size="sm" disabled={!url.trim()} onClick={addUrl}>
          <Plus data-icon="inline-start" />
          Agregar
        </Button>
      </div>
    </div>
  );
}
