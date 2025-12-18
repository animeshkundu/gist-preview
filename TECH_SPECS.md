# GistPreview - Technical Specifications

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        GistPreview App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  URL Input   │───▶│  URL Parser  │───▶│  Gist Fetcher    │  │
│  │  Component   │    │  (lib)       │    │  (hook)          │  │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘  │
│                                                    │            │
│                                                    ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Recent      │◀───│  KV Storage  │◀───│  Gist State      │  │
│  │  Gists       │    │  (persist)   │    │  (context)       │  │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘  │
│                                                    │            │
│                                                    ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Viewport    │───▶│  Preview     │◀───│  File Selector   │  │
│  │  Toggle      │    │  Frame       │    │  (tabs)          │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  GitHub Gist API │
                    │  (external)      │
                    └──────────────────┘
```

### Component Hierarchy

```
App
├── Header (logo, nav)
├── GistInput (URL input form)
├── GistPreview (main content area)
│   ├── FileSelector (tabs for files)
│   ├── ViewportToggle (device sizes)
│   ├── PreviewFrame (sandboxed iframe)
│   └── ActionBar (copy, share buttons)
├── RecentGists (history sidebar/section)
│   └── GistCard[] (individual gist cards)
└── Toaster (notifications)
```

---

## Detailed Design

### 1. URL Parsing Module (`lib/parseGistUrl.ts`)

**Purpose**: Extract gist ID from various URL formats

**Supported Formats**:
```
https://gist.github.com/username/abc123def456
https://gist.github.com/abc123def456
gist.github.com/username/abc123def456
abc123def456 (raw ID - 32 hex characters)
```

**Interface**:
```typescript
interface ParseResult {
  success: true;
  gistId: string;
  username?: string;
} | {
  success: false;
  error: string;
}

function parseGistUrl(input: string): ParseResult
```

**Validation Rules**:
- Gist IDs are 32 hexadecimal characters (or 20 for older gists)
- Username is optional in URL
- Strip whitespace and protocol variations

---

### 2. Gist API Module (`lib/gistApi.ts`)

**Purpose**: Fetch gist data from GitHub API

**Endpoint**: `GET https://api.github.com/gists/{gist_id}`

**Response Interface**:
```typescript
interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content: string;
}

interface GistData {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

interface GistApiResult {
  success: true;
  data: GistData;
} | {
  success: false;
  error: string;
  status?: number;
}

async function fetchGist(gistId: string): Promise<GistApiResult>
```

**Error Handling**:
- 404: "Gist not found"
- 403: "Rate limited" or "Private gist"
- Network error: "Unable to connect"

---

### 3. useGist Hook (`hooks/useGist.ts`)

**Purpose**: Manage gist fetching state and caching

**Interface**:
```typescript
interface UseGistReturn {
  gist: GistData | null;
  loading: boolean;
  error: string | null;
  fetchGist: (gistId: string) => Promise<void>;
  selectedFile: string | null;
  setSelectedFile: (filename: string) => void;
  files: GistFile[];
}

function useGist(): UseGistReturn
```

**Behavior**:
- Auto-select first HTML file, or first file if no HTML
- Cache fetched gists in memory for session
- Clear error on new fetch attempt

---

### 4. useRecentGists Hook (`hooks/useRecentGists.ts`)

**Purpose**: Persist recently viewed gists

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
  clearRecent: () => void;
}

function useRecentGists(): UseRecentGistsReturn
```

**Behavior**:
- Store max 10 recent gists
- Most recent first
- Deduplicate by gist ID (move to top if revisited)

---

### 5. PreviewFrame Component

**Purpose**: Safely render gist content in isolated iframe

**Implementation**:
```typescript
interface PreviewFrameProps {
  content: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}
```

**Security**:
- Sandbox attributes: `allow-scripts`
- Use `srcdoc` for content injection
- No `allow-same-origin` to prevent escape

**Content Assembly**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>{css_content}</style>
</head>
<body>
  {html_content}
  <script>{js_content}</script>
</body>
</html>
```

**Viewport Sizes**:
- Desktop: 100% width
- Tablet: 768px
- Mobile: 375px

---

### 6. State Management

**App-level State** (useState):
```typescript
interface AppState {
  view: 'landing' | 'preview';
  gistId: string | null;
  inputValue: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}
```

**Persistent State** (useKV):
```typescript
// Key: 'recent-gists'
// Value: RecentGist[]
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up index.html with fonts (Space Grotesk, Inter, JetBrains Mono)
- [ ] Configure color theme in index.css
- [ ] Create parseGistUrl utility
- [ ] Create gistApi utility
- [ ] Create basic App structure

### Phase 2: Core Components
- [ ] Build GistInput component with validation
- [ ] Build useGist hook
- [ ] Build FileSelector component
- [ ] Build PreviewFrame component
- [ ] Build ViewportToggle component

### Phase 3: History & Polish
- [ ] Build useRecentGists hook
- [ ] Build RecentGists component
- [ ] Build GistCard component
- [ ] Add copy/share functionality
- [ ] Add loading skeletons

### Phase 4: Animation & UX
- [ ] Add framer-motion animations
- [ ] Add toast notifications
- [ ] Add error states
- [ ] Mobile responsive adjustments

### Phase 5: Testing & Refinement
- [ ] Test various gist formats
- [ ] Test error scenarios
- [ ] Test mobile experience
- [ ] Performance optimization

---

## API Rate Limiting Strategy

GitHub API allows 60 requests/hour for unauthenticated requests.

**Mitigation**:
1. Cache gist data in memory during session
2. Show clear rate limit message with reset time
3. Encourage users to wait or try different gist

**Rate Limit Response**:
```json
{
  "message": "API rate limit exceeded",
  "documentation_url": "..."
}
```

Headers to check:
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (Unix timestamp)

---

## Browser Compatibility

Target: Modern browsers (last 2 versions)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Required APIs:
- Fetch API
- ES2020+ features
- CSS Custom Properties
- CSS Grid/Flexbox
