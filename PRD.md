# GistPreview - Modern Gist Renderer

A modern, secure, and elegant web application that transforms GitHub Gists into beautifully rendered web pages.

**Experience Qualities**:
1. **Instant** - Users should experience near-zero latency from URL input to rendered preview, with optimistic loading states that feel responsive
2. **Trustworthy** - The interface should communicate security and reliability through polished design and clear error handling
3. **Delightful** - Small moments of animation and thoughtful UX details should make the tool memorable and enjoyable to use

**Complexity Level**: Light Application (multiple features with basic state)
- The app has a clear primary function (rendering gists) with supporting features like URL parsing, error handling, file selection, and responsive iframe rendering. State management is straightforward but requires handling async data fetching and user preferences.

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

### Improvements for Modern Version

1. **URL Input Field** - Allow users to paste any Gist URL format
2. **Smart URL Parsing** - Support multiple Gist URL formats:
   - `https://gist.github.com/username/gist_id`
   - `https://gist.github.com/gist_id`
   - `gist_id` (raw ID)
3. **File Selector** - Dropdown/tabs for multi-file gists
4. **Live Preview** - Responsive iframe with device size toggles
5. **Code View Toggle** - Switch between rendered preview and source code
6. **Modern UI** - Sleek, minimal design with smooth animations
7. **Better Error States** - Helpful error messages with recovery suggestions
8. **Shareable URLs** - Generate shareable preview links
9. **Recent Gists** - Remember recently viewed gists (using KV storage)

---

## Essential Features

### 1. Gist URL Input & Parsing
- **Functionality**: Accept Gist URLs in multiple formats and extract the gist ID
- **Purpose**: Primary entry point - users need a simple way to input any gist URL
- **Trigger**: User pastes/types URL into input field and presses Enter or clicks Preview
- **Progression**: Paste URL → Validate format → Extract gist ID → Fetch data → Show preview
- **Success Criteria**: All valid Gist URL formats are correctly parsed; invalid URLs show helpful error messages

### 2. Gist Data Fetching
- **Functionality**: Fetch gist metadata and file contents from GitHub API
- **Purpose**: Retrieve the actual content to render
- **Trigger**: After successful URL parsing
- **Progression**: Show loading skeleton → Fetch from API → Parse response → Populate file list → Render first HTML file
- **Success Criteria**: Gists load within 2 seconds; rate limiting is handled gracefully; private gist errors are clear

### 3. File Selection
- **Functionality**: Display list of files in gist with ability to select which to preview
- **Purpose**: Multi-file gists need navigation between files
- **Trigger**: Gist with multiple files is loaded
- **Progression**: Display file tabs/dropdown → User clicks file → Update preview → Update URL hash
- **Success Criteria**: File switching is instant; selected file persists in URL for sharing

### 4. Preview Rendering with Content-Based Type Inference
- **Functionality**: Render file contents with appropriate formatting based on **content analysis**, not just file extension
- **Purpose**: Core value proposition - see the gist as a beautifully rendered page, even when file extensions are missing or generic (e.g., `gistfile1.txt`)
- **Trigger**: File is selected (auto-selects first HTML-content file, or first Markdown file, or first available file)
- **Progression**: Analyze content patterns → Infer content type → Apply appropriate renderer → Display in iframe
- **Content Type Inference Logic**:
  - **HTML Detection**: Looks for `<!DOCTYPE html>`, `<html>` tags, or multiple HTML element patterns (`<div>`, `<p>`, `<a>`, etc.)
  - **Markdown Detection**: Looks for headers (`# Title`), links `[text](url)`, code blocks, bold/italic, lists, blockquotes, tables
  - **JSON Detection**: Validates if content parses as valid JSON
  - **CSS Detection**: Looks for selector patterns, `@media`, color values, CSS units
  - **JavaScript Detection**: Looks for `function`, `const`, `let`, arrow functions, common JS patterns
  - **Fallback**: If no patterns match with confidence ≥50%, falls back to extension-based detection, then generic code/text
- **Supported Formats**:
  - **HTML**: Full webpage rendering with associated CSS/JS files from the gist injected
  - **Markdown**: Rendered as formatted HTML with beautiful dark-themed styling
  - **JSON**: Syntax-highlighted with color-coded keys, values, and proper formatting
  - **Code files** (JS, TS, CSS, etc.): Syntax-highlighted with line numbers and language badge
  - **Plain Text**: Clean text display with proper formatting
- **Success Criteria**: Files without extensions render correctly based on content; HTML runs correctly; Markdown is properly formatted; code is readable with highlighting

### 5. Viewport Controls & Fullscreen Mode
- **Functionality**: Toggle between desktop/tablet/mobile viewport sizes, plus a fullscreen mode for immersive preview
- **Purpose**: Test responsive designs within gists; fullscreen allows distraction-free viewing of rendered content
- **Trigger**: User clicks viewport size buttons or fullscreen button
- **Progression**: Click size → Animate iframe resize → Update active state; Click fullscreen → Expand to fill entire viewport → Show floating exit button → Press ESC or click X to exit
- **Success Criteria**: Smooth resize animation; sizes match real device widths; fullscreen covers entire viewport with elegant exit controls

### 6. Recent Gists History
- **Functionality**: Store and display recently viewed gists
- **Purpose**: Quick access to previously viewed gists
- **Trigger**: Successful gist load saves to history; history shown on landing page
- **Trigger**: View landing page or click history icon
- **Progression**: Load history from KV → Display as clickable cards → Click to load gist
- **Success Criteria**: Last 10 gists are remembered; clicking loads instantly

### 7. Share/Copy Link
- **Functionality**: Copy shareable preview URL to clipboard
- **Purpose**: Easy sharing of gist previews
- **Trigger**: User clicks share/copy button
- **Progression**: Click button → Generate URL → Copy to clipboard → Show toast confirmation
- **Success Criteria**: URL copies successfully; toast appears; URL works when shared

---

## Edge Case Handling

- **Invalid URL Format**: Show inline validation error with example of valid formats
- **Gist Not Found (404)**: Display friendly "Gist not found" message with suggestions
- **Private Gist**: Explain that private gists require authentication (not supported)
- **Rate Limited**: Show rate limit message with retry countdown timer
- **Non-HTML Files**: Render with appropriate formatting (Markdown, JSON syntax highlighting, code with line numbers)
- **Empty Gist**: Display "This gist has no files" message
- **Network Error**: Offer retry button with offline-friendly messaging
- **Large Files**: Warn about large file sizes; consider truncation for preview

---

## Design Direction

The design should evoke feelings of **technical precision**, **modern minimalism**, and **developer trust**. Think of tools like Vercel, Linear, or Raycast - clean interfaces that get out of the way while feeling premium. The aesthetic should appeal to developers who appreciate thoughtful design without being flashy or distracting.

---

## Color Selection

A sophisticated dark-mode-first palette with vibrant accents that feel technical yet approachable.

- **Primary Color**: `oklch(0.7 0.15 250)` - A calming blue that communicates reliability and technical competence
- **Secondary Colors**: 
  - `oklch(0.25 0.02 250)` - Deep navy for cards and elevated surfaces
  - `oklch(0.18 0.01 250)` - Near-black for the background, providing depth
- **Accent Color**: `oklch(0.75 0.18 160)` - Vibrant teal/cyan for CTAs, links, and success states - energetic without being aggressive
- **Foreground/Background Pairings**:
  - Background `oklch(0.14 0.01 260)`: Foreground `oklch(0.95 0 0)` - Ratio ~14:1 ✓
  - Card `oklch(0.2 0.02 255)`: Card-foreground `oklch(0.9 0 0)` - Ratio ~10:1 ✓
  - Primary `oklch(0.7 0.15 250)`: Primary-foreground `oklch(0.1 0 0)` - Ratio ~9:1 ✓
  - Accent `oklch(0.75 0.18 160)`: White text `oklch(0.98 0 0)` - Ratio ~5:1 ✓
  - Muted `oklch(0.35 0.02 250)`: Muted-foreground `oklch(0.65 0.02 250)` - Ratio ~4.5:1 ✓

---

## Font Selection

Typography should feel technical and precise while maintaining excellent readability. A combination of a geometric sans-serif for UI elements and a monospace font for code creates clear hierarchy and reinforces the developer-focused nature.

- **Primary Font**: Space Grotesk - Geometric, technical, with character. Used for headings and UI labels.
- **Body Font**: Inter - Clean and highly readable for descriptions and longer text.
- **Code Font**: JetBrains Mono - Industry-standard for code, with ligatures disabled for clarity.

- **Typographic Hierarchy**:
  - H1 (Page Title): Space Grotesk Bold/32px/tight letter-spacing (-0.02em)
  - H2 (Section Headers): Space Grotesk Semibold/24px/tight letter-spacing
  - H3 (Card Titles): Space Grotesk Medium/18px/normal letter-spacing
  - Body: Inter Regular/15px/relaxed line-height (1.6)
  - Code/Mono: JetBrains Mono Regular/14px/normal line-height
  - Caption: Inter Regular/13px/muted color

---

## Animations

Animations should be subtle and functional, enhancing perceived performance and providing feedback without causing distraction. Use spring physics for natural movement and keep durations snappy (150-300ms). Key animation moments:

- **Page Load**: Staggered fade-in of main elements (input, then content area)
- **Input Focus**: Subtle ring glow expansion and border color transition
- **Button Hover/Press**: Scale down slightly (0.98) with shadow reduction
- **Loading State**: Skeleton shimmer animation for content areas
- **Preview Load**: Fade-in with slight upward movement when content appears
- **Viewport Toggle**: Smooth width transition with spring easing
- **Fullscreen Mode**: Smooth fade-in overlay with staggered controls animation; ESC key hint fades in at bottom
- **Toast Notifications**: Slide up from bottom with spring physics
- **File Tab Switch**: Underline slides to active tab

---

## Component Selection

### Components (from shadcn/ui):
- **Input**: URL input field - add `font-mono` class for URL display, custom focus ring matching accent color
- **Button**: Primary actions (Preview, Copy) - use `variant="default"` for primary, `variant="ghost"` for secondary actions
- **Card**: Recent gists display, main preview container - subtle border with hover elevation
- **Tabs**: File selection for multi-file gists - custom underline indicator animation
- **Select**: Viewport size dropdown (mobile alternative to button group)
- **Skeleton**: Loading states - use for preview area and file list during fetch
- **Tooltip**: Icon button labels - consistent 200ms delay
- **Badge**: File type indicators (HTML, CSS, JS) - muted variant with colored dot

### Customizations:
- **PreviewFrame**: Custom iframe wrapper with sandbox attributes, loading detection, and error boundary
- **ViewportToggle**: Button group for desktop/tablet/mobile with animated indicator
- **GistCard**: Recent gist display with favicon, title, truncated description, and timestamp

### States:
- **Buttons**: Default → Hover (slight lift, brighter) → Active (pressed, scale 0.98) → Disabled (50% opacity, no pointer)
- **Input**: Default (muted border) → Focus (accent ring, elevated shadow) → Error (destructive border, shake animation) → Valid (subtle success indicator)
- **Tabs**: Inactive (muted text) → Hover (foreground text) → Active (foreground text, accent underline)

### Icon Selection (Phosphor Icons):
- `Globe` - Preview/render action
- `Code` - View source toggle
- `Copy` - Copy to clipboard
- `Link` - Share/copy link
- `Desktop` / `DeviceTablet` / `DeviceMobile` - Viewport toggles
- `Clock` - Recent gists
- `ArrowRight` - Submit/go
- `X` - Clear input
- `Warning` - Error states
- `Check` - Success confirmation

### Spacing:
- Page padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Section gaps: `gap-8` (32px) between major sections
- Card padding: `p-5` (20px) internal padding
- Button gaps: `gap-2` (8px) between icon and text
- Input height: `h-12` (48px) for primary input

### Mobile:
- Single column layout below 768px
- Viewport toggle becomes dropdown select
- File tabs become horizontal scroll or select dropdown
- Preview iframe fills available width
- Recent gists stack vertically as smaller cards
- Touch targets minimum 44px

---

## Technical Architecture

### Data Flow
```
URL Input → Parse → Fetch GitHub API → Store in State → Render Preview
                                      ↓
                              Save to Recent (KV)
```

### API Integration
- Endpoint: `https://api.github.com/gists/{gist_id}`
- No authentication required for public gists
- Rate limit: 60 requests/hour for unauthenticated

### State Management
- `useState` for UI state (loading, selected file, viewport size)
- `useKV` for persistent state (recent gists history)

### Security Considerations
- Iframe sandbox: `allow-scripts allow-same-origin` (minimal permissions)
- CSP headers for injected content
- No execution of gist JS in main window context

---

## File Structure

```
src/
├── App.tsx                 # Main app component with routing logic
├── components/
│   ├── GistInput.tsx       # URL input with validation
│   ├── GistPreview.tsx     # Main preview container
│   ├── PreviewFrame.tsx    # Sandboxed iframe wrapper
│   ├── FileSelector.tsx    # File tabs/dropdown with inferred type badges
│   ├── ViewportToggle.tsx  # Device size buttons
│   ├── RecentGists.tsx     # History display
│   └── GistCard.tsx        # Individual gist card
├── hooks/
│   ├── useGist.ts          # Gist fetching logic with smart file selection
│   └── useRecentGists.ts   # Recent gists with KV
├── lib/
│   ├── parseGistUrl.ts     # URL parsing utilities
│   ├── gistApi.ts          # GitHub API client
│   ├── contentRenderer.ts  # File content rendering (HTML, Markdown, JSON, code)
│   ├── contentTypeInference.ts  # Content-based file type inference engine
│   └── utils.ts            # General utilities
└── index.css               # Theme and custom styles
```
