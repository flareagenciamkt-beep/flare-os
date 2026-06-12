// Normalización de URLs de imagen para las piezas.
// Convierte links de "compartir" de Google Drive en URLs directas de imagen;
// cualquier otra URL pasa sin cambios.

const DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([\w-]+)/, // .../file/d/<id>/view?usp=sharing
  /drive\.google\.com\/open\?id=([\w-]+)/, // .../open?id=<id>
  /drive\.google\.com\/uc\?[^#]*id=([\w-]+)/, // ya directa: la dejamos uniforme
];

export function directImageUrl(url: string | undefined | null): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";
  for (const pattern of DRIVE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  return trimmed;
}
