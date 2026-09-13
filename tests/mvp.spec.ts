import { expect, test, type Page } from "@playwright/test";

import { cleanupTestEvents, closeTestDatabase } from "./database";

const alpha = { username: "admin.alpha", pin: "123456" };
const central = { username: "admin.pusat", pin: "123456" };

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await cleanupTestEvents();
});

test.afterEach(async () => {
  await cleanupTestEvents();
});

test.afterAll(async () => {
  await closeTestDatabase();
});

async function login(page: Page, credentials: { username: string; pin: string }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(credentials.username);
  await page.getByLabel("PIN").fill(credentials.pin);
  await page.getByRole("button", { name: "Masuk" }).click();
}

async function createEvent(page: Page, values: { clientName: string; eventDate: string; downPayment: string }) {
  await page.goto("/dashboard/events/new");
  await page.getByLabel("Nama client").fill(values.clientName);
  await page.getByLabel("Tanggal acara").fill(values.eventDate);
  await page.locator('select[name="session"]').selectOption("DAY");
  await page.getByLabel("Total tagihan").fill("100000");
  await page.getByLabel("Jumlah DP").fill(values.downPayment);
  await page.getByRole("button", { name: "Simpan acara" }).click();
  await expect(page).toHaveURL(/\/dashboard\/events\/.+\?created=1$/);
}

test("authentication redirects unauthenticated users, persists a session, and logs out", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Username").fill("invalid.e2e.user");
  await page.getByLabel("PIN").fill("000000");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Username atau PIN tidak valid.", { exact: true })).toBeVisible();

  await login(page, alpha);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Admin Gedung Alpha", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Admin Gedung Alpha", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("building admin is isolated to their building and cannot read another building event", async ({ page }) => {
  await login(page, alpha);
  await expect(page.getByText("PT Nusantara")).toBeVisible();
  await expect(page.getByText("Komunitas Harmoni")).not.toBeVisible();

  await page.goto("/dashboard/events/event-beta-night");
  await expect(page.getByText("Komunitas Harmoni")).not.toBeVisible();
});

test("event lifecycle calculates payment status, rejects a duplicate active slot, and retains cancelled history", async ({ page }) => {
  await login(page, alpha);
  await createEvent(page, { clientName: "E2E Test Lifecycle", eventDate: "2098-01-10", downPayment: "0" });
  await expect(page.getByText("Belum bayar")).toBeVisible();

  await page.getByLabel("Nilai pelunasan").fill("100000");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByText("Pelunasan berhasil diperbarui.")).toBeVisible();
  await expect(page.getByText("Lunas")).toBeVisible();

  await page.goto("/dashboard/events/new");
  await page.getByLabel("Nama client").fill("E2E Test Conflict");
  await page.getByLabel("Tanggal acara").fill("2098-01-10");
  await page.locator('select[name="session"]').selectOption("DAY");
  await page.getByLabel("Total tagihan").fill("100000");
  await page.getByLabel("Jumlah DP").fill("0");
  await page.getByRole("button", { name: "Simpan acara" }).click();
  await expect(page.getByText("Sesi pada tanggal tersebut sudah digunakan. Pilih sesi atau tanggal lain.", { exact: true })).toBeVisible();

  await page.goBack();
  await page.getByRole("button", { name: "Batalkan acara" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Ya, batalkan" }).click();
  await expect(page.getByText("Acara berhasil dibatalkan.")).toBeVisible();
  await expect(page.getByText("Dibatalkan")).toBeVisible();
  await expect(page.getByText("Acara yang dibatalkan tidak dapat menerima pelunasan baru.")).toBeVisible();
});

test("DP status and central dashboard filters use the same event dataset", async ({ page }) => {
  await login(page, alpha);
  await createEvent(page, { clientName: "E2E Test Dashboard", eventDate: "2098-01-11", downPayment: "25000" });
  await expect(page.getByText("DP dibayar")).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await login(page, central);
  await expect(page).toHaveURL(/\/central$/);
  await page.locator('select[name="buildingId"]').selectOption("building-alpha");
  await page.locator('input[name="startDate"]').fill("2098-01-11");
  await page.locator('input[name="endDate"]').fill("2098-01-11");
  await page.getByRole("button", { name: "Terapkan filter" }).click();
  await expect(page.getByText("E2E Test Dashboard")).toBeVisible();
  await expect(page.getByText("Komunitas Harmoni")).not.toBeVisible();

  const summary = page.getByLabel("Ringkasan acara");
  await expect(summary.getByText("Total acara").locator("..")).toContainText("1");
  await expect(summary.getByText("Acara aktif").locator("..")).toContainText("1");
  await expect(summary.getByText("Dibatalkan").locator("..")).toContainText("0");
  await expect(summary.getByText("Total DP").locator("..")).toContainText("Rp25.000");
  await expect(summary.getByText("Total pelunasan").locator("..")).toContainText("Rp0");

  await page.goto("/dashboard/events/new");
  await expect(page).toHaveURL(/\/central$/);
  await expect(page.getByRole("button", { name: "Simpan acara" })).not.toBeVisible();
});
