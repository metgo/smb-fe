import { type Page } from "@playwright/test";
import { test, expect, newAuthenticatedContext } from "./fixtures/auth";
import { EventsListPage } from "./pages/EventsListPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { EventSessionMgmtPage } from "./pages/EventSessionMgmtPage";

/**
 * Discovers real staging data to drive the tests below:
 * - `anyEventId`: id of the first event in the list — enough to open a brand-new,
 *   unsaved session (Capacity/Analytics/Notify/Registrations tabs run on local
 *   demo data seeded in the browser, independent of a real saved session).
 * - `existingSession`: an event that already has a saved session, needed only for
 *   the Preview flow, which calls the backend with a real sessionId.
 * Searches a handful of events (list order isn't guaranteed) and gives up
 * gracefully — tests that need an existing session skip themselves if none found.
 */
async function discoverTestData(page: Page) {
  const eventsList = new EventsListPage(page);
  await eventsList.goto();
  const attempts = Math.min(await eventsList.rowCount(), 6);
  if (attempts === 0) {
    throw new Error(
      "No events found on staging — seed at least one event to run these tests.",
    );
  }

  let anyEventId = "";
  let existingSession: { eventId: string; sessionId: string } | null = null;

  for (let i = 0; i < attempts; i++) {
    await eventsList.goto();
    await eventsList.openEventDetailsAt(i);
    const eventId = new URL(page.url()).searchParams.get("eventId") ?? "";
    if (!anyEventId) anyEventId = eventId;

    const details = new EventDetailsPage(page);
    await details.openSessionsTab();
    if (await details.openExistingSessionIfAny()) {
      const url = new URL(page.url());
      existingSession = {
        eventId: url.searchParams.get("eventId") ?? "",
        sessionId: url.searchParams.get("sessionId") ?? "",
      };
      break;
    }
  }

  return { anyEventId, existingSession };
}

let anyEventId: string;
let existingSession: { eventId: string; sessionId: string } | null;

test.beforeAll(async ({ browser }) => {
  // Discovery below does up to a dozen staging page loads (list -> details -> sessions
  // tab, repeated per candidate event) — well past the default 30s hook budget.
  test.setTimeout(120_000);
  const context = await newAuthenticatedContext(browser, "superadmin");
  const page = await context.newPage();
  ({ anyEventId, existingSession } = await discoverTestData(page));
  await context.close();
});

test.describe("Event Session Management — new/unsaved session", () => {
  test.beforeEach(async ({ page }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.goto(anyEventId);
  });

  test("loads with page header, all tabs, and Landing Page active by default", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.expectLoaded();
    await expect(mgmt.tab("landing")).toHaveClass(
      /border-teal-500|border-teal-600/,
    );
  });

  test("Preview button stays disabled until a session is saved", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await expect(mgmt.previewButton).toBeDisabled();
  });

  test("Landing tab flags hero image and ticket selection as required to publish", async ({
    page,
  }) => {
    await expect(page.getByText("Required").first()).toBeVisible();
    await expect(page.getByText("Background Image (Hero)")).toBeVisible();
    await expect(page.getByText("Tickets shown on page")).toBeVisible();
  });

  test("switching tabs updates the active tab and renders each tab's content", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);

    await mgmt.openTab("capacity");
    await expect(page.getByText("Live Capacity Report")).toBeVisible();

    await mgmt.openTab("analytics");
    await expect(page.getByText("Registrations by Session")).toBeVisible();
    await expect(page.getByText("Occupancy by Session")).toBeVisible();

    await mgmt.openTab("notify");
    await expect(page.getByText("Send Message to Registrants")).toBeVisible();

    await mgmt.openTab("regs");
    await expect(
      page.getByRole("button", { name: "Reset All Bookings" }),
    ).toBeVisible();

    await mgmt.openTab("landing");
    await expect(page.getByText("Page Header")).toBeVisible();
  });

  test("Reset All Bookings on the Registrations tab asks for confirmation", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.openTab("regs");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset All Bookings" }).click();

    // Page stays usable after confirming (data reseeded, no crash).
    await expect(
      mgmt.tabContent.getByText("Registrations", { exact: true }),
    ).toBeVisible();
  });

  test("Take a Tour opens the guided tour and Skip Tour closes it", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.tourButton.click();

    await expect(
      page.getByText("Welcome to Event Session Management"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Skip Tour" }).click();
    await expect(
      page.getByText("Welcome to Event Session Management"),
    ).not.toBeVisible();
  });

  test("Back button returns to the event's details page", async ({ page }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.backButton.click();
    await expect(page).toHaveURL(/\/event-details\?eventId=/);
  });
});

test.describe("Event Session Management — existing session", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !existingSession,
      "No event with an already-saved session was found on staging within the search budget.",
    );
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.goto(existingSession!.eventId, existingSession!.sessionId);
  });

  test("loads with the saved sessionId in the URL and Landing tab populated", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await mgmt.expectLoaded();
    await expect(page).toHaveURL(/sessionId=/);
  });

  test("Preview button is enabled and opens the guest landing page preview", async ({
    page,
  }) => {
    const mgmt = new EventSessionMgmtPage(page);
    await expect(mgmt.previewButton).toBeEnabled();

    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 15000 }),
      mgmt.previewButton.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    expect(popup.url()).not.toBe("about:blank");
  });
});
