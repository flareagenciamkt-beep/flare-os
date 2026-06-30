"use client";

// Vista previa "real" del feed: cómo se verían las piezas publicadas
// en el perfil del cliente (grid 3xN estilo Instagram + historias arriba).

import { FileText, Images, Megaphone, Play } from "lucide-react";
import { PieceImage } from "@/components/shared/piece-image";
import { ideaDate } from "@/lib/stats";
import { cn } from "@/lib/utils";
import {
  IDEA_STATUS_LABELS,
  type Idea,
  type IdeaFormat,
  type IdeaStatus,
} from "@/lib/types";

const STATUS_DOT: Record<IdeaStatus, string> = {
  idea: "bg-zinc-400",
  en_produccion: "bg-flare",
  en_revision_interna: "bg-violet-400",
  en_revision_cliente: "bg-fuchsia-400",
  aprobada: "bg-teal-400",
  programada: "bg-amber-400",
  publicada: "bg-emerald-400",
};

const FORMAT_ICON: Partial<Record<IdeaFormat, React.ComponentType<{ className?: string }>>> = {
  reel: Play,
  carrusel: Images,
  anuncio: Megaphone,
};

// Gradientes para piezas sin imagen aún (deterministas por id).
const PLACEHOLDER_GRADIENTS = [
  "from-orange-950 via-zinc-900 to-zinc-950",
  "from-zinc-800 via-zinc-900 to-black",
  "from-rose-950 via-zinc-900 to-zinc-950",
  "from-stone-800 via-zinc-900 to-zinc-950",
  "from-amber-950 via-zinc-900 to-black",
  "from-red-950 via-zinc-900 to-zinc-950",
];

function gradientFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

function sortByDateDesc(ideas: Idea[]) {
  return [...ideas].sort((a, b) =>
    (ideaDate(b) ?? b.createdAt).localeCompare(ideaDate(a) ?? a.createdAt),
  );
}

function Tile({ idea, onEdit }: { idea: Idea; onEdit: (idea: Idea) => void }) {
  const Icon = FORMAT_ICON[idea.format] ?? FileText;
  return (
    <button
      onClick={() => onEdit(idea)}
      title={`${idea.title} · ${IDEA_STATUS_LABELS[idea.status]}`}
      className="group relative aspect-square overflow-hidden bg-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Placeholder siempre debajo: si la imagen falla o no existe, se ve esto */}
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br p-2",
          gradientFor(idea.id),
        )}
      >
        <Icon className="size-5 text-white/35" />
        <p className="line-clamp-2 text-center text-[9px] font-medium leading-tight text-white/60">
          {idea.title}
        </p>
      </div>
      {idea.coverImage && (
        <PieceImage
          src={idea.coverImage}
          alt={idea.title}
          className="transition-transform duration-200 group-hover:scale-105"
        />
      )}

      {/* Indicador de formato (como IG) */}
      {FORMAT_ICON[idea.format] && (
        <Icon className="absolute right-1.5 top-1.5 size-3.5 text-white drop-shadow" />
      )}
      {/* Estado de producción */}
      <span
        className={cn(
          "absolute left-1.5 top-1.5 size-2 rounded-full ring-2 ring-black/40",
          STATUS_DOT[idea.status],
        )}
      />
      {idea.status !== "publicada" && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-3 text-left text-[8px] font-semibold uppercase tracking-wider text-white/80">
          {IDEA_STATUS_LABELS[idea.status]}
        </span>
      )}
    </button>
  );
}

function PhoneFrame({
  label,
  ideas,
  onEdit,
}: {
  label: string;
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
}) {
  const stories = sortByDateDesc(ideas.filter((i) => i.format === "historia"));
  const posts = sortByDateDesc(ideas.filter((i) => i.format !== "historia"));

  return (
    <div className="w-full max-w-90 overflow-hidden rounded-2xl border border-border bg-[#0a0b0e] shadow-lg">
      {/* Header del perfil */}
      <div className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-flare to-flare-soft text-xs font-bold text-white">
          {label.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          <p className="text-[10px] text-muted-foreground">
            Vista previa del feed · {posts.length} piezas
          </p>
        </div>
      </div>

      {/* Historias */}
      {stories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto border-b border-border/60 px-3.5 py-3">
          {stories.map((s) => (
            <button
              key={s.id}
              onClick={() => onEdit(s)}
              title={`${s.title} · ${IDEA_STATUS_LABELS[s.status]}`}
              className="flex w-14 shrink-0 flex-col items-center gap-1 outline-none"
            >
              <span className="rounded-full bg-gradient-to-tr from-flare via-flare-soft to-amber-400 p-[2px]">
                <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#0a0b0e] bg-zinc-800">
                  <span className="text-[9px] font-semibold text-white/60">
                    {s.title.slice(0, 2).toUpperCase()}
                  </span>
                  {s.coverImage && <PieceImage src={s.coverImage} alt={s.title} />}
                </span>
              </span>
              <span className="w-full truncate text-center text-[9px] text-muted-foreground">
                {s.title.replace(/^Historia:?\s*/i, "")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid de piezas */}
      {posts.length ? (
        <div className="grid grid-cols-3 gap-0.5 bg-black/40 p-0.5">
          {posts.map((idea) => (
            <Tile key={idea.id} idea={idea} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <p className="px-4 py-10 text-center text-xs text-muted-foreground">
          Sin piezas de feed todavía.
        </p>
      )}
    </div>
  );
}

interface FeedPreviewProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  groupByClient?: boolean;
  singleLabel?: string;
  // Resolución de nombre de cliente (inyectada para no depender del store:
  // el portal usa este componente sin FlareStoreProvider).
  clientName?: (clientId: string | null) => string;
}

export function FeedPreview({
  ideas,
  onEdit,
  groupByClient = true,
  singleLabel,
  clientName = () => "Cliente",
}: FeedPreviewProps) {

  const visible = ideas;

  const groups = groupByClient
    ? Array.from(
        visible.reduce((map, idea) => {
          const key = idea.clientId ?? "none";
          map.set(key, [...(map.get(key) ?? []), idea]);
          return map;
        }, new Map<string, Idea[]>()),
      )
    : ([["all", visible]] as [string, Idea[]][]);

  return (
    <div>
      {/* Leyenda de estados */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {(Object.keys(STATUS_DOT) as IdeaStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("size-2 rounded-full", STATUS_DOT[s])} />
            {IDEA_STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        {groups.map(([key, groupIdeas]) => (
          <PhoneFrame
            key={key}
            label={
              key === "all"
                ? (singleLabel ?? "Feed")
                : key === "none"
                  ? "Flare (interno)"
                  : clientName(key)
            }
            ideas={groupIdeas}
            onEdit={onEdit}
          />
        ))}
        {!groups.length && (
          <p className="text-xs text-muted-foreground">
            No hay piezas para previsualizar con estos filtros.
          </p>
        )}
      </div>
    </div>
  );
}
