"use client";

// Tab Estrategia: documento 1:1 por cliente, editable inline (upsert).

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { useFlare } from "@/lib/store";
import { strategySchema, type StrategyFormValues } from "@/lib/schemas";
import { formatDate } from "@/lib/dates";

const EMPTY: StrategyFormValues = {
  brandBrief: "",
  targetAudience: "",
  offer: "",
  tone: "",
  brandPromise: "",
  differentiators: "",
  competitors: "",
  doGuidelines: "",
  dontGuidelines: "",
  strategicNotes: "",
};

export function StrategyTab({ clientId }: { clientId: string }) {
  const { strategies, upsertStrategy } = useFlare();
  const strategy = strategies.find((s) => s.clientId === clientId);

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: strategy ?? EMPTY,
  });
  const { register, handleSubmit, reset, formState } = form;

  React.useEffect(() => {
    reset(strategy ?? EMPTY);
    // Solo re-sincronizar cuando cambia el cliente o llega la estrategia del fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, strategy?.id, reset]);

  const onSubmit = handleSubmit((values) => {
    upsertStrategy(clientId, values);
    toast.success("Estrategia guardada");
    reset(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {strategy
            ? `Última actualización: ${formatDate(strategy.updatedAt)}`
            : "Este cliente aún no tiene estrategia documentada."}
        </p>
        <Button type="submit" size="sm" disabled={!formState.isDirty}>
          <Save data-icon="inline-start" />
          Guardar estrategia
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardContent className="space-y-4 p-4">
            <Field label="Brief general de marca">
              <Textarea rows={3} {...register("brandBrief")} placeholder="Qué es la marca, qué vende y por qué existe..." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Público objetivo">
                <Textarea rows={3} {...register("targetAudience")} />
              </Field>
              <Field label="Oferta principal">
                <Textarea rows={3} {...register("offer")} />
              </Field>
              <Field label="Tono de comunicación">
                <Input {...register("tone")} placeholder="Ej: cercano, educativo, directo" />
              </Field>
              <Field label="Promesa de marca">
                <Input {...register("brandPromise")} />
              </Field>
              <Field label="Diferenciadores">
                <Textarea rows={2} {...register("differentiators")} />
              </Field>
              <Field label="Competidores">
                <Textarea rows={2} {...register("competitors")} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-emerald-500/20 py-0">
          <CardContent className="p-4">
            <Field label="✅ Lo que SÍ se debe hacer">
              <Textarea rows={5} {...register("doGuidelines")} />
            </Field>
          </CardContent>
        </Card>

        <Card className="gap-0 border-red-500/20 py-0">
          <CardContent className="p-4">
            <Field label="🚫 Lo que NO se debe hacer">
              <Textarea rows={5} {...register("dontGuidelines")} />
            </Field>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 lg:col-span-2">
          <CardContent className="p-4">
            <Field label="Observaciones estratégicas">
              <Textarea rows={3} {...register("strategicNotes")} />
            </Field>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
