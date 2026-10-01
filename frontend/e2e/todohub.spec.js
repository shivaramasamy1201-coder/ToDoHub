import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Global console & network tracking
const consoleErrors = [];
const networkErrors = [];

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/favicon.ico')) {
      networkErrors.push(`[Network ${res.status()}] ${res.url()}`);
    }
  });
});

test.describe('1. Authentication & Route Protection', () => {
  test('Redirect unauthenticated users from protected route /dashboard to /login', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });
  });

  test('Public routes accessibility and login validation', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('h1')).toContainText(/ToDoHub/i);

    // Test form validation error on empty click
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('[role="alert"]')).toContainText(/enter your email/i);

    // Register page
    await page.goto('http://localhost:5173/register');
    await expect(page.locator('h1')).toContainText(/ToDoHub/i);

    // Forgot password page
    await page.goto('http://localhost:5173/forgot-password');
    await expect(page.locator('h1')).toContainText(/Forgot Password/i);
  });
});

test.describe('2. Authenticated Application Views & Visual Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock session into localStorage before loading page
    await page.addInitScript(() => {
      const mockSession = {
        access_token: 'mock-access-token-12345',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        user: {
          id: 'test-user-id-001',
          email: 'demo@todohub.local',
          user_metadata: { full_name: 'Demo User' }
        }
      };
      window.localStorage.setItem('sb-fzzvulqyqgajseluhxbp-auth-token', JSON.stringify(mockSession));
    });
  });

  test('Dashboard rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
    await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png'), fullPage: true });
  });

  test('Tasks page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/tasks');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Tasks/i);
    await page.screenshot({ path: path.join(screenshotsDir, '03_tasks_page.png'), fullPage: true });
  });

  test('Categories page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/categories');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Categories/i);
    await page.screenshot({ path: path.join(screenshotsDir, '04_categories.png'), fullPage: true });
  });

  test('Calendar page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/calendar');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Calendar/i);
    await page.screenshot({ path: path.join(screenshotsDir, '05_calendar.png'), fullPage: true });
  });

  test('Notifications page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/notifications');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Notifications/i);
    await page.screenshot({ path: path.join(screenshotsDir, '06_notifications.png'), fullPage: true });
  });

  test('AI Assistant page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/assistant');
    await page.waitForSelector('.page-header, h1, .assistant-container');
    await page.screenshot({ path: path.join(screenshotsDir, '07_ai_assistant.png'), fullPage: true });
  });

  test('Profile page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Profile/i);
    await page.screenshot({ path: path.join(screenshotsDir, '08_profile.png'), fullPage: true });
  });

  test('Settings page rendering and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/settings');
    await page.waitForSelector('.page-header, h1');
    await expect(page.locator('h1')).toContainText(/Settings/i);
    await page.screenshot({ path: path.join(screenshotsDir, '09_settings.png'), fullPage: true });
  });

  test('Floating AI Agent toggle and screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    const aiButton = page.locator('.floating-ai-button');
    await expect(aiButton).toBeVisible();
    await aiButton.click();
    await page.waitForSelector('.floating-ai-panel');
    await expect(page.locator('.floating-ai-panel')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, '10_floating_ai_agent_open.png') });
  });
});

test.describe('3. Responsive Viewport Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const mockSession = {
        access_token: 'mock-access-token-12345',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        user: {
          id: 'test-user-id-001',
          email: 'demo@todohub.local',
          user_metadata: { full_name: 'Demo User' }
        }
      };
      window.localStorage.setItem('sb-fzzvulqyqgajseluhxbp-auth-token', JSON.stringify(mockSession));
    });
  });

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'desktop_1280', width: 1280, height: 800 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'mobile_480', width: 480, height: 800 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_360', width: 360, height: 800 }
  ];

  for (const vp of viewports) {
    test(`No horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(300);

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      await page.screenshot({ path: path.join(screenshotsDir, `responsive_${vp.name}.png`) });
    });
  }
});
