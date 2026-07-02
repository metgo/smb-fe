import { type Page } from "@playwright/test";

export class EventsListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/events-management");
    await this.page
      .locator("table tbody tr.cursor-pointer")
      .first()
      .waitFor({ state: "visible" });
  }

  async rowCount(): Promise<number> {
    return this.page.locator("table tbody tr.cursor-pointer").count();
  }

  /** Clicks the row at `index` in the (default) list view and opens its quick-view "Details" link. */
  async openEventDetailsAt(index: number) {
    await this.page.locator("table tbody tr.cursor-pointer").nth(index).click();
    await this.page.getByRole("button", { name: "Details" }).click();
    await this.page.waitForURL(/\/event-details\?eventId=/);
  }

  /** Clicks the first row in the (default) list view and opens its quick-view "Details" link. */
  async openFirstEventDetails() {
    await this.openEventDetailsAt(0);
  }
}
