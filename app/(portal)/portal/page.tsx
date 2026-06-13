"use client";

import { CalendarDays, CheckCircle2, Eye, Send, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/stat-card";
import { FormatBadge, ChannelBadge, PhaseBadge } from "@/components/shared/badges";
import { PieceImage } from "@/components/shared/piece-image";
import { usePortalIdeaDialog } from "@/components/portal/idea-dialog";
import { usePortal } from "@/lib/portal-store";
import { formatDate } from "@/lib/dates";
import { ideaDate } from "@/lib/stats";
import { CLIENT_APPROVAL_LABELS } from "@/lib/types";

export default function PortalHomePage() {
  const { client, ideas } = usePortal();
  const { openIdea, dialog } = usePortalIdeaDialog();

  const inReview = ideas.filter((i) => i.status === "en_revision_cliente");
  const pending = inReview.filter((i) => (i.clientApproval ?? "pendiente") === "pendiente");
  const approved = ideas.filter((i) => i.status === "aprobada");
  const scheduled = ideas.filter((i) => i.status === "programada");
  const published = ideas.filter((i) => i.status === "publicada");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Hola, {client.brand} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aquí está el estado de tu contenido con Flare.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Por aprobar"
          value={pending.length}
          icon={Eye}
          tone={pending.length ? "warning" : "success"}
        />
        <StatCard label="Programados" value={scheduled.length} icon={CalendarDays} />
        <StatCard label="Publicados" value={published.length} icon={Send} tone="success" />
      </div>

      <Card className="mt-4 gap-0 py-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tu progreso con Flare
            </p>
            <PhaseBadge phase={client.currentPhase} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={client.progressPercentage} className="flex-1" />
            <span className="text-sm font-semibold tabular-nums">
              {client.progressPercentage}%
            </span>
          </div>
          {(client.mainGoal || client.monthlyGoal || client.contentGoal) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {client.mainGoal && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Target className="size-3 text-flare" />
                    Objetivo principal
                  </p>
                  <p className="mt-1 text-xs">{client.mainGoal}</p>
                </div>
              )}
              {client.monthlyGoal && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Meta del mes
                  </p>
                  <p className="mt-1 text-xs">{client.monthlyGoal}</p>
                </div>
              )}
              {client.contentGoal && (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Meta de contenido
                  </p>
                  <p className="mt-1 text-xs">{client.contentGoal}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold">Piezas en revisión</p>
        {inReview.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {inReview.map((idea) => {
              const approval = idea.clientApproval ?? "pendiente";
              return (
                <Card key={idea.id} className="gap-0 py-0">
                  <CardContent className="flex gap-3 p-3.5">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                      <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
                        Sin preview
                      </div>
                      {idea.coverImage && (
                        <PieceImage src={idea.coverImage} alt={idea.title} />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm font-medium">{idea.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <FormatBadge format={idea.format} />
                        <ChannelBadge channel={idea.channel} />
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(ideaDate(idea), "d MMM")}
                        </span>
                        {approval === "pendiente" ? (
                          <Button size="xs" onClick={() => openIdea(idea)}>
                            Revisar pieza
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            {CLIENT_APPROVAL_LABELS[approval]}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-8 text-center text-xs text-muted-foreground">
            No hay piezas esperando tu revisión. 🎉
          </p>
        )}
      </div>

      {approved.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold">Aprobadas recientemente</p>
          <div className="space-y-2">
            {approved.slice(0, 5).map((idea) => (
              <button
                key={idea.id}
                onClick={() => openIdea(idea)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-left transition-colors hover:bg-emerald-500/10"
              >
                <p className="truncate text-xs font-medium">{idea.title}</p>
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Aprobada · Flare la programará
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {dialog}
    </div>
  );
}
