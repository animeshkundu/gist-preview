import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixture with common utilities for e2e tests
 */
export const test = base.extend({
  // Can add custom fixtures here if needed
});

export { expect };

/**
 * Mock GitHub API response for a single-file gist
 */
export function createMockGistResponse(
  id: string,
  filename: string,
  content: string,
  language: string = 'Text'
) {
  return {
    id,
    description: `Test gist - ${filename}`,
    public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    files: {
      [filename]: {
        filename,
        type: 'text/plain',
        language,
        raw_url: `https://gist.githubusercontent.com/test/${id}/raw/${filename}`,
        size: content.length,
        content,
      },
    },
    owner: {
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  };
}

/**
 * Mock GitHub API response for a multi-file gist
 */
export function createMockMultiFileGistResponse(
  id: string,
  files: Array<{ filename: string; content: string; language?: string }>
) {
  const filesObj: Record<string, any> = {};
  
  files.forEach(({ filename, content, language = 'Text' }) => {
    filesObj[filename] = {
      filename,
      type: 'text/plain',
      language,
      raw_url: `https://gist.githubusercontent.com/test/${id}/raw/${filename}`,
      size: content.length,
      content,
    };
  });

  return {
    id,
    description: 'Test multi-file gist',
    public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    files: filesObj,
    owner: {
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  };
}

/**
 * Wait for iframe content to load
 */
export async function waitForIframeContent(page: any) {
  // Wait for the iframe to be present
  await page.waitForSelector('iframe', { timeout: 15000 });
  
  // Wait a bit for content to render
  await page.waitForTimeout(1000);
}

/**
 * Setup API mock for a gist
 */
export async function mockGistApi(page: any, gistId: string, response: any) {
  await page.route('**/gists/**', async (route: any) => {
    if (route.request().url().includes(gistId)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Get iframe content
 */
export async function getIframeContent(page: any): Promise<string> {
  const frame = page.frameLocator('iframe');
  const content = await frame.locator('body').innerHTML();
  return content;
}
