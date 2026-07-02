import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  test as base,
  type Browser,
  type BrowserContext,
} from "@playwright/test";

export type Role = "superadmin" | "dmo" | "authority" | "traveller";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_DIR = path.join(__dirname, "..", "..", "playwright", ".auth");

function readSessionData(role: Role): Record<string, string> {
  const sessionFile = path.join(AUTH_DIR, `${role}.session.json`);
  if (!fs.existsSync(sessionFile)) {
    throw new Error(
      `Missing ${sessionFile} — run \`npx playwright test --project=setup\` first.`,
    );
  }
  return JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
}

/** For use outside the `test` fixture (e.g. test.beforeAll) — builds a logged-in context for `role`. */
export async function newAuthenticatedContext(
  browser: Browser,
  role: Role,
): Promise<BrowserContext> {
  const context = await browser.newContext({
    storageState: path.join(AUTH_DIR, `${role}.json`),
  });
  const sessionData = readSessionData(role);
  await context.addInitScript((data: Record<string, string>) => {
    for (const [key, value] of Object.entries(data)) {
      window.sessionStorage.setItem(key, value);
    }
  }, sessionData);
  return context;
}

export const test = base.extend<{ role: Role }>({
  // Default role for specs that don't override it via test.use({ role: ... }).
  role: ["superadmin", { option: true }],

  storageState: async ({ role }, use) => {
    await use(path.join(AUTH_DIR, `${role}.json`));
  },

  // Wraps the built-in `context` fixture (which already applied storageState
  // above) to also replay the sessionStorage snapshot captured in auth.setup.ts,
  // since storageState alone doesn't cover sessionStorage-based login.
  context: async ({ context, role }, use) => {
    const sessionData = readSessionData(role);

    await context.addInitScript((data: Record<string, string>) => {
      for (const [key, value] of Object.entries(data)) {
        window.sessionStorage.setItem(key, value);
      }
    }, sessionData);

    await use(context);
  },
});

export { expect } from "@playwright/test";
