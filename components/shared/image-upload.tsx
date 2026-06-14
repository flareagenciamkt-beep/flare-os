"use client";

// Campo de imagen: subir un archivo a Storage o pegar una URL.
// El valor final (URL) se entrega vía onChange para guardarlo en el formulario.

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieceImage } from "@/components/shared/piece-image";
import { uploadToStorage } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, folder = "pieces" }: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToStorage(file, folder);
      onChange(url);
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40">
          {value ? (
            <PieceImage src={value} alt="Vista previa" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0])}
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
                {uploading ? "Subiendo..." : "Subir imagen"}
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Quitar imagen"
                  onClick={() => onChange("")}
                >
                  <X />
                </Button>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Conecta Supabase para subir archivos. Mientras tanto, pega una URL.
            </p>
          )}

          {/* Alternativa: pegar URL directa o de Drive */}
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…o pega una URL (imagen directa o Drive público)"
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
