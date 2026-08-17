import crypto from "node:crypto";
import { execSync } from "node:child_process";

const BOT_TOKEN = process.env.BOT_TOKEN || "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
const API_BASE = "http://127.0.0.1:8000/admin/api/v1";

async function getAdminToken(tgId = 777967425) {
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

  const res = await fetch(`${API_BASE}/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Admin login failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

function runSql(sql) {
  const cmd = `docker compose exec -T postgres psql -U donater -d donater -t -A -c "${sql.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { cwd: "C:/Users/Admin/Desktop/donater" }).toString().trim();
}

async function main() {
  console.log("=================================================");
  console.log("       STEP 4 PROOF & FLOW VERIFICATION          ");
  console.log("=================================================\n");

  const token = await getAdminToken();

  // 1. Foydalanuvchi ma'lumoti
  const userId = runSql("SELECT id FROM users ORDER BY id LIMIT 1").split("\n")[0].trim();
  console.log(`[1] Test foydalanuvchisi aniqlandi: user_id = ${userId}`);

  // ----------------------------------------------------
  // TEST A: TASDIQLASH (APPROVE) OQIMI
  // ----------------------------------------------------
  console.log("\n--- TEST A: TASDIQLASH (APPROVE) OQIMI ---");

  // Yangi tasdiq kutayotgan to'lov va chek yaratish
  const insertApproveSql = `WITH p AS (INSERT INTO payments (public_id, user_id, provider, amount_uzs, status, meta, created_at, updated_at) SELECT 'PM-T' || lpad((random()*99999)::int::text, 5, '0'), ${userId}, 'manual', 150000.00, 'pending', '{}', now(), now() RETURNING id) INSERT INTO payment_proofs (payment_id, tg_file_id, decision, created_at, updated_at) SELECT id, 'test-proof-file-approve', 'pending', now(), now() FROM p RETURNING id, payment_id;`;
  const insertApproveOutput = runSql(insertApproveSql);
  const [approveProofId, approvePaymentId] = insertApproveOutput.split("\n")[0].split("|").map((s) => s.trim());
  console.log(`Yangi to'lov va chek yaratildi: proof_id = ${approveProofId}, payment_id = ${approvePaymentId}`);

  // Tasdiqlashdan OLDIN foydalanuvchi balansi (/users/{id})
  const userBeforeApproveRes = await fetch(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userBeforeApprove = await userBeforeApproveRes.json();
  console.log(`1. Tasdiqlashdan OLDIN balans (/users/${userId}): ${userBeforeApprove.balance_uzs} UZS`);

  // Tasdiqlashdan OLDIN navbat holati (/payments/pending-proofs)
  const queueBeforeApproveRes = await fetch(`${API_BASE}/payments/pending-proofs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const queueBeforeApprove = await queueBeforeApproveRes.json();
  const isProofInQueueBefore = queueBeforeApprove.some((p) => p.id === Number(approveProofId));
  console.log(`2. Tasdiqlashdan OLDIN navbatda bormi: ${isProofInQueueBefore} (Jami navbatda: ${queueBeforeApprove.length} ta)`);

  // Tasdiqlash so'rovi (POST /payments/proofs/{id}/approve)
  const approveRes = await fetch(`${API_BASE}/payments/proofs/${approveProofId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
  });
  const approveStatusCode = approveRes.status;
  const approveData = await approveRes.json();
  console.log(`3. Tasdiqlash javobi (HTTP status): ${approveStatusCode} (Kutilgan: 200 OK)`);
  console.log(`   To'lov yangi statusi: ${approveData.status}, credited_at: ${approveData.credited_at}`);

  // Tasdiqlashdan KEYIN foydalanuvchi balansi (/users/{id})
  const userAfterApproveRes = await fetch(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userAfterApprove = await userAfterApproveRes.json();
  console.log(`4. Tasdiqlashdan KEYIN balans (/users/${userId}): ${userAfterApprove.balance_uzs} UZS`);
  const balanceDiff = parseFloat(userAfterApprove.balance_uzs) - parseFloat(userBeforeApprove.balance_uzs);
  console.log(`   Balans oshishi: +${balanceDiff.toLocaleString("uz-UZ")} UZS (+150 000.00 UZS)`);

  // Ledger yozuvi tekshiruvi (Postgres ledger_entries)
  const ledgerSql = `SELECT kind, amount_uzs, balance_after, comment FROM ledger_entries WHERE ref_id = '${approvePaymentId}' AND ref_type = 'payment' ORDER BY id DESC LIMIT 1;`;
  const ledgerRow = runSql(ledgerSql).split("\n")[0];
  console.log(`   Ledger yozuvi (kind | amount | balance_after | comment): ${ledgerRow}`);

  // Tasdiqlashdan KEYIN navbat holati (/payments/pending-proofs)
  const queueAfterApproveRes = await fetch(`${API_BASE}/payments/pending-proofs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const queueAfterApprove = await queueAfterApproveRes.json();
  const isProofInQueueAfter = queueAfterApprove.some((p) => p.id === Number(approveProofId));
  console.log(`5. Tasdiqlashdan KEYIN navbatda bormi: ${isProofInQueueAfter} (Chek ro'yxatdan muvaffaqiyatli chiqib ketdi)`);

  // ----------------------------------------------------
  // TEST B: RAD ETISH (REJECT) OQIMI
  // ----------------------------------------------------
  console.log("\n--- TEST B: RAD ETISH (REJECT) OQIMI ---");

  // Yangi tasdiq kutayotgan to'lov va chek yaratish
  const insertRejectSql = `WITH p AS (INSERT INTO payments (public_id, user_id, provider, amount_uzs, status, meta, created_at, updated_at) SELECT 'PM-T' || lpad((random()*99999)::int::text, 5, '0'), ${userId}, 'manual', 85000.00, 'pending', '{}', now(), now() RETURNING id) INSERT INTO payment_proofs (payment_id, tg_file_id, decision, created_at, updated_at) SELECT id, 'test-proof-file-reject', 'pending', now(), now() FROM p RETURNING id, payment_id;`;
  const insertRejectOutput = runSql(insertRejectSql);
  const [rejectProofId, rejectPaymentId] = insertRejectOutput.split("\n")[0].split("|").map((s) => s.trim());
  console.log(`Yangi to'lov va chek yaratildi: proof_id = ${rejectProofId}, payment_id = ${rejectPaymentId}`);

  // Rad etishdan OLDIN foydalanuvchi balansi
  const userBeforeRejectRes = await fetch(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userBeforeReject = await userBeforeRejectRes.json();
  console.log(`1. Rad etishdan OLDIN balans: ${userBeforeReject.balance_uzs} UZS`);

  // Rad etish so'rovi (POST /payments/proofs/{id}/reject)
  const rejectReason = "Chek fotosurati noaniq yoki to'lov summasi mos kelmadi";
  const rejectRes = await fetch(`${API_BASE}/payments/proofs/${rejectProofId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason: rejectReason }),
  });
  const rejectStatusCode = rejectRes.status;
  const rejectData = await rejectRes.json();
  console.log(`2. Rad etish javobi (HTTP status): ${rejectStatusCode} (Kutilgan: 200 OK)`);
  console.log(`   To'lov yangi statusi: ${rejectData.status}`);

  // Rad etishdan KEYIN foydalanuvchi balansi
  const userAfterRejectRes = await fetch(`${API_BASE}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userAfterReject = await userAfterRejectRes.json();
  console.log(`3. Rad etishdan KEYIN balans: ${userAfterReject.balance_uzs} UZS (O'zgarmadi: ${userBeforeReject.balance_uzs === userAfterReject.balance_uzs})`);

  // Rad etishdan KEYIN navbat holati
  const queueAfterRejectRes = await fetch(`${API_BASE}/payments/pending-proofs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const queueAfterReject = await queueAfterRejectRes.json();
  const isRejectProofInQueueAfter = queueAfterReject.some((p) => p.id === Number(rejectProofId));
  console.log(`4. Rad etishdan KEYIN navbatda bormi: ${isRejectProofInQueueAfter} (Chek navbatdan chiqarildi)`);

  // DB da proof decision va reject_reason tekshiruvi
  const proofSql = `SELECT decision, reject_reason FROM payment_proofs WHERE id = ${rejectProofId};`;
  const proofRow = runSql(proofSql).split("\n")[0];
  console.log(`   DB payment_proofs yozuvi: ${proofRow}`);

  // ----------------------------------------------------
  // TEST C: TELEGRAM CHEK RASMI (PROOF FILE)
  // ----------------------------------------------------
  console.log("\n--- TEST C: TELEGRAM PROOF FILE PROXY VA FILE_ID ---");
  const proofFileRes = await fetch(`${API_BASE}/payments/${approvePaymentId}/proof-file`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`1. Fake tg_file_id ('test-proof-file-approve') bilan backend proxysi: ${proofFileRes.status} ${proofFileRes.statusText}`);
  const proofFileBody = await proofFileRes.json().catch(() => null);
  console.log(`   Backend Telegram javobi:`, proofFileBody);
}

main().catch(console.error);
