"use client";

import * as React from "react";
import Link from "next/link";
import { StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClientStatusBadge } from "@/components/shared/badges";
import { useFlare } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import type { Client } from "@/lib/types";

function ClientNoteCard({ client }: { client: Client }) {
  const { updateClient } = useFlare();
  const [draft, setDraft] = React.useState<string | null>(null);
  const dirty = draft !== null && draft !== client.internalNotes;

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex h-full flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link
            href={`/clients/${client.id}`}
            className="truncate text-sm font-semibold transition-colors hover:text-flare-soft"
          >
            {client.brand}
          </Link>
          <ClientStatusBadge status={client.status} />
        </div>
        <Textarea
          rows={5}
          value={draft ?? client.internalNotes}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Notas internas sobre este cliente..."
          className="flex-1 text-xs"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Actualizado: {formatDate(client.lastUpdate)}
          </span>
          <Button
            size="xs"
            variant={dirty ? "default" : "outline"}
            disabled={!dirty}
            onClick={() => {
              updateClient(client.id, { internalNotes: draft ?? "" });
              setDraft(null);
              toast.success(`Notas de ${client.brand} guardadas`);
            }}
          >
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientNotesPage() {
  const { clients } = useFlare();

  return (
    <div>
      <PageHeader
        title="Notas de clientes"
        description="Notas internas rápidas por cliente, editables en línea."
      />
      {clients.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <ClientNoteCard key={c.id} client={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={StickyNote}
          title="No hay clientes"
          description="Crea un cliente para empezar a tomar notas."
        />
      )}
    </div>
  );
}
