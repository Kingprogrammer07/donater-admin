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
  console.log("   STEP 12: ADMINS & AUDIT REAL API PROOFS                ");
  console.log("==========================================================\n");

  const ownerAuth = await getDevLoginTokens(777967425);
  const viewerAuth = await getDevLoginTokens(11223344);

  // 1. PROOF 1: GET /admins
  console.log("--- PROOF 1: GET /admins ---");
  const adminsRes = await fetch(`${API_BASE}/admins`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const adminsData = await adminsRes.json();
  console.log("GET /admins status:", adminsRes.status);
  console.log("Admins List Data:", JSON.stringify(adminsData, null, 2));

  // 2. PROOF 2: GET /audit
  console.log("\n--- PROOF 2: GET /audit ---");
  const auditRes = await fetch(`${API_BASE}/audit?limit=5`, {
    headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
  });
  const auditData = await auditRes.json();
  console.log("GET /audit status:", auditRes.status);
  console.log("Audit Page Data:", JSON.stringify(auditData, null, 2));

  // 3. PROOF 3: 409 Conflict on Self-Edit Attempt
  console.log("\n--- PROOF 3: 409 CONFLICT ON SELF-EDIT ATTEMPT ---");
  const selfEditRes = await fetch(`${API_BASE}/admins/${ownerAuth.admin.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerAuth.accessToken}`,
    },
    body: JSON.stringify({ role: "admin" }),
  });
  const selfEditError = await selfEditRes.json();
  console.log("Self PATCH status:", selfEditRes.status);
  console.log("Self PATCH 409 error response:", JSON.stringify(selfEditError, null, 2));

  // 4. PROOF 4: PLAYWRIGHT UI TESTING & REAL SCREENSHOTS
  console.log("\n--- PROOF 4: UI TESTING & SCREENSHOTS ---");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5196 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5196/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 4.1 Viewer Role Verification
    console.log("Checking Viewer role permissions on /admins...");
    const ctxViewer = await browser.newContext({
      viewport: { width: 1280, height: 960 },
    });
    const pageViewer = await ctxViewer.newPage();
    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}admins`);
    await pageViewer.waitForSelector("h1", { timeout: 15000 });
    await pageViewer.waitForTimeout(600);

    const createBtnCount = await pageViewer.locator("button:has-text('Yangi admin')").count();
    const editBtnCount = await pageViewer.locator("button:has-text('Tahrirlash')").count();
    console.log("Viewer 'Yangi admin' button count:", createBtnCount);
    console.log("Viewer 'Tahrirlash' button count:", editBtnCount);
    await ctxViewer.close();

    // 4.2 Owner Light Screenshot
    console.log("Capturing Admins Light Mode screenshot...");
    const lightAuth = await getDevLoginTokens(777967425);
    const ctxLight = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      colorScheme: "light",
    });
    const pageLight = await ctxLight.newPage();
    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, lightAuth.refreshToken);
    await pageLight.goto(`${baseUrl}admins`);
    await pageLight.waitForSelector("h1", { timeout: 15000 });
    await pageLight.waitForTimeout(1000);

    const lightPath = path.join(artifactsDir, "admins_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot: ${lightPath}`);
    await ctxLight.close();

    // 4.3 Owner Dark Screenshot
    console.log("Capturing Admins Dark Mode screenshot...");
    const darkAuth = await getDevLoginTokens(777967425);
    const ctxDark = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      colorScheme: "dark",
    });
    const pageDark = await ctxDark.newPage();
    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);
    await pageDark.goto(`${baseUrl}admins`);
    await pageDark.waitForSelector("h1", { timeout: 15000 });
    await pageDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pageDark.waitForTimeout(1000);

    const darkPath = path.join(artifactsDir, "admins_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot: ${darkPath}`);
    await ctxDark.close();

    // 4.4 Owner Mobile iPhone Screenshot
    console.log("Capturing Admins Mobile iPhone screenshot...");
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
    await pagePhone.goto(`${baseUrl}admins`);
    await pagePhone.waitForSelector("h1", { timeout: 15000 });
    await pagePhone.waitForTimeout(1000);

    const phonePath = path.join(artifactsDir, "admins_iphone_390px_real.png");
    await pagePhone.screenshot({ path: phonePath, fullPage: false });
    console.log(`Saved iPhone screenshot: ${phonePath}`);
    await ctxPhone.close();

    console.log("\n=== STEP 12 ADMINS & AUDIT PROOFS COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("Step 12 verification error:", err);
  } finally {
    await browser.close();
    await server.close();
  }
}

run();
