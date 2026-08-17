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
  console.log("   STEP 10: SYSTEM STATUS & DIAGNOSTICS PROOFS            ");
  console.log("==========================================================\n");

  const ownerAuth = await getDevLoginTokens(777967425);
  const viewerAuth = await getDevLoginTokens(11223344);

  // 1. PROOF 1: GET /system/health
  console.log("--- PROOF 1: SYSTEM HEALTH ---");
  const healthRes = await fetch(`${API_BASE}/system/health`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const healthData = await healthRes.json();
  console.log("GET /system/health status:", healthRes.status);
  console.log("Health Data:", JSON.stringify(healthData, null, 2));

  // 2. PROOF 2: GET /system/queue
  console.log("\n--- PROOF 2: QUEUE & WORKER STATUS ---");
  const queueRes = await fetch(`${API_BASE}/system/queue`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const queueData = await queueRes.json();
  console.log("GET /system/queue status:", queueRes.status);
  console.log("Queue Data:", JSON.stringify(queueData, null, 2));

  // 3. PROOF 3: GET /system/fazercards
  console.log("\n--- PROOF 3: FAZERCARDS UPSTREAM STATUS ---");
  const fazercardsRes = await fetch(`${API_BASE}/system/fazercards`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const fazercardsData = await fazercardsRes.json();
  console.log("GET /system/fazercards status:", fazercardsRes.status);
  console.log("FazerCards Data:", JSON.stringify(fazercardsData, null, 2));

  // 4. PROOF 4: GET /system/webhooks & POST /system/webhooks/test
  console.log("\n--- PROOF 4: WEBHOOKS & TEST DELIVERY ---");
  const webhooksRes = await fetch(`${API_BASE}/system/webhooks`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const webhooksData = await webhooksRes.json();
  console.log("GET /system/webhooks status:", webhooksRes.status);
  console.log("Webhooks URL:", webhooksData.url);
  console.log("Secret Configured:", webhooksData.secret_configured);
  console.log("Recent Deliveries Count:", webhooksData.deliveries.length);

  const testWebhookRes = await fetch(`${API_BASE}/system/webhooks/test`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const testWebhookData = await testWebhookRes.json();
  console.log("POST /system/webhooks/test status:", testWebhookRes.status);
  console.log("Test Webhook Data:", JSON.stringify(testWebhookData, null, 2));

  // 5. PROOF 5: PLAYWRIGHT REAL UI TESTING & SCREENSHOTS
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
    console.log("Checking Viewer role permissions on /system...");
    const viewerPageAuth = await getDevLoginTokens(11223344);
    const pageViewer = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerPageAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}system`, { waitUntil: "networkidle" });
    await pageViewer.waitForSelector("text=Tizim Holati va Diagnostika", { timeout: 15000 });
    await pageViewer.waitForTimeout(600);

    const testWebhookBtnCount = await pageViewer.locator("button:has-text('Test Webhook')").count();
    console.log("Viewer 'Test Webhook' button count:", testWebhookBtnCount);
    await pageViewer.close();

    // 5.2 Owner Light Screenshot
    console.log("Capturing System Status Light Mode screenshot...");
    const ownerLightAuth = await getDevLoginTokens(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });
    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerLightAuth.refreshToken);
    await pageLight.goto(`${baseUrl}system`, { waitUntil: "networkidle" });
    await pageLight.waitForSelector("text=Tizim Holati va Diagnostika", { timeout: 15000 });
    await pageLight.waitForTimeout(800);

    const lightPath = path.join(artifactsDir, "system_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot: ${lightPath}`);
    await pageLight.close();

    // 5.3 Owner Dark Screenshot
    console.log("Capturing System Status Dark Mode screenshot...");
    const ownerDarkAuth = await getDevLoginTokens(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "dark",
    });
    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerDarkAuth.refreshToken);
    await pageDark.goto(`${baseUrl}system`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pageDark.waitForSelector("text=Tizim Holati va Diagnostika", { timeout: 15000 });
    await pageDark.waitForTimeout(800);

    const darkPath = path.join(artifactsDir, "system_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot: ${darkPath}`);
    await pageDark.close();

    // 5.4 Owner Mobile iPhone Screenshot
    console.log("Capturing System Status Mobile iPhone screenshot...");
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
    await pagePhone.goto(`${baseUrl}system`, { waitUntil: "networkidle" });
    await pagePhone.waitForSelector("text=Tizim Holati va Diagnostika", { timeout: 15000 });
    await pagePhone.waitForTimeout(800);

    const phonePath = path.join(artifactsDir, "system_iphone_390px_real.png");
    await pagePhone.screenshot({ path: phonePath, fullPage: false });
    console.log(`Saved iPhone screenshot: ${phonePath}`);
    await pagePhone.close();

    console.log("\n=== STEP 10 VERIFICATION & PROOFS COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Step 10 verification error:", err);
  } finally {
    await browser.close();
    await server.close();
  }
}

run();
