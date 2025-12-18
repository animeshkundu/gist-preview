# Copilot Instructions for GistPreview

## Project Overview

GistPreview is a React 19 + TypeScript app that renders GitHub Gists as beautifully formatted web pages. Built with Vite, Tailwind CSS 4.1, and shadcn/ui components.

## Architecture

```
src/
├── components/     # Feature components (GistInput, GistPreview, PreviewFrame, etc.)
│   └── ui/         # shadcn/ui primitives (DO NOT modify directly)
├── hooks/          # Custom React hooks (useGist, useRecentGists)
├── lib/            # Pure utility modules (parseGistUrl, gistApi, contentRenderer, contentTypeInference)
├── types/          # Centralized TypeScript type definitions
│   ├── index.ts    # Barrel export for all types
│   ├── gist.ts     # GitHub Gist API types
│   ├── content.ts  # Content type inference types
│   └── parser.ts   # URL parsing result types
└── __tests__/      # Test setup with global mocks
```

**Data Flow**: `GistInput` → `parseGistUrl` → `useGist.loadGist()` → `gistApi.fetchGist()` → `GistPreview` → `PreviewFrame` (sandboxed iframe)

**Key Pattern**: Content type is inferred from file *content*, not just extension. See [contentTypeInference.ts](src/lib/contentTypeInference.ts) for pattern-based detection of HTML, Markdown, JSON, CSS, JavaScript.

## Development Commands

```bash
npm run dev          # Start dev server (port 5000)
npm run typecheck    # TypeScript validation (run before commits)
npm run lint         # ESLint checks
npm test             # Run tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report (90% threshold enforced)
npm run build        # Production build
```

## Code Conventions

### Imports
- Use `@/` path alias for all src imports: `import { Button } from '@/components/ui/button'`
- Import types from centralized location: `import type { GistData } from '@/types'`
- Icons from `@phosphor-icons/react` with explicit weight prop

### Components
- Feature components use props interfaces (e.g., `GistInputProps`)
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for computed values from state
- Animations via Framer Motion with `AnimatePresence` for exit animations

### Lib Modules
- Return discriminated union types for operations: `{ success: true, data } | { success: false, error }`
- See [gistApi.ts](src/lib/gistApi.ts) and [parseGistUrl.ts](src/lib/parseGistUrl.ts) for examples

### Styling
- Tailwind classes directly in JSX
- Use `cn()` from `@/lib/utils` to merge conditional classes
- Dark theme only (no theme switching)

## Testing Patterns

**Location**: Tests are colocated in `__tests__/` subdirectories (e.g., `src/hooks/__tests__/useGist.test.ts`)

**Mocking**:
- `localStorage` is mocked in [setup.ts](src/__tests__/setup.ts)
- Mock `fetch`, `navigator.clipboard`, and `window.matchMedia` are pre-configured
- Mock API calls with `vi.mocked(gistApi.fetchGist).mockResolvedValueOnce(...)`
- Mock Framer Motion in component tests: `vi.mock('framer-motion', () => ({ motion: { div: 'div' }, AnimatePresence: ... }))`

**Hook Testing**:
```typescript
const { result } = renderHook(() => useGist());
await act(async () => {
  await result.current.loadGist('abc123');
});
expect(result.current.gist).not.toBeNull();
```

## Key Integrations

- **GitHub Gist API**: Unauthenticated, 60 req/hour limit. Handle 403 (rate limit) and 404 (not found) gracefully.
- **localStorage**: Recent gists persistence via `useRecentGists` hook.
- **html2canvas**: Screenshot capture with clipboard fallback to file download.

## CI Pipeline

GitHub Actions runs: typecheck → lint → test → coverage → build. All must pass. Coverage threshold is 90% for branches/functions/lines/statements.

## Things to Avoid

- Don't modify files in `src/components/ui/` - these are shadcn/ui primitives
- Don't use `any` type - strict TypeScript is enforced
- Don't skip tests for new lib/hook code - coverage thresholds will fail CI
