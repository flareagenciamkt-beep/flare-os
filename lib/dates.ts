import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(
  iso: string | null | undefined,
  pattern = "d MMM yyyy",
): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern, { locale: es });
  } catch {
    return iso;
  }
}
