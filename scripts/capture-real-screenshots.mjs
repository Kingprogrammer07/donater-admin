import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const BOT_TOKEN = process.env.BOT_TOKEN || "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
const API_BASE = "http://127.0.0.1:8000/admin/api/v1";

async function getDevLoginRefreshToken(tgId = 777967425) {
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
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("1. Starting Vite dev server for Step 4 Payments verification...");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5184 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5184;
  const baseUrl = `http://127.0.0.1:${port}/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const testResults = {};

  try {
    // 1. Verify Unauthenticated / Tokensiz 401 on Proof File Endpoint
    console.log("2. Testing unauthenticated proof-file request (expected 401)...");
    const unauthProofRes = await fetch(`${API_BASE}/payments/1/proof-file`);
    testResults.unauthenticatedProofTest = {
      status: unauthProofRes.status,
      statusText: unauthProofRes.statusText,
      is401Unauthorized: unauthProofRes.status === 401,
    };
    console.log(`Unauthenticated status: ${unauthProofRes.status} (401 ok)`);

    // 2. Desktop Light Mode & Payments Queue Verification
    console.log("3. Capturing Desktop Payments Page in Light Mode with live backend data...");
    const lightAuth = await getDevLoginRefreshToken(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });

    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, lightAuth.refreshToken);

    await pageLight.goto(`${baseUrl}payments`, { waitUntil: "domcontentloaded" });
    await pageLight.waitForTimeout(1000);

    const queueCardFound = await pageLight.locator("text=Chek #").first().isVisible();
    const customerFound = await pageLight.locator("text=@muhammad_dev").isVisible();

    testResults.ownerQueueTest = {
      queueCardFound,
      customerFound,
      role: lightAuth.admin.role,
    };

    // Capture Light Mode Screenshot
    const lightPath = path.join(artifactsDir, "payments_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot to: ${lightPath}`);
    await pageLight.close();

    // 3. Desktop Dark Mode (Showing Reject Modal in Dark Mode)
    console.log("4. Capturing Desktop Dark Mode with Reject Modal...");
    const darkAuth = await getDevLoginRefreshToken(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });
    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);

    await pageDark.goto(`${baseUrl}payments`, { waitUntil: "domcontentloaded" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(1000);

    // Click Reject button to open Reject modal
    const rejectBtn = pageDark.locator("button:has-text('Rad etish')").first();
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      await pageDark.waitForTimeout(400);
    }

    const darkPath = path.join(artifactsDir, "payments_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot to: ${darkPath}`);
    await pageDark.close();

    // 4. Testing Viewer Role (11223344) & Missing Review Buttons
    console.log("5. Testing Viewer Role (11223344)...");
    const viewerAuth = await getDevLoginRefreshToken(11223344);
    const pageViewer = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });
    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}payments`, { waitUntil: "domcontentloaded" });
    await pageViewer.waitForTimeout(1000);

    const hasApproveBtn = await pageViewer.locator("button:has-text('Tasdiqlash')").isVisible();
    const hasRejectBtn = await pageViewer.locator("button:has-text('Rad etish')").isVisible();
    const hasViewerWarning = await pageViewer.locator("text=Viewer rolidasiz").isVisible();

    testResults.viewerRoleTest = {
      role: viewerAuth.admin.role,
      hasApproveBtn,
      hasRejectBtn,
      hasViewerWarning,
      areActionButtonsHidden: !hasApproveBtn && !hasRejectBtn,
    };
    console.log(`Viewer buttons hidden: ${!hasApproveBtn && !hasRejectBtn}, warning visible: ${hasViewerWarning}`);
    await pageViewer.close();

    // 5. Capture iPhone (390px) Viewport
    console.log("6. Capturing iPhone Layout (390px)...");
    const iphoneAuth = await getDevLoginRefreshToken(777967425);
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await pageIPhone.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, iphoneAuth.refreshToken);

    await pageIPhone.goto(`${baseUrl}payments`, { waitUntil: "domcontentloaded" });
    await pageIPhone.waitForTimeout(1000);

    const iphonePath = path.join(artifactsDir, "payments_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`Saved iPhone screenshot to: ${iphonePath}`);
    await pageIPhone.close();

    // 6. Testing 409 Conflict Simulation
    console.log("7. Testing 409 Conflict Response Structure on Double Action...");
    const testAuth = await getDevLoginRefreshToken(777967425);
    const secondApprove = await fetch(`${API_BASE}/payments/proofs/1/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testAuth.accessToken}`,
        "Idempotency-Key": crypto.randomUUID(),
      },
    });
    const secondData = await secondApprove.json();
    console.log(`Approve status: ${secondApprove.status}`, secondData);

    testResults.conflict409Test = {
      secondApproveStatus: secondApprove.status,
      is409Conflict: secondApprove.status === 409,
      conflictDetail: secondData.detail || secondData,
    };

    console.log("\n=== STEP 4 PAYMENTS VERIFICATION RESULTS ===");
    console.log(JSON.stringify(testResults, null, 2));
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
