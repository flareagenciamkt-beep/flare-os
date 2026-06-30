"use client";

// Card bento con encabezado (título + botón "↗" opcional que enlaza a la vista
// relacionada). Reutiliza la Card oscura del design system.

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BentoCard({
  title,
  href,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: React.ReactNode;
  href?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className={cn("flex h-full flex-col p-4", contentClassName)}>
        {(title || href || action) && (
          <div className="mb-3 flex items-center justify-between gap-2">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {action ??
              (href && (
                <Link
                  href={href}
                  aria-label="Abrir vista completa"
                  className="flex size-8 items-center justify-center rounded-full bg-[rgba(241,233,224,0.06)] text-foreground/70 transition-colors hover:bg-[rgba(241,233,224,0.12)] hover:text-foreground"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              ))}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
