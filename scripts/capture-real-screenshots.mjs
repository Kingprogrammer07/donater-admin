import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";

async function run() {
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("Starting Vite dev server for Step 2 layout capture...");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5176 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5176;
  const baseUrl = `http://127.0.0.1:${port}/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const measurements = {};

  const setupAuthMocks = async (page) => {
    await page.addInitScript(() => {
      localStorage.setItem("donater_admin_refresh_token", "mock-dev-refresh-token");
    });

    await page.route("**/admin/api/v1/auth/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          access_expires_at: new Date(Date.now() + 3600000).toISOString(),
          refresh_token: "mock-rotated-refresh-token",
          admin: {
            id: 1,
            tg_id: 777967425,
            username: "owner",
            full_name: "Aziz Qosimov",
            role: "owner",
            is_active: true,
            last_login_at: new Date().toISOString(),
          },
        }),
      });
    });

    await page.route("**/admin/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          admin: {
            id: 1,
            tg_id: 777967425,
            username: "owner",
            full_name: "Aziz Qosimov",
            role: "owner",
            is_active: true,
            last_login_at: new Date().toISOString(),
          },
          permissions: [
            "view",
            "review_payments",
            "adjust_balance",
            "manage_orders",
            "reveal_delivery",
            "manage_pricing",
            "manage_settings",
            "manage_catalog",
            "broadcast",
            "manage_admins",
          ],
        }),
      });
    });
  };

  try {
    // 1. Desktop Light Mode
    console.log("Capturing Desktop Layout Light Mode...");
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });
    await setupAuthMocks(pageLight);

    await pageLight.goto(baseUrl, { waitUntil: "networkidle" });
    await pageLight.waitForTimeout(600);

    // Trigger 500 error toast to demonstrate request_id copying in screenshot
    await pageLight.click("button:has-text('500 Error Toast')");
    await pageLight.waitForTimeout(400);

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

      const sidebar = document.querySelector("aside");
      const sidebarBg = window.getComputedStyle(sidebar || document.body).backgroundColor;
      const navBtn = document.querySelector("aside nav button");
      const navColor = window.getComputedStyle(navBtn || document.body).color;
      const header = document.querySelector("header");
      const headerBg = window.getComputedStyle(header || document.body).backgroundColor;
      const headerTitle = document.querySelector("header span.font-semibold");
      const headerTitleColor = window.getComputedStyle(headerTitle || document.body).color;

      return {
        sidebarBackground: sidebarBg,
        navItemColor: navColor,
        navItemContrastRatio: `${getContrast(navColor, sidebarBg)} : 1`,
        headerTitleColor,
        headerContrastRatio: `${getContrast(headerTitleColor, headerBg)} : 1`,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    measurements.light = lightMetrics;
    const lightPath = path.join(artifactsDir, "layout_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Layout Light screenshot to: ${lightPath}`);

    // 2. Desktop Dark Mode
    console.log("Capturing Desktop Layout Dark Mode...");
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });
    await setupAuthMocks(pageDark);

    await pageDark.goto(baseUrl, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(600);

    // Trigger success toast
    await pageDark.click("button:has-text('Success Toast')");
    await pageDark.waitForTimeout(400);

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

      const sidebar = document.querySelector("aside");
      const sidebarBg = window.getComputedStyle(sidebar || document.body).backgroundColor;
      const navBtn = document.querySelector("aside nav button");
      const navColor = window.getComputedStyle(navBtn || document.body).color;

      return {
        sidebarBackground: sidebarBg,
        navItemColor: navColor,
        navItemContrastRatio: `${getContrast(navColor, sidebarBg)} : 1`,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    measurements.dark = darkMetrics;
    const darkPath = path.join(artifactsDir, "layout_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Layout Dark screenshot to: ${darkPath}`);

    // 3. iPhone 390px Viewport (Mobile Drawer open)
    console.log("Capturing iPhone Layout (390px)...");
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await setupAuthMocks(pageIPhone);

    await pageIPhone.goto(baseUrl, { waitUntil: "networkidle" });
    await pageIPhone.waitForTimeout(500);

    // Open mobile hamburger menu
    await pageIPhone.click("button[aria-label='Menyuni ochish']");
    await pageIPhone.waitForTimeout(400);

    const iphoneMetrics = await pageIPhone.evaluate(() => {
      const drawer = document.querySelector("div[role='dialog']");
      const navButtons = document.querySelectorAll("div[role='dialog'] aside nav button");
      const touchTargets = Array.from(navButtons).map((btn) => {
        const r = btn.getBoundingClientRect();
        return {
          text: btn.innerText.trim(),
          height: `${Math.round(r.height)}px`,
          is44pt: r.height >= 44,
        };
      });

      const menuToggleBtn = document.querySelector("header button[aria-label='Menyuni ochish']");
      const menuRect = menuToggleBtn ? menuToggleBtn.getBoundingClientRect() : null;

      return {
        isDrawerOpen: !!drawer,
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        hamburgerButtonHeight: menuRect ? `${menuRect.height}px` : "N/A",
        navTouchTargetsCount: touchTargets.length,
        allNavItemsAbove44pt: touchTargets.every((t) => t.is44pt),
        sampleNavTouchTarget: touchTargets[0],
      };
    });

    measurements.iphone = iphoneMetrics;
    const iphonePath = path.join(artifactsDir, "layout_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`Saved iPhone Layout screenshot to: ${iphonePath}`);

    console.log("\n=== STEP 2 REAL MEASUREMENT RESULTS ===");
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
