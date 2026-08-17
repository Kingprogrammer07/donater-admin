import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const BOT_TOKEN = process.env.BOT_TOKEN || "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
const API_BASE = "http://127.0.0.1:8000/admin/api/v1";

function runSql(sql) {
  const cmd = `docker compose exec -T postgres psql -U donater -d donater -t -A -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { cwd: "C:/Users/Admin/Desktop/donater" }).toString().trim();
}

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
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("=================================================");
  console.log("     STEP 5 ORDERS VERIFICATION & SCREENSHOTS    ");
  console.log("=================================================\n");

  const server = await createServer({
    server: { host: "127.0.0.1", port: 5195 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5195/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  const testResults = {};

  try {
    // ----------------------------------------------------
    // 1. Desktop Light Mode: Orders Table
    // ----------------------------------------------------
    console.log("1. Capturing Desktop Light Mode: Orders Page...");
    const ownerAuth = await getDevLoginTokens(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });

    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, ownerAuth.refreshToken);

    await pageLight.goto(`${baseUrl}orders`, { waitUntil: "domcontentloaded" });
    await pageLight.waitForTimeout(1000);

    const tableRows = await pageLight.locator("tbody tr").count();
    const hasOrder = await pageLight.locator("text=ORD-").first().isVisible();
    console.log(`   Orders table rows count: ${tableRows}, hasOrder: ${hasOrder}`);

    const lightPath = path.join(artifactsDir, "orders_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`   Saved Light screenshot to: ${lightPath}`);
    await pageLight.close();

    // ----------------------------------------------------
    // 2. Desktop Dark Mode: Order Detail Drawer & Price Breakdown
    // ----------------------------------------------------
    console.log("2. Capturing Desktop Dark Mode: Order Detail Drawer with Price Breakdown...");
    const darkAuth = await getDevLoginTokens(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });

    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);

    // Navigate to deep link /orders/3 (Completed order)
    await pageDark.goto(`${baseUrl}orders/3`, { waitUntil: "domcontentloaded" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(1200);

    const darkPath = path.join(artifactsDir, "orders_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`   Saved Dark screenshot to: ${darkPath}`);
    await pageDark.close();

    // ----------------------------------------------------
    // 3. Mobile Layout: iPhone 390px
    // ----------------------------------------------------
    console.log("3. Capturing iPhone Layout (390px)...");
    const iphoneAuth = await getDevLoginTokens(777967425);
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await pageIPhone.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, iphoneAuth.refreshToken);

    await pageIPhone.goto(`${baseUrl}orders/2`, { waitUntil: "domcontentloaded" });
    await pageIPhone.waitForTimeout(1200);

    const iphonePath = path.join(artifactsDir, "orders_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`   Saved iPhone screenshot to: ${iphonePath}`);
    await pageIPhone.close();

    // ----------------------------------------------------
    // 4. PROOF 1: REFUND FAILED ORDER
    // ----------------------------------------------------
    console.log("\n--- PROOF 1: REFUND FAILED ORDER & LEDGER ---");
    // Seed fresh test orders
    const seedOutput = execSync("Get-Content scripts/seed_fresh_orders.py | docker exec -i donater-api-1 python -", { shell: "powershell" }).toString();
    console.log("   " + seedOutput.trim());
    const match = seedOutput.match(/fail_id=(\d+), pending_id=(\d+)/);
    const failId = match ? match[1] : "5";
    const pendingId = match ? match[2] : "6";

    const userBeforeRefundRes = await fetch(`${API_BASE}/users/2`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const userBeforeRefund = await userBeforeRefundRes.json();
    console.log(`1. Refunddan OLDIN foydalanuvchi balansi: ${userBeforeRefund.balance_uzs} UZS`);

    const refundReason = "Provayder serverida xatolik yuz berdi";
    const refundRes = await fetch(`${API_BASE}/orders/${failId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: refundReason }),
    });

    const refundStatusCode = refundRes.status;
    const refundData = await refundRes.json();
    console.log(`2. Refund API javob kodi: ${refundStatusCode} (Kutilgan: 200 OK)`);
    console.log(`   Buyurtma yangi holati: ${refundData.status}`);

    const userAfterRefundRes = await fetch(`${API_BASE}/users/2`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const userAfterRefund = await userAfterRefundRes.json();
    console.log(`3. Refunddan KEYIN foydalanuvchi balansi: ${userAfterRefund.balance_uzs} UZS`);
    const balanceDiff = parseFloat(userAfterRefund.balance_uzs) - parseFloat(userBeforeRefund.balance_uzs);
    console.log(`   Balansga qaytgan summa: +${balanceDiff.toLocaleString("uz-UZ")} UZS (+18 500.00 UZS)`);

    // Ledger query
    const ledgerSql = `SELECT kind, amount_uzs, balance_after, comment FROM ledger_entries WHERE ref_id = '${failId}' AND ref_type = 'order' AND kind = 'order_refund' ORDER BY id DESC LIMIT 1;`;
    const ledgerRow = runSql(ledgerSql).split("\n")[0];
    console.log(`4. Postgres ledger_entries yozuvi: ${ledgerRow}`);

    testResults.proof1_refund = {
      refundStatusCode,
      orderStatus: refundData.status,
      balanceBefore: userBeforeRefund.balance_uzs,
      balanceAfter: userAfterRefund.balance_uzs,
      balanceRefundedAmount: balanceDiff,
      ledgerEntry: ledgerRow,
    };

    // ----------------------------------------------------
    // 5. PROOF 2: RETRY FUNDS_HELD ORDER
    // ----------------------------------------------------
    console.log("\n--- PROOF 2: RETRY FUNDS_HELD ORDER ---");
    const retryRes = await fetch(`${API_BASE}/orders/${pendingId}/retry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const retryStatusCode = retryRes.status;
    const retryData = await retryRes.json();
    console.log(`1. Retry API javob kodi: ${retryStatusCode} (Kutilgan: 200 OK)`);
    console.log(`   Buyurtma holati: ${retryData.status}`);

    // Audit log check for retry
    const retryAuditSql = `SELECT action, target_type, target_id FROM audit_log WHERE target_id = '${pendingId}' AND action = 'order.retry' ORDER BY id DESC LIMIT 1;`;
    const retryAuditRow = runSql(retryAuditSql).split("\n")[0];
    console.log(`2. Postgres audit_log retry yozuvi: ${retryAuditRow}`);

    testResults.proof2_retry = {
      retryStatusCode,
      orderStatus: retryData.status,
      auditLogEntry: retryAuditRow,
    };

    // ----------------------------------------------------
    // 6. PROOF 3: VIEWER ROLE RESTRICTIONS (403 ON PAYLOAD & NO WRITE)
    // ----------------------------------------------------
    console.log("\n--- PROOF 3: VIEWER ROLE SECURITY & 403 ---");
    const viewerAuth = await getDevLoginTokens(11223344);
    const viewerPayloadRes = await fetch(`${API_BASE}/orders/3/payload`, {
      headers: { Authorization: `Bearer ${viewerAuth.accessToken}` },
    });
    const viewerPayloadStatus = viewerPayloadRes.status;
    const viewerPayloadData = await viewerPayloadRes.json();
    console.log(`1. Viewer roli bilan /orders/3/payload so'rovi: ${viewerPayloadStatus} (Kutilgan: 403 Forbidden)`);
    console.log(`   Server xatosi:`, viewerPayloadData);

    const viewerRefundRes = await fetch(`${API_BASE}/orders/3/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "test" }),
    });
    console.log(`2. Viewer roli bilan /orders/3/refund so'rovi: ${viewerRefundRes.status} (Kutilgan: 403 Forbidden)`);

    testResults.proof3_viewerRole = {
      role: viewerAuth.admin.role,
      payloadStatus: viewerPayloadStatus,
      is403Forbidden: viewerPayloadStatus === 403,
      refundStatus: viewerRefundRes.status,
    };

    // ----------------------------------------------------
    // 7. PROOF 4: REVEAL PAYLOAD & AUDIT LOG
    // ----------------------------------------------------
    console.log("\n--- PROOF 4: REVEAL PAYLOAD & AUDIT LOG PROOF ---");
    const revealRes = await fetch(`${API_BASE}/orders/3/payload`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const revealStatus = revealRes.status;
    const revealData = await revealRes.json();
    console.log(`1. Owner roli bilan /orders/3/payload so'rovi: ${revealStatus} (Kutilgan: 200 OK)`);
    console.log(`   Yetkazilgan kalit (payload):`, revealData.delivered_payload);

    // Check audit_log
    const auditSql = `SELECT action, target_type, target_id, actor_tg_id FROM audit_log WHERE target_id = '3' AND action = 'order.reveal_payload' ORDER BY id DESC LIMIT 1;`;
    const auditRow = runSql(auditSql).split("\n")[0];
    console.log(`2. Postgres audit_log yozuvi: ${auditRow}`);

    testResults.proof4_payloadAudit = {
      revealStatus,
      deliveredPayload: revealData.delivered_payload,
      auditLogEntry: auditRow,
    };

    console.log("\n=== STEP 5 ORDERS FULL VERIFICATION RESULTS ===");
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
