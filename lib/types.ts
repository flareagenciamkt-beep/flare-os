// ─── Flare OS — Domain types ────────────────────────────────────────────────
// Regla clave: ideas, tasks, resources, prompts y processes tienen clientId
// opcional. Con clientId → pertenece a un cliente; sin él → interno de Flare.

export type ClientStatus = "activo" | "pausado" | "prospecto" | "cerrado";
export type Priority = "baja" | "media" | "alta" | "urgente";
export type ClientPriority = "baja" | "media" | "alta";
export type ClientPhase =
  | "onboarding"
  | "estrategia"
  | "produccion"
  | "publicacion"
  | "optimizacion"
  | "pausa"
  | "cerrado";
export type HealthStatus = "bien" | "atencion" | "atrasado" | "critico";

export interface ClientLink {
  label: string;
  url: string;
}

export interface Client {
  id: string;
  name: string;
  brand: string;
  industry: string;
  status: ClientStatus;
  owner: string;
  priority: ClientPriority;
  currentPhase: ClientPhase;
  healthStatus: HealthStatus;
  progressPercentage: number;
  description: string;
  mainGoal: string;
  monthlyGoal: string;
  contentGoal: string;
  mainKpi: string;
  nextAction: string;
  importantLinks: ClientLink[];
  internalNotes: string;
  // Relación comercial y planificación (V1.1)
  monthlyFee: number;
  currency: string;
  startDate: string | null;
  activeServices: string[];
  activeChannels: string[];
  nextDeliverable: string;
  lastUpdate: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

// ─── Vista 360 (V1.1) ───────────────────────────────────────────────────────

export interface ClientStrategy {
  id: string;
  clientId: string;
  brandBrief: string;
  targetAudience: string;
  offer: string;
  tone: string;
  brandPromise: string;
  differentiators: string;
  competitors: string;
  doGuidelines: string;
  dontGuidelines: string;
  strategicNotes: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteType =
  | "general"
  | "reunion"
  | "feedback"
  | "problema"
  | "decision"
  | "recordatorio"
  | "estrategia";

export interface ClientNote {
  id: string;
  clientId: string;
  title: string;
  content: string;
  type: NoteType;
  isPinned: boolean;
  responsible: string;
  relatedEntityType: string;
  relatedEntityId: string;
  createdAt: string;
  updatedAt: string;
}

export type AccessStatus =
  | "pendiente"
  | "solicitado"
  | "recibido"
  | "validado"
  | "problema";

export interface ClientAccess {
  id: string;
  clientId: string;
  platform: string;
  usernameOrEmail: string;
  url: string;
  status: AccessStatus;
  responsible: string;
  requiresSensitiveAccess: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientMeeting {
  id: string;
  clientId: string;
  meetingDate: string;
  type: string;
  participants: string;
  topics: string;
  decisions: string;
  pendingItems: string;
  nextMeetingDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = "pendiente" | "pagado" | "vencido" | "parcial";

export interface ClientBilling {
  id: string;
  clientId: string;
  monthlyFee: number;
  currency: string;
  paymentStatus: PaymentStatus;
  billingDate: string | null;
  includedServices: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export type IdeaCategory =
  | "contenido"
  | "campana"
  | "automatizacion"
  | "web"
  | "estrategia"
  | "diseno"
  | "ventas"
  | "otro";
export type IdeaStatus =
  | "idea"
  | "validada"
  | "en_produccion"
  | "en_revision_interna"
  | "en_revision_cliente"
  | "aprobada"
  | "programada"
  | "publicada"
  | "pausada"
  | "archivada";
export type IdeaFormat =
  | "carrusel"
  | "reel"
  | "historia"
  | "blog"
  | "email"
  | "landing"
  | "anuncio"
  | "automatizacion"
  | "otro";
export type Channel =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "linkedin"
  | "web"
  | "email"
  | "whatsapp"
  | "otro";

export type ClientApproval = "pendiente" | "aprobada" | "cambios_solicitados";

export interface Idea {
  id: string;
  clientId: string | null;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  priority: Priority;
  format: IdeaFormat;
  channel: Channel;
  suggestedDate: string | null;
  publishDate: string | null;
  responsible: string;
  notes: string;
  prompt: string;
  references: string;
  // Producción (V1.2)
  copy?: string;
  script?: string;
  designNotes?: string;
  externalUrl?: string;
  coverImage?: string; // URL de la pieza/diseño para la vista previa del feed
  // Aprobación desde el portal de clientes (opcional: mocks y forms no la tocan)
  clientApproval?: ClientApproval;
  clientFeedback?: string;
  clientApprovalAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | "pendiente"
  | "en_progreso"
  | "bloqueada"
  | "en_revision"
  | "completada";
export type TaskArea =
  | "contenido"
  | "diseno"
  | "copy"
  | "pauta"
  | "web"
  | "automatizacion"
  | "estrategia"
  | "cuenta"
  | "ventas"
  | "otro";

export interface Task {
  id: string;
  clientId: string | null;
  ideaId: string | null;
  meetingId?: string | null; // V1.2: relación opcional con reunión
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  responsible: string;
  dueDate: string | null;
  area: TaskArea;
  notes: string;
  relatedLink: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType =
  | "logo"
  | "brandbook"
  | "foto"
  | "video"
  | "documento"
  | "prompt"
  | "sop"
  | "plantilla"
  | "script"
  | "nota"
  | "referencia"
  | "proceso"
  | "link"
  | "otro";
export type ResourceCategory =
  | "contenido"
  | "diseno"
  | "estrategia"
  | "automatizacion"
  | "ventas"
  | "desarrollo"
  | "cliente"
  | "otro";

export interface Resource {
  id: string;
  clientId: string | null;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  content: string;
  externalLink: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  clientId: string | null;
  title: string;
  category: ResourceCategory;
  promptContent: string;
  recommendedUse: string;
  requiredVariables: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProcessStatus = "activo" | "borrador" | "archivado";

export interface Process {
  id: string;
  clientId: string | null;
  title: string;
  area: TaskArea;
  description: string;
  steps: string[];
  responsible: string;
  frequency: string;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
}

// Subconjunto de Client expuesto al portal (espejo del RPC portal_client)
export interface PortalClient {
  id: string;
  name: string;
  brand: string;
  industry: string;
  status: ClientStatus;
  currentPhase: ClientPhase;
  progressPercentage: number;
  mainGoal: string;
  monthlyGoal: string;
  contentGoal: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "team" | "client";
  clientId: string | null;
}

export interface ClientMetric {
  id: string;
  clientId: string;
  periodMonth: number; // 1-12
  periodYear: number;
  instagramFollowers: number;
  monthlyReach: number;
  impressions: number;
  clicks: number;
  interactions: number;
  leadsGenerated: number;
  whatsappClicks: number;
  postsPublished: number;
  reelsPublished: number;
  carouselsPublished: number;
  storiesPublished: number;
  adSpend: number;
  relevantResults: string;
  performanceNotes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Labels y opciones (para selects, badges y filtros) ────────────────────

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  activo: "Activo",
  pausado: "Pausado",
  prospecto: "Prospecto",
  cerrado: "Cerrado",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export const PHASE_LABELS: Record<ClientPhase, string> = {
  onboarding: "Onboarding",
  estrategia: "Estrategia",
  produccion: "Producción",
  publicacion: "Publicación",
  optimizacion: "Optimización",
  pausa: "Pausa",
  cerrado: "Cerrado",
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  bien: "Bien",
  atencion: "Atención",
  atrasado: "Atrasado",
  critico: "Crítico",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  idea: "Idea",
  validada: "Validada",
  en_produccion: "En producción",
  en_revision_interna: "Revisión interna",
  en_revision_cliente: "Revisión cliente",
  aprobada: "Aprobada",
  programada: "Programada",
  publicada: "Publicada",
  pausada: "Pausada",
  archivada: "Archivada",
};

export const IDEA_CATEGORY_LABELS: Record<IdeaCategory, string> = {
  contenido: "Contenido",
  campana: "Campaña",
  automatizacion: "Automatización",
  web: "Web",
  estrategia: "Estrategia",
  diseno: "Diseño",
  ventas: "Ventas",
  otro: "Otro",
};

export const FORMAT_LABELS: Record<IdeaFormat, string> = {
  carrusel: "Carrusel",
  reel: "Reel",
  historia: "Historia",
  blog: "Blog",
  email: "Email",
  landing: "Landing",
  anuncio: "Anuncio",
  automatizacion: "Automatización",
  otro: "Otro",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  web: "Web",
  email: "Email",
  whatsapp: "WhatsApp",
  otro: "Otro",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  bloqueada: "Bloqueada",
  en_revision: "En revisión",
  completada: "Completada",
};

export const AREA_LABELS: Record<TaskArea, string> = {
  contenido: "Contenido",
  diseno: "Diseño",
  copy: "Copy",
  pauta: "Pauta",
  web: "Web",
  automatizacion: "Automatización",
  estrategia: "Estrategia",
  cuenta: "Cuenta",
  ventas: "Ventas",
  otro: "Otro",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  logo: "Logo",
  brandbook: "Brandbook",
  foto: "Foto",
  video: "Video",
  documento: "Documento",
  prompt: "Prompt",
  sop: "SOP",
  plantilla: "Plantilla",
  script: "Script",
  nota: "Nota",
  referencia: "Referencia",
  proceso: "Proceso",
  link: "Link",
  otro: "Otro",
};

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  contenido: "Contenido",
  diseno: "Diseño",
  estrategia: "Estrategia",
  automatizacion: "Automatización",
  ventas: "Ventas",
  desarrollo: "Desarrollo",
  cliente: "Cliente",
  otro: "Otro",
};

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  activo: "Activo",
  borrador: "Borrador",
  archivado: "Archivado",
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general: "General",
  reunion: "Reunión",
  feedback: "Feedback",
  problema: "Problema",
  decision: "Decisión",
  recordatorio: "Recordatorio",
  estrategia: "Estrategia",
};

export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  pendiente: "Pendiente",
  solicitado: "Solicitado",
  recibido: "Recibido",
  validado: "Validado",
  problema: "Problema",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido",
  parcial: "Parcial",
};

export const CURRENCY_OPTIONS = ["USD", "COP", "EUR", "MXN"] as const;

export const CLIENT_APPROVAL_LABELS: Record<ClientApproval, string> = {
  pendiente: "Pendiente de aprobación",
  aprobada: "Aprobada por cliente",
  cambios_solicitados: "Cambios solicitados",
};

// Columnas del kanban: el flujo principal de producción.
// "pausada" y "archivada" no son columnas: se llega vía menú "Mover a".
export const KANBAN_COLUMNS: IdeaStatus[] = [
  "idea",
  "validada",
  "en_produccion",
  "en_revision_interna",
  "en_revision_cliente",
  "aprobada",
  "programada",
  "publicada",
];

export const TEAM_MEMBERS = ["Juan", "Sara", "Andrés", "Laura"] as const;

export const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function optionsFromLabels<T extends string>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}
