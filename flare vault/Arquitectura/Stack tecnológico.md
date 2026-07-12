---
tags: [arquitectura]
fuente: package.json
actualizado: 2026-07-12
---

# Stack tecnológico

- **Next.js 16.2.9** + **React 19.2** — App Router con route groups y Server Components. ⚠️ Es una versión custom con breaking changes: `params` es **Promise** en las páginas (ej. [[Vista 360 del cliente]]); consultar `node_modules/next/dist/docs/` antes de escribir código.
- **Supabase JS** — backend, DB y auth. Ver [[Modo demo vs Supabase]] y [[Seguridad del portal]].
- **shadcn 4 sobre @base-ui/react 1.5** — los primitivos de `components/ui/*` envuelven Base UI (patrón render prop), **no Radix**.
- **Tailwind 4** (`@tailwindcss/postcss`) + tw-animate-css.
- **react-hook-form + zod 4** (`lib/schemas.ts`) para formularios.
- **sonner** (toasts), **lucide-react** (iconos), **date-fns**, **next-themes**.
- **Playwright** para tests E2E (`tests/`, `playwright.config.ts`).
- **Deploy en Vercel** — `flare-os.vercel.app` (team `flareagenciamkt-beeps-projects`), auto-deploy desde `main`. Detalles de env/secretos en [[Modo demo vs Supabase]].

Relacionado: [[Estructura del proyecto]], [[Store de agencia (useFlare)]].
