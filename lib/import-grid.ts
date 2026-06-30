// Parser de parrilla importada (pegada desde Sheets/Excel o CSV). Detecta el
// delimitador, mapea cabeceras flexibles (sin acentos/mayúsculas) a campos de
// Idea y normaliza formato/canal/estado/prioridad y fechas.

import {
  CHANNEL_LABELS,
  FORMAT_LABELS,
  IDEA_STATUS_LABELS,
  PRIORITY_LABELS,
  type Channel,
  type IdeaFormat,
  type IdeaStatus,
  type Priority,
} from "@/lib/types";

export interface ParsedRow {
  title: string;
  description: string;
  ideaType: string;
  format: IdeaFormat;
  channel: Channel;
  status: IdeaStatus;
  priority: Priority;
  responsible: string;
  suggestedDate: string | null;
  publishDate: string | null;
  copy: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  skipped: number; // filas sin título
  total: number;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Busca la key de un Record<label> cuyo label o key coincida (sin acentos).
function matchKey<T extends string>(labels: Record<T, string>, value: string): T | undefined {
  const v = norm(value);
  if (!v) return undefined;
  for (const [key, label] of Object.entries(labels) as [T, string][]) {
    if (norm(label) === v || norm(key) === v) return key;
  }
  return undefined;
}

function parseDate(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const dm = v.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dm) {
    const [, d, m, y] = dm;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(v);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

// Sinónimos aceptados por columna (todos normalizados).
const COLUMN_ALIASES: Record<keyof ParsedRow, string[]> = {
  title: ["titulo", "title", "pieza", "contenido", "tema"],
  description: ["descripcion", "description", "concepto", "idea"],
  ideaType: ["tipo", "tipo de idea", "tipo de contenido"],
  format: ["formato", "format"],
  channel: ["canal", "channel", "red", "plataforma"],
  status: ["estado", "status"],
  priority: ["prioridad", "priority"],
  responsible: ["responsable", "owner", "encargado"],
  suggestedDate: ["fecha", "fecha sugerida", "fecha tentativa"],
  publishDate: ["fecha de publicacion", "fecha publicacion", "publicacion", "publish"],
  copy: ["copy", "caption", "texto"],
};

function resolveColumns(headers: string[]): Partial<Record<keyof ParsedRow, number>> {
  const map: Partial<Record<keyof ParsedRow, number>> = {};
  headers.forEach((h, i) => {
    const hn = norm(h);
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [keyof ParsedRow, string[]][]) {
      if (map[field] === undefined && aliases.includes(hn)) map[field] = i;
    }
  });
  return map;
}

export function parseGrid(
  text: string,
  defaults: { responsible: string },
): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { rows: [], skipped: 0, total: 0 };

  // Delimitador: tab si existe (pegado de Sheets), si no coma.
  const delim = lines[0].includes("\t") ? "\t" : ",";
  const split = (line: string) => line.split(delim).map((c) => c.trim());

  const headers = split(lines[0]);
  const cols = resolveColumns(headers);
  // Sin cabecera de título reconocida → asumimos orden por defecto.
  const ordered = cols.title === undefined;

  const rows: ParsedRow[] = [];
  let skipped = 0;

  for (const line of lines.slice(ordered ? 0 : 1)) {
    const cells = split(line);
    const get = (field: keyof ParsedRow, fallbackIndex: number) => {
      const idx = ordered ? fallbackIndex : cols[field];
      return idx !== undefined && cells[idx] !== undefined ? cells[idx].trim() : "";
    };

    const title = get("title", 0);
    if (!title) {
      skipped += 1;
      continue;
    }

    rows.push({
      title,
      description: get("description", 1),
      ideaType: get("ideaType", 2),
      format: matchKey(FORMAT_LABELS, get("format", 3)) ?? "carrusel",
      channel: matchKey(CHANNEL_LABELS, get("channel", 4)) ?? "instagram",
      status: matchKey(IDEA_STATUS_LABELS, get("status", 5)) ?? "idea",
      priority: matchKey(PRIORITY_LABELS, get("priority", 6)) ?? "media",
      responsible: get("responsible", 7) || defaults.responsible,
      suggestedDate: parseDate(get("suggestedDate", 8)),
      publishDate: parseDate(get("publishDate", 9)),
      copy: get("copy", 10),
    });
  }

  return { rows, skipped, total: rows.length + skipped };
}
