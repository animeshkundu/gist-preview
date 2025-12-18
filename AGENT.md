# Agent Instructions

Guidelines for AI coding agents working on this repository.

## Before Starting Work

1. **Read relevant documentation** in `docs/` directory:
   - [docs/PRD.md](docs/PRD.md) - Product requirements and design decisions
   - [docs/TECH_SPECS.md](docs/TECH_SPECS.md) - Technical architecture and implementation details

2. **Understand the codebase** via [.github/copilot-instructions.md](.github/copilot-instructions.md)

## During Development

### Code Changes
- Follow existing patterns in the codebase (see `src/lib/` and `src/hooks/` for examples)
- Use `@/` import alias for all `src/` imports
- Return discriminated unions for fallible operations: `{ success: true, data } | { success: false, error }`

### Testing Requirements
- **Add or update unit tests** for any new/changed code in `lib/`, `hooks/`, or `components/`
- Tests live in `__tests__/` subdirectories (e.g., `src/lib/__tests__/parseGistUrl.test.ts`)
- Coverage threshold is **90%** - CI will fail if not met

### Validation Checklist
Run these commands and ensure they pass before considering work complete:

```bash
npm run typecheck    # TypeScript validation
npm run lint         # ESLint checks  
npm test             # Unit tests
npm run build        # Production build
```

## Architecture Decision Records

When making significant architectural decisions, create an ADR in `docs/ADR/`:

```
docs/ADR/
├── 0001-content-type-inference.md
├── 0002-your-decision-title.md
└── ...
```

**ADR Template:**
```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or harder as a result of this change?
```

Create an ADR when:
- Adding new dependencies
- Changing data flow or state management patterns
- Modifying API contracts or interfaces
- Introducing new architectural patterns

## Documentation Updates

Update documentation when:
- Adding new features → Update `README.md` and `docs/PRD.md`
- Changing technical architecture → Update `docs/TECH_SPECS.md`
- Modifying developer workflows → Update `.github/copilot-instructions.md`
- Adding new components/hooks → Add JSDoc comments and update relevant docs

## Things to Avoid

- Don't modify `src/components/ui/*` - these are shadcn/ui primitives
- Don't use `any` type - strict TypeScript is enforced
- Don't skip tests - coverage thresholds will fail CI
- Don't commit without running the validation checklist
