import { test, expect } from '@playwright/test';

test.describe('Patient Booking Flow', () => {
  test('should allow a patient to search for a doctor and book an appointment', async ({ page }) => {
    // 1. Navigate to the app (assuming public directory or login)
    // For this test, we assume the user logs in as a patient first.
    // In a real app with Supabase Auth UI, you'd fill the email and password.
    await page.goto('/login');
    
    // Attempt login (using the seed data credentials)
    await page.fill('input[type="email"]', 'patient@smartcare.test');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/patient**');
    
    // 2. Navigate to Doctor Directory
    await page.click('text=Find a Doctor');
    
    // 3. Search for a doctor (Cardiology)
    await page.fill('input[type="search"]', 'Cardiology');
    await page.click('button:has-text("Search")');

    // Expect to see the seeded doctor
    await expect(page.locator('text=Test Doctor')).toBeVisible();

    // 4. Click to book appointment
    await page.click('text=Book Appointment');

    // Fill booking form
    // Note: Depends on the exact UI implementation, selecting dates might require specific interactions.
    // We assume standard HTML5 date/time inputs for simplicity.
    await page.fill('input[name="appointment_date"]', '2027-10-15');
    await page.fill('input[name="appointment_time"]', '14:30');
    await page.fill('textarea[name="reason"]', 'Routine heart checkup');
    
    await page.click('button[type="submit"]');

    // 5. Expect success notification or redirect to appointments
    await expect(page.locator('text=Appointment requested successfully').or(page.locator('text=Upcoming Appointments'))).toBeVisible();
  });
});
