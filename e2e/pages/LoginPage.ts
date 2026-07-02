import { type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('form input[type="text"]').first();
    this.passwordInput = page.locator('form input[type="password"]');
    this.submitButton = page.getByRole("button", { name: "Sign In" });
  }

  async goto() {
    await this.page.goto("/authentication");
  }

  async loginAs(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/authentication"),
    );
  }
}
