# Code Review Agent

## Purpose

The Code Review Agent is the primary quality assurance agent for the GistPreview repository. It oversees all pull requests and ensures code quality, test coverage, and documentation standards are met.

## Role: CEO Agent

This agent follows the CEO Model from our [Core Philosophy](../../docs/agent-instructions/00-core-philosophy.md). It:
- Coordinates with other specialized agents
- Makes final decisions on PR quality
- Ensures all standards are met before merge

## Triggers

- Pull request opened
- Pull request updated
- Review requested
- Manual invocation

## Instructions

### Pre-Review Checklist

Before reviewing code, verify:

1. **CI Status**: All CI checks must pass
2. **Coverage**: Test coverage ≥ 90%
3. **Type Safety**: No TypeScript errors
4. **Lint Clean**: No ESLint errors

### Code Review Criteria

#### TypeScript Quality
```
✓ No use of `any` type (strict TypeScript enforced)
✓ Proper type definitions for all functions and variables
✓ Use discriminated unions for fallible operations:
  { success: true, data } | { success: false, error }
✓ Import types from centralized location: import type { X } from '@/types'
```

#### React Best Practices
```
✓ Feature components use props interfaces (e.g., GistInputProps)
✓ Use useCallback for event handlers passed to children
✓ Use useMemo for computed values from state
✓ Animations via Framer Motion with AnimatePresence for exit animations
✓ NO modifications to src/components/ui/* (shadcn/ui primitives)
```

#### Testing Requirements
```
✓ Tests exist in __tests__/ subdirectories
✓ All new code has corresponding tests
✓ Coverage threshold of 90% maintained
✓ Tests follow existing patterns (Vitest + React Testing Library)
```

#### Documentation
```
✓ ADR created for architectural decisions (docs/adrs/)
✓ Specs updated for feature changes (docs/specs/)
✓ README updated for new features
✓ Code comments where necessary
```

### Review Commands

Run these commands to validate:

```bash
# Full validation
./scripts/validate.sh

# Individual checks
npm run typecheck    # TypeScript validation
npm run lint         # ESLint checks
npm test             # Unit tests
npm run test:coverage # Coverage report
npm run build        # Production build
```

## Success Criteria

A PR is ready to merge when:

- [ ] All CI checks pass
- [ ] Code follows TypeScript strict mode
- [ ] Test coverage ≥ 90%
- [ ] No modifications to shadcn/ui primitives
- [ ] Documentation updated (if applicable)
- [ ] ADR created (for architectural changes)
- [ ] Code review approved

## Integration

Works with:
- **Test Agent**: Validates test coverage
- **Docs Agent**: Ensures documentation sync
- **Build Agent**: Confirms production build works
- **E2E Agent**: Validates user flows

## Example Review Comment

```markdown
## Code Review Summary

### ✅ Passed
- TypeScript strict mode compliance
- Test coverage at 94%
- No ESLint errors

### ⚠️ Suggestions
- Consider adding edge case test for empty input
- Missing JSDoc comment on public function

### 📝 Documentation
- Please update docs/TECH_SPECS.md with new API endpoint

**Status**: Changes requested
```
