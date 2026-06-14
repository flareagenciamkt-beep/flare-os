import { test, expect } from "@playwright/test";

test.describe("Interacciones con datos demo (store mock)", () => {
  test("la lista de clientes muestra datos del store", async ({ page }) => {
    await page.goto("/clients");
    // Nombres provenientes de lib/mock-data.ts
    await expect(page.getByText("Autozone").first()).toBeVisible();
    await expect(page.getByText("Ocho Pilates").first()).toBeVisible();
  });

  test('"Nueva idea" abre el diálogo de creación', async ({ page }) => {
    await page.goto("/agency/ideas");
    await page.getByRole("button", { name: "Nueva idea" }).click();
    // El form se monta en un diálogo accesible.
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("navegación entre secciones mantiene la sesión demo", async ({ page }) => {
    await page.goto("/clients/dashboard");
    await page.getByRole("link", { name: /ideas/i }).first().click();
    await expect(page).toHaveURL(/\/agency\/ideas/);
    expect(page.url()).not.toContain("/login");
  });

  test("Métricas operativas renderiza gráficos (svg)", async ({ page }) => {
    await page.goto("/agency/metrics");
    await expect(page.getByText("Mix de producción por cliente")).toBeVisible();
    await expect(page.getByText("Pipeline editorial")).toBeVisible();
    // El StackedBarChart se monta como <svg>.
    expect(await page.locator("main svg").count()).toBeGreaterThan(0);
  });

  test("Facturación desglosa el ingreso por moneda", async ({ page }) => {
    await page.goto("/clients/billing");
    const kpi = page.getByText("Ingreso mensual acordado").locator("../..");
    // Los mocks mezclan USD y COP: ambas divisas deben aparecer separadas.
    await expect(kpi).toContainText("USD");
    await expect(kpi).toContainText("COP");
  });
});
