import { type Locator, type Page, expect } from "@playwright/test";

export type TabId = "landing" | "capacity" | "analytics" | "notify" | "regs";

const TAB_LABELS: Record<TabId, string> = {
  landing: "Landing Page",
  capacity: "Capacity Report",
  analytics: "Analytics",
  notify: "Notifications",
  regs: "Registrations",
};

export class EventSessionMgmtPage {
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly tabsNav: Locator;
  readonly tabContent: Locator;
  readonly previewButton: Locator;
  readonly tourButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.locator('[data-tour="page-header"]');
    this.tabsNav = page.locator('[data-tour="tabs-nav"]');
    this.tabContent = page.locator('[data-tour="tab-content"]');
    this.previewButton = page.getByRole("button", { name: "Preview" });
    this.tourButton = page.getByRole("button", { name: "Take a Tour" });
    // Scoped to the page header: the Landing tab also has its own "Back" button
    // at the bottom of the form, with the same accessible name.
    this.backButton = this.pageHeader.getByRole("button", { name: "Back" });
  }

  tab(id: TabId): Locator {
    return this.tabsNav.getByRole("button", { name: TAB_LABELS[id] });
  }

  async goto(eventId: string, sessionId?: string) {
    const search = sessionId
      ? `?eventId=${eventId}&sessionId=${sessionId}`
      : `?eventId=${eventId}`;
    await this.page.goto(`/event-session-management${search}`);
  }

  async openTab(id: TabId) {
    await this.tab(id).click();
    await expect(this.tab(id)).toHaveClass(/border-teal-500|border-teal-600/);
  }

  async expectLoaded() {
    await expect(this.pageHeader).toContainText("Event Session Management");
    await expect(this.tabsNav).toBeVisible();
    for (const id of Object.keys(TAB_LABELS) as TabId[]) {
      await expect(this.tab(id)).toBeVisible();
    }
  }
}
