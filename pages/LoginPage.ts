import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  readonly usernameInput = this.page.locator("xpath=//input[@id='username']");
  readonly passwordInput = this.page.locator("xpath=//input[@id='password']");
  readonly submitButton = this.page.locator("xpath=//button[@id='submit']");
  readonly errorMessage = this.page.locator("xpath=//div[@id='error']");

  // Success page locators
  readonly successHeading = this.page.locator("xpath=//h1[contains(normalize-space(.), 'Logged In Successfully')]");
  readonly successText = this.page.locator("xpath=//p[contains(normalize-space(.), 'Congratulations student. You successfully logged in!')]");
  readonly logoutButton = this.page.locator("xpath=//a[contains(normalize-space(.), 'Log out')]");

  async goto() {
    await this.page.goto('/practice-test-login/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectSuccessState() {
    await expect(this.page).toHaveURL(/.*\/logged-in-successfully\/?/);
    await expect(this.successHeading).toBeVisible();
    await expect(this.successText).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async expectErrorMessage(expectedText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedText);
  }
}
