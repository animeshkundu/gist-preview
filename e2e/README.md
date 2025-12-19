# E2E Testing for GistPreview

This directory contains end-to-end (e2e) integration tests for the GistPreview application using Playwright.

## Overview

The e2e tests validate the entire application flow from user input to content rendering, covering:

- Landing page and input validation
- HTML content rendering (complete documents, fragments, JavaScript execution, CSS styling)
- Markdown rendering (headers, lists, links, code blocks)
- Code content display (JSON, CSS, JavaScript)
- React/JSX transpilation and execution
- Multi-file gist handling and file switching
- URL parameter handling
- Error handling

## Running Tests

```bash
# Run all e2e tests
npm run e2e

# Run tests in UI mode (interactive)
npm run e2e:ui

# Run tests in headed mode (with browser visible)
npm run e2e:headed

# View test report
npm run e2e:report
```

## Test Structure

- **`complete.spec.ts`** - Comprehensive e2e test suite covering all major features (14 tests)
- **`basic-functionality.spec.ts`** - Core functionality tests (6 tests)  
- **`fixtures/helpers.ts`** - Shared test utilities and mock helpers

## Test Coverage

The e2e tests provide comprehensive coverage of user-facing functionality:

### Landing Page & Input (4 tests)
- Display landing page with all elements
- Validate invalid gist URLs
- Accept valid gist IDs
- Accept full gist URLs

### Content Rendering (7 tests)
- **HTML**: Complete documents, JavaScript execution
- **Markdown**: Headers, lists
- **Code**: JSON, CSS, JavaScript display
- **React/JSX**: Component transpilation and rendering

### Multi-file Support (1 test)
- File switching functionality

### UI Functionality (2 tests)
- URL parameter loading
- Error handling for non-existent gists

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Browser**: Chromium (can be extended to Firefox, WebKit)
- **Auto-start dev server**: Runs `npm run dev` before tests
- **Server reuse**: Reuses existing dev server if already running
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on failure
- **Traces**: Captured on first retry

## Key Features

- **API Mocking**: Uses Playwright's route interception to mock GitHub Gist API responses
- **Valid Gist IDs**: Uses realistic 24-character hex IDs matching GitHub's format
- **Iframe Testing**: Tests sandboxed iframe content rendering
- **Async Content**: Handles React transpilation and execution timing
- **Multi-file Gists**: Tests file selection and switching

## Mock Helpers

The `fixtures/helpers.ts` file provides:

- `mockGistApi()` - Mock GitHub API responses
- `createMockGistResponse()` - Generate single-file gist responses
- `createMockMultiFileGistResponse()` - Generate multi-file gist responses
- `waitForIframeContent()` - Wait for iframe to load
- `MOCK_GIST_IDS` - Pre-defined valid gist IDs for different content types

## CI Integration

The tests are configured to run in CI with:
- Single worker (sequential execution)
- 2 retries per test
- HTML and list reporters
- Automatic dev server management

## Adding New Tests

1. Use `MOCK_GIST_IDS` constants for gist IDs (ensures valid format)
2. Use `mockGistApi()` helper for API mocking
3. Use `waitForIframeContent()` after navigation
4. Use `page.frameLocator('iframe')` to test iframe content
5. For React tests, add extra wait time for transpilation

## Example Test

```typescript
test('should render HTML content', async ({ page }) => {
  const mockGistId = MOCK_GIST_IDS.html;
  const htmlContent = '<h1>Test</h1>';
  
  await mockGistApi(page, mockGistId, createMockGistResponse(
    mockGistId, 'test.html', htmlContent, 'HTML'
  ));
  
  const input = page.getByPlaceholder(/paste.*gist/i);
  await input.fill(mockGistId);
  await input.press('Enter');
  
  await waitForIframeContent(page);
  
  const iframe = page.frameLocator('iframe');
  await expect(iframe.locator('h1')).toContainText('Test');
});
```

## Debugging

To debug failing tests:

```bash
# View HTML report with screenshots and traces
npm run e2e:report

# Run in UI mode for interactive debugging
npm run e2e:ui

# Run with headed browser
npm run e2e:headed
```

## Performance

Current test execution time: ~40 seconds for all 14 tests (includes dev server startup).
