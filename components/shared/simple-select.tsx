"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "default";
}

export function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  size = "default",
}: SimpleSelectProps) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange((v as string) ?? "")}
    >
      <SelectTrigger size={size} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
