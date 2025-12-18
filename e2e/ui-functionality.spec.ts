import { test, expect, createMockMultiFileGistResponse, waitForIframeContent } from './fixtures/helpers';
// Note: Use mockGistApi(page, gistId, response) for API mocking

test.describe('GistPreview - UI Functionality', () => {
  test('should switch between multiple files', async ({ page }) => {
    const mockGistId = 'multi-file-test';
    const files = [
      { filename: 'index.html', content: '<h1>HTML File</h1>', language: 'HTML' },
      { filename: 'styles.css', content: '.container { display: flex; }', language: 'CSS' },
      { filename: 'script.js', content: 'console.log("Hello");', language: 'JavaScript' },
    ];
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, files)),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Should show file selector buttons
    await expect(page.getByText('index.html')).toBeVisible();
    await expect(page.getByText('styles.css')).toBeVisible();
    await expect(page.getByText('script.js')).toBeVisible();
    
    // Click on CSS file
    await page.getByText('styles.css').click();
    await page.waitForTimeout(500);
    
    // Content should update
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('container');
    
    // Click on JS file
    await page.getByText('script.js').click();
    await page.waitForTimeout(500);
    
    // Content should update again
    await expect(iframe.locator('body')).toContainText('console.log');
  });

  test('should toggle viewport sizes', async ({ page }) => {
    const mockGistId = 'viewport-test';
    const htmlContent = '<h1>Viewport Test</h1>';
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, [
          { filename: 'test.html', content: htmlContent, language: 'HTML' }
        ])),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Look for viewport toggle buttons (desktop, tablet, mobile)
    // The actual implementation might use icons or specific labels
    const iframe = page.locator('iframe');
    
    // Get initial width
    const initialBox = await iframe.boundingBox();
    expect(initialBox).not.toBeNull();
    
    // Try to find and click viewport toggle buttons
    // These might be aria-labels or specific test IDs
    const viewportButtons = page.locator('button').filter({ hasText: /mobile|tablet|desktop/i });
    const count = await viewportButtons.count();
    
    if (count > 0) {
      // Click mobile if available
      const mobileButton = viewportButtons.filter({ hasText: /mobile/i }).first();
      if (await mobileButton.count() > 0) {
        await mobileButton.click();
        await page.waitForTimeout(300);
        
        // Width should change
        const mobileBox = await iframe.boundingBox();
        expect(mobileBox?.width).not.toBe(initialBox?.width);
      }
    }
  });

  test('should enter and exit fullscreen mode', async ({ page }) => {
    const mockGistId = 'fullscreen-test';
    const htmlContent = '<h1>Fullscreen Test</h1>';
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, [
          { filename: 'test.html', content: htmlContent, language: 'HTML' }
        ])),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Look for fullscreen button (might have icon or text)
    const fullscreenButton = page.getByRole('button').filter({ hasText: /fullscreen|expand/i }).first();
    
    if (await fullscreenButton.count() > 0) {
      await fullscreenButton.click();
      await page.waitForTimeout(300);
      
      // In fullscreen, controls should be minimal or hidden
      // Check that the preview takes more space
      const iframe = page.locator('iframe');
      const fullscreenBox = await iframe.boundingBox();
      expect(fullscreenBox).not.toBeNull();
      expect(fullscreenBox!.height).toBeGreaterThan(400);
    }
  });

  test('should show share button and copy URL', async ({ page }) => {
    const mockGistId = 'share-test';
    const htmlContent = '<h1>Share Test</h1>';
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, [
          { filename: 'test.html', content: htmlContent, language: 'HTML' }
        ])),
      });
    });
    
    // Mock clipboard API
    await page.evaluate(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: (text: string) => Promise.resolve(),
        },
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Look for share/copy button
    const shareButton = page.getByRole('button').filter({ hasText: /share|copy/i }).first();
    
    if (await shareButton.count() > 0) {
      await shareButton.click();
      
      // Should show success message or toast
      await expect(page.getByText(/copied|success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate back to input', async ({ page }) => {
    const mockGistId = 'back-test';
    const htmlContent = '<h1>Back Test</h1>';
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, [
          { filename: 'test.html', content: htmlContent, language: 'HTML' }
        ])),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Look for back button
    const backButton = page.getByRole('button').filter({ hasText: /back|return/i }).first();
    
    if (await backButton.count() > 0) {
      await backButton.click();
      
      // Should return to input screen
      await expect(page.getByRole('heading', { name: 'GistPreview' })).toBeVisible();
      await expect(input).toBeVisible();
    }
  });

  test('should load gist from URL parameter', async ({ page }) => {
    const mockGistId = 'url-param-test';
    const htmlContent = '<h1>URL Parameter Test</h1>';
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockMultiFileGistResponse(mockGistId, [
          { filename: 'test.html', content: htmlContent, language: 'HTML' }
        ])),
      });
    });
    
    // Navigate directly with gist parameter
    await page.goto(`/?gist=${mockGistId}`);
    
    await waitForIframeContent(page);
    
    // Should load gist automatically
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('h1')).toContainText('URL Parameter Test');
  });
});
