import { test, expect, createMockGistResponse, createMockMultiFileGistResponse, waitForIframeContent, mockGistApi, MOCK_GIST_IDS } from './fixtures/helpers';

test.describe('GistPreview - Complete E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Landing Page and Input', () => {
    test('should display landing page with all elements', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'GistPreview' })).toBeVisible();
      await expect(page.getByPlaceholder(/paste.*gist/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
    });

    test('should validate invalid gist URL', async ({ page }) => {
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill('invalid-url');
      await input.press('Enter');
      // The error might show either as validation error or from URL parsing
      await expect(page.locator('text=/Invalid|URL|format|must be from gist.github.com/i')).toBeVisible();
    });

    test('should accept valid gist ID', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.html;
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'test.html', '<h1>Test</h1>', 'HTML'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      await expect(page.locator('iframe')).toBeVisible();
    });

    test('should accept gist URL', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.html;
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'test.html', '<h1>Test</h1>', 'HTML'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(`https://gist.github.com/user/${mockGistId}`);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      await expect(page.locator('iframe')).toBeVisible();
    });
  });

  test.describe('HTML Content Rendering', () => {
    test('should render complete HTML document', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.html;
      const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1 id="heading">HTML Test</h1><p class="para">Content</p></body>
</html>`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'index.html', htmlContent, 'HTML'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('#heading')).toContainText('HTML Test');
      await expect(iframe.locator('.para')).toContainText('Content');
    });

    test('should execute JavaScript in HTML', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.javascript;
      const htmlContent = `<!DOCTYPE html>
<html>
<body>
  <div id="output">Initial</div>
  <script>document.getElementById('output').textContent = 'JS Executed';</script>
</body>
</html>`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'interactive.html', htmlContent, 'HTML'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('#output')).toContainText('JS Executed');
    });
  });

  test.describe('Markdown Content Rendering', () => {
    test('should render Markdown with headers and lists', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.markdown;
      const mdContent = `# Main Header
## Sub Header

- Item 1
- Item 2
- Item 3`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'README.md', mdContent, 'Markdown'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('h1')).toContainText('Main Header');
      await expect(iframe.locator('h2')).toContainText('Sub Header');
      await expect(iframe.locator('ul li')).toHaveCount(3);
    });
  });

  test.describe('Code Content Display', () => {
    test('should display JSON content', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.json;
      const jsonContent = JSON.stringify({ name: 'Test', value: 123 }, null, 2);
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'data.json', jsonContent, 'JSON'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('body')).toContainText('Test');
      await expect(iframe.locator('body')).toContainText('123');
    });

    test('should display CSS content', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.css;
      const cssContent = `.container { display: flex; }`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'styles.css', cssContent, 'CSS'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('body')).toContainText('container');
      await expect(iframe.locator('body')).toContainText('display: flex');
    });

    test('should display JavaScript content', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.javascript;
      const jsContent = `function test() {\n  console.log('Hello');\n}`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'script.js', jsContent, 'JavaScript'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('body')).toContainText('function test');
      await expect(iframe.locator('body')).toContainText('console.log');
    });
  });

  test.describe('React/JSX Content', () => {
    test('should render simple JSX component', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.react;
      const jsxContent = `function Hello() {
  return <h1>Hello from React!</h1>;
}

ReactDOM.render(<Hello />, document.getElementById('root'));`;
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'App.jsx', jsxContent, 'JavaScript'));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      await page.waitForTimeout(1500); // Give React time to render
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('body')).toContainText('Hello from React', { timeout: 10000 });
    });
  });

  test.describe('Multi-file Gists', () => {
    test('should switch between multiple files', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.multiFile;
      const files = [
        { filename: 'index.html', content: '<h1>HTML File</h1>', language: 'HTML' },
        { filename: 'styles.css', content: '.test { color: red; }', language: 'CSS' },
        { filename: 'script.js', content: 'console.log("test");', language: 'JavaScript' },
      ];
      
      await mockGistApi(page, mockGistId, createMockMultiFileGistResponse(mockGistId, files));
      
      const input = page.getByPlaceholder(/paste.*gist/i);
      await input.fill(mockGistId);
      await input.press('Enter');
      
      await waitForIframeContent(page);
      
      // File selector should show all files
      await expect(page.getByText('index.html')).toBeVisible();
      await expect(page.getByText('styles.css')).toBeVisible();
      await expect(page.getByText('script.js')).toBeVisible();
      
      // Click CSS file
      await page.getByText('styles.css').click();
      await page.waitForTimeout(500);
      
      const iframe = page.frameLocator('iframe');
      await expect(iframe.locator('body')).toContainText('test');
      await expect(iframe.locator('body')).toContainText('color: red');
    });
  });

  test.describe('UI Functionality', () => {
    test('should load gist from URL parameter', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.html;
      const htmlContent = '<h1>From URL Param</h1>';
      
      await mockGistApi(page, mockGistId, createMockGistResponse(mockGistId, 'test.html', htmlContent, 'HTML'));
      
      await page.goto(`/?gist=${mockGistId}`);
      
      await waitForIframeContent(page);
      
      // Use first iframe (there might be multiple for fullscreen/normal view)
      const iframe = page.frameLocator('iframe').first();
      await expect(iframe.locator('h1')).toContainText('From URL Param');
    });

    test('should show error for non-existent gist', async ({ page }) => {
      const mockGistId = MOCK_GIST_IDS.error;
      
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
      
      await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 10000 });
    });
  });
});
