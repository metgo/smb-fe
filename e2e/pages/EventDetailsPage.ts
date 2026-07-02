import { type Page } from "@playwright/test";

export class EventDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openSessionsTab() {
    await this.page.getByRole("button", { name: "Sessions" }).click();
  }

  /** If this event already has a session, opens it (URL gets both eventId and sessionId). */
  async openExistingSessionIfAny(): Promise<boolean> {
    const editSessionBtn = this.page.getByTitle("Edit session").first();
    if (!(await editSessionBtn.isVisible().catch(() => false))) {
      return false;
    }
    await editSessionBtn.click();
    await this.page.waitForURL(/\/event-session-management\?.*sessionId=/);
    return true;
  }

  /** Starts a brand-new, unsaved session (URL gets eventId only, no sessionId). */
  async createNewSession() {
    await this.page
      .getByRole("button", { name: "Create Session" })
      .first()
      .click();
    await this.page.waitForURL(/\/event-session-management\?eventId=/);
  }
}
