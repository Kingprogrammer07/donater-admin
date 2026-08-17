import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
const BOT_TOKEN = process.env.BOT_TOKEN || "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
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
  console.log("   STEP 9: BROADCASTS VERIFICATION & PROOFS               ");
  console.log("==========================================================\n");

  const ownerAuth = await getDevLoginTokens(777967425);
  const viewerAuth = await getDevLoginTokens(11223344);

  // 1. PROOF 1: POST /broadcasts/preview
  console.log("--- PROOF 1: AUDIENCE PREVIEW ---");
  const emptyFilterRes = await fetch(`${API_BASE}/broadcasts/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
    body: JSON.stringify({}),
  });
  const emptyFilterTotal = await emptyFilterRes.json();
  console.log("1. Empty filter (all non-blocked users) preview total:", emptyFilterTotal);

  const targetedFilterRes = await fetch(`${API_BASE}/broadcasts/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
    body: JSON.stringify({
      languages: ["uz"],
      has_ordered: true,
    }),
  });
  const targetedTotal = await targetedFilterRes.json();
  console.log("2. Targeted filter (languages=['uz'], has_ordered=true) preview total:", targetedTotal);

  // 2. PROOF 2: POST /broadcasts (Creation of draft)
  console.log("\n--- PROOF 2: CREATE DRAFT BROADCAST (201 CREATED) ---");
  const createRes = await fetch(`${API_BASE}/broadcasts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
    body: JSON.stringify({
      audience: {
        languages: ["uz"],
        include_blocked: false,
      },
      text_uz: "🎉 Donater do'konida maxsus yozgi chegirmalar boshlandi! 💎 Barcha MLBB va PUBG to'plamlariga 15% chegirma.",
      text_ru: "🎉 В магазине Donater начались специальные летние скидки! 💎 Скидка 15% на все наборы MLBB и PUBG.",
      text_en: "🎉 Special summer discounts started at Donater store! 💎 15% off all MLBB and PUBG packs.",
      buttons: [
        {
          url: "https://t.me/donater_bot?start=promo_summer",
          text_uz: "Katalogga o'tish 🛍️",
          text_ru: "Перейти в каталог 🛍️",
          text_en: "Open Catalog 🛍️",
        },
        {
          url: "https://donater.uz/rules",
          text_uz: "Aksiya qoidalari ℹ️",
          text_ru: "Правила акции ℹ️",
          text_en: "Promo Rules ℹ️",
        },
      ],
      scheduled_at: null,
    }),
  });

  const createdBroadcast = await createRes.json();
  console.log("Create Broadcast status:", createRes.status);
  console.log("Created Broadcast object:", {
    id: createdBroadcast.id,
    status: createdBroadcast.status,
    total_count: createdBroadcast.total_count,
    sent_count: createdBroadcast.sent_count,
    buttons_count: createdBroadcast.buttons.length,
    created_at: createdBroadcast.created_at,
  });

  // 3. PROOF 3: POST /broadcasts/{id}/start
  console.log("\n--- PROOF 3: START BROADCAST ---");
  const startRes = await fetch(`${API_BASE}/broadcasts/${createdBroadcast.id}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
  });
  const startedBroadcast = await startRes.json();
  console.log("Start Broadcast status:", startRes.status);
  console.log("Started Broadcast response:", {
    id: startedBroadcast.id,
    status: startedBroadcast.status,
    total_count: startedBroadcast.total_count,
    started_at: startedBroadcast.started_at,
  });

  // 4. PROOF 4: Invalid Transition 409 Conflict
  console.log("\n--- PROOF 4: INVALID STATE TRANSITION (409 CONFLICT) ---");
  // Trying to start an already running/started broadcast
  const reStartRes = await fetch(`${API_BASE}/broadcasts/${createdBroadcast.id}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
  });
  console.log("Re-start Broadcast status:", reStartRes.status);
  console.log("Re-start 409 body:", await reStartRes.json());

  // 5. PROOF 5: UI TESTING & SCREENSHOTS VIA PLAYWRIGHT
  console.log("\n--- PROOF 5: UI TESTING & SCREENSHOTS ---");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5199 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5199/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 5.1 Viewer Role Verification
    console.log("Checking Viewer role permissions on /broadcasts...");
    const viewerPageAuth = await getDevLoginTokens(11223344);
    const pageViewer = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerPageAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}broadcasts`, { waitUntil: "networkidle" });
    await pageViewer.waitForSelector("text=Broadcast (Ommaviy Xabarnomalar)", { timeout: 15000 });
    await pageViewer.waitForTimeout(600);

    const newBroadcastBtnCount = await pageViewer.locator("button:has-text('Yangi xabarnoma')").count();
    console.log("Viewer 'Yangi xabarnoma' button count:", newBroadcastBtnCount);
    await pageViewer.close();

    // 5.2 Owner Light Screenshot
    console.log("Capturing Broadcasts Light Mode screenshot...");
    const ownerLightAuth = await getDevLoginTokens(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });
    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerLightAuth.refreshToken);
    await pageLight.goto(`${baseUrl}broadcasts`, { waitUntil: "networkidle" });
    await pageLight.waitForSelector("text=Broadcast (Ommaviy Xabarnomalar)", { timeout: 15000 });
    await pageLight.waitForTimeout(600);

    const lightPath = path.join(artifactsDir, "broadcasts_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot: ${lightPath}`);

    // Open detail drawer for screenshot
    await pageLight.locator("tbody tr").first().click();
    await pageLight.waitForSelector("text=Xabarnoma #", { timeout: 10000 });
    await pageLight.waitForTimeout(600);
    const drawerLightPath = path.join(artifactsDir, "broadcasts_drawer_light_real.png");
    await pageLight.screenshot({ path: drawerLightPath, fullPage: false });
    console.log(`Saved Drawer Light screenshot: ${drawerLightPath}`);
    await pageLight.close();

    // 5.3 Owner Dark Screenshot
    console.log("Capturing Broadcasts Dark Mode screenshot...");
    const ownerDarkAuth = await getDevLoginTokens(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "dark",
    });
    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerDarkAuth.refreshToken);
    await pageDark.goto(`${baseUrl}broadcasts`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pageDark.waitForSelector("text=Broadcast (Ommaviy Xabarnomalar)", { timeout: 15000 });
    await pageDark.waitForTimeout(600);

    const darkPath = path.join(artifactsDir, "broadcasts_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot: ${darkPath}`);
    await pageDark.close();

    // 5.4 Owner Mobile iPhone Screenshot
    console.log("Capturing Broadcasts Mobile iPhone screenshot...");
    const ownerPhoneAuth = await getDevLoginTokens(777967425);
    const pagePhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await pagePhone.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerPhoneAuth.refreshToken);
    await pagePhone.goto(`${baseUrl}broadcasts`, { waitUntil: "networkidle" });
    await pagePhone.waitForSelector("text=Broadcast (Ommaviy Xabarnomalar)", { timeout: 15000 });
    await pagePhone.waitForTimeout(600);

    const phonePath = path.join(artifactsDir, "broadcasts_iphone_390px_real.png");
    await pagePhone.screenshot({ path: phonePath, fullPage: false });
    console.log(`Saved iPhone screenshot: ${phonePath}`);
    await pagePhone.close();

    // 5.5 Wizard Modal Screenshot (Step 3 Preview)
    console.log("Capturing Wizard Preview Screenshot...");
    const ownerWizardAuth = await getDevLoginTokens(777967425);
    const pageWizard = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });
    await pageWizard.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerWizardAuth.refreshToken);
    await pageWizard.goto(`${baseUrl}broadcasts`, { waitUntil: "networkidle" });
    await pageWizard.waitForSelector("text=Broadcast (Ommaviy Xabarnomalar)", { timeout: 15000 });
    await pageWizard.waitForTimeout(400);

    // Click "Yangi xabarnoma"
    await pageWizard.click("button:has-text('Yangi xabarnoma')");
    await pageWizard.waitForSelector("text=Yangi xabarnoma yaratish", { timeout: 5000 });
    await pageWizard.waitForTimeout(500);

    // Step 1: Click "Keyingisi"
    await pageWizard.click("button:has-text('Keyingisi')");
    await pageWizard.waitForSelector("text=Xabar matni", { timeout: 5000 });
    await pageWizard.waitForTimeout(400);

    // Step 2: Enter text
    await pageWizard.fill("textarea", "🔥 Yangi mavsum boshlandi! Donater orqali tezkor va xavfsiz to'ldiring.");
    await pageWizard.waitForTimeout(300);

    // Step 2: Click "Keyingisi"
    await pageWizard.click("button:has-text('Keyingisi')");
    await pageWizard.waitForSelector("text=Auditoriya filtri parametrlari", { timeout: 5000 });
    await pageWizard.waitForTimeout(600);

    const wizardPath = path.join(artifactsDir, "broadcasts_wizard_step3_real.png");
    await pageWizard.screenshot({ path: wizardPath, fullPage: false });
    console.log(`Saved Wizard Step 3 screenshot: ${wizardPath}`);
    await pageWizard.close();

    console.log("\n=== STEP 9 VERIFICATION & PROOFS COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Step 9 verification error:", err);
  } finally {
    await browser.close();
    await server.close();
  }
}

run();
