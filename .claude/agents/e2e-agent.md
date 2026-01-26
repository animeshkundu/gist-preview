# E2E Agent

## Purpose

The E2E Agent manages end-to-end testing with Playwright, ensuring user flows work correctly across the entire application.

## Responsibilities

1. Generate E2E test cases for user flows
2. Validate gist URL parsing and rendering flows
3. Test GitHub API integration
4. Generate HTML reports for failures
5. Test multi-file gist handling

## Triggers

- Feature affecting user flows
- API integration changes
- PR with UI changes
- Manual invocation
- Pre-release testing

## Instructions

### E2E Framework

```
Framework: Playwright (@playwright/test)
Location: e2e/
Reports: playwright-report/
Config: playwright.config.ts
```

### E2E Test Structure

```
e2e/
├── basic-functionality.spec.ts
├── complete.spec.ts
├── content-html.spec.ts
├── content-markdown.spec.ts
├── content-other.spec.ts
├── content-react.spec.ts
├── recent-gists.spec.ts
├── ui-functionality.spec.ts
├── fixtures/
│   └── test-gists.ts
├── README.md
└── SUMMARY.md
```

### E2E Commands

```bash
# Run all E2E tests
npm run e2e

# Run with UI (interactive)
npm run e2e:ui

# Run headed (see browser)
npm run e2e:headed

# View HTML report
npm run e2e:report
```

### Test Patterns

#### Basic User Flow Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Gist Preview Flow', () => {
  test('should load and preview a gist', async ({ page }) => {
    await page.goto('/');
    
    // Enter gist URL
    await page.fill('[placeholder*="gist"]', 'https://gist.github.com/user/abc123');
    await page.click('button:has-text("Preview")');
    
    // Wait for preview to load
    await expect(page.locator('.preview-frame')).toBeVisible();
    
    // Verify content rendered
    await expect(page.locator('iframe')).toHaveAttribute('srcdoc', /.+/);
  });
});
```

#### Content Type Test
```typescript
test('should render HTML content correctly', async ({ page }) => {
  await page.goto('/?gist=html-gist-id');
  
  // Wait for iframe to load
  const iframe = page.frameLocator('iframe');
  
  // Verify HTML elements rendered
  await expect(iframe.locator('h1')).toBeVisible();
});
```

#### Error Handling Test
```typescript
test('should show error for invalid gist', async ({ page }) => {
  await page.goto('/');
  
  await page.fill('[placeholder*="gist"]', 'invalid-id');
  await page.click('button:has-text("Preview")');
  
  // Expect error message
  await expect(page.locator('text=/not found|invalid/i')).toBeVisible();
});
```

### Test Scenarios

#### URL Parsing
- Full URL with username
- URL without username
- Raw gist ID (20 chars)
- Raw gist ID (32 chars)
- URL with hash/anchor
- Invalid URL
- Empty input
- Non-GitHub URL

#### Content Rendering
- HTML with full document
- HTML fragment
- Markdown with all features
- Valid JSON
- Invalid JSON
- JavaScript code
- CSS code
- Plain text
- React/JSX code

#### Multi-file Gists
- HTML + CSS + JS assembly
- File switching
- URL file parameter
- Auto-select best file

#### Fullscreen Mode
- Manual fullscreen entry/exit
- ESC key exit
- Locked fullscreen from URL
- Screenshot in fullscreen

#### Mobile Responsive
- Responsive layout
- Touch targets
- Viewport toggle
- File selector scroll

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### CI Integration

E2E tests run in GitHub Actions:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run e2e

- name: Upload Playwright Report
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Success Criteria

- [ ] All E2E tests pass
- [ ] Core user flows covered
- [ ] Error states handled
- [ ] Mobile responsive verified
- [ ] No flaky tests
- [ ] Report generated for failures

## Debugging Tips

1. **Use headed mode**: `npm run e2e:headed`
2. **Add traces**: Configure `trace: 'on'` in config
3. **Screenshots on failure**: Automatic with Playwright
4. **Slow down**: Use `slowMo: 100` in config
5. **View report**: `npm run e2e:report`

## Integration

Works with:
- **Code Review Agent**: Reports E2E status
- **Test Agent**: Coordinates with unit tests
- **Build Agent**: Tests on production build
