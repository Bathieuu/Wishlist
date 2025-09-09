import { test, expect } from '@playwright/test';

test.describe('Wishlist Link Collector', () => {
  test('should display homepage correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Wishlist Link Collector/);

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Wishlist Link Collector' })).toBeVisible();

    // Check URL input form
    await expect(page.getByLabel('URL du produit')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prévisualiser' })).toBeVisible();

    // Check instructions
    await expect(page.getByText('Comment ça marche ?')).toBeVisible();
  });

  test('should validate URL input', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.getByLabel('URL du produit');
    const previewButton = page.getByRole('button', { name: 'Prévisualiser' });

    // Test empty input
    await previewButton.click();
    await expect(page.getByText('Veuillez saisir une URL')).toBeVisible();

    // Test invalid URL
    await urlInput.fill('invalid-url');
    await previewButton.click();
    await expect(page.getByText('URL invalide ou non autorisée')).toBeVisible();

    // Test valid URL format (without actually making request)
    await urlInput.fill('https://example.com/product');
    // Form should not show validation error anymore
    await expect(page.getByText('URL invalide ou non autorisée')).not.toBeVisible();
  });

  test('should show loading state when processing URL', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.getByLabel('URL du produit');
    const previewButton = page.getByRole('button', { name: 'Prévisualiser' });

    // Fill valid URL
    await urlInput.fill('https://example.com/product');
    
    // Click preview button
    await previewButton.click();

    // Should show loading state (button changes to "Prévisualisation...")
    await expect(page.getByRole('button', { name: /Prévisualisation/ })).toBeVisible();
  });

  test('should navigate to wishlist page', async ({ page }) => {
    await page.goto('/');

    // Check if Ma Wishlist link is visible (when logged in)
    const wishlistLink = page.getByRole('link', { name: 'Ma Wishlist' });
    
    // If user is not logged in, the link might not be visible
    // We'll just check if clicking the link works when it exists
    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();
      await expect(page).toHaveURL('/me');
    }
  });

  test('should show authentication prompt for wishlist page when not logged in', async ({ page }) => {
    await page.goto('/me');

    // Should show login prompt
    await expect(page.getByText('Connexion requise')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter avec Google' })).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/');

    // Check for proper form labels
    const urlInput = page.getByLabel('URL du produit');
    await expect(urlInput).toBeVisible();

    // Check for proper button roles
    await expect(page.getByRole('button', { name: 'Prévisualiser' })).toBeVisible();

    // Check for proper navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for proper heading hierarchy
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Should still display main elements
    await expect(page.getByRole('heading', { name: 'Wishlist Link Collector' })).toBeVisible();
    await expect(page.getByLabel('URL du produit')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prévisualiser' })).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Wishlist Link Collector' })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('heading', { name: 'Wishlist Link Collector' })).toBeVisible();
  });
});
