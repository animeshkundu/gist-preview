import { test, expect, createMockGistResponse, waitForIframeContent } from './fixtures/helpers';

test.describe('GistPreview - JSON, CSS, JavaScript, and Code Content', () => {
  test('should display JSON content with formatting', async ({ page }) => {
    const mockGistId = 'json-test';
    const jsonContent = JSON.stringify({
      name: 'Test Object',
      version: '1.0.0',
      items: [1, 2, 3],
      nested: {
        key: 'value'
      }
    }, null, 2);
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'data.json', jsonContent, 'JSON')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // JSON should be visible in the preview
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('Test Object');
    await expect(iframe.locator('body')).toContainText('version');
  });

  test('should display CSS content with line numbers', async ({ page }) => {
    const mockGistId = 'css-test';
    const cssContent = `.container {
  display: flex;
  justify-content: center;
}

.button {
  padding: 10px 20px;
  background: blue;
}`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'styles.css', cssContent, 'CSS')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // CSS should be visible as code
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('container');
    await expect(iframe.locator('body')).toContainText('display: flex');
  });

  test('should display JavaScript content with syntax', async ({ page }) => {
    const mockGistId = 'js-test';
    const jsContent = `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 10);
console.log(result);`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'script.js', jsContent, 'JavaScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // JavaScript should be visible as code
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('calculateSum');
    await expect(iframe.locator('body')).toContainText('console.log');
  });

  test('should display TypeScript content', async ({ page }) => {
    const mockGistId = 'ts-test';
    const tsContent = `interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'types.ts', tsContent, 'TypeScript')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // TypeScript should be visible as code
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('interface User');
    await expect(iframe.locator('body')).toContainText('greetUser');
  });

  test('should display plain text content', async ({ page }) => {
    const mockGistId = 'text-test';
    const textContent = `This is a plain text file.
It contains multiple lines.
No special formatting.`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'notes.txt', textContent, 'Text')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Plain text should be visible
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('plain text file');
    await expect(iframe.locator('body')).toContainText('multiple lines');
  });

  test('should display Python code', async ({ page }) => {
    const mockGistId = 'py-test';
    const pyContent = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`;
    
    await page.route('https://api.github.com/gists/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockGistResponse(mockGistId, 'script.py', pyContent, 'Python')),
      });
    });
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    // Python code should be visible
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toContainText('fibonacci');
    await expect(iframe.locator('body')).toContainText('def');
  });
});
