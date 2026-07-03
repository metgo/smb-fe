import { type Locator, type Page } from "@playwright/test";

/**
 * Drives the "Add Session" wizard modal opened from the Landing tab. The modal
 * isn't a portal — the Landing tab's own fields (which reuse labels like
 * "Subtitle") stay mounted underneath it, so every locator here is scoped to
 * the modal container to avoid matching the page behind it.
 */
export class SessionWizardPage {
  readonly page: Page;
  readonly modal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator("div.fixed.inset-0.z-100");
  }

  async fillDetailsStep(fields: {
    name: string;
    tagline: string;
    description: string;
  }) {
    await this.modal.getByLabel("Name", { exact: true }).fill(fields.name);
    await this.modal
      .getByLabel("Subtitle", { exact: true })
      .fill(fields.tagline);
    await this.modal
      .getByLabel("Description", { exact: true })
      .fill(fields.description);
  }

  async next() {
    await this.modal.getByRole("button", { name: "Next" }).click();
  }

  /** Steps 2-5 (images, instructors, rooms, dates) already have valid defaults — just walk through. */
  async skipToReview() {
    for (let i = 0; i < 5; i++) {
      await this.next();
    }
  }

  async done() {
    await this.modal.getByRole("button", { name: "Done" }).click();
  }
}
