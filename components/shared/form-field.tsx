"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SimpleSelect, type Option } from "./simple-select";

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, error, className, required, hint, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
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
  required?: boolean;
}

export function RHFSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  error,
  className,
  required,
}: RHFSelectProps<T>) {
  return (
    <Field label={label} error={error} className={className} required={required}>
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
