import crypto from "node:crypto";

const BOT_TOKEN = "5566434691:AAFlFOuAMeY2nSLQsY64CHseYI7g07qO56k";
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

  const data = await response.json();
  return data;
}

async function main() {
  const owner = await getDevLoginTokens(777967425);
  console.log("Owner login permissions:", owner.admin.role, owner.permissions);

  const previewRes = await fetch(`${API_BASE}/markup/preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${owner.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ offer_id: 2, quantity: 1 }),
  });
  console.log("Preview status:", previewRes.status);
  const previewBody = await previewRes.json();
  console.log("Preview body:", previewBody);

  const viewer = await getDevLoginTokens(11223344);
  console.log("Viewer login permissions:", viewer.admin?.role, viewer.permissions);
}

main().catch(console.error);
