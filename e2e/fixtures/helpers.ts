import { test as base, expect, Page, Route } from '@playwright/test';

/**
 * Extended test fixture with common utilities for e2e tests
 */
export const test = base.extend({
  // Can add custom fixtures here if needed
});

export { expect };

/**
 * Generate a valid gist ID (20-32 hex characters)
 */
export function generateValidGistId(_prefix: string = 'test'): string {
  const hex = '0123456789abcdef';
  let id = '';
  // Generate 24 character hex string
  for (let i = 0; i < 24; i++) {
    id += hex[Math.floor(Math.random() * hex.length)];
  }
  return id;
}

/**
 * Common valid gist IDs for testing
 */
export const MOCK_GIST_IDS = {
  html: 'abc123def456abc123def456',
  markdown: 'def456789abc123456789abc',
  json: 'fedcba987654321fedcba98',
  css: '123456789abcdef123456789',
  javascript: '987654321fedcba987654321',
  react: 'aabbccddee1122334455aabb',
  multiFile: 'ff00ee11dd22cc33bb44aa55',
  error: 'eeeeeeeeeeeeeeeeeeeeeeee',
};

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
export async function waitForIframeContent(page: Page) {
  // Wait for the iframe to be present
  await page.waitForSelector('iframe', { timeout: 15000 });
  
  // Wait a bit for content to render
  await page.waitForTimeout(1000);
}

/**
 * Setup API mock for a gist
 * Can be called with either:
 * - mockGistApi(page, gistId, responseObject)
 * - mockGistApi(page, gistId, filename, content, language) to auto-create response
 */
export async function mockGistApi(
  page: Page,
  gistId: string,
  filenameOrResponse: string | Record<string, unknown>,
  content?: string,
  language?: string
) {
  let response: Record<string, unknown>;
  
  if (typeof filenameOrResponse === 'string' && content) {
    // Called with individual parameters
    response = createMockGistResponse(gistId, filenameOrResponse, content, language);
  } else {
    // Called with response object
    response = filenameOrResponse as Record<string, unknown>;
  }
  
  await page.route('**/gists/**', async (route: Route) => {
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
export async function getIframeContent(page: Page): Promise<string> {
  const frame = page.frameLocator('iframe');
  const content = await frame.locator('body').innerHTML();
  return content;
}
