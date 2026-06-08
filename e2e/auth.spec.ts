import { test, expect } from '@playwright/test';

test.describe('NextHerts Authentication & Interface E2E Tests', () => {

  test('should verify Bootstrap client-side JS works on the homepage', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Check that the demo collapse is hidden initially
    const demoCollapse = page.locator('#demoCollapse');
    await expect(demoCollapse).not.toBeVisible();

    // Click the toggle button
    const toggleBtn = page.getByRole('button', { name: 'Toggle Interactive Demo' });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Wait for the collapse animation to finish (class gets 'show')
    await expect(demoCollapse).toHaveClass(/show/);
    await expect(demoCollapse).toContainText('Bootstrap JavaScript is Working!');

    // Toggle again to hide it
    await toggleBtn.click();
    await expect(demoCollapse).not.toHaveClass(/show/);
  });

  test('should show validation error on sign-in with invalid credentials', async ({ page }) => {
    // Navigate to Sign In
    await page.goto('/auth/sign-in');

    // Check header
    await expect(page.locator('h1')).toContainText('NextHerts Auth');
    await expect(page.locator('p.text-white-50').first()).toContainText('Sign in to your account to continue');

    // Fill in credentials
    await page.fill('#email', 'nonexistent@example.com');
    await page.fill('#password', 'wrongpassword');

    // Submit form
    const submitBtn = page.getByRole('button', { name: 'Sign In' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // The server action will contact Neon Auth which will fail and return an error
    // Verify that the UI renders the resulting error alert
    const errorAlert = page.locator('.alert-danger');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/invalid/i);
  });

  test('should enforce the Sign-Up disabled feature flag', async ({ page }) => {
    // Navigate to Sign Up
    await page.goto('/auth/sign-up');

    // Check that warning banner is visible
    const warningAlert = page.locator('.alert-warning');
    await expect(warningAlert).toBeVisible();
    await expect(warningAlert).toContainText('Registration is currently disabled by the administrator.');

    // Check that inputs are disabled
    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await expect(nameInput).toBeDisabled();
    await expect(emailInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();

    // Check that submit button is disabled
    const submitBtn = page.getByRole('button', { name: 'Create Account' });
    await expect(submitBtn).toBeDisabled();
  });
});
