import { test, expect, type Page } from "@playwright/test";

// Rutas internas (equipo/agencia). En modo demo el AuthGuard deja pasar directo.
const APP_ROUTES = [
  "/clients/dashboard",
  "/clients",
  "/clients/metrics",
  "/clients/billing",
  "/agency/dashboard",
  "/agency/tasks",
  "/agency/kanban",
  "/agency/calendar",
  "/agency/feed",
  "/agency/ideas",
  "/agency/metrics",
  "/settings",
];

// Errores de consola ruidosos pero inofensivos que ignoramos en el smoke.
const IGNORED = [
  /Download the React DevTools/i,
  /favicon/i,
  /hydration/i, // se revisa aparte si hace falta
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORED.some((re) => re.test(text))) return;
    errors.push(`[console] ${text}`);
  });
  page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
  return errors;
}

test.describe("Smoke: rutas internas renderizan", () => {
  for (const route of APP_ROUTES) {
    test(`carga ${route}`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(route, { waitUntil: "networkidle" });

      expect(res?.status(), `HTTP status de ${route}`).toBeLessThan(400);
      // No debe redirigir a /login (modo demo no exige sesión).
      expect(page.url()).not.toContain("/login");
      // El shell debe montar contenido visible.
      await expect(page.locator("main")).toBeVisible();
      expect(errors, `errores en ${route}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});
