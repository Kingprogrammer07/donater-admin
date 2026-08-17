import { chromium } from "playwright";
import { createServer } from "vite";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const BOT_TOKEN = process.env.BOT_TOKEN || "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
const API_BASE = "http://127.0.0.1:8000/admin/api/v1";

function runSql(sql) {
  const cmd = `docker compose exec -T postgres psql -U donater -d donater -t -A -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { cwd: "C:/Users/Admin/Desktop/donater" }).toString().trim();
}

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

  const data = await response.json();
  return data.refresh_token;
}

async function run() {
  // Clear any existing pending proofs so we have an exact test state
  runSql("UPDATE payment_proofs SET decision = 'rejected', reject_reason = 'cleanup' WHERE decision = 'pending';");
  runSql("UPDATE payments SET status = 'failed' WHERE status = 'pending';");

  const userId = runSql("SELECT id FROM users ORDER BY id LIMIT 1").split("\n")[0].trim();

  // Seed fresh pending payment
  const insertSql = `WITH p AS (INSERT INTO payments (public_id, user_id, provider, amount_uzs, status, meta, created_at, updated_at) SELECT 'PM-UI' || lpad((random()*99999)::int::text, 5, '0'), ${userId}, 'manual', 150000.00, 'pending', '{}', now(), now() RETURNING id) INSERT INTO payment_proofs (payment_id, tg_file_id, decision, created_at, updated_at) SELECT id, 'ui-test-file', 'pending', now(), now() FROM p RETURNING id, payment_id;`;
  const insertOut = runSql(insertSql);
  const [proofId, paymentId] = insertOut.split("\n")[0].split("|").map((s) => s.trim());
  console.log(`UI Test uchun yagona yangi chek yaratildi: proof_id=${proofId}, payment_id=${paymentId}`);

  const server = await createServer({ server: { host: "127.0.0.1", port: 5191 } });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5191/admin/`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const refreshToken = await getDevLoginRefreshToken();
  await page.addInitScript((t) => localStorage.setItem("donater_admin_refresh_token", t), refreshToken);

  await page.goto(`${baseUrl}payments`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Check UI displays the proof
  const hasProof = await page.locator(`text=Chek #${proofId}`).isVisible();
  console.log(`1. UI da Chek #${proofId} ko'rinyaptimi:`, hasProof);

  // Click Tasdiqlash button on the card
  await page.locator(`button:has-text('Tasdiqlash')`).first().click();
  await page.waitForTimeout(400);

  // Check confirm dialog open
  const isDialogVisible = await page.locator("div[role='alertdialog']").isVisible();
  console.log("2. Confirm dialog ochildimi:", isDialogVisible);

  // Click confirm inside dialog and wait for approve response
  const [approveResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/approve") && res.request().method() === "POST"),
    page.locator("div[role='alertdialog'] button").last().click(),
  ]);

  console.log(`3. UI orqali tasdiqlash API javob kodi: ${approveResponse.status()}`);
  const respJson = await approveResponse.json();
  console.log(`   API qaytargan to'lov holati: status=${respJson.status}, credited_at=${respJson.credited_at}`);

  await page.waitForTimeout(1500);

  const isProofStillVisible = await page.locator(`text=Chek #${proofId}`).isVisible();
  const isEmptyStateVisible = await page.locator("text=Ko'rib chiqilmagan cheklar mavjud emas").isVisible();
  console.log(`4. Tasdiqlangandan so'ng Chek #${proofId} navbatdan chiqib ketdimi: ${!isProofStillVisible}`);
  console.log(`5. Navbat bo'sh holati (EmptyState) ko'rindimi: ${isEmptyStateVisible}`);

  await browser.close();
  await server.close();
}

run().catch(console.error);
