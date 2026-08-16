import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";

async function run() {
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("Starting Vite dev server...");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5175 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5175;
  const baseUrl = `http://127.0.0.1:${port}/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const measurements = {};

  try {
    // 1. Desktop Light Mode
    console.log("Capturing Desktop Light Mode...");
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });

    await pageLight.goto(baseUrl, { waitUntil: "networkidle" });
    await pageLight.waitForTimeout(600);

    const lightMetrics = await pageLight.evaluate(() => {
      const getLuminance = (rgbStr) => {
        const match = rgbStr.match(/\d+(\.\d+)?/g);
        if (!match || match.length < 3) return 0;
        const [r, g, b] = match.slice(0, 3).map((v) => {
          const c = Number(v) / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * (r || 0) + 0.7152 * (g || 0) + 0.0722 * (b || 0);
      };

      const getContrast = (rgb1, rgb2) => {
        const l1 = getLuminance(rgb1);
        const l2 = getLuminance(rgb2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
      };

      const card = document.querySelector("main > div") || document.querySelector("main");
      const cardBg = window.getComputedStyle(card || document.body).backgroundColor;
      const title = document.querySelector("h2");
      const titleColor = window.getComputedStyle(title || document.body).color;
      const desc = document.querySelector("p");
      const descColor = window.getComputedStyle(desc || document.body).color;
      const primaryBtn = document.querySelector("button.bg-fg") || document.querySelector("button");
      const btnStyle = window.getComputedStyle(primaryBtn);

      return {
        cardBackground: cardBg,
        titleColor,
        titleContrastRatio: getContrast(titleColor, cardBg),
        descColor,
        descContrastRatio: getContrast(descColor, cardBg),
        buttonBg: btnStyle.backgroundColor,
        buttonColor: btnStyle.color,
        buttonContrastRatio: getContrast(btnStyle.color, btnStyle.backgroundColor),
        buttonHeight: btnStyle.height,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    measurements.light = lightMetrics;
    const lightPath = path.join(artifactsDir, "login_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot to: ${lightPath}`);

    // 2. Desktop Dark Mode
    console.log("Capturing Desktop Dark Mode...");
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });

    await pageDark.goto(baseUrl, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(600);

    const darkMetrics = await pageDark.evaluate(() => {
      const getLuminance = (rgbStr) => {
        const match = rgbStr.match(/\d+(\.\d+)?/g);
        if (!match || match.length < 3) return 0;
        const [r, g, b] = match.slice(0, 3).map((v) => {
          const c = Number(v) / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * (r || 0) + 0.7152 * (g || 0) + 0.0722 * (b || 0);
      };

      const getContrast = (rgb1, rgb2) => {
        const l1 = getLuminance(rgb1);
        const l2 = getLuminance(rgb2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
      };

      const card = document.querySelector("main > div") || document.querySelector("main");
      const cardBg = window.getComputedStyle(card || document.body).backgroundColor;
      const title = document.querySelector("h2");
      const titleColor = window.getComputedStyle(title || document.body).color;
      const desc = document.querySelector("p");
      const descColor = window.getComputedStyle(desc || document.body).color;
      const primaryBtn = document.querySelector("button.bg-fg") || document.querySelector("button");
      const btnStyle = window.getComputedStyle(primaryBtn);

      return {
        cardBackground: cardBg,
        titleColor,
        titleContrastRatio: getContrast(titleColor, cardBg),
        descColor,
        descContrastRatio: getContrast(descColor, cardBg),
        buttonBg: btnStyle.backgroundColor,
        buttonColor: btnStyle.color,
        buttonContrastRatio: getContrast(btnStyle.color, btnStyle.backgroundColor),
        buttonHeight: btnStyle.height,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    measurements.dark = darkMetrics;
    const darkPath = path.join(artifactsDir, "login_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot to: ${darkPath}`);

    // 3. iPhone 390px Viewport
    console.log("Capturing iPhone (390px) Viewport...");
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await pageIPhone.goto(baseUrl, { waitUntil: "networkidle" });
    await pageIPhone.waitForTimeout(600);

    const iphoneMetrics = await pageIPhone.evaluate(() => {
      const button = document.querySelector("button.bg-fg") || document.querySelector("button");
      const btnRect = button.getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        buttonTouchTargetWidth: `${btnRect.width}px`,
        buttonTouchTargetHeight: `${btnRect.height}px`,
        isTouchTargetAbove44pt: btnRect.height >= 44,
      };
    });

    measurements.iphone = iphoneMetrics;
    const iphonePath = path.join(artifactsDir, "login_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`Saved iPhone screenshot to: ${iphonePath}`);

    console.log("\n=== REAL DOM MEASUREMENT RESULTS ===");
    console.log(JSON.stringify(measurements, null, 2));
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
