import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
const BOT_TOKEN = process.env.BOT_TOKEN || "6563656612:AAExNlgoYxt33JnN9YOUUTLdL_oSVlSNaiM";
const API_BASE = "http://127.0.0.1:8000/admin/api/v1";

async function getDevLoginTokens(tgId = 777967425) {
  const payload = {
    id: tgId,
    first_name: "Dev",
    username: "dev",
    auth_date: Math.floor(Date.now() / 1000),
  };

  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const checkString = Object.keys(payload)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join("\n");
  payload.hash = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

  const response = await fetch(`${API_BASE}/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Dev login failed for tg_id ${tgId}: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    admin: data.admin,
  };
}

async function run() {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("==========================================================");
  console.log("   STEP 11: SETTINGS REAL API PROOFS & VERIFICATION       ");
  console.log("==========================================================\n");

  const ownerAuth = await getDevLoginTokens(777967425);
  const viewerAuth = await getDevLoginTokens(11223344);

  // 1. PROOF 1: GET /settings
  console.log("--- PROOF 1: GET /settings ---");
  const getSettingsRes = await fetch(`${API_BASE}/settings`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const currentSettings = await getSettingsRes.json();
  console.log("GET /settings status:", getSettingsRes.status);
  console.log("Current Settings Data:", JSON.stringify(currentSettings, null, 2));

  // 2. PROOF 2: PATCH /settings (only changed keys)
  console.log("\n--- PROOF 2: PATCH /settings (Real Request & Response) ---");
  const patchPayload = {
    values: {
      support_contact: "@donater_help_bot",
      manual_payment_instructions: {
        uz: "💳 Karta: 8600 1234 5678 9012\n👤 Egasi: DONATER TEST MCHJ\n🏦 Bank: Humo / Uzcard\n\n📌 To'lov qilib chekni yuboring.",
        ru: "💳 Карта: 8600 1234 5678 9012\n👤 Владелец: DONATER TEST ООО\n\n📌 Отправьте чек после оплаты.",
        en: "💳 Card: 8600 1234 5678 9012\n👤 Holder: DONATER TEST LLC\n\n📌 Send payment screenshot after transfer."
      }
    }
  };
  console.log("PATCH Request Body:", JSON.stringify(patchPayload, null, 2));

  const patchRes = await fetch(`${API_BASE}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`
    },
    body: JSON.stringify(patchPayload)
  });
  const patchedSettings = await patchRes.json();
  console.log("PATCH /settings status:", patchRes.status);
  console.log("Patched Response Data:", JSON.stringify(patchedSettings, null, 2));

  // 3. PROOF 3: Unknown Key Rejection (400 Bad Request)
  console.log("\n--- PROOF 3: UNKNOWN KEY REJECTION TEST ---");
  const badPatchRes = await fetch(`${API_BASE}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`
    },
    body: JSON.stringify({ values: { non_existent_key: "value" } })
  });
  const badPatchData = await badPatchRes.json();
  console.log("Bad PATCH status:", badPatchRes.status);
  console.log("Bad PATCH error response:", JSON.stringify(badPatchData, null, 2));

  // 4. PROOF 4: PLAYWRIGHT UI TESTING & SCREENSHOTS
  console.log("\n--- PROOF 4: UI TESTING & SCREENSHOTS ---");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5198 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5198/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 4.1 Viewer Role Verification
    console.log("Checking Viewer role read-only state on /settings...");
    const pageViewer = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}settings`, { waitUntil: "networkidle" });
    await pageViewer.waitForSelector("text=Tizim Sozlamalari (System Settings)", { timeout: 15000 });
    await pageViewer.waitForTimeout(600);

    const viewerNoticeCount = await pageViewer.locator("text=manage_settings").count();
    const viewerSaveBtnCount = await pageViewer.locator("button:has-text('Saqlash')").count();
    console.log("Viewer read-only warning count:", viewerNoticeCount);
    console.log("Viewer Save button count:", viewerSaveBtnCount);
    await pageViewer.close();

    // 4.2 Owner Light Screenshot
    console.log("Capturing Settings Light Mode screenshot...");
    const ctxLight = await browser.newContext({
      viewport: { width: 1280, height: 1100 },
      colorScheme: "light",
    });
    const pageLight = await ctxLight.newPage();
    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerAuth.refreshToken);
    await pageLight.goto(`${baseUrl}settings`);
    await pageLight.waitForSelector("h1", { timeout: 15000 });
    await pageLight.waitForTimeout(1000);

    const lightPath = path.join(artifactsDir, "settings_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot: ${lightPath}`);
    await ctxLight.close();

    // 4.3 Owner Dark Screenshot
    console.log("Capturing Settings Dark Mode screenshot...");
    const darkAuth = await getDevLoginTokens(777967425);
    const ctxDark = await browser.newContext({
      viewport: { width: 1280, height: 1100 },
      colorScheme: "dark",
    });
    const pageDark = await ctxDark.newPage();
    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);
    await pageDark.goto(`${baseUrl}settings`);
    await pageDark.waitForSelector("h1", { timeout: 15000 });
    await pageDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pageDark.waitForTimeout(1000);

    const darkPath = path.join(artifactsDir, "settings_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot: ${darkPath}`);
    await ctxDark.close();

    // 4.4 Owner Mobile iPhone Screenshot
    console.log("Capturing Settings Mobile iPhone screenshot...");
    const phoneAuth = await getDevLoginTokens(777967425);
    const ctxPhone = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const pagePhone = await ctxPhone.newPage();
    await pagePhone.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, phoneAuth.refreshToken);
    await pagePhone.goto(`${baseUrl}settings`);
    await pagePhone.waitForSelector("h1", { timeout: 15000 });
    await pagePhone.waitForTimeout(1000);

    const phonePath = path.join(artifactsDir, "settings_iphone_390px_real.png");
    await pagePhone.screenshot({ path: phonePath, fullPage: false });
    console.log(`Saved iPhone screenshot: ${phonePath}`);
    await ctxPhone.close();

    console.log("\n=== STEP 11 SETTINGS PROOFS & VERIFICATION COMPLETED ===");

    console.log("\n=== STEP 11 SETTINGS PROOFS & VERIFICATION COMPLETED ===");
  } catch (err) {
    console.error("Step 11 verification error:", err);
  } finally {
    await browser.close();
    await server.close();
  }
}

run();
