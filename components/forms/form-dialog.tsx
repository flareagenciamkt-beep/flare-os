"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  wide?: boolean;
  children: React.ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  wide,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <div className="-mr-2 max-h-[65vh] space-y-4 overflow-y-auto pr-2">
            {children}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
