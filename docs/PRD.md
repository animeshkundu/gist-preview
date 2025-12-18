# GistPreview - Modern Gist Renderer

A modern, secure, and elegant web application that transforms GitHub Gists into beautifully rendered web pages with fullscreen preview, screenshot sharing, and intelligent content-type inference.

**Experience Qualities**:
1. **Instant** - Users should experience near-zero latency from URL input to rendered preview, with optimistic loading states that feel responsive
2. **Trustworthy** - The interface should communicate security and reliability through polished design and clear error handling
3. **Delightful** - Small moments of animation and thoughtful UX details should make the tool memorable and enjoyable to use

**Complexity Level**: Light Application (multiple features with basic state)
- The app has a clear primary function (rendering gists) with supporting features like URL parsing, error handling, file selection, responsive iframe rendering, fullscreen mode, and screenshot sharing. State management is straightforward but requires handling async data fetching and user preferences.

---

## Background & Research

### Original GistPreview Analysis

The original gistpreview.github.io works by:
1. Parsing Gist URLs from the path (e.g., `gistpreview.github.io/{username}/{gist_id}`)
2. Fetching Gist data via GitHub's API
3. Rendering HTML/CSS/JS files in an iframe
4. Supporting direct file links via `?file=` query parameter

**Limitations of the Original**:
- Dated visual design (basic Bootstrap styling)
- No input field for pasting Gist URLs directly
- Limited error handling and user feedback
- No loading states or animations
- No file picker for multi-file gists
- No syntax highlighting for code preview
- No dark mode or modern theming
- Mobile experience is suboptimal
- No fullscreen preview mode
- No screenshot/sharing capabilities

### Improvements in Modern Version

1. **URL Input Field** - Allow users to paste any Gist URL format
2. **Smart URL Parsing** - Support multiple Gist URL formats
3. **File Selector** - Tabs for multi-file gists with content-type badges
4. **Live Preview** - Responsive iframe with device size toggles
5. **Code View Toggle** - Switch between rendered preview and source code
6. **Modern UI** - Sleek, dark-themed design with smooth animations
7. **Better Error States** - Helpful error messages with recovery suggestions
8. **Shareable URLs** - Generate shareable preview links with query parameters
9. **Recent Gists** - Remember recently viewed gists (using KV storage)
10. **Fullscreen Mode** - Immersive preview with locked mode for shared links
11. **Screenshot Sharing** - Copy screenshot + link to clipboard for easy sharing
12. **Content-Type Inference** - Intelligent detection of file types from content, not just extensions

---

## Essential Features

### 1. Gist URL Input & Parsing
- **Functionality**: Accept Gist URLs in multiple formats and extract the gist ID
- **Purpose**: Primary entry point - users need a simple way to input any gist URL
- **Trigger**: User pastes/types URL into input field and presses Enter or clicks Preview
- **Progression**: Paste URL → Validate format → Extract gist ID → Fetch data → Show preview
- **Success Criteria**: All valid Gist URL formats are correctly parsed; invalid URLs show helpful error messages

**Supported URL Formats**:
- `https://gist.github.com/username/abc123def456`
- `https://gist.github.com/abc123def456`
- `gist.github.com/username/abc123def456`
- `abc123def456` (raw 20-32 character hex ID)

### 2. Gist Data Fetching
- **Functionality**: Fetch gist metadata and file contents from GitHub API
- **Purpose**: Retrieve the actual content to render
- **Trigger**: After successful URL parsing
- **Progression**: Show loading spinner → Fetch from API → Parse response → Populate file list → Auto-select best file → Render preview
- **Success Criteria**: Gists load within 2 seconds; rate limiting is handled gracefully; private gist errors are clear

### 3. File Selection
- **Functionality**: Display list of files in gist with ability to select which to preview
- **Purpose**: Multi-file gists need navigation between files
- **Trigger**: Gist with multiple files is loaded
- **Progression**: Display file tabs with type badges → User clicks file → Update preview → Update URL query parameter
- **Success Criteria**: File switching is instant; selected file persists in URL for sharing

**Smart File Selection Logic**:
1. Prioritize HTML files (especially `index.html`)
2. Fall back to Markdown files (especially `README.md`)
3. Finally, select the first available file

### 4. Preview Rendering with Content-Based Type Inference
- **Functionality**: Render file contents with appropriate formatting based on **content analysis**, not just file extension
- **Purpose**: Core value proposition - see the gist as a beautifully rendered page, even when file extensions are missing or generic (e.g., `gistfile1.txt`)
- **Trigger**: File is selected
- **Progression**: Analyze content patterns → Infer content type → Apply appropriate renderer → Display in iframe

**Content Type Inference Engine**:
- **HTML Detection**: Looks for `<!DOCTYPE html>`, `<html>` tags, or multiple HTML element patterns
- **Markdown Detection**: Looks for headers (`# Title`), links, code blocks, bold/italic, lists, blockquotes, tables
- **JSON Detection**: Validates if content parses as valid JSON
- **CSS Detection**: Looks for selector patterns, `@media`, color values, CSS units
- **JavaScript Detection**: Looks for `function`, `const`, `let`, arrow functions, common JS patterns
- **Fallback**: If no patterns match with confidence ≥50%, falls back to extension-based detection, then generic code/text

**Supported Render Formats**:
| Type | Rendering | Features |
|------|-----------|----------|
| HTML | Full webpage in iframe | CSS/JS from other gist files auto-injected |
| Markdown | Styled HTML with dark theme | GFM support, syntax highlighting, tables |
| JSON | Syntax-highlighted | Color-coded keys/values, auto-formatted |
| Code (JS, TS, CSS, etc.) | Line numbers + language badge | Hover highlight, monospace font |
| Plain Text | Clean text display | Filename header |

### 5. Viewport Controls
- **Functionality**: Toggle between desktop/tablet/mobile viewport sizes
- **Purpose**: Test responsive designs within gists
- **Trigger**: User clicks viewport size buttons
- **Progression**: Click size → Animate iframe resize with spring physics → Update active state
- **Success Criteria**: Smooth resize animation; sizes match real device widths

**Viewport Sizes**:
- Desktop: 100% width
- Tablet: 768px
- Mobile: 375px

### 6. Fullscreen Mode
- **Functionality**: Expand preview to fill entire viewport for immersive viewing
- **Purpose**: Distraction-free viewing of rendered content; essential for shared preview links
- **Trigger**: User clicks fullscreen button OR loads gist via URL query parameter
- **Progression**: Click fullscreen → Expand to fill viewport → Show floating controls → Press ESC or click X to exit

**Fullscreen Behavior Modes**:
| Entry Method | Initial State | Exit Controls | ESC Key |
|--------------|---------------|---------------|---------|
| Click fullscreen button | Fullscreen | X button + ESC hint | Exits |
| Load via `?gist=` URL | Locked fullscreen | Copy button only | Disabled |

- **Locked Fullscreen**: When a gist is loaded directly from a shared URL (with `?gist=` parameter), fullscreen mode is permanently enabled with no escape. This provides a seamless, clean preview experience for shared links.

### 7. Recent Gists History
- **Functionality**: Store and display recently viewed gists
- **Purpose**: Quick access to previously viewed gists
- **Trigger**: Successful gist load saves to history; history shown on landing page
- **Progression**: Load history from localStorage → Display as clickable cards with avatars → Click to load gist
- **Success Criteria**: Last 10 gists are remembered; clicking loads instantly

### 8. Share/Copy Link
- **Functionality**: Copy shareable preview URL to clipboard
- **Purpose**: Easy sharing of gist previews
- **Trigger**: User clicks Share button
- **Progression**: Click button → Generate URL with gist ID and file → Copy to clipboard → Show toast confirmation
- **Success Criteria**: URL copies successfully; toast appears; URL opens in locked fullscreen when shared

**URL Format**: `{origin}?gist={gistId}&file={filename}`

### 9. Screenshot Copy
- **Functionality**: Capture a screenshot of the current preview and copy it to clipboard along with the preview link
- **Purpose**: Easy visual sharing for documentation, social media, or communication
- **Trigger**: User clicks Screenshot button
- **Progression**: Click button → Capture preview area using html2canvas → Copy image to clipboard → Show toast with confirmation and preview link
- **Fallback Behavior**: If clipboard API doesn't support images, download PNG file and copy link to clipboard instead
- **Success Criteria**: Screenshot captures current preview state; toast confirms action; filename uses sanitized gist description

### 10. Raw Code View Toggle
- **Functionality**: Switch between rendered preview and raw source code
- **Purpose**: Allow viewing original file contents
- **Trigger**: User clicks Raw/Preview toggle button
- **Progression**: Click Raw → Show monospace code view → Click Preview → Return to rendered view
- **Success Criteria**: Instant toggle; code is scrollable and copyable

### 11. Open in GitHub
- **Functionality**: Link to original gist on GitHub
- **Purpose**: Quick access to original source for forking, commenting, etc.
- **Trigger**: User clicks GitHub button
- **Progression**: Click → Open gist's html_url in new tab
- **Success Criteria**: Opens correct gist page

---

## Edge Case Handling

- **Invalid URL Format**: Show inline validation error with example of valid formats
- **Gist Not Found (404)**: Display friendly "Gist not found. It may be private or deleted." message
- **Private Gist (403)**: Explain that private gists require authentication (not supported)
- **Rate Limited (403 + headers)**: Show rate limit message with estimated wait time in minutes
- **Network Error**: Show "Network error. Check your connection and try again."
- **Empty Gist**: Display "This gist has no files" message (graceful handling)
- **Large Files**: Files render as-is; browser handles large content
- **Files Without Extensions**: Content-type inference engine analyzes content to determine type
- **Multi-file HTML Gists**: CSS and JS files are automatically injected into HTML preview

---

## Design Direction

The design should evoke feelings of **technical precision**, **modern minimalism**, and **developer trust**. Think of tools like Vercel, Linear, or Raycast - clean interfaces that get out of the way while feeling premium. The dark-first aesthetic appeals to developers who appreciate thoughtful design without being flashy or distracting.

---

## Color Selection

A sophisticated dark-mode-first palette with vibrant accents that feel technical yet approachable.

- **Primary Color**: `oklch(0.7 0.15 250)` - A calming blue that communicates reliability and technical competence
- **Secondary Colors**: 
  - `oklch(0.25 0.02 250)` - Deep navy for cards and elevated surfaces
  - `oklch(0.14 0.01 260)` - Near-black for the background, providing depth
- **Accent Color**: `oklch(0.75 0.18 160)` - Vibrant teal/cyan for CTAs, links, and success states - energetic without being aggressive
- **Destructive Color**: `oklch(0.6 0.2 25)` - Warm red for errors and destructive actions

**Foreground/Background Pairings** (WCAG AA Compliant):
| Surface | Background | Foreground | Contrast |
|---------|------------|------------|----------|
| Background | `oklch(0.14 0.01 260)` | `oklch(0.95 0 0)` | ~14:1 ✓ |
| Card | `oklch(0.2 0.02 255)` | `oklch(0.9 0 0)` | ~10:1 ✓ |
| Primary | `oklch(0.7 0.15 250)` | `oklch(0.1 0 0)` | ~9:1 ✓ |
| Accent | `oklch(0.75 0.18 160)` | `oklch(0.1 0.02 160)` | ~8:1 ✓ |
| Muted | `oklch(0.25 0.02 250)` | `oklch(0.6 0.02 250)` | ~4.5:1 ✓ |

---

## Font Selection

Typography should feel technical and precise while maintaining excellent readability. A combination of a geometric sans-serif for UI elements and a monospace font for code creates clear hierarchy and reinforces the developer-focused nature.

- **Display Font**: Space Grotesk - Geometric, technical, with character. Used for headings and app title.
- **Body Font**: Inter - Clean and highly readable for descriptions and UI text.
- **Code Font**: JetBrains Mono - Industry-standard for code and URLs.

**Typographic Hierarchy**:
| Element | Font | Size/Weight | Notes |
|---------|------|-------------|-------|
| App Title (H1) | Space Grotesk | Bold/40px (5xl) | Tight tracking |
| Section Header (H2) | Space Grotesk | Semibold/24px (lg) | With icon |
| Card Title | Space Grotesk | Semibold/18px | Line clamp 1 |
| Body Text | Inter | Regular/15px | Relaxed line height |
| Muted Text | Inter | Regular/14px | Muted color |
| Code/URLs | JetBrains Mono | Regular/14px | Monospace |
| Badges | Inter | Medium/10px | Uppercase |

---

## Animations

Animations should be subtle and functional, enhancing perceived performance and providing feedback without causing distraction. Use spring physics (framer-motion) for natural movement and keep durations snappy.

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| Page load fade-in | 300ms | ease-out | Staggered content reveal |
| Button hover/press | 150ms | spring | Scale feedback |
| Loading spinner | continuous | linear | Processing indicator |
| Viewport resize | 300ms | spring (stiff: 300, damp: 30) | Smooth width transition |
| Fullscreen transition | 200ms | ease-out | Fade in/out |
| Toast notification | 200ms | spring | Slide up from bottom |
| File tab indicator | 150ms | spring (stiff: 400, damp: 30) | Underline slides |
| Error message | 200ms | ease-out | Fade + slide down |
| Clear button | 150ms | spring | Scale in/out |

**Custom Animations** (defined in index.css):
- `shimmer`: Loading skeleton background animation (1.5s infinite)
- `fade-in-up`: Content reveal animation (0.4s ease-out)

---

## Component Selection

### Components (from shadcn/ui v4):
| Component | Usage | Customization |
|-----------|-------|---------------|
| Input | URL input field | `font-mono`, custom focus ring, error state |
| Button | All actions | Multiple variants (default, ghost, secondary) |
| Card | Recent gists, preview container | Hover elevation, cursor-pointer |
| Badge | File type indicators | Custom colors per type |
| Tooltip | Icon button labels | (available if needed) |
| Toaster (sonner) | Notifications | Position: bottom-center |

### Custom Components:
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| GistInput | URL input with validation | Clear button, error display, loading state |
| GistPreview | Main preview container | File selector, viewport toggle, action bar |
| PreviewFrame | Sandboxed iframe | Responsive width, loading detection |
| FileSelector | File tabs with type badges | Animated indicator, color-coded types |
| ViewportToggle | Device size buttons | Animated active indicator, fullscreen button |
| RecentGists | History display | Avatar, description, timestamp, clear all |

### Button States:
- **Default**: Solid background, normal opacity
- **Hover**: Slight brightness increase
- **Active/Pressed**: Scale 0.98
- **Disabled**: 50% opacity, no pointer events
- **Loading**: Spinner replaces content

### File Type Badge Colors:
| Type | Background | Text |
|------|------------|------|
| HTML | `orange-500/20` | `orange-400` |
| CSS | `blue-500/20` | `blue-400` |
| JavaScript | `yellow-500/20` | `yellow-400` |
| JSON | `green-500/20` | `green-400` |
| Markdown | `purple-500/20` | `purple-400` |
| Code | `indigo-500/20` | `indigo-400` |
| Text | `muted` | `muted-foreground` |

### Icon Selection (Phosphor Icons):
| Icon | Usage | Weight |
|------|-------|--------|
| Code | App logo, Raw toggle | duotone/bold |
| ArrowRight | Submit button | bold |
| X | Clear input, exit fullscreen | bold |
| Warning | Error states | fill |
| ArrowLeft | Back button | bold |
| Copy | Screenshot button | bold |
| Link | Share button | bold |
| ArrowSquareOut | GitHub link | bold |
| Eye | Preview toggle | bold |
| Desktop/DeviceTablet/DeviceMobile | Viewport toggle | regular/fill |
| CornersOut | Fullscreen button | bold |
| Clock | Recent gists header | fill |
| Trash | Remove/clear | bold |
| Files | Default avatar placeholder | fill |
| GithubLogo | Footer link | fill |

### Spacing System:
| Context | Value | Tailwind |
|---------|-------|----------|
| Page padding (desktop) | 24px | `p-6` |
| Page padding (mobile) | 16px | `p-4` |
| Section gap | 32px | `gap-8` / `mb-10` |
| Card padding | 16-20px | `p-4` / `p-5` |
| Button icon gap | 6-8px | `gap-1.5` / `gap-2` |
| Input height | 56px | `h-14` |
| Button height | 40px | `h-10` |

### Mobile Responsive Behavior:
- **Breakpoint**: 768px (sm)
- Single column layout below breakpoint
- Viewport toggle labels hidden on mobile
- Action button labels hidden on mobile (icons only)
- File selector horizontal scroll
- Recent gists stack vertically
- Touch targets minimum 44px

---

## Technical Architecture

### Data Flow
```
URL Input → Parse → Fetch GitHub API → Store in State → Render Preview
     ↓                                       ↓
 Validate                              Save to Recent (localStorage)
     ↓                                       ↓
 Error Display                         Update URL params
```

### URL State Management
- Gist ID and selected file are stored in URL query parameters
- `?gist={id}&file={filename}`
- Enables shareable links and browser back/forward navigation
- URL is updated via `window.history.replaceState`

### API Integration
- **Endpoint**: `GET https://api.github.com/gists/{gist_id}`
- **Authentication**: None required for public gists
- **Rate Limit**: 60 requests/hour for unauthenticated
- **Headers**: `Accept: application/vnd.github.v3+json`

### State Management
| State Type | Hook | Purpose |
|------------|------|---------|
| Gist data | `useState` | Current gist, loading, error |
| Selected file | `useState` | Current file being previewed |
| Recent gists | `useState` + `localStorage` | Persistent history (max 10) |
| Viewport | `useState` | Current viewport size |
| Fullscreen | `useState` | Fullscreen mode state |
| URL-loaded | `useState` | Track if loaded from URL (for locked fullscreen) |

### Security Considerations
- **Iframe sandbox**: `allow-scripts` only (no `allow-same-origin`)
- **srcdoc**: Content injected via srcdoc attribute, not src URL
- **No execution in main context**: Gist JS runs only in sandboxed iframe
- **XSS prevention**: HTML content is rendered in isolated iframe

---

## File Structure

```
src/
├── App.tsx                      # Main app with routing logic
├── components/
│   ├── GistInput.tsx            # URL input with validation & clear button
│   ├── GistPreview.tsx          # Main preview container with all controls
│   ├── PreviewFrame.tsx         # Sandboxed iframe with viewport sizing
│   ├── FileSelector.tsx         # File tabs with type badges
│   ├── ViewportToggle.tsx       # Device size buttons + fullscreen
│   └── RecentGists.tsx          # History display with cards
├── hooks/
│   ├── useGist.ts               # Gist fetching with smart file selection
│   └── useRecentGists.ts        # Recent gists with localStorage persistence
├── lib/
│   ├── parseGistUrl.ts          # URL parsing & validation
│   ├── gistApi.ts               # GitHub API client & file assembly
│   ├── contentRenderer.ts       # File content rendering (MD, JSON, code, text)
│   ├── contentTypeInference.ts  # Content-based type detection engine
│   └── utils.ts                 # CN class helper
└── index.css                    # Theme colors & custom animations
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| framer-motion | Animations and transitions |
| @phosphor-icons/react | Icon system |
| marked | Markdown to HTML conversion |
| html2canvas | Screenshot capture |
| date-fns | Relative time formatting |
| sonner | Toast notifications |

---

## Testing

The application has comprehensive unit test coverage (90%+) using Vitest and React Testing Library.

### Test Structure
```
src/
├── __tests__/
│   └── setup.ts                 # Global test setup & mocks
├── lib/__tests__/
│   ├── parseGistUrl.test.ts     # URL parsing tests
│   ├── contentTypeInference.test.ts # Content detection tests
│   ├── contentRenderer.test.ts  # Rendering tests
│   ├── gistApi.test.ts          # API client tests
│   └── utils.test.ts            # Utility function tests
├── hooks/__tests__/
│   ├── useGist.test.ts          # Gist hook tests
│   └── useRecentGists.test.ts   # Recent gists hook tests
└── components/__tests__/
    ├── GistInput.test.tsx       # Input component tests
    ├── GistPreview.test.tsx     # Preview component tests
    ├── PreviewFrame.test.tsx    # Iframe component tests
    ├── FileSelector.test.tsx    # File selector tests
    ├── ViewportToggle.test.tsx  # Viewport toggle tests
    └── RecentGists.test.tsx     # Recent gists tests
```

### Test Commands
| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Coverage Thresholds
- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

---

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration.

### Workflow: `.github/workflows/ci.yml`

**Triggers**:
- Push to `main` branch
- Pull requests targeting `main` branch

**Jobs**:
| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Clone repository |
| Setup Node | `actions/setup-node@v4` | Install Node.js 20.x |
| Install | `npm ci` | Install dependencies |
| Type Check | `npm run typecheck` | TypeScript validation |
| Lint | `npm run lint` | ESLint code quality |
| Test | `npm test` | Run unit tests |
| Coverage | `npm run test:coverage` | Generate coverage report |
| Build | `npm run build` | Production build |
| Upload | `actions/upload-artifact@v4` | Store coverage reports |

### NPM Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development server |
| `build` | `tsc -b && vite build` | Production build |
| `typecheck` | `tsc --noEmit` | Type checking only |
| `lint` | `eslint .` | Lint codebase |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Watch mode |
| `test:coverage` | `vitest run --coverage` | With coverage |

---

## Future Enhancements (Not Implemented)

- [ ] Syntax highlighting for code (Prism.js or Shiki)
- [ ] Authentication for private gists
- [ ] Gist editing/forking
- [ ] Multiple theme options
- [ ] Embed code generation
- [ ] Print-friendly view
- [ ] Keyboard shortcuts documentation
