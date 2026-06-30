"use client";

// Hook imperativo para confirmar acciones sensibles (borrar, archivar) sin
// cablear estado manual en cada componente. Uso:
//   const { confirm, dialog } = useConfirm();
//   ...
//   onClick={() => confirm({ title, description, destructive, onConfirm })}
//   ...
//   return (<>... {dialog}</>)

import * as React from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function useConfirm() {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions) => setOptions(opts), []);

  const dialog = (
    <ConfirmDialog
      open={options !== null}
      onOpenChange={(open) => {
        if (!open) setOptions(null);
      }}
      title={options?.title ?? ""}
      description={options?.description}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      destructive={options?.destructive}
      onConfirm={async () => {
        await options?.onConfirm();
      }}
    />
  );

  return { confirm, dialog };
}
