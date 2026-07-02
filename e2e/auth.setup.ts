import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// The app stores the session (access_token, user_info) in sessionStorage, which
// Playwright's built-in storageState() does NOT capture (it only persists cookies
// and localStorage). So on top of storageState() we snapshot sessionStorage
// ourselves; e2e/fixtures/auth.ts replays it via context.addInitScript on every
// test so specs can reuse a login instead of driving the login form each run.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, "..", "playwright", ".auth");
fs.mkdirSync(AUTH_DIR, { recursive: true });

const ROLES = [
  {
    role: "superadmin",
    email: process.env.E2E_SUPERADMIN_EMAIL,
    password: process.env.E2E_SUPERADMIN_PASSWORD,
  },
  {
    role: "dmo",
    email: process.env.E2E_DMO_EMAIL,
    password: process.env.E2E_DMO_PASSWORD,
  },
  {
    role: "authority",
    email: process.env.E2E_AUTHORITY_EMAIL,
    password: process.env.E2E_AUTHORITY_PASSWORD,
  },
  {
    role: "traveller",
    email: process.env.E2E_TRAVELLER_EMAIL,
    password: process.env.E2E_TRAVELLER_PASSWORD,
  },
] as const;

for (const { role, email, password } of ROLES) {
  setup(`authenticate as ${role}`, async ({ page, context }) => {
    if (!email || !password) {
      setup.skip(
        true,
        `Missing E2E_${role.toUpperCase()}_EMAIL / E2E_${role.toUpperCase()}_PASSWORD in e2e/.env`,
      );
      return;
    }

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(email, password);
    await expect(page.locator("body")).not.toContainText("Incorrect password");

    const sessionData = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i)!;
        out[key] = window.sessionStorage.getItem(key)!;
      }
      return out;
    });
    expect(
      sessionData.access_token,
      "login did not populate access_token",
    ).toBeTruthy();

    fs.writeFileSync(
      path.join(AUTH_DIR, `${role}.session.json`),
      JSON.stringify(sessionData, null, 2),
    );
    await context.storageState({ path: path.join(AUTH_DIR, `${role}.json`) });
  });
}
