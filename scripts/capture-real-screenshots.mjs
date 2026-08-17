import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import fs from "node:fs";

async function run() {
  const artifactsDir = "C:/Users/Admin/.gemini/antigravity/brain/1a04d73f-cca8-4d6c-ba1f-0fdc07577a66";
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  console.log("Starting Vite dev server for Step 3 primitives verification...");
  const server = await createServer({
    server: { host: "127.0.0.1", port: 5182 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5182;
  const baseUrl = `http://127.0.0.1:${port}/admin/`;
  console.log(`Vite server started on ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
  });

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

  const testResults = {};

  try {
    // 1. Desktop Light Mode & DataTable URL Search Params Persistence
    console.log("1. Testing DataTable URL Filters & Page Refresh Persistence...");
    const pageLight = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "light",
    });
    await setupAuthMocks(pageLight);

    await pageLight.goto(`${baseUrl}styleguide`, { waitUntil: "networkidle" });
    await pageLight.waitForTimeout(600);

    // Apply Filter: type in search input and click "completed"
    await pageLight.fill("input[type='search']", "Azizbek");
    await pageLight.click("button:has-text('completed')");
    await pageLight.waitForTimeout(300);

    const initialFilterUrl = pageLight.url();
    const rowsBeforeReload = await pageLight.locator("tbody tr").count();

    // Reload page to verify persistence
    await pageLight.reload({ waitUntil: "networkidle" });
    await pageLight.waitForTimeout(500);

    const afterReloadState = await pageLight.evaluate(() => {
      const input = document.querySelector("input[type='search']");
      const activeFilter = document.querySelector("button.bg-fg")?.innerText?.trim();
      const firstRowText = document.querySelector("tbody tr td")?.innerText?.trim();
      const domRowCount = document.querySelectorAll("tbody tr").length;

      return {
        inputValue: input?.value,
        activeFilter,
        firstRowText,
        domRowCount,
        currentUrl: window.location.href,
      };
    });

    testResults.filterPersistence = {
      initialFilterUrl,
      rowsBeforeReload,
      afterReloadState,
      isStatePreserved:
        afterReloadState.inputValue === "Azizbek" &&
        afterReloadState.activeFilter === "completed" &&
        afterReloadState.domRowCount > 0,
    };

    // Capture Light Mode Screenshot
    const lightPath = path.join(artifactsDir, "layout_light_real.png");
    await pageLight.screenshot({ path: lightPath, fullPage: false });
    console.log(`Saved Light screenshot to: ${lightPath}`);

    // 2. Testing 1000-Row Virtual Scrolling Performance
    console.log("2. Testing 1000-Row Virtual Scrolling DOM footprint...");
    // Clear filters to show 1000 items
    await pageLight.fill("input[type='search']", "");
    await pageLight.click("button:has-text('Barchasi')");
    await pageLight.waitForTimeout(300);

    const virtualDomStats = await pageLight.evaluate(() => {
      const scrollContainer = document.querySelector("table")?.parentElement;
      const initialDomRows = document.querySelectorAll("tbody tr").length;

      if (scrollContainer) {
        scrollContainer.scrollTop = 5000; // scroll deep into 1000 items
      }

      const scrolledDomRows = document.querySelectorAll("tbody tr").length;
      return {
        initialDomRows,
        scrolledDomRows,
        totalItemsInMock: 1000,
        isVirtualized: scrolledDomRows < 35, // Only ~15-25 nodes in DOM despite 1000 rows
      };
    });
    testResults.virtualScroll = virtualDomStats;

    // 3. Testing Drawer Focus Trap and Focus Return
    console.log("3. Testing Drawer Focus Trap & Return...");
    // Switch to Dialogs tab
    await pageLight.click("button:has-text('Drawer & Modal')");
    await pageLight.waitForTimeout(300);

    const openDrawerBtn = pageLight.locator("button", { hasText: "O'ngdan Drawer Ochish" });
    await openDrawerBtn.focus();
    await openDrawerBtn.click();
    await pageLight.waitForTimeout(400);

    const drawerFocusTrapTest = await pageLight.evaluate(async () => {
      const dialog = document.querySelector("div[role='dialog']");
      const initialFocusedTag = document.activeElement?.tagName;
      const initialFocusedAria = document.activeElement?.getAttribute("aria-label");

      // Verify that focus is inside dialog
      const isInsideDialog = dialog ? dialog.contains(document.activeElement) : false;

      return {
        isDrawerOpen: !!dialog,
        isInsideDialog,
        initialFocusedTag,
        initialFocusedAria,
      };
    });

    // Press Escape to close drawer and check focus return
    await pageLight.keyboard.press("Escape");
    await pageLight.waitForTimeout(400);

    const focusReturnTest = await pageLight.evaluate(() => {
      const activeEl = document.activeElement;
      return {
        activeElementText: activeEl?.innerText?.trim(),
        activeElementTag: activeEl?.tagName,
        isReturnedToTriggerButton: activeEl?.innerText?.includes("O'ngdan Drawer Ochish"),
      };
    });

    testResults.drawerAccessibility = {
      drawerFocusTrapTest,
      focusReturnTest,
    };

    // 4. Desktop Dark Mode (Showing Drawer open in Dark Mode)
    console.log("4. Capturing Desktop Layout Dark Mode...");
    const pageDark = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      colorScheme: "dark",
    });
    await setupAuthMocks(pageDark);
    await pageDark.goto(`${baseUrl}styleguide`, { waitUntil: "networkidle" });
    await pageDark.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await pageDark.waitForTimeout(400);

    // Open Drawer in Dark Mode to capture
    await pageDark.click("tbody tr >> nth=0");
    await pageDark.waitForTimeout(400);

    const darkPath = path.join(artifactsDir, "layout_dark_real.png");
    await pageDark.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved Dark screenshot to: ${darkPath}`);

    // 5. iPhone (390px) Mobile Viewport
    console.log("5. Capturing iPhone Layout (390px)...");
    const pageIPhone = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await setupAuthMocks(pageIPhone);
    await pageIPhone.goto(`${baseUrl}styleguide`, { waitUntil: "networkidle" });
    await pageIPhone.waitForTimeout(400);

    // Switch to Primitives tab on mobile
    await pageIPhone.click("button:has-text('Money, Date, Status')");
    await pageIPhone.waitForTimeout(400);

    const iphonePath = path.join(artifactsDir, "layout_iphone_390px_real.png");
    await pageIPhone.screenshot({ path: iphonePath, fullPage: false });
    console.log(`Saved iPhone screenshot to: ${iphonePath}`);

    console.log("\n=== STEP 3 PRIMITIVES VERIFICATION RESULTS ===");
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
