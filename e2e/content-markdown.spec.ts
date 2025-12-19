import { test, expect, createMockGistResponse, waitForIframeContent } from './fixtures/helpers';
// Note: Use mockGistApi(page, gistId, response) for API mocking

test.describe('GistPreview - Markdown Content', () => {
  test('should render Markdown with headers', async ({ page }) => {
    const mockGistId = 'md-headers';
    const mdContent = `# Main Heading
## Subheading
### Third Level

This is a paragraph with some text.`;
    
    await mockGistApi(page, mockGistId, 'README.md', mdContent, 'Markdown');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('h1')).toContainText('Main Heading');
    await expect(iframe.locator('h2')).toContainText('Subheading');
    await expect(iframe.locator('h3')).toContainText('Third Level');
  });

  test('should render Markdown with links', async ({ page }) => {
    const mockGistId = 'md-links';
    const mdContent = `# Links Test

[GitHub](https://github.com)
[Google](https://google.com)`;
    
    await mockGistApi(page, mockGistId, 'links.md', mdContent, 'Markdown');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    const githubLink = iframe.locator('a[href="https://github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toContainText('GitHub');
    
    const googleLink = iframe.locator('a[href="https://google.com"]');
    await expect(googleLink).toBeVisible();
  });

  test('should render Markdown with code blocks', async ({ page }) => {
    const mockGistId = 'md-code';
    const mdContent = `# Code Example

\`\`\`javascript
function hello() {
  console.log('Hello World');
}
\`\`\`

Inline code: \`const x = 42;\``;
    
    await mockGistApi(page, mockGistId, 'code.md', mdContent, 'Markdown');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    // Code blocks are usually rendered in <pre><code> tags
    await expect(iframe.locator('pre code, code')).toHaveCount(2); // One code block + one inline code
  });

  test('should render Markdown with lists', async ({ page }) => {
    const mockGistId = 'md-lists';
    const mdContent = `# Lists

Unordered list:
- Item 1
- Item 2
- Item 3

Ordered list:
1. First
2. Second
3. Third`;
    
    await mockGistApi(page, mockGistId, 'lists.md', mdContent, 'Markdown');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    // Check for unordered list
    await expect(iframe.locator('ul li')).toHaveCount(3);
    // Check for ordered list
    await expect(iframe.locator('ol li')).toHaveCount(3);
  });

  test('should render Markdown with emphasis', async ({ page }) => {
    const mockGistId = 'md-emphasis';
    const mdContent = `# Text Formatting

**Bold text** and *italic text*

__Also bold__ and _also italic_`;
    
    await mockGistApi(page, mockGistId, 'emphasis.md', mdContent, 'Markdown');
    
    await page.goto('/');
    const input = page.getByPlaceholder(/paste.*gist/i);
    await input.fill(mockGistId);
    await input.press('Enter');
    
    await waitForIframeContent(page);
    
    const iframe = page.frameLocator('iframe');
    // Bold is typically rendered as <strong> or <b>
    await expect(iframe.locator('strong, b')).toHaveCount(2);
    // Italic is typically rendered as <em> or <i>
    await expect(iframe.locator('em, i')).toHaveCount(2);
  });
});
