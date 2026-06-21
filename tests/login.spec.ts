import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Practice Test Automation - Login UI', () => {
  test('Positive login should redirect and show success content', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('student', 'Password123');
    await loginPage.expectSuccessState();
    await page.waitForTimeout(2000);
  });

  test('Negative login with invalid username should show username error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('incorrectUser', 'Password123');
    await loginPage.expectErrorMessage('Your username is invalid!');
  });

  test('Negative login with invalid password should show password error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('student', 'incorrectPassword');
    await loginPage.expectErrorMessage('Your password is invalid!');
  });

  test('Negative login with empty username and password should show username error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('', '');
    await loginPage.expectErrorMessage('Your username is invalid!');
  });
});
