import { test, expect, createMockGistResponse, waitForIframeContent, mockGistApi } from './fixtures/helpers';

test.describe('GistPreview - HTML Content', () => {
  test('should render complete HTML document', async ({ page }) => {
    const mockGistId = 'html-complete';
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <style>body { color: red; }</style>
</head>
<body>
  <h1 id="test-heading">HTML Test</h1>
  <p class="test-paragraph">This is a complete HTML document</p>
</body>
</html>`;
    
    await mockGistApi(page, mockGistId, 'index.html', htmlContent, 'HTML');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Check iframe exists
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('#test-heading')).toContainText('HTML Test');
    await expect(iframe.locator('.test-paragraph')).toBeVisible();
  });

  test('should render partial HTML fragments', async ({ page }) => {
    const mockGistId = 'html-partial';
    const htmlContent = `<div class="container">
  <h2>Partial HTML</h2>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>`;
    
    await mockGistApi(page, mockGistId, 'fragment.html', htmlContent, 'HTML');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('.container h2')).toContainText('Partial HTML');
    await expect(iframe.locator('ul li')).toHaveCount(2);
  });

  test('should execute JavaScript in HTML', async ({ page }) => {
    const mockGistId = 'html-with-js';
    const htmlContent = `<!DOCTYPE html>
<html>
<body>
  <div id="output">Initial</div>
  <script>
    document.getElementById('output').textContent = 'JavaScript Executed';
  </script>
</body>
</html>`;
    
    await mockGistApi(page, mockGistId, 'interactive.html', htmlContent, 'HTML');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    // JavaScript should have executed
    await expect(iframe.locator('#output')).toContainText('JavaScript Executed');
  });

  test('should apply CSS styles in HTML', async ({ page }) => {
    const mockGistId = 'html-with-css';
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    .styled-element {
      color: rgb(255, 0, 0);
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="styled-element">Styled Content</div>
</body>
</html>`;
    
    await mockGistApi(page, mockGistId, 'styled.html', htmlContent, 'HTML');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    const styledElement = iframe.locator('.styled-element');
    await expect(styledElement).toBeVisible();
    
    // Check that styles are applied
    const color = await styledElement.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 0, 0)');
  });
});
