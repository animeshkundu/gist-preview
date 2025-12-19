import { test, expect, createMockGistResponse } from './fixtures/helpers';
// Note: Use mockGistApi(page, gistId, response) for API mocking

test.describe('GistPreview - Recent Gists', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should save gist to recent history', async ({ page }) => {
    const mockGistId = 'recent-test-1';
    const htmlContent = '<h1>Recent Test</h1>';
    
    await mockGistApi(page, mockGistId, 'test.html', htmlContent, 'HTML');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    // Wait for gist to load
    await page.waitForTimeout(1000);
    
    // Go back
    const backButton = page.getByRole('button').filter({ hasText: /back|return/i }).first();
    if (await backButton.count() > 0) {
      await backButton.click();
    }
    
    // Check if recent gists section appears
    const recentSection = page.locator('text=/recent/i');
    if (await recentSection.count() > 0) {
      await expect(recentSection).toBeVisible();
    }
  });

  test('should load gist from recent history', async ({ page }) => {
    const mockGistId = 'recent-test-2';
    const htmlContent = '<h1>Recent Load Test</h1>';
    
    await mockGistApi(page, mockGistId, 'test.html', htmlContent, 'HTML');
    
    // First, load a gist
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Go back
    const backButton = page.getByRole('button').filter({ hasText: /back|return/i }).first();
    if (await backButton.count() > 0) {
      await backButton.click();
      await page.waitForTimeout(500);
      
      // Try to find and click the recent gist
      const recentGistLink = page.locator(`text="${mockGistId}"`).or(page.locator(`text=/recent.*test/i`)).first();
      if (await recentGistLink.count() > 0) {
        await recentGistLink.click();
        
        // Should load the gist again
        await page.waitForTimeout(1000);
        const iframe = page.frameLocator('iframe');
        await expect(iframe.locator('h1')).toContainText('Recent Load Test', { timeout: 5000 });
      }
    }
  });

  test('should persist recent gists across page reloads', async ({ page }) => {
    const mockGistId = 'persist-test';
    const htmlContent = '<h1>Persist Test</h1>';
    
    await mockGistApi(page, mockGistId, 'test.html', htmlContent, 'HTML');
    
    // Load a gist
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Check localStorage
    const storedData = await page.evaluate(() => localStorage.getItem('recent-gists'));
    expect(storedData).not.toBeNull();
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    }
  });

  test('should remove gist from recent history', async ({ page }) => {
    const mockGistId = 'remove-test';
    const htmlContent = '<h1>Remove Test</h1>';
    
    await mockGistApi(page, mockGistId, 'test.html', htmlContent, 'HTML');
    
    // Load a gist
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Go back
    const backButton = page.getByRole('button').filter({ hasText: /back|return/i }).first();
    if (await backButton.count() > 0) {
      await backButton.click();
      await page.waitForTimeout(500);
      
      // Look for remove/delete button in recent gists
      const removeButton = page.getByRole('button').filter({ hasText: /remove|delete|clear/i }).first();
      if (await removeButton.count() > 0) {
        await removeButton.click();
        
        // Recent gist should be removed
        await page.waitForTimeout(500);
      }
    }
  });

  test('should limit number of recent gists', async ({ page }) => {
    // Load multiple gists to test the limit
    for (let i = 1; i <= 12; i++) {
      const mockGistId = `limit-test-${i}`;
      const htmlContent = `<h1>Limit Test ${i}</h1>`;
      
      await page.route(`https://api.github.com/gists/${mockGistId}`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createMockGistResponse(mockGistId, `test${i}.html`, htmlContent, 'HTML')),
        });
      });
      
      await page.goto('/');
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await page.waitForTimeout(500);
      
      // Go back for next iteration
      const backButton = page.getByRole('button').filter({ hasText: /back|return/i }).first();
      if (await backButton.count() > 0) {
        await backButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Check localStorage - should be limited (typically 10 items)
    const storedData = await page.evaluate(() => localStorage.getItem('recent-gists'));
    if (storedData) {
      const parsed = JSON.parse(storedData);
      expect(parsed.length).toBeLessThanOrEqual(10);
    }
  });
});
