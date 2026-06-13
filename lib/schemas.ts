import { z } from "zod";

// Schemas de validación de Flare OS V1 (React Hook Form + Zod).

export const clientSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  brand: z.string().min(1, "La marca es obligatoria"),
  industry: z.string().min(2, "La industria es obligatoria"),
  status: z.enum(["activo", "pausado", "prospecto", "cerrado"]),
  owner: z.string().min(1, "Asigna un responsable"),
  priority: z.enum(["baja", "media", "alta"]),
  currentPhase: z.enum([
    "onboarding",
    "estrategia",
    "produccion",
    "publicacion",
    "optimizacion",
    "pausa",
    "cerrado",
  ]),
  healthStatus: z.enum(["bien", "atencion", "atrasado", "critico"]),
  progressPercentage: z.coerce.number().min(0, "Mínimo 0").max(100, "Máximo 100"),
  description: z.string(),
  mainGoal: z.string(),
  monthlyGoal: z.string(),
  contentGoal: z.string(),
  mainKpi: z.string(),
  nextAction: z.string(),
  linksText: z.string(), // una línea por link: "Etiqueta | https://url"
  internalNotes: z.string(),
  // V1.1 — relación comercial
  monthlyFee: z.coerce.number().min(0, "Mínimo 0"),
  currency: z.string().min(1),
  startDate: z.string(),
  servicesText: z.string(), // servicios separados por coma
  channelsText: z.string(), // canales separados por coma
  nextDeliverable: z.string(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// ─── Vista 360 (V1.1) ───────────────────────────────────────────────────────

export const strategySchema = z.object({
  brandBrief: z.string(),
  targetAudience: z.string(),
  offer: z.string(),
  tone: z.string(),
  brandPromise: z.string(),
  differentiators: z.string(),
  competitors: z.string(),
  doGuidelines: z.string(),
  dontGuidelines: z.string(),
  strategicNotes: z.string(),
});

export type StrategyFormValues = z.infer<typeof strategySchema>;

export const noteSchema = z.object({
  title: z.string().min(2, "El título es obligatorio"),
  content: z.string(),
  type: z.enum([
    "general",
    "reunion",
    "feedback",
    "problema",
    "decision",
    "recordatorio",
    "estrategia",
  ]),
  isPinned: z.boolean(),
  responsible: z.string().min(1, "Asigna un responsable"),
  // Relación opcional: "none" | "idea" | "task" | "meeting" + id de la entidad
  relatedEntityType: z.string(),
  relatedEntityId: z.string(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const accessSchema = z.object({
  platform: z.string().min(2, "La plataforma es obligatoria"),
  usernameOrEmail: z.string(),
  url: z.string(),
  status: z.enum(["pendiente", "solicitado", "recibido", "validado", "problema"]),
  responsible: z.string().min(1, "Asigna un responsable"),
  requiresSensitiveAccess: z.boolean(),
  notes: z.string(),
});

export type AccessFormValues = z.infer<typeof accessSchema>;

export const meetingSchema = z.object({
  meetingDate: z.string().min(1, "La fecha es obligatoria"),
  type: z.string(),
  participants: z.string(),
  topics: z.string(),
  decisions: z.string(),
  pendingItems: z.string(),
  nextMeetingDate: z.string(),
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;

export const billingSchema = z.object({
  monthlyFee: z.coerce.number().min(0),
  currency: z.string().min(1),
  paymentStatus: z.enum(["pendiente", "pagado", "vencido", "parcial"]),
  billingDate: z.string(),
  includedServices: z.string(),
  observations: z.string(),
});

export type BillingFormValues = z.infer<typeof billingSchema>;

export const ideaSchema = z.object({
  clientId: z.string(), // "none" = interno de Flare
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string(),
  category: z.enum([
    "contenido",
    "campana",
    "automatizacion",
    "web",
    "estrategia",
    "diseno",
    "ventas",
    "otro",
  ]),
  status: z.enum([
    "idea",
    "validada",
    "en_produccion",
    "en_revision_interna",
    "en_revision_cliente",
    "aprobada",
    "programada",
    "publicada",
    "pausada",
    "archivada",
  ]),
  priority: z.enum(["baja", "media", "alta", "urgente"]),
  format: z.enum([
    "carrusel",
    "reel",
    "historia",
    "blog",
    "email",
    "landing",
    "anuncio",
    "automatizacion",
    "otro",
  ]),
  channel: z.enum([
    "instagram",
    "tiktok",
    "facebook",
    "linkedin",
    "web",
    "email",
    "whatsapp",
    "otro",
  ]),
  suggestedDate: z.string(),
  publishDate: z.string(),
  responsible: z.string().min(1, "Asigna un responsable"),
  notes: z.string(),
  prompt: z.string(),
  references: z.string(),
  coverImage: z.string(),
  // Producción (V1.2)
  copy: z.string(),
  script: z.string(),
  designNotes: z.string(),
  externalUrl: z.string(),
});

export type IdeaFormValues = z.infer<typeof ideaSchema>;

export const taskSchema = z.object({
  clientId: z.string(),
  ideaId: z.string(),
  meetingId: z.string(), // "none" = sin reunión asociada
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string(),
  status: z.enum(["pendiente", "en_progreso", "bloqueada", "en_revision", "completada"]),
  priority: z.enum(["baja", "media", "alta", "urgente"]),
  responsible: z.string().min(1, "Asigna un responsable"),
  dueDate: z.string(),
  area: z.enum([
    "contenido",
    "diseno",
    "copy",
    "pauta",
    "web",
    "automatizacion",
    "estrategia",
    "cuenta",
    "ventas",
    "otro",
  ]),
  notes: z.string(),
  relatedLink: z.string(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const resourceSchema = z.object({
  clientId: z.string(),
  title: z.string().min(2, "El título es obligatorio"),
  type: z.enum([
    "logo",
    "brandbook",
    "foto",
    "video",
    "documento",
    "prompt",
    "sop",
    "plantilla",
    "script",
    "nota",
    "referencia",
    "proceso",
    "link",
    "otro",
  ]),
  category: z.enum([
    "contenido",
    "diseno",
    "estrategia",
    "automatizacion",
    "ventas",
    "desarrollo",
    "cliente",
    "otro",
  ]),
  content: z.string(),
  externalLink: z.string(),
  tagsText: z.string(), // tags separados por coma
});

export type ResourceFormValues = z.infer<typeof resourceSchema>;

export const promptSchema = z.object({
  clientId: z.string(),
  title: z.string().min(2, "El título es obligatorio"),
  category: z.enum([
    "contenido",
    "diseno",
    "estrategia",
    "automatizacion",
    "ventas",
    "desarrollo",
    "cliente",
    "otro",
  ]),
  promptContent: z.string().min(10, "Escribe el prompt completo"),
  recommendedUse: z.string(),
  variablesText: z.string(), // variables separadas por coma
  tagsText: z.string(),
});

export type PromptFormValues = z.infer<typeof promptSchema>;

export const processSchema = z.object({
  clientId: z.string(),
  title: z.string().min(2, "El título es obligatorio"),
  area: z.enum([
    "contenido",
    "diseno",
    "copy",
    "pauta",
    "web",
    "automatizacion",
    "estrategia",
    "cuenta",
    "ventas",
    "otro",
  ]),
  description: z.string(),
  stepsText: z.string().min(3, "Agrega al menos un paso (uno por línea)"),
  responsible: z.string().min(1, "Asigna un responsable"),
  frequency: z.string(),
  status: z.enum(["activo", "borrador", "archivado"]),
});

export type ProcessFormValues = z.infer<typeof processSchema>;

export const metricSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  periodMonth: z.coerce.number().min(1).max(12),
  periodYear: z.coerce.number().min(2020).max(2100),
  instagramFollowers: z.coerce.number().min(0),
  monthlyReach: z.coerce.number().min(0),
  impressions: z.coerce.number().min(0),
  clicks: z.coerce.number().min(0),
  interactions: z.coerce.number().min(0),
  leadsGenerated: z.coerce.number().min(0),
  whatsappClicks: z.coerce.number().min(0),
  postsPublished: z.coerce.number().min(0),
  reelsPublished: z.coerce.number().min(0),
  carouselsPublished: z.coerce.number().min(0),
  storiesPublished: z.coerce.number().min(0),
  adSpend: z.coerce.number().min(0),
  relevantResults: z.string(),
  performanceNotes: z.string(),
});

export type MetricFormValues = z.infer<typeof metricSchema>;

// Helpers de conversión texto ↔ estructuras
export function parseLinks(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((s) => s.trim());
      return url ? { label, url } : { label: line, url: line };
    });
}

export function linksToText(links: { label: string; url: string }[]) {
  return links.map((l) => `${l.label} | ${l.url}`).join("\n");
}

export function parseList(text: string, separator: RegExp | string = ",") {
  return text
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function nullableClientId(value: string): string | null {
  return value === "none" ? null : value;
}

export function nullableDate(value: string): string | null {
  return value.trim() === "" ? null : value;
}
