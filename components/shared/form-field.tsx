"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SimpleSelect, type Option } from "./simple-select";

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

interface RHFSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export function RHFSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  error,
  className,
}: RHFSelectProps<T>) {
  return (
    <Field label={label} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <SimpleSelect
            value={field.value == null ? "" : String(field.value)}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
          />
        )}
      />
    </Field>
  );
}
