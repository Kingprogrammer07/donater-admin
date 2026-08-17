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

  console.log("=================================================");
  console.log("   STEP 7 DASHBOARD VERIFICATION & SCREENSHOTS   ");
  console.log("=================================================\n");

  const server = await createServer({
    server: { host: "127.0.0.1", port: 5197 },
  });
  await server.listen();
  const baseUrl = `http://127.0.0.1:5197/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const testResults = {};

  try {
    // ----------------------------------------------------
    // 1. Desktop Light Mode: Dashboard
    // ----------------------------------------------------
    console.log("1. Capturing Desktop Light Mode: Dashboard Page...");
    const lightAuth = await getDevLoginTokens(777967425);
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "light",
    });

    await pageLight.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, lightAuth.refreshToken);

    await pageLight.goto(`${baseUrl}`, { waitUntil: "networkidle" });
    await pageLight.waitForSelector("text=Boshqaruv Paneli (Dashboard)", { timeout: 15000 });
    await pageLight.waitForTimeout(600);

    // Hover over the chart to show light tooltip
    const lightSvg = pageLight.locator(".recharts-wrapper").first();
    const lightBox = await lightSvg.boundingBox();
    if (lightBox) {
      await pageLight.mouse.move(lightBox.x + lightBox.width * 0.85, lightBox.y + lightBox.height * 0.5);
      await pageLight.waitForTimeout(300);
    }

    // Inspect computed token values in Light Mode
    const lightComputed = await pageLight.evaluate(() => {
      const el = document.documentElement;
      const cs = getComputedStyle(el);
      return {
        chartRevenue: cs.getPropertyValue("--chart-revenue").trim(),
        chartProfit: cs.getPropertyValue("--chart-profit").trim(),
        chartGrid: cs.getPropertyValue("--chart-grid").trim(),
        chartTooltipBg: cs.getPropertyValue("--chart-tooltip-bg").trim(),
        surface: cs.getPropertyValue("--surface").trim(),
        hairline: cs.getPropertyValue("--hairline").trim(),
      };
    });
    console.log("   Light Mode Computed Tokens:", lightComputed);
    testResults.lightComputedTokens = lightComputed;

    const lightPath = path.join(artifactsDir, "dashboard_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`   Saved Light screenshot to: ${lightPath}`);
    await pageLight.close();

    // ----------------------------------------------------
    // 2. Desktop Dark Mode: Dashboard
    // ----------------------------------------------------
    console.log("2. Capturing Desktop Dark Mode: Dashboard Page...");
    const darkAuth = await getDevLoginTokens(777967425);
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      colorScheme: "dark",
    });

    await pageDark.addInitScript((token) => {
      localStorage.setItem("donater_admin_refresh_token", token);
    }, darkAuth.refreshToken);

    await pageDark.goto(`${baseUrl}`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForSelector("text=Boshqaruv Paneli (Dashboard)", { timeout: 15000 });
    await pageDark.waitForTimeout(600);

    // Hover over the chart to show dark tooltip
    const darkSvg = pageDark.locator(".recharts-wrapper").first();
    const darkBox = await darkSvg.boundingBox();
    if (darkBox) {
      await pageDark.mouse.move(darkBox.x + darkBox.width * 0.85, darkBox.y + darkBox.height * 0.5);
      await pageDark.waitForTimeout(300);
    }

    // Inspect computed token values in Dark Mode
    const darkComputed = await pageDark.evaluate(() => {
      const el = document.documentElement;
      const cs = getComputedStyle(el);
      return {
        chartRevenue: cs.getPropertyValue("--chart-revenue").trim(),
        chartProfit: cs.getPropertyValue("--chart-profit").trim(),
        chartGrid: cs.getPropertyValue("--chart-grid").trim(),
        chartTooltipBg: cs.getPropertyValue("--chart-tooltip-bg").trim(),
        surface: cs.getPropertyValue("--surface").trim(),
        hairline: cs.getPropertyValue("--hairline").trim(),
      };
    });
    console.log("   Dark Mode Computed Tokens:", darkComputed);
    testResults.darkComputedTokens = darkComputed;

    const darkPath = path.join(artifactsDir, "dashboard_dark_real.png");
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

    await pageIPhone.goto(`${baseUrl}`, { waitUntil: "networkidle" });
    await pageIPhone.waitForSelector("text=Boshqaruv Paneli (Dashboard)", { timeout: 15000 });
    await pageIPhone.waitForTimeout(600);

    const iphonePath = path.join(artifactsDir, "dashboard_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`   Saved iPhone screenshot to: ${iphonePath}`);
    await pageIPhone.close();

    // ----------------------------------------------------
    // 4. PROOF 1: GET /stats/overview (7d) NUMBERS
    // ----------------------------------------------------
    console.log("\n--- PROOF 1: GET /stats/overview (7d) NUMBERS ---");
    const overviewAuth = await getDevLoginTokens(777967425);
    const overview7dRes = await fetch(`${API_BASE}/stats/overview?period=7d`, {
      headers: { Authorization: `Bearer ${overviewAuth.accessToken}` },
    });
    const overview7d = await overview7dRes.json();
    console.log("API Overview (7d) Response:", JSON.stringify(overview7d, null, 2));

    testResults.proof1_overview7d = overview7d;

    // ----------------------------------------------------
    // 5. PROOF 2: PERIOD COMPARISON (today vs 30d)
    // ----------------------------------------------------
    console.log("\n--- PROOF 2: PERIOD COMPARISON (today vs 30d) ---");
    const overviewTodayRes = await fetch(`${API_BASE}/stats/overview?period=today`, {
      headers: { Authorization: `Bearer ${overviewAuth.accessToken}` },
    });
    const overviewToday = await overviewTodayRes.json();

    const overview30dRes = await fetch(`${API_BASE}/stats/overview?period=30d`, {
      headers: { Authorization: `Bearer ${overviewAuth.accessToken}` },
    });
    const overview30d = await overview30dRes.json();

    console.log("1. Period = today:", JSON.stringify(overviewToday, null, 2));
    console.log("2. Period = 30d:", JSON.stringify(overview30d, null, 2));

    testResults.proof2_periodComparison = {
      today: overviewToday,
      "30d": overview30d,
      isDifferencePresent:
        overviewToday.new_users !== overview30d.new_users ||
        overviewToday.orders_total !== overview30d.orders_total ||
        overviewToday.revenue_uzs !== overview30d.revenue_uzs,
    };

    // ----------------------------------------------------
    // 6. PROOF 3: EMPTY TIMESERIES TEST
    // ----------------------------------------------------
    console.log("\n--- PROOF 3: EMPTY TIMESERIES CHECK ---");
    const timeseriesRes = await fetch(
      `${API_BASE}/stats/timeseries?metric=revenue&interval=hour&period=today`,
      {
        headers: { Authorization: `Bearer ${overviewAuth.accessToken}` },
      }
    );
    const timeseriesData = await timeseriesRes.json();
    console.log(`Timeseries point count: ${timeseriesData.points?.length || 0}`);
    console.log(
      `Points with non-zero value: ${
        timeseriesData.points?.filter((p) => Number(p.value) > 0).length || 0
      }`
    );

    testResults.proof3_timeseries = {
      metric: timeseriesData.metric,
      interval: timeseriesData.interval,
      totalBuckets: timeseriesData.points?.length || 0,
      nonZeroBuckets: timeseriesData.points?.filter((p) => Number(p.value) > 0).length || 0,
    };

    // ----------------------------------------------------
    // 7. PROOF 4: BUILD CHUNK ANALYSIS
    // ----------------------------------------------------
    console.log("\n--- PROOF 4: BUILD CHUNK SIZES ---");
    const distAssetsDir = path.join("C:/Users/Admin/Desktop/donater-admin/dist/assets");
    const files = fs.readdirSync(distAssetsDir);
    const chunkStats = files
      .filter((f) => f.endsWith(".js"))
      .map((f) => {
        const stat = fs.statSync(path.join(distAssetsDir, f));
        return {
          file: f,
          sizeKb: (stat.size / 1024).toFixed(2),
        };
      })
      .sort((a, b) => parseFloat(b.sizeKb) - parseFloat(a.sizeKb));

    console.log("Chunk sizes (sorted largest to smallest):", chunkStats);
    testResults.proof4_chunks = chunkStats;

    console.log("\n=== STEP 7 DASHBOARD VERIFICATION COMPLETED ===");
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
