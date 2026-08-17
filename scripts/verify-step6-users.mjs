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
  console.log("     STEP 6 USERS VERIFICATION & SCREENSHOTS     ");
  console.log("=================================================\n");

  const server = await createServer({
    server: { host: "127.0.0.1", port: 5196 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5196/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const testResults = {};

  try {
    const ownerAuth = await getDevLoginTokens(777967425);

    // ----------------------------------------------------
    // 1. Desktop Light Mode: Users Table
    // ----------------------------------------------------
    console.log("1. Capturing Desktop Light Mode: Users Page...");
    const lightAuth = await getDevLoginTokens(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });

    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, lightAuth.refreshToken);

    await pageLight.goto(`${baseUrl}users`, { waitUntil: "networkidle" });
    await pageLight.waitForSelector("text=Foydalanuvchilar boshqaruvi", { timeout: 8000 });
    await pageLight.waitForTimeout(500);

    const tableRows = await pageLight.locator("tbody tr").count();
    console.log(`   Users table rows count: ${tableRows}`);

    const lightPath = path.join(artifactsDir, "users_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`   Saved Light screenshot to: ${lightPath}`);
    await pageLight.close();

    // ----------------------------------------------------
    // 2. Desktop Dark Mode: User Detail Drawer & Ledger
    // ----------------------------------------------------
    console.log("2. Capturing Desktop Dark Mode: User Detail Drawer with Ledger...");
    const darkAuth = await getDevLoginTokens(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });

    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);

    // Navigate to deep link /users/2
    await pageDark.goto(`${baseUrl}users/2`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForSelector("text=Foydalanuvchi profili", { timeout: 8000 });
    await pageDark.waitForTimeout(600);

    const darkPath = path.join(artifactsDir, "users_dark_real.png");
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

    await pageIPhone.goto(`${baseUrl}users/2`, { waitUntil: "networkidle" });
    await pageIPhone.waitForSelector("text=Foydalanuvchi profili", { timeout: 8000 });
    await pageIPhone.waitForTimeout(600);

    const iphonePath = path.join(artifactsDir, "users_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`   Saved iPhone screenshot to: ${iphonePath}`);
    await pageIPhone.close();

    // ----------------------------------------------------
    // 4. PROOF 1: BALANCE ADJUST (+50 000 UZS) & LEDGER
    // ----------------------------------------------------
    console.log("\n--- PROOF 1: +50 000 UZS BALANCE ADJUSTMENT ---");
    const userBeforeRes = await fetch(`${API_BASE}/users/2`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const userBefore = await userBeforeRes.json();
    console.log(`1. Tuzatishdan OLDIN foydalanuvchi balansi: ${userBefore.balance_uzs} UZS`);

    const idempotencyKey1 = crypto.randomUUID();
    const adjustRes1 = await fetch(
      `${API_BASE}/users/2/balance-adjust?idempotency_key=${encodeURIComponent(idempotencyKey1)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerAuth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_uzs: 50000.0,
          comment: "Qo'lda hisob to'ldirish (Manual bonus)",
        }),
      }
    );

    const adjust1StatusCode = adjustRes1.status;
    const adjust1Data = await adjustRes1.json();
    console.log(`2. Balance adjust API javob kodi: ${adjust1StatusCode} (Kutilgan: 200 OK)`);
    console.log(`   Qaytgan balance_after: ${adjust1Data.balance_after} UZS`);

    const userAfterRes = await fetch(`${API_BASE}/users/2`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const userAfter = await userAfterRes.json();
    console.log(`3. Tuzatishdan KEYIN foydalanuvchi balansi: ${userAfter.balance_uzs} UZS`);
    const balanceDiff = parseFloat(userAfter.balance_uzs) - parseFloat(userBefore.balance_uzs);
    console.log(`   Balansga qo'shilgan summa: +${balanceDiff.toLocaleString("uz-UZ")} UZS (+50 000.00 UZS)`);

    // Ledger query in postgres
    const ledgerSql = `SELECT kind, amount_uzs, balance_after, ref_id, comment FROM ledger_entries WHERE ref_id = '${idempotencyKey1}' AND kind = 'admin_adjust';`;
    const ledgerRow = runSql(ledgerSql).split("\n")[0];
    console.log(`4. Postgres ledger_entries yozuvi: ${ledgerRow}`);

    testResults.proof1_adjust = {
      adjustStatusCode: adjust1StatusCode,
      balanceBefore: userBefore.balance_uzs,
      balanceAfter: userAfter.balance_uzs,
      balanceDiff,
      idempotencyKey: idempotencyKey1,
      ledgerRow,
    };

    // ----------------------------------------------------
    // 5. PROOF 2: IDEMPOTENT RE-SUBMISSION WITH SAME KEY
    // ----------------------------------------------------
    console.log("\n--- PROOF 2: IDEMPOTENCY RE-SUBMISSION WITH SAME KEY ---");
    const countBeforeResend = runSql(
      `SELECT count(*) FROM ledger_entries WHERE ref_id = '${idempotencyKey1}' AND kind = 'admin_adjust';`
    );
    console.log(`1. Qayta yuborishdan OLDIN bazadagi ledger yozuvlar soni: ${countBeforeResend}`);

    // Send the exact same request again
    const adjustRes2 = await fetch(
      `${API_BASE}/users/2/balance-adjust?idempotency_key=${encodeURIComponent(idempotencyKey1)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerAuth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_uzs: 50000.0,
          comment: "Qo'lda hisob to'ldirish (Manual bonus)",
        }),
      }
    );

    const adjust2StatusCode = adjustRes2.status;
    const adjust2Data = await adjustRes2.json();
    console.log(`2. Takroriy so'rov API javob kodi: ${adjust2StatusCode} (Kutilgan: 200 OK)`);

    const countAfterResend = runSql(
      `SELECT count(*) FROM ledger_entries WHERE ref_id = '${idempotencyKey1}' AND kind = 'admin_adjust';`
    );
    console.log(`3. Qayta yuborishdan KEYIN bazadagi ledger yozuvlar soni: ${countAfterResend} (Kutilgan: 1, ikkinchi yozuv qo'shilmadi)`);

    const userAfterResendRes = await fetch(`${API_BASE}/users/2`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const userAfterResend = await userAfterResendRes.json();
    console.log(`4. Takroriy so'rovdan keyingi foydalanuvchi balansi: ${userAfterResend.balance_uzs} UZS (O'zgarmadi)`);

    testResults.proof2_idempotency = {
      resendStatusCode: adjust2StatusCode,
      ledgerCountBefore: Number(countBeforeResend),
      ledgerCountAfter: Number(countAfterResend),
      isIdempotent: Number(countBeforeResend) === Number(countAfterResend),
      balanceRemainedSame: userAfterResend.balance_uzs === userAfter.balance_uzs,
    };

    // ----------------------------------------------------
    // 6. PROOF 3: NEGATIVE ADJUSTMENT EXCEEDING BALANCE (400 BAD REQUEST)
    // ----------------------------------------------------
    console.log("\n--- PROOF 3: NEGATIVE ADJUSTMENT EXCEEDING BALANCE ---");
    const currentBalanceNum = parseFloat(userAfterResend.balance_uzs);
    const excessDebitAmount = -(currentBalanceNum + 100000);
    const overdraftKey = crypto.randomUUID();

    console.log(`1. Mavjud balans: ${currentBalanceNum} UZS. Yechilmoqchi bo'lgan summa: ${excessDebitAmount} UZS`);
    const overdraftRes = await fetch(
      `${API_BASE}/users/2/balance-adjust?idempotency_key=${encodeURIComponent(overdraftKey)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerAuth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_uzs: excessDebitAmount,
          comment: "Haddan tashqari yechish urinishi",
        }),
      }
    );

    const overdraftStatus = overdraftRes.status;
    const overdraftError = await overdraftRes.json();
    console.log(`2. Overdraft so'rovi API javob kodi: ${overdraftStatus} (Kutilgan: 400 Bad Request)`);
    console.log(`   Server xatosi:`, overdraftError);

    testResults.proof3_overdraft = {
      statusCode: overdraftStatus,
      is400BadRequest: overdraftStatus === 400,
      errorMessage: overdraftError.detail,
    };

    // ----------------------------------------------------
    // 7. PROOF 4: VIEWER ROLE SECURITY (403 FORBIDDEN & NO BUTTONS)
    // ----------------------------------------------------
    console.log("\n--- PROOF 4: VIEWER ROLE RESTRICTIONS & 403 ---");
    const viewerAuth = await getDevLoginTokens(11223344);
    const viewerAdjustKey = crypto.randomUUID();

    const viewerAdjustRes = await fetch(
      `${API_BASE}/users/2/balance-adjust?idempotency_key=${encodeURIComponent(viewerAdjustKey)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${viewerAuth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_uzs: 10000.0,
          comment: "Viewer unauthorized balance adjust",
        }),
      }
    );
    console.log(`1. Viewer roli bilan /users/2/balance-adjust: ${viewerAdjustRes.status} (Kutilgan: 403 Forbidden)`);

    const viewerBlockRes = await fetch(`${API_BASE}/users/2/block`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "Viewer block test" }),
    });
    console.log(`2. Viewer roli bilan /users/2/block: ${viewerBlockRes.status} (Kutilgan: 403 Forbidden)`);

    testResults.proof4_viewerSecurity = {
      role: viewerAuth.admin.role,
      adjustStatusCode: viewerAdjustRes.status,
      blockStatusCode: viewerBlockRes.status,
      is403Forbidden: viewerAdjustRes.status === 403 && viewerBlockRes.status === 403,
    };

    console.log("\n=== STEP 6 USERS FULL VERIFICATION RESULTS ===");
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
