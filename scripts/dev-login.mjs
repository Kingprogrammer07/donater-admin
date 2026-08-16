/**
 * Sign in locally, without the Telegram widget.
 *
 * The widget only renders on a domain registered with BotFather, so it cannot
 * work on localhost. This mints the same signed payload Telegram would send,
 * posts it to the admin API, and prints one line to paste into the browser
 * console. Nothing here ships in the app bundle: the bot token must never
 * reach a browser.
 *
 *   BOT_TOKEN=... node scripts/dev-login.mjs [tg_id]
 */
import crypto from "node:crypto";

const BOT_TOKEN = process.env.BOT_TOKEN;
const API = process.env.API_BASE || "http://127.0.0.1:8000/admin/api/v1";
const TG_ID = Number(process.argv[2] || 777967425);
const REFRESH_KEY = "donater_admin_refresh_token";

if (!BOT_TOKEN) {
  console.error(
    "BOT_TOKEN is not set. Read it from the backend .env and pass it in:\n" +
      "  BOT_TOKEN=<token> node scripts/dev-login.mjs"
  );
  process.exit(1);
}

const payload = {
  id: TG_ID,
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

const response = await fetch(`${API}/auth/telegram`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  console.error(`sign-in failed: ${response.status} ${await response.text()}`);
  console.error(
    response.status === 403
      ? `Telegram id ${TG_ID} is not an admin. Add it: docker compose run --rm --no-deps api python -m donater.cli admin add ${TG_ID} --role owner`
      : ""
  );
  process.exit(1);
}

const tokens = await response.json();
console.log(`Signed in as ${tokens.admin.tg_id} (${tokens.admin.role}).`);
console.log("Paste this in the browser console on the panel, then reload:\n");
console.log(`localStorage.setItem(${JSON.stringify(REFRESH_KEY)}, ${JSON.stringify(tokens.refresh_token)})`);
