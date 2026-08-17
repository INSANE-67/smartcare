import { test, expect } from '@playwright/test';

test.describe('Admin Verification Flow', () => {
  test('should allow an admin to approve a pending doctor', async ({ page }) => {
    // 1. Navigate and Login as Admin
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'admin@smartcare.test');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin');
    
    // 2. Navigate to Pending Doctors
    await page.click('text=Pending Doctors');
    await page.waitForURL('**/admin/doctors/pending');

    // 3. Verify pending doctor is present
    await expect(page.locator('text=Test Doctor')).toBeVisible();
    await expect(page.locator('text=Pending Review')).toBeVisible();

    // 4. Click Approve
    await page.click('button:has-text("Approve")');

    // 5. Verify the list updates and shows "All caught up" or the doctor is removed
    // Based on our implementation, it shows a success empty state if 0 doctors are left
    await expect(page.locator('text=All caught up!')).toBeVisible({ timeout: 10000 });
  });
});
