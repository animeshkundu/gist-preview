# GistPreview - Technical Specifications

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GistPreview App                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐    ┌────────────────┐    ┌─────────────────────┐   │
│  │   GistInput    │───▶│  parseGistUrl  │───▶│     useGist         │   │
│  │   Component    │    │  (validation)  │    │   (fetch + state)   │   │
│  └────────────────┘    └────────────────┘    └──────────┬──────────┘   │
│                                                          │              │
│                                                          ▼              │
│  ┌────────────────┐    ┌────────────────┐    ┌─────────────────────┐   │
│  │  RecentGists   │◀───│  useKV         │◀───│   GistData State    │   │
│  │   Component    │    │  (persistence) │    │   (gist, files)     │   │
│  └────────────────┘    └────────────────┘    └──────────┬──────────┘   │
│                                                          │              │
│                                                          ▼              │
│  ┌────────────────┐    ┌────────────────┐    ┌─────────────────────┐   │
│  │ ViewportToggle │───▶│  PreviewFrame  │◀───│   FileSelector      │   │
│  │ + Fullscreen   │    │  (iframe)      │    │   (tabs)            │   │
│  └────────────────┘    └────────────────┘    └─────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│                    ┌─────────────────────┐                              │
│                    │ Content Renderers   │                              │
│                    │ (HTML/MD/JSON/Code) │                              │
│                    └─────────────────────┘                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  GitHub Gist API    │
                    │  (external)         │
                    └─────────────────────┘
```

### Component Hierarchy

```
App
├── [Landing View]
│   ├── Logo + Title
│   ├── GistInput
│   │   ├── Input (monospace)
│   │   ├── Clear Button (animated)
│   │   ├── Submit Button (with loading)
│   │   └── Error Display (animated)
│   ├── RecentGists
│   │   └── Card[] (avatar, description, timestamp)
│   └── Footer (GitHub link)
│
├── [Preview View]
│   └── GistPreview
│       ├── Header (back button, title, owner)
│       ├── ViewportToggle
│       │   ├── Desktop/Tablet/Mobile buttons
│       │   └── Fullscreen button
│       ├── FileSelector (tabs with type badges)
│       ├── ActionBar
│       │   ├── Raw/Preview toggle
│       │   ├── Screenshot button
│       │   ├── Share button
│       │   └── GitHub button
│       ├── PreviewFrame (Card wrapper)
│       │   └── iframe (sandboxed)
│       └── [Fullscreen Overlay]
│           ├── Full-viewport iframe
│           ├── Copy button (floating)
│           ├── Exit button (if not locked)
│           └── ESC hint (if not locked)
│
└── Toaster (sonner)
```

---

## Detailed Design

### 1. URL Parsing Module (`lib/parseGistUrl.ts`)

**Purpose**: Extract gist ID from various URL formats with robust validation

**Interfaces**:
```typescript
interface ParseSuccess {
  success: true;
  gistId: string;
  username?: string;
}

interface ParseError {
  success: false;
  error: string;
}

type ParseResult = ParseSuccess | ParseError;

function parseGistUrl(input: string): ParseResult
function buildGistPreviewUrl(gistId: string, filename?: string): string
```

**Validation Logic**:
```
Input → Trim whitespace
      → Check if raw hex ID (20-32 chars) → Return success
      → Parse as URL
      → Validate hostname contains 'gist.github.com'
      → Extract path segments
      → Find hex ID in path
      → Return success with gistId and optional username
```

**Supported Formats**:
| Format | Example |
|--------|---------|
| Full URL | `https://gist.github.com/user/abc123def456` |
| Shortened | `gist.github.com/user/abc123def456` |
| ID only URL | `https://gist.github.com/abc123def456` |
| Raw ID | `abc123def456789012345678` |
| With hash | `https://gist.github.com/user/abc123#file-example-js` |

**Error Messages**:
| Condition | Message |
|-----------|---------|
| Empty input | "Please enter a Gist URL or ID" |
| Wrong domain | "URL must be from gist.github.com" |
| No ID found | "No Gist ID found in URL" |
| Invalid ID format | "Invalid Gist ID format" |
| Parse failure | "Invalid URL format. Try pasting a gist.github.com URL or a Gist ID" |

---

### 2. Gist API Module (`lib/gistApi.ts`)

**Purpose**: Fetch gist data from GitHub API with comprehensive error handling

**Interfaces**:
```typescript
interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content: string;
}

interface GistOwner {
  login: string;
  avatar_url: string;
}

interface GistData {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner | null;
  html_url: string;
}

interface GistApiSuccess {
  success: true;
  data: GistData;
}

interface GistApiError {
  success: false;
  error: string;
  status?: number;
  retryAfter?: number;
}

type GistApiResult = GistApiSuccess | GistApiError;

async function fetchGist(gistId: string): Promise<GistApiResult>
```

**Error Handling Matrix**:
| Status | Condition | Error Message |
|--------|-----------|---------------|
| 404 | Not found | "Gist not found. It may be private or deleted." |
| 403 | Rate limit (X-RateLimit-Remaining: 0) | "Rate limited. Try again in {N} minutes." |
| 403 | Access denied | "Access denied. This gist may be private." |
| Other | HTTP error | "GitHub API error ({status})" |
| - | Network failure | "Network error. Check your connection and try again." |
| - | Unknown | "An unexpected error occurred. Please try again." |

**Utility Functions**:
```typescript
function getFilesByType(files: Record<string, GistFile>): {
  html: GistFile[];
  css: GistFile[];
  js: GistFile[];
  other: GistFile[];
}

function assemblePreviewHtml(
  htmlContent: string,
  cssFiles: GistFile[],
  jsFiles: GistFile[]
): string

function getFileExtension(filename: string): string
function isRenderableFile(filename: string): boolean
function getLanguageFromExtension(ext: string): string
```

**HTML Assembly Logic**:
```
If HTML has <html> structure:
  - Inject CSS into <style> before </head>
  - Inject JS into <script> before </body>
Else:
  - Wrap in full HTML document
  - Add CSS in <style>
  - Add body content
  - Add JS in <script>
```

---

### 3. Content Type Inference Engine (`lib/contentTypeInference.ts`)

**Purpose**: Intelligently detect file content type from content patterns, not just extensions

**Types**:
```typescript
type InferredContentType = 
  | 'html'
  | 'markdown'
  | 'json'
  | 'css'
  | 'javascript'
  | 'code'
  | 'text';

interface ContentTypeResult {
  type: InferredContentType;
  confidence: number; // 0-1
}
```

**Detection Patterns**:

| Type | High Confidence Patterns | Medium Confidence Patterns |
|------|-------------------------|---------------------------|
| HTML | `<!DOCTYPE html>`, `<html>...</html>` | Multiple HTML tags (`<div>`, `<p>`, etc.) |
| Markdown | Headers + links + code blocks | Individual MD patterns (lists, bold, italic) |
| JSON | Valid JSON.parse() | Starts with `{` or `[` |
| CSS | Selector blocks + @rules | CSS units, color values |
| JavaScript | Multiple JS keywords | Arrow functions, console.log |

**Inference Priority**:
1. Check file extension first (if known extension, use it)
2. Run content analysis for each type
3. Select type with highest confidence (≥50%)
4. Fallback to 'code' if code indicators present
5. Default to 'text'

**Public Functions**:
```typescript
function inferContentType(content: string, filename: string): InferredContentType
function shouldRenderAsWebPage(type: InferredContentType): boolean
function getDisplayType(type: InferredContentType): string
```

---

### 4. Content Renderer Module (`lib/contentRenderer.ts`)

**Purpose**: Transform various content types into renderable HTML

**Renderer Functions**:

| Function | Input | Output |
|----------|-------|--------|
| `renderMarkdownToHtml(content)` | Markdown string | Full HTML document with dark styling |
| `renderHtmlContent(content)` | HTML string | Normalized HTML document |
| `renderCodeToHtml(content, filename)` | Code string | HTML with line numbers + syntax badge |
| `renderJsonToHtml(content, filename)` | JSON string | HTML with color-coded highlighting |
| `renderTextToHtml(content, filename)` | Plain text | HTML with filename header |
| `getRenderedContent(content, filename)` | Any content | Dispatches to appropriate renderer |

**Markdown Rendering**:
- Uses `marked` library with GFM enabled
- Custom dark theme styling
- Styled code blocks, tables, blockquotes
- Responsive images

**Code Rendering Features**:
- Line numbers (sticky left column)
- Filename header with language badge
- Hover highlight on lines
- Custom scrollbar styling

**JSON Rendering Features**:
- Auto-formatting with 2-space indent
- Color-coded: keys (blue), strings (green), numbers (yellow), booleans (pink), null (purple)
- Syntax validation (falls back to raw if invalid)

---

### 5. useGist Hook (`hooks/useGist.ts`)

**Purpose**: Manage gist fetching, file selection, and state

**Interface**:
```typescript
interface UseGistReturn {
  gist: GistData | null;
  loading: boolean;
  error: string | null;
  loadGist: (gistId: string) => Promise<boolean>;
  selectedFile: string | null;
  setSelectedFile: (filename: string) => void;
  files: GistFile[];
  filesByType: { html: GistFile[]; css: GistFile[]; js: GistFile[]; other: GistFile[] };
  reset: () => void;
}
```

**Smart File Selection Algorithm**:
```
1. Get all files from gist
2. Categorize by inferred content type
3. Selection priority:
   a. HTML files → prefer index.html
   b. Markdown files → prefer README.md
   c. First available file
4. Return selected filename
```

---

### 6. useRecentGists Hook (`hooks/useRecentGists.ts`)

**Purpose**: Persist recently viewed gists using KV storage

**Interface**:
```typescript
interface RecentGist {
  id: string;
  description: string | null;
  owner: string | null;
  ownerAvatar: string | null;
  viewedAt: number; // timestamp
  fileCount: number;
}

interface UseRecentGistsReturn {
  recentGists: RecentGist[];
  addToRecent: (gist: GistData) => void;
  removeFromRecent: (gistId: string) => void;
  clearRecent: () => void;
}
```

**Behavior**:
- Maximum 10 entries (configurable via `MAX_RECENT_GISTS`)
- Deduplicates by gist ID (moves to top if revisited)
- Uses functional updates to prevent stale state
- Persists via `useKV('recent-gists', [])`

---

### 7. GistPreview Component

**Purpose**: Main preview container with all controls and modes

**Props**:
```typescript
interface GistPreviewProps {
  gist: GistData;
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
  onBack: () => void;
  initialFullscreen?: boolean;
  lockedFullscreen?: boolean;
}
```

**State**:
| State | Type | Purpose |
|-------|------|---------|
| viewport | `'desktop' | 'tablet' | 'mobile'` | Current viewport size |
| showCode | `boolean` | Raw code view toggle |
| isFullscreen | `boolean` | Fullscreen mode active |
| isCopying | `boolean` | Screenshot in progress |

**Fullscreen Logic**:
```
if lockedFullscreen:
  - Always show fullscreen
  - Hide exit button
  - Disable ESC key
else if initialFullscreen:
  - Start in fullscreen
  - Show exit controls
  - ESC key exits
else:
  - Normal mode
  - Fullscreen button available
```

**Screenshot Implementation**:
```typescript
1. Determine target element (fullscreen iframe or preview div)
2. Use html2canvas to capture
3. Convert to blob (PNG)
4. Try ClipboardItem API
   - Success: Show "Screenshot copied!" toast
   - Failure: Download file + copy link
5. Show confirmation with preview URL
```

---

### 8. PreviewFrame Component

**Purpose**: Sandboxed iframe wrapper with responsive sizing

**Props**:
```typescript
interface PreviewFrameProps {
  content: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}
```

**Viewport Widths**:
| Viewport | Width |
|----------|-------|
| desktop | 100% |
| tablet | 768px |
| mobile | 375px |

**Security Attributes**:
```html
<iframe
  srcDoc={content}
  sandbox="allow-scripts"
  title="Gist Preview"
/>
```

**Loading State**:
- Shows spinner until iframe `onLoad` fires
- Content fades in with opacity transition

---

### 9. App Component

**Purpose**: Root component with view routing and URL state management

**URL Parameter Handling**:
```typescript
// On mount
const params = new URLSearchParams(window.location.search);
const gistId = params.get('gist');
const file = params.get('file');

if (gistId) {
  setLoadedFromUrl(true); // Enables locked fullscreen
  loadGist(gistId).then(success => {
    if (success && file) {
      setSelectedFile(file);
    }
  });
}

// On gist load
window.history.replaceState({}, '', 
  `?gist=${gist.id}&file=${encodeURIComponent(selectedFile)}`
);
```

**View States**:
| Condition | View | Layout |
|-----------|------|--------|
| `gist === null` | Landing | Centered input + recent gists |
| `gist !== null` | Preview | Full preview with controls |

---

## State Management Summary

### React State (useState)
| Hook Location | State | Purpose |
|---------------|-------|---------|
| App | `loadedFromUrl` | Track if loaded from URL for locked fullscreen |
| useGist | `gist`, `loading`, `error`, `selectedFile` | Gist data and fetch state |
| GistPreview | `viewport`, `showCode`, `isFullscreen`, `isCopying` | UI state |
| GistInput | `value`, `validationError` | Input state |
| PreviewFrame | `loaded` | Iframe load detection |

### Persistent State (localStorage)
| Key | Type | Purpose |
|-----|------|---------|
| `recent-gists` | `RecentGist[]` | Recently viewed gists (max 10) |

---

## API Rate Limiting Strategy

**GitHub API Limits**:
- 60 requests/hour for unauthenticated requests
- Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Handling**:
1. Check `X-RateLimit-Remaining` on 403 responses
2. Calculate wait time from `X-RateLimit-Reset` (Unix timestamp)
3. Display user-friendly message with wait time in minutes

---

## Browser Compatibility

**Target**: Modern browsers (last 2 versions)

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Required APIs**:
- Fetch API
- ES2020+ (optional chaining, nullish coalescing)
- CSS Custom Properties
- CSS Grid/Flexbox
- ClipboardItem API (with fallback)
- URL API

---

## Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Large gist files | Render as-is; browser handles |
| Re-renders | useMemo for file lists, content |
| Animation jank | Spring physics, GPU-accelerated transforms |
| Screenshot capture | Loading state, async processing |

---

## Unit Testing

The application uses **Vitest** with **React Testing Library** for comprehensive test coverage.

### Test Configuration

**File**: `vitest.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/hooks/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['src/components/ui/**', 'src/**/*.test.*', 'src/__tests__/**'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

### Test Categories

| Category | Location | Coverage |
|----------|----------|----------|
| URL Parsing | `lib/__tests__/parseGistUrl.test.ts` | All URL formats, edge cases |
| Content Inference | `lib/__tests__/contentTypeInference.test.ts` | All content types |
| Content Rendering | `lib/__tests__/contentRenderer.test.ts` | All renderers |
| API Client | `lib/__tests__/gistApi.test.ts` | Fetch, errors, utilities |
| useGist Hook | `hooks/__tests__/useGist.test.ts` | Loading, errors, file selection |
| useRecentGists Hook | `hooks/__tests__/useRecentGists.test.ts` | Add, remove, persistence |
| GistInput | `components/__tests__/GistInput.test.tsx` | Validation, submission |
| GistPreview | `components/__tests__/GistPreview.test.tsx` | All features, fullscreen |
| PreviewFrame | `components/__tests__/PreviewFrame.test.tsx` | Iframe, loading |
| FileSelector | `components/__tests__/FileSelector.test.tsx` | Selection, badges |
| ViewportToggle | `components/__tests__/ViewportToggle.test.tsx` | Sizing, fullscreen |
| RecentGists | `components/__tests__/RecentGists.test.tsx` | Display, actions |

### Mocking Strategy

| Dependency | Mock Location | Purpose |
|------------|---------------|---------|
| `localStorage` | `setup.ts` | Persistent storage |
| `framer-motion` | Test files | Animation components |
| `sonner` | Test files | Toast notifications |
| `html2canvas` | Test files | Screenshot capture |
| `fetch` | `setup.ts` | API requests |
| `navigator.clipboard` | `setup.ts` | Clipboard operations |

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run with coverage report |

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

**Triggers**:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Pipeline Steps**:
```
┌─────────────────────────────────────────────────────────────┐
│                     CI Pipeline                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Checkout ───► 2. Setup Node ───► 3. npm ci              │
│                                                              │
│  4. Type Check (tsc --noEmit)                               │
│         │                                                    │
│         ▼                                                    │
│  5. Lint (eslint .)                                         │
│         │                                                    │
│         ▼                                                    │
│  6. Test (vitest run)                                       │
│         │                                                    │
│         ▼                                                    │
│  7. Coverage (vitest run --coverage)                        │
│         │                                                    │
│         ▼                                                    │
│  8. Build (tsc -b && vite build)                            │
│         │                                                    │
│         ▼                                                    │
│  9. Upload Coverage Artifact                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### ESLint Configuration

**File**: `eslint.config.js`

**Extends**:
- `@eslint/js` recommended
- `typescript-eslint` recommended

**Plugins**:
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

**Custom Rules**:
| Rule | Setting | Purpose |
|------|---------|---------|
| `react-hooks/rules-of-hooks` | error | Enforce hooks rules |
| `react-hooks/exhaustive-deps` | warn | Dependency array validation |
| `react-refresh/only-export-components` | warn | Fast refresh compatibility |
| `@typescript-eslint/no-unused-vars` | error | Unused variables (ignores `_` prefix) |

**Ignored Paths**:
- `dist/`
- `node_modules/`
- `coverage/`
- `packages/`

---

## Testing Checklist

### URL Parsing
- [ ] Full URL with username
- [ ] URL without username
- [ ] Raw gist ID (20 chars)
- [ ] Raw gist ID (32 chars)
- [ ] URL with hash/anchor
- [ ] Invalid URL
- [ ] Empty input
- [ ] Non-GitHub URL

### Gist Fetching
- [ ] Public gist
- [ ] Non-existent gist (404)
- [ ] Private gist (403)
- [ ] Rate limited (403 + headers)
- [ ] Network error

### Content Rendering
- [ ] HTML with full document
- [ ] HTML fragment
- [ ] Markdown with all features
- [ ] Valid JSON
- [ ] Invalid JSON
- [ ] JavaScript code
- [ ] CSS code
- [ ] Plain text
- [ ] File without extension

### Multi-file Gists
- [ ] HTML + CSS + JS assembly
- [ ] File switching
- [ ] URL file parameter

### Fullscreen Mode
- [ ] Manual fullscreen entry/exit
- [ ] ESC key exit
- [ ] Locked fullscreen from URL
- [ ] Screenshot in fullscreen

### Mobile
- [ ] Responsive layout
- [ ] Touch targets
- [ ] Viewport toggle
- [ ] File selector scroll
