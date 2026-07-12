// ─── Flare OS — Domain types ────────────────────────────────────────────────
// Regla clave: ideas, tasks, resources, prompts y processes tienen clientId
// opcional. Con clientId → pertenece a un cliente; sin él → interno de Flare.

export type ClientStatus =
  | "prospecto"
  | "onboarding"
  | "activo"
  | "pausado"
  | "cerrado"
  | "perdido";
export type Priority = "baja" | "media" | "alta" | "urgente";
export type ClientPriority = "baja" | "media" | "alta" | "urgente";
export type ClientPhase =
  | "onboarding"
  | "estrategia"
  | "produccion"
  | "revision_interna"
  | "revision_cliente"
  | "publicacion"
  | "optimizacion"
  | "reporte_mensual";
export type HealthStatus = "bien" | "observacion" | "riesgo" | "critico" | "pausado";

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
  // V1.3 — campos estructurados de los modales premium (todos opcionales)
  monthlyGoalType?: string;
  monthlyGoalValue?: number;
  contentGoalType?: string;
  contentGoalValue?: number;
  reviewFrequency?: string;
  mainFormats?: string[];
  publishFrequency?: string;
  contractType?: string;
  paymentMethod?: string;
  clientPaymentStatus?: string;
  renewalDate?: string | null;
  portalContactName?: string;
  portalAccessEmail?: string;
  portalRole?: string;
  portalVisibility?: string;
  portalPermissions?: ClientPortalPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPortalPermissions {
  metrics: boolean;
  calendar: boolean;
  comment: boolean;
  approve: boolean;
  createTasks: boolean;
  reports: boolean;
  download: boolean;
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

// ─── Cuentas conectadas para analytics (V1.4) ────────────────────────────────
// Asocia cuentas de plataformas (Instagram, TikTok…) a un cliente para atribuir
// sus métricas. Distinto de ClientAccess (checklist de accesos): esto identifica
// LA cuenta medida. La conexión OAuth es opcional: sin credenciales de la
// plataforma la cuenta queda "asociada" en modo manual y las métricas se siguen
// registrando a mano. Los tokens OAuth nunca viven en este tipo: van en la tabla
// connected_account_tokens, solo accesible desde el servidor.

export type ConnectedProvider =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "meta_ads"
  | "google_analytics"
  | "otro";

export type ConnectedAccountStatus =
  | "asociada" // registrada manualmente, sin conexión API
  | "conectada" // OAuth activo, lista para sync
  | "expirada" // token vencido: requiere reconexión
  | "error" // el último sync falló
  | "desconectada"; // desvinculada de la API (sigue asociada al cliente)

export interface ConnectedAccount {
  id: string;
  clientId: string;
  provider: ConnectedProvider;
  handle: string; // @usuario o nombre de la cuenta en la plataforma
  url: string;
  externalId: string; // id de la cuenta en la plataforma (lo llena el OAuth)
  status: ConnectedAccountStatus;
  syncEnabled: boolean;
  connectedAt: string | null;
  lastSyncAt: string | null;
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
// Estados simplificados del ciclo de producción (7). Los antiguos
// "validada", "pausada" y "archivada" se remapearon a estos.
export type IdeaStatus =
  | "idea"
  | "en_produccion"
  | "en_revision_interna"
  | "en_revision_cliente"
  | "aprobada"
  | "programada"
  | "publicada";
export type IdeaFormat =
  | "carrusel"
  | "reel"
  | "post"
  | "historia"
  | "tiktok"
  | "short"
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
  ideaType?: string; // tipo de idea (preset) — V1.3
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
  coverImage?: string; // URL de portada (primera imagen) para la vista previa
  images?: string[]; // galería de imágenes (carruseles = varias) — V1.3
  // Aprobación desde el portal de clientes (opcional: mocks y forms no la tocan)
  clientApproval?: ClientApproval;
  clientFeedback?: string;
  clientApprovalAt?: string | null;
  // Registro de aprobación: quién dio el OK y cuándo (cliente o equipo).
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Comentarios/hilo de una pieza. Los crean equipo o cliente desde el detalle.
export type CommentAuthorRole = "admin" | "team" | "client";

export interface IdeaComment {
  id: string;
  ideaId: string;
  author: string; // nombre o email visible
  authorRole: CommentAuthorRole;
  body: string;
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
  | "estrategia"
  | "contenido"
  | "diseno"
  | "video"
  | "pauta"
  | "community"
  | "metricas"
  | "cliente"
  | "admin"
  // Legacy (datos existentes)
  | "copy"
  | "web"
  | "automatizacion"
  | "cuenta"
  | "ventas"
  | "otro";

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  clientId: string | null;
  ideaId: string | null;
  meetingId?: string | null; // V1.2: relación opcional con reunión
  taskType?: string; // tipo de tarea (preset) — V1.3
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  responsible: string;
  dueDate: string | null;
  area: TaskArea;
  notes: string;
  relatedLink: string;
  checklist?: TaskChecklistItem[];
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

// Roles del sistema. "admin" y "team" operan el módulo agencia; "client" usa
// solo el portal. admin tiene capacidades extra (ajustes, facturación, gestión).
export type Role = "admin" | "team" | "client";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
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
  prospecto: "Prospecto",
  onboarding: "Onboarding",
  activo: "Activo",
  pausado: "Pausado",
  cerrado: "Cerrado",
  perdido: "Perdido",
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
  revision_interna: "Revisión interna",
  revision_cliente: "Revisión cliente",
  publicacion: "Publicación",
  optimizacion: "Optimización",
  reporte_mensual: "Reporte mensual",
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  bien: "Bien",
  observacion: "En observación",
  riesgo: "En riesgo",
  critico: "Crítico",
  pausado: "Pausado",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  idea: "Idea",
  en_produccion: "En producción",
  en_revision_interna: "Revisión interna",
  en_revision_cliente: "Revisión cliente",
  aprobada: "Aprobada",
  programada: "Programada",
  publicada: "Publicada",
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
  post: "Post",
  historia: "Historia",
  tiktok: "TikTok",
  short: "Short",
  blog: "Blog",
  email: "Email",
  landing: "Landing",
  anuncio: "Anuncio (Ad)",
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
  en_progreso: "En proceso",
  bloqueada: "Bloqueada",
  en_revision: "En revisión",
  completada: "Completada",
};

export const AREA_LABELS: Record<TaskArea, string> = {
  estrategia: "Estrategia",
  contenido: "Contenido",
  diseno: "Diseño",
  video: "Video",
  pauta: "Pauta",
  community: "Community",
  metricas: "Métricas",
  cliente: "Cliente",
  admin: "Admin",
  copy: "Copy",
  web: "Web",
  automatizacion: "Automatización",
  cuenta: "Cuenta",
  ventas: "Ventas",
  otro: "Otro",
};

// Áreas que se ofrecen en el modal de tarea (spec). Las legacy quedan válidas
// para datos existentes pero no se listan.
export const TASK_AREA_OPTIONS = [
  "estrategia",
  "contenido",
  "diseno",
  "video",
  "pauta",
  "community",
  "metricas",
  "cliente",
  "admin",
].map((v) => ({ value: v, label: AREA_LABELS[v as TaskArea] }));

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

export const CONNECTED_PROVIDER_LABELS: Record<ConnectedProvider, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  meta_ads: "Meta Ads",
  google_analytics: "Google Analytics",
  otro: "Otra",
};

export const CONNECTED_ACCOUNT_STATUS_LABELS: Record<ConnectedAccountStatus, string> = {
  asociada: "Asociada (manual)",
  conectada: "Conectada",
  expirada: "Token expirado",
  error: "Error de sync",
  desconectada: "Desconectada",
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

// Columnas del kanban: el flujo principal de producción (los 7 estados).
export const KANBAN_COLUMNS: IdeaStatus[] = [
  "idea",
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
