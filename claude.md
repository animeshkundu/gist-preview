# GistPreview - Claude AI Instructions

This is an AI-Enabled repository optimized for Agentic Coding. All AI agents must follow the protocols defined in this repository.

## Critical Instructions for AI Agents

**Before answering ANY request, you MUST:**

1. **Read agent instructions** in `docs/agent-instructions/`
   - [00-core-philosophy.md](docs/agent-instructions/00-core-philosophy.md) - Foundational principles
   - [01-research-and-web.md](docs/agent-instructions/01-research-and-web.md) - Research protocols
   - [02-testing-and-validation.md](docs/agent-instructions/02-testing-and-validation.md) - Testing requirements
   - [03-tooling-and-pipelines.md](docs/agent-instructions/03-tooling-and-pipelines.md) - Automation guidelines

2. **Check ADRs** in `docs/adrs/` for past decisions to avoid regression

3. **If you modify code**, you MUST update:
   - The corresponding Spec in `docs/specs/`
   - Architecture docs in `docs/architecture/` if system design changes
   - History in `docs/history/` after work is complete

4. **If you are unsure**, search the internet. Do not hallucinate APIs.

5. **Run validation** before committing: `./scripts/validate.sh`

---

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

**Key Pattern**: Content type is inferred from file *content*, not just extension. See [contentTypeInference.ts](src/lib/contentTypeInference.ts) for pattern-based detection.

## Documentation Structure

```
docs/
├── adrs/              # Architecture Decision Records
├── specs/             # Technical Specifications
├── architecture/      # System diagrams (Mermaid.js)
├── history/           # Handoffs and deprecated patterns
├── agent-instructions/# AI Agent operating protocols
├── PRD.md             # Product Requirements Document
├── TECH_SPECS.md      # Comprehensive technical specs
└── AGENT.md           # Agent quick reference
```

## Development Commands

```bash
npm run dev          # Start dev server (port 5000)
npm run typecheck    # TypeScript validation (run before commits)
npm run lint         # ESLint checks
npm test             # Run tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report (90% threshold enforced)
npm run build        # Production build
./scripts/validate.sh # Full validation (typecheck + lint + test + coverage)
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

## Testing Requirements

**Location**: Tests are colocated in `__tests__/` subdirectories

**Coverage**: Minimum 90% for branches, functions, lines, and statements

**Mocking**:
- `localStorage` is mocked in [setup.ts](src/__tests__/setup.ts)
- Mock `fetch`, `navigator.clipboard`, and `window.matchMedia` are pre-configured

## CI Pipeline

GitHub Actions runs: typecheck → lint → test → coverage → build. All must pass. Coverage threshold is 90%.

## Things to Avoid

- ❌ Don't modify files in `src/components/ui/` - these are shadcn/ui primitives
- ❌ Don't use `any` type - strict TypeScript is enforced
- ❌ Don't skip tests - coverage thresholds will fail CI
- ❌ Don't commit without running `./scripts/validate.sh`
- ❌ Don't write code without updating documentation first
