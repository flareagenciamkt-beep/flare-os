// Opciones de preset para los modales (dropdowns y chips). Centralizadas para
// reducir escritura manual y mantener consistencia.

import type { Option } from "@/components/shared/simple-select";

const opts = (values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

// ─── Cliente · Información general ──────────────────────────────────────────
export const INDUSTRY_OPTIONS = opts([
  "Seguros",
  "Restaurantes",
  "Salud",
  "Belleza",
  "Real estate",
  "Automotriz",
  "Educación",
  "E-commerce",
  "Servicios profesionales",
  "Construcción",
  "Tecnología",
  "Otro",
]);

export const MAIN_GOAL_OPTIONS = opts([
  "Aumentar leads",
  "Aumentar ventas",
  "Mejorar posicionamiento",
  "Construir comunidad",
  "Lanzar marca",
  "Educar audiencia",
  "Mejorar retención",
  "Generar tráfico web",
  "Agendar citas",
  "Otro",
]);

export const GOAL_TYPE_OPTIONS = opts([
  "Leads",
  "Ventas",
  "Seguidores",
  "Alcance",
  "Interacciones",
  "Mensajes",
  "Reservas",
  "Visitas web",
  "Piezas",
]);

export const KPI_OPTIONS = opts([
  "Leads por WhatsApp",
  "Costo por lead",
  "Alcance",
  "Interacciones",
  "Seguidores",
  "Clics al link",
  "Mensajes recibidos",
  "Reservas",
  "Ventas",
  "CPC",
  "CPM",
  "CTR",
  "Engagement rate",
]);

// ─── Cliente · Operación ───────────────────────────────────────────────────
export const DELIVERABLE_OPTIONS = opts([
  "Parrilla mensual",
  "Reporte mensual",
  "Revisión de métricas",
  "Calendario editorial",
  "Propuesta creativa",
  "Campaña de pauta",
  "Reunión estratégica",
  "Otro",
]);

export const REVIEW_FREQUENCY_OPTIONS = opts([
  "Semanal",
  "Quincenal",
  "Mensual",
  "Solo cuando sea necesario",
]);

// ─── Cliente · Servicios y canales ─────────────────────────────────────────
export const SERVICE_CHIPS = [
  "Estrategia",
  "Contenido",
  "Diseño",
  "Reels",
  "Carruseles",
  "Historias",
  "Community management",
  "Pauta Meta",
  "Pauta Google",
  "Landing page",
  "Automatización",
  "Email marketing",
  "Reportería",
  "Consultoría",
];

export const CHANNEL_CHIPS = [
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "Google",
  "WhatsApp",
  "Email",
  "Blog",
  "Web",
];

export const FORMAT_CHIPS = [
  "Reels",
  "Carruseles",
  "Posts",
  "Historias",
  "Lives",
  "Shorts",
  "Ads",
  "Blogs",
  "Emails",
];

export const PUBLISH_FREQUENCY_OPTIONS = opts([
  "3 piezas por semana",
  "4 piezas por semana",
  "5 piezas por semana",
  "8 piezas por mes",
  "12 piezas por mes",
  "16 piezas por mes",
  "Personalizado",
]);

// ─── Cliente · Contrato ────────────────────────────────────────────────────
export const CONTRACT_TYPE_OPTIONS = opts([
  "Mensual",
  "Trimestral",
  "Semestral",
  "Anual",
  "Proyecto único",
]);

export const PAYMENT_METHOD_OPTIONS = opts([
  "Transferencia",
  "Stripe",
  "PayPal",
  "Efectivo",
  "Otro",
]);

export const CLIENT_PAYMENT_STATUS_OPTIONS = opts([
  "Al día",
  "Pendiente",
  "Vencido",
  "En revisión",
]);

// ─── Cliente · Portal ──────────────────────────────────────────────────────
export const PORTAL_ROLE_OPTIONS = opts([
  "Dueño",
  "Marketing manager",
  "Asistente",
  "Aprobador",
  "Observador",
]);

export const PORTAL_VISIBILITY_OPTIONS = opts([
  "Solo métricas y contenido",
  "Métricas, contenido y tareas",
  "Vista completa del cliente",
]);

export const PORTAL_PERMISSIONS: { key: string; label: string }[] = [
  { key: "metrics", label: "Puede ver métricas" },
  { key: "calendar", label: "Puede ver calendario" },
  { key: "comment", label: "Puede comentar piezas" },
  { key: "approve", label: "Puede aprobar piezas" },
  { key: "createTasks", label: "Puede crear tareas" },
  { key: "reports", label: "Puede ver reportes" },
  { key: "download", label: "Puede descargar archivos" },
];

// ─── Idea ──────────────────────────────────────────────────────────────────
export const IDEA_TYPE_OPTIONS = opts([
  "Post educativo",
  "Reel",
  "Carrusel",
  "Historia",
  "Testimonio",
  "Oferta",
  "Behind the scenes",
  "Caso de éxito",
  "Pregunta frecuente",
  "Contenido de autoridad",
  "Contenido comercial",
  "Contenido de comunidad",
]);

// Plantillas rápidas: prellenan tipo + título + descripción.
export interface IdeaTemplate {
  label: string;
  ideaType: string;
  title: string;
  description: string;
  format: string; // valor de IdeaFormat
}

export const IDEA_TEMPLATES: IdeaTemplate[] = [
  { label: "Carrusel educativo", ideaType: "Post educativo", title: "5 cosas que deberías saber sobre…", description: "Carrusel educativo que resuelve una duda común de la audiencia.", format: "carrusel" },
  { label: "Reel de autoridad", ideaType: "Contenido de autoridad", title: "El error #1 que comete la gente con…", description: "Reel corto demostrando expertise y construyendo confianza.", format: "reel" },
  { label: "Post comercial", ideaType: "Contenido comercial", title: "Oferta del mes: …", description: "Pieza con llamada a la acción clara hacia venta o contacto.", format: "post" },
  { label: "Historia interactiva", ideaType: "Contenido de comunidad", title: "¿Tú qué prefieres?", description: "Historia con encuesta o quiz para activar a la comunidad.", format: "historia" },
  { label: "Testimonio", ideaType: "Testimonio", title: "Lo que dice nuestro cliente…", description: "Testimonio real en formato social proof.", format: "reel" },
  { label: "Pregunta frecuente", ideaType: "Pregunta frecuente", title: "¿Cómo funciona…?", description: "Respondemos una pregunta frecuente de los clientes.", format: "carrusel" },
  { label: "Comparativo", ideaType: "Post educativo", title: "Opción A vs Opción B", description: "Comparativo que ayuda a decidir y posiciona la oferta.", format: "carrusel" },
  { label: "Checklist", ideaType: "Post educativo", title: "Checklist para…", description: "Lista accionable que la audiencia querrá guardar.", format: "carrusel" },
  { label: "Antes/después", ideaType: "Caso de éxito", title: "Antes y después: …", description: "Transformación visual que demuestra resultados.", format: "reel" },
  { label: "Caso de éxito", ideaType: "Caso de éxito", title: "Cómo ayudamos a … a lograr …", description: "Historia de resultado con contexto, acción y métrica.", format: "carrusel" },
];

// ─── Tarea ─────────────────────────────────────────────────────────────────
export const TASK_TYPE_OPTIONS = opts([
  "Crear copy",
  "Diseñar pieza",
  "Editar video",
  "Revisar contenido",
  "Programar publicación",
  "Cargar métricas",
  "Enviar a cliente",
  "Hacer cambios",
  "Publicar",
  "Crear reporte",
  "Reunión",
  "Otro",
]);
