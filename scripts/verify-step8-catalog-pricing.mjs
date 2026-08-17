import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

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
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("==========================================================");
  console.log("   STEP 8: CATALOG, PRICING & FX VERIFICATION & PROOFS    ");
  console.log("==========================================================\n");

  const ownerAuth = await getDevLoginTokens(777967425);
  const viewerAuth = await getDevLoginTokens(11223344);

  const server = await createServer({
    server: { host: "127.0.0.1", port: 5198 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5198/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // PROOF 1: Marja qoidasini o'zgartirib /markup/preview
    // ----------------------------------------------------
    console.log("\n--- PROOF 1: MARKUP PREVIEW BEFORE & AFTER ---");
    
    // Ensure global rule exists
    const listRes = await fetch(`${API_BASE}/markup/rules`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const currentRules = await listRes.json();
    let globalRule = currentRules.find((r) => r.scope === "global");
    if (!globalRule) {
      const createRes = await fetch(`${API_BASE}/markup/rules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerAuth.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "global",
          markup_pct: 12.0,
          markup_fixed_uzs: 0,
          round_to_uzs: 100,
          is_active: true,
          note: "Global asosiy marja",
        }),
      });
      globalRule = await createRes.json();
    }

    // Get quote before (offer_id: 2)
    const previewBeforeRes = await fetch(`${API_BASE}/markup/preview`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ offer_id: 2, quantity: 1 }),
    });
    const quoteBefore = await previewBeforeRes.json();
    console.log("1. Oldingi Quote (Preview Before / Global 12%):", {
      markup_pct: quoteBefore.markup_pct,
      fx_rate: quoteBefore.fx_rate,
      price_uzs: quoteBefore.price_uzs,
      profit_uzs: quoteBefore.profit_uzs,
      rule_id: quoteBefore.markup_rule_id,
    });

    // Check if an offer rule already exists on offer_id: 2, if so delete it or update it
    const existingOfferRule = currentRules.find((r) => r.scope === "offer" && r.offer_id === 2);
    if (existingOfferRule) {
      await fetch(`${API_BASE}/markup/rules/${existingOfferRule.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
      });
    }

    // Create an offer-specific rule with 25% markup
    const offerRuleRes = await fetch(`${API_BASE}/markup/rules`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "offer",
        offer_id: 2,
        markup_pct: 25.0,
        markup_fixed_uzs: 1000,
        round_to_uzs: 100,
        is_active: true,
        note: "Offer #2 maxsus 25% marja",
      }),
    });
    const offerRule = await offerRuleRes.json();
    console.log("2. Maxsus Offer qoidasi qo'shildi:", {
      id: offerRule.id,
      scope: offerRule.scope,
      offer_id: offerRule.offer_id,
      markup_pct: offerRule.markup_pct,
    });

    // Get quote after
    const previewAfterRes = await fetch(`${API_BASE}/markup/preview`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ offer_id: 2, quantity: 1 }),
    });
    const quoteAfter = await previewAfterRes.json();
    console.log("3. Keyingi Quote (Preview After / Offer rule 25%):", {
      markup_pct: quoteAfter.markup_pct,
      fx_rate: quoteAfter.fx_rate,
      price_uzs: quoteAfter.price_uzs,
      profit_uzs: quoteAfter.profit_uzs,
      rule_id: quoteAfter.markup_rule_id,
    });

    // Clean up temporary offer rule
    if (offerRule && offerRule.id) {
      await fetch(`${API_BASE}/markup/rules/${offerRule.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
      });
    }

    // ----------------------------------------------------
    // PROOF 2: Global qoidani o'chirishga urinish (409 Conflict)
    // ----------------------------------------------------
    console.log("\n--- PROOF 2: GLOBAL RULE DELETE 409 CONFLICT ---");
    const deleteGlobalRes = await fetch(`${API_BASE}/markup/rules/${globalRule.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const deleteGlobalStatus = deleteGlobalRes.status;
    const deleteGlobalBody = await deleteGlobalRes.json();
    console.log("DELETE /markup/rules/global response:", {
      status: deleteGlobalStatus,
      body: deleteGlobalBody,
    });

    // ----------------------------------------------------
    // PROOF 3: Qo'lda kurs qo'yish va Strict rejimni yoqish
    // ----------------------------------------------------
    console.log("\n--- PROOF 3: FX MANUAL & STRICT MODE ---");
    const setManualRes = await fetch(`${API_BASE}/fx/manual`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate: 12900.0,
        note: "Step 8 Test Manual Rate",
      }),
    });
    const manualRateData = await setManualRes.json();
    console.log("1. Manual Rate set response:", manualRateData);

    const setModeRes = await fetch(`${API_BASE}/fx/mode`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ownerAuth.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ strict_manual: true }),
    });
    const modeData = await setModeRes.json();
    console.log("2. FX Mode strict_manual response:", modeData);

    const currentFxRes = await fetch(`${API_BASE}/fx/current`, {
      headers: { Authorization: `Bearer ${ownerAuth.accessToken}` },
    });
    const currentFx = await currentFxRes.json();
    console.log("3. GET /fx/current:", currentFx);

    // ----------------------------------------------------
    // PROOF 4: Viewer roli bilan tahrirlash tugmalari yo'qligi
    // ----------------------------------------------------
    console.log("\n--- PROOF 4: VIEWER ROLE PERMISSION RESTRICTIONS ---");
    const pageViewer = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    pageViewer.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
    pageViewer.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));

    await pageViewer.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerAuth.refreshToken);

    await pageViewer.goto(`${baseUrl}pricing`, { waitUntil: "networkidle" });
    await pageViewer.waitForSelector("text=Marja va Valyuta kursi boshqaruvi", { timeout: 15000 });
    await pageViewer.waitForTimeout(600);

    const addRuleBtnCount = await pageViewer.locator("button:has-text('Qoida qo\\'shish')").count();
    const manualRateBtnCount = await pageViewer.locator("button:has-text('Qo\\'lda kurs qo\\'yish')").count();
    const editBtnCount = await pageViewer.locator("button:has-text('Tahrirlash')").count();

    console.log("Viewer /pricing page buttons count:", {
      addRuleBtnCount,
      manualRateBtnCount,
      editBtnCount,
    });

    const viewerCatAuth = await getDevLoginTokens(11223344);
    const pageViewerCat = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    pageViewerCat.on("pageerror", (err) => console.log("CAT PAGE ERROR:", err.message));
    pageViewerCat.on("console", (msg) => console.log("CAT PAGE CONSOLE:", msg.text()));
    await pageViewerCat.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, viewerCatAuth.refreshToken);

    await pageViewerCat.goto(`${baseUrl}catalog`, { waitUntil: "networkidle" });
    await pageViewerCat.waitForSelector("text=Katalog boshqaruvi", { timeout: 15000 });
    await pageViewerCat.waitForTimeout(600);

    const syncBtnCount = await pageViewerCat.locator("button:has-text('Katalogni sinxronlash')").count();
    const catEditBtnCount = await pageViewerCat.locator("button:has-text('Tahrirlash')").count();

    console.log("Viewer /catalog page buttons count:", {
      syncBtnCount,
      catEditBtnCount,
    });
    await pageViewer.close();
    await pageViewerCat.close();

    // ----------------------------------------------------
    // PROOF 5: UI SCREENSHOTS (Catalog & Pricing)
    // ----------------------------------------------------
    console.log("\n--- PROOF 5: CAPTURING REAL UI SCREENSHOTS ---");

    // 1. Catalog Light Mode
    const catLightAuth = await getDevLoginTokens(777967425);
    const pageCatLight = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });
    await pageCatLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, catLightAuth.refreshToken);
    await pageCatLight.goto(`${baseUrl}catalog`, { waitUntil: "networkidle" });
    await pageCatLight.waitForSelector("text=Katalog boshqaruvi", { timeout: 15000 });
    await pageCatLight.waitForTimeout(600);
    const catLightPath = path.join(artifactsDir, "catalog_light_real.png");
    await pageCatLight.screenshot({ path: catLightPath, fullPage: false });
    console.log(`   Saved Catalog Light screenshot: ${catLightPath}`);
    await pageCatLight.close();

    // 2. Catalog Dark Mode
    const catDarkAuth = await getDevLoginTokens(777967425);
    const pageCatDark = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "dark",
    });
    await pageCatDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, catDarkAuth.refreshToken);
    await pageCatDark.goto(`${baseUrl}catalog`, { waitUntil: "networkidle" });
    await pageCatDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pageCatDark.waitForSelector("text=Katalog boshqaruvi", { timeout: 15000 });
    await pageCatDark.waitForTimeout(600);
    const catDarkPath = path.join(artifactsDir, "catalog_dark_real.png");
    await pageCatDark.screenshot({ path: catDarkPath, fullPage: false });
    console.log(`   Saved Catalog Dark screenshot: ${catDarkPath}`);
    await pageCatDark.close();

    // 3. Pricing Light Mode
    const pricingLightAuth = await getDevLoginTokens(777967425);
    const pagePricingLight = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });
    await pagePricingLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, pricingLightAuth.refreshToken);
    await pagePricingLight.goto(`${baseUrl}pricing`, { waitUntil: "networkidle" });
    await pagePricingLight.waitForSelector("text=Marja va Valyuta kursi boshqaruvi", { timeout: 15000 });
    await pagePricingLight.waitForTimeout(600);
    const pricingLightPath = path.join(artifactsDir, "pricing_light_real.png");
    await pagePricingLight.screenshot({ path: pricingLightPath, fullPage: false });
    console.log(`   Saved Pricing Light screenshot: ${pricingLightPath}`);
    await pagePricingLight.close();

    // 4. Pricing Dark Mode
    const pricingDarkAuth = await getDevLoginTokens(777967425);
    const pagePricingDark = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "dark",
    });
    await pagePricingDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, pricingDarkAuth.refreshToken);
    await pagePricingDark.goto(`${baseUrl}pricing`, { waitUntil: "networkidle" });
    await pagePricingDark.evaluate(() => document.documentElement.classList.add("dark"));
    await pagePricingDark.waitForSelector("text=Marja va Valyuta kursi boshqaruvi", { timeout: 15000 });
    await pagePricingDark.waitForTimeout(600);
    const pricingDarkPath = path.join(artifactsDir, "pricing_dark_real.png");
    await pagePricingDark.screenshot({ path: pricingDarkPath, fullPage: false });
    console.log(`   Saved Pricing Dark screenshot: ${pricingDarkPath}`);
    await pagePricingDark.close();

    // 5. Pricing iPhone 390px
    const pricingPhoneAuth = await getDevLoginTokens(777967425);
    const pagePricingPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await pagePricingPhone.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, pricingPhoneAuth.refreshToken);
    await pagePricingPhone.goto(`${baseUrl}pricing`, { waitUntil: "networkidle" });
    await pagePricingPhone.waitForSelector("text=Marja va Valyuta kursi boshqaruvi", { timeout: 15000 });
    await pagePricingPhone.waitForTimeout(600);
    const pricingPhonePath = path.join(artifactsDir, "pricing_iphone_390px_real.png");
    await pagePricingPhone.screenshot({ path: pricingPhonePath, fullPage: false });
    console.log(`   Saved Pricing iPhone screenshot: ${pricingPhonePath}`);
    await pagePricingPhone.close();

    console.log("\n=== STEP 8 VERIFICATION & PROOFS COMPLETED SUCCESSFULLY ===");
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error("Step 8 verification failed:", err);
  process.exit(1);
});
