import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";

async function run() {
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("Starting Vite dev server for React Router tests...");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5178 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5178;
  const baseUrl = `http://127.0.0.1:${port}/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const setupAuthMocks = async (page, permissions = [
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
  ]) => {
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
            role: permissions.includes("manage_admins") ? "owner" : "viewer",
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
            role: permissions.includes("manage_admins") ? "owner" : "viewer",
            is_active: true,
            last_login_at: new Date().toISOString(),
          },
          permissions,
        }),
      });
    });
  };

  const testResults = {};

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });
    await setupAuthMocks(page);

    // 1. Test direct navigation to /admin/orders/42
    console.log("1. Testing direct navigation to /admin/orders/42...");
    await page.goto(`${baseUrl}orders/42`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const orders42Data = await page.evaluate(() => {
      const h1 = document.querySelector("h1")?.innerText;
      const h2 = document.querySelector("h2")?.innerText;
      const activeNav = document.querySelector("aside a[aria-current='page']")?.getAttribute("href");
      const activeNavText = document.querySelector("aside a[aria-current='page']")?.innerText?.trim();
      const breadcrumb = document.querySelector("nav[aria-label='Breadcrumb']")?.innerText?.trim();
      const activeElementTag = document.activeElement?.tagName;
      const activeElementAria = document.activeElement?.getAttribute("aria-label");

      return {
        h1,
        h2,
        activeNavHref: activeNav,
        activeNavText,
        breadcrumb,
        activeElement: `${activeElementTag}${activeElementAria ? `[aria-label='${activeElementAria}']` : ''}`,
      };
    });
    testResults.orders42Direct = orders42Data;

    // Capture Light Mode Screenshot
    const lightPath = path.join(artifactsDir, "layout_light_real.png");
    await page.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot to: ${lightPath}`);

    // 2. Test Link element attributes (middle-click capability / real <a href>)
    console.log("2. Testing NavLink <a> element attributes...");
    const navLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("aside a")).map((a) => ({
        label: a.innerText.trim(),
        tagName: a.tagName,
        href: a.getAttribute("href"),
        ariaCurrent: a.getAttribute("aria-current"),
      }));
    });
    testResults.allNavLinks = navLinks;

    // 3. Test Navigation & Browser Back Button (popstate)
    console.log("3. Testing client navigation to Payments and browser back...");
    await page.locator("aside a", { hasText: "To'lovlar" }).first().click();
    await page.waitForTimeout(400);

    const paymentsNavData = await page.evaluate(() => ({
      url: window.location.pathname,
      h1: document.querySelector("h1")?.innerText,
      activeElement: document.activeElement?.tagName,
      activeNavHref: document.querySelector("aside a[aria-current='page']")?.getAttribute("href"),
    }));
    testResults.paymentsNavigation = paymentsNavData;

    // Browser Back
    await page.goBack();
    await page.waitForTimeout(400);

    const backNavData = await page.evaluate(() => ({
      url: window.location.pathname,
      h1: document.querySelector("h1")?.innerText,
      activeElement: document.activeElement?.tagName,
      activeNavHref: document.querySelector("aside a[aria-current='page']")?.getAttribute("href"),
    }));
    testResults.browserBackButton = backNavData;

    // 4. Test Dark Mode & Toast
    console.log("4. Capturing Dark Mode...");
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });
    await setupAuthMocks(pageDark);
    await pageDark.goto(`${baseUrl}payments`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(400);
    await pageDark.click("button:has-text('Success Toast')");
    await pageDark.waitForTimeout(400);

    const darkPath = path.join(artifactsDir, "layout_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot to: ${darkPath}`);

    // 5. Test iPhone (390px) Mobile Viewport & Drawer
    console.log("5. Capturing iPhone Layout (390px)...");
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await setupAuthMocks(pageIPhone);
    await pageIPhone.goto(`${baseUrl}orders/42`, { waitUntil: "networkidle" });
    await pageIPhone.waitForTimeout(400);

    // Open Drawer
    await pageIPhone.click("button[aria-label='Menyuni ochish']");
    await pageIPhone.waitForTimeout(400);

    const iphoneMetrics = await pageIPhone.evaluate(() => {
      const drawer = document.querySelector("div[role='dialog']");
      const navButtons = document.querySelectorAll("div[role='dialog'] aside nav a");
      const touchTargets = Array.from(navButtons).map((btn) => {
        const r = btn.getBoundingClientRect();
        return {
          text: btn.innerText.trim(),
          height: `${Math.round(r.height)}px`,
          is44pt: r.height >= 44,
        };
      });

      return {
        isDrawerOpen: !!drawer,
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        navTouchTargetsCount: touchTargets.length,
        allNavItemsAbove44pt: touchTargets.every((t) => t.is44pt),
      };
    });
    testResults.iphoneDrawer = iphoneMetrics;

    const iphonePath = path.join(artifactsDir, "layout_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`Saved iPhone screenshot to: ${iphonePath}`);

    // 6. Test Viewer Role (Permission Filtering: /admins hidden)
    console.log("6. Testing Viewer Role (ensure /admins is hidden)...");
    const pageViewer = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await setupAuthMocks(pageViewer, ["view"]); // only 'view' permission
    await pageViewer.goto(baseUrl, { waitUntil: "networkidle" });
    await pageViewer.waitForTimeout(500);

    const viewerData = await pageViewer.evaluate(() => {
      const links = Array.from(document.querySelectorAll("aside a")).map((a) => a.getAttribute("href"));
      return {
        allRenderedLinks: links,
        hasAdminsLink: links.includes("/admin/admins") || links.includes("/admins"),
        hasPricingLink: links.includes("/admin/pricing") || links.includes("/pricing"),
        hasBroadcastsLink: links.includes("/admin/broadcasts") || links.includes("/broadcasts"),
        hasPaymentsLink: links.includes("/admin/payments") || links.includes("/payments"),
      };
    });
    testResults.viewerRoleFiltering = viewerData;

    console.log("\n=== REACT ROUTER V7 VERIFICATION RESULTS ===");
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
