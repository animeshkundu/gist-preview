import { test, expect, createMockGistResponse, waitForIframeContent, mockGistApi, MOCK_GIST_IDS } from './fixtures/helpers';

test.describe('GistPreview - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should display the landing page with input', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { name: 'GistPreview' })).toBeVisible();
    
    // Check for input field
    const input = page.getByPlaceholder(/paste.*gist/i);
    await expect(input).toBeVisible();
    
    // Check for submit button
    await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
  });

  test('should show error for invalid gist URL', async ({ page }) => {
    const input = page.getByPlaceholder(/paste.*gist/i);
    
    // Enter invalid URL
    await input.fill('invalid-url');
    await input.press('Enter');
    
    // Should show error message - matches actual error from parseGistUrl
    await expect(page.getByText(/Invalid URL format/i)).toBeVisible();
  });

  test('should accept gist ID and fetch gist', async ({ page }) => {
    const mockGistId = MOCK_GIST_IDS.html;
    const mockContent = '<h1>Hello World</h1>';
    
    await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'test.html', mockContent, 'HTML'));
    
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    // Wait for preview to load
    await waitForIframeContent(page);
    
    // Check that iframe exists
    await expect(page.locator('iframe')).toBeVisible();
  });

  test('should accept full gist URL', async ({ page }) => {
    const mockGistId = MOCK_GIST_IDS.html;
    const mockContent = '<p>Test content</p>';
    
    await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'test.html', mockContent, 'HTML'));
    
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(`https://gist.github.com/user/${mockGistId}`);
    await input.press('Enter');
    
    // Wait for preview to load
    await waitForIframeContent(page);
    
    // Check that iframe exists
    await expect(page.locator('iframe')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    const mockGistId = MOCK_GIST_IDS.error;
    
    // Mock API error
    await page.route('**/gists/**', async (route) => {
      if (route.request().url().includes(mockGistId)) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Not Found' }),
        });
      } else {
        await route.continue();
      }
    });
    
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    // Should show error state  
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during fetch', async ({ page }) => {
    const mockGistId = MOCK_GIST_IDS.html;
    
    // Mock slow API response
    await page.route('**/gists/**', async (route) => {
      if (route.request().url().includes(mockGistId)) {
        // Delay response
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createMockGistResponse(mockGistId, 'test.html', '<p>Test</p>', 'HTML')),
        });
      } else {
        await route.continue();
      }
    });
    
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    
    // Click preview button
    const previewButton = page.getByRole('button', { name: /preview/i });
    await previewButton.click();
    
    // Check for loading state (button should be disabled or show loading indicator)
    await expect(previewButton).toBeDisabled();
  });
});
