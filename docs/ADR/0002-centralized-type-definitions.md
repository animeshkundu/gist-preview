# ADR-0002: Centralized Type Definitions

## Status
Accepted

## Date
2024-12-18

## Context
TypeScript type definitions for core data structures (GistData, InferredContentType, ParseResult) were previously scattered across implementation files in `src/lib/`. This pattern had several drawbacks:

1. **Code Organization**: Type definitions mixed with implementation logic made files harder to navigate
2. **Import Verbosity**: Consumers had to import types from implementation modules (e.g., `from '@/lib/gistApi'`) rather than a dedicated types location
3. **Maintenance**: Changes to type definitions required editing implementation files
4. **Discoverability**: No central location to view all shared types in the application

## Decision
We have created a centralized `src/types/` directory with the following structure:

```
src/types/
├── index.ts       # Barrel export for all types
├── gist.ts        # GitHub Gist API types
├── content.ts     # Content type inference types
└── parser.ts      # URL parsing result types
```

### Implementation Details

1. **Type Files**: Each file in `src/types/` contains related type definitions with documentation
2. **Barrel Export**: `src/types/index.ts` re-exports all types for convenient imports
3. **Backward Compatibility**: Original lib files re-export types to maintain compatibility with existing code
4. **Import Pattern**: New code should use `import type { ... } from '@/types'`

### Type Organization

- **gist.ts**: GitHub Gist API response types (GistFile, GistData, GistApiResult, etc.)
- **content.ts**: Content type inference types (InferredContentType, ContentTypeResult)
- **parser.ts**: URL parsing result types (ParseResult, ParseSuccess, ParseError)

## Consequences

### Positive
- **Single Source of Truth**: All shared types defined in one location
- **Better IDE Support**: Type-only imports improve autocomplete and navigation
- **Cleaner Code**: Implementation files are more focused on logic
- **Easier Refactoring**: Type changes centralized in dedicated files
- **Self-Documenting**: Types directory clearly shows application's data model

### Neutral
- **Migration Path**: Existing imports from lib files still work via re-exports
- **Two Ways to Import**: Types can be imported from `@/types` (preferred) or original locations

### Negative
- **Additional Directory**: Adds one more directory to the project structure
- **Learning Curve**: New contributors must learn to import from `@/types`

## Alternatives Considered

1. **Keep types with implementations**: Rejected - reduces code organization
2. **Single types.ts file**: Rejected - would become too large as project grows
3. **types/ subdirectories per feature**: Rejected - overkill for current project size

## Migration Notes

Existing code using the old import pattern will continue to work:
```typescript
// Old pattern (still works)
import { GistData } from '@/lib/gistApi';

// New pattern (preferred)
import type { GistData } from '@/types';
```

New code should use the `@/types` import pattern for consistency.
