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

test("event amount fields format rupiah values while keeping the workflow submittable", async ({ page }) => {
  await login(page, alpha);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/events/new");

  await expect(page.getByLabel("Total tagihan")).toHaveValue("Rp 0");
  await expect(page.getByLabel("Jumlah DP")).toHaveValue("");
  await expect(page.getByLabel("Pelunasan (opsional)")).toHaveValue("Rp 0");

  await page.getByLabel("Total tagihan").fill("150000");
  await page.getByLabel("Jumlah DP").fill("25000");
  await page.getByLabel("Pelunasan (opsional)").fill("125000");

  await expect(page.getByLabel("Total tagihan")).toHaveValue("Rp 150.000");
  await expect(page.getByLabel("Jumlah DP")).toHaveValue("Rp 25.000");
  await expect(page.getByLabel("Pelunasan (opsional)")).toHaveValue("Rp 125.000");
  await expect(page.locator('input[type="hidden"][name="totalAmount"]')).toHaveValue("150000");
  await expect(page.locator('input[type="hidden"][name="downPayment"]')).toHaveValue("25000");
  await expect(page.locator('input[type="hidden"][name="finalPayment"]')).toHaveValue("125000");
});

test("creating an event requires a positive down payment", async ({ page }) => {
  await login(page, alpha);
  await page.goto("/dashboard/events/new");
  await page.getByLabel("Nama client").fill("E2E Test DP Required");
  await page.getByLabel("Tanggal acara").fill("2098-01-09");
  await page.locator('select[name="session"]').selectOption("DAY");
  await page.getByLabel("Total tagihan").fill("100000");
  await page.getByLabel("Jumlah DP").fill("0");
  await page.getByRole("button", { name: "Simpan acara" }).click();

  await expect(page).toHaveURL(/\/dashboard\/events\/new$/);
  await expect(page.getByRole("alert")).toHaveText("Periksa kembali data acara yang diisi.");
});

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
  await createEvent(page, { clientName: "E2E Test Lifecycle", eventDate: "2098-01-10", downPayment: "25000" });
  await expect(page.getByText("DP dibayar")).toBeVisible();

  await page.getByLabel("Nilai pelunasan").fill("100000");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByText("Pelunasan berhasil diperbarui.")).toBeVisible();
  await expect(page.getByText("Lunas")).toBeVisible();

  await page.goto("/dashboard/events/new");
  await page.getByLabel("Nama client").fill("E2E Test Conflict");
  await page.getByLabel("Tanggal acara").fill("2098-01-10");
  await page.locator('select[name="session"]').selectOption("DAY");
  await page.getByLabel("Total tagihan").fill("100000");
  await page.getByLabel("Jumlah DP").fill("25000");
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
  await expect(summary.getByText("Acara selesai").locator("..")).toContainText("0");
  await expect(summary.getByText("Dibatalkan").locator("..")).toContainText("0");
  await expect(summary.getByText("Total DP")).not.toBeVisible();
  await expect(summary.getByText("Total pelunasan")).not.toBeVisible();

  const resetLink = page.getByRole("link", { name: "Reset" });
  await expect(resetLink).toHaveAttribute("href", "/central");
  await resetLink.click();
  await expect(page).toHaveURL(/\/central$/);

  await page.goto("/dashboard/events/new");
  await expect(page).toHaveURL(/\/central$/);
  await expect(page.getByRole("button", { name: "Simpan acara" })).not.toBeVisible();
});

test("desktop sidebar remains visible while the page scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await login(page, central);

  const sidebar = page.locator("aside");
  await expect(sidebar).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)).toBe(true);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => (await sidebar.boundingBox())?.y).toBe(0);
});
