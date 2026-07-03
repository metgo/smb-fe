import { type Locator, type Page, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HERO_IMAGE_PATH = path.join(
  __dirname,
  "..",
  "fixtures",
  "assets",
  "hero-image.png",
);

/** Drives the Landing tab exactly like a human filling out the form. */
export class LandingTabPage {
  readonly page: Page;
  readonly brandInput: Locator;
  readonly headlineInput: Locator;
  readonly subheadInput: Locator;
  readonly addSessionButton: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandInput = page.getByLabel("Brand / Studio Name");
    this.headlineInput = page.getByLabel("Main Heading");
    this.subheadInput = page.getByLabel("Subtitle");
    this.addSessionButton = page.getByRole("button", { name: "Add Session" });
    this.publishButton = page.getByRole("button", { name: /^Publish/ });
  }

  async fillPageHeader(fields: {
    brand: string;
    headline: string;
    subhead: string;
  }) {
    await this.brandInput.fill(fields.brand);
    await this.headlineInput.fill(fields.headline);
    await this.subheadInput.fill(fields.subhead);
  }

  /** Uploads a real image through the hero-image dropzone; this hits the real upload API. */
  async uploadHeroImage() {
    await this.page
      .locator('input[type="file"]')
      .setInputFiles(HERO_IMAGE_PATH);
    await expect(this.page.getByAltText("hero")).toBeVisible({
      timeout: 30_000,
    });
  }

  async setSelectionMode(mode: "Single Choice" | "Multiple Choice") {
    await this.page
      .getByRole("button", { name: mode, exact: false })
      .first()
      .click();
  }

  async hasAnyTickets(): Promise<boolean> {
    const empty = await this.page
      .getByText("No tickets found for this event.")
      .isVisible()
      .catch(() => false);
    return !empty;
  }

  /** Tickets are the first checkboxes to appear in the Landing tab's DOM order. */
  async selectFirstTicket() {
    await this.page.locator('input[type="checkbox"]').first().check();
  }
}
