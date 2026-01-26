# Testing and Validation Protocol

This document defines the mandatory testing requirements and self-validation procedures for all AI agents working on this repository.

## 1. The 90% Rule

**All code changes must maintain a minimum of 90% code coverage for Unit and Integration tests.**

### Coverage Thresholds (Enforced by CI)

| Metric | Minimum |
|--------|---------|
| Branches | 90% |
| Functions | 90% |
| Lines | 90% |
| Statements | 90% |

### What This Means in Practice

- Every new function needs tests
- Every branch (if/else, switch cases) needs coverage
- Every error path needs validation
- No "test later" exceptions

## 2. Test-Driven Development (TDD)

**Agents must write the test *before* or *with* the implementation.**

### TDD Workflow

```
1. Write a failing test that defines expected behavior
2. Run the test to confirm it fails
3. Write the minimum code to make the test pass
4. Run the test to confirm it passes
5. Refactor if needed (tests should still pass)
6. Repeat for next behavior
```

### Why TDD Matters for AI Agents

- **Prevents hallucination**: Tests define real behavior
- **Ensures correctness**: Code must satisfy the test
- **Documents intent**: Tests explain what code should do
- **Enables refactoring**: Safe to change code with tests

## 3. Test Categories

### Unit Tests (`*.test.ts`, `*.test.tsx`)

Test individual functions, hooks, and components in isolation.

**Location**: `src/[module]/__tests__/[file].test.ts`

**Example Structure**:
```typescript
describe('parseGistUrl', () => {
  describe('valid inputs', () => {
    it('should parse full URL with username', () => {
      const result = parseGistUrl('https://gist.github.com/user/abc123');
      expect(result.success).toBe(true);
      expect(result.gistId).toBe('abc123');
    });
  });

  describe('invalid inputs', () => {
    it('should return error for empty input', () => {
      const result = parseGistUrl('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Please enter');
    });
  });
});
```

### Integration Tests

Test how multiple units work together.

**Focus Areas**:
- Hook + API interactions
- Component + State interactions
- Data flow through multiple modules

### Component Tests

Test React components with React Testing Library.

**Best Practices**:
```typescript
// Good: Test behavior, not implementation
await user.click(screen.getByRole('button', { name: /submit/i }));
expect(screen.getByText(/success/i)).toBeInTheDocument();

// Bad: Test implementation details
expect(component.state.isSubmitting).toBe(true);
```

## 4. Self-Correction Workflow

Before committing ANY code change, agents must:

### Step 1: Run the Validation Script
```bash
./scripts/validate.sh
```

This script runs:
1. TypeScript type checking (`npm run typecheck`)
2. ESLint linting (`npm run lint`)
3. All tests (`npm test`)
4. Coverage check (`npm run test:coverage`)

### Step 2: Review Test Output

If tests fail:
1. Read the error message carefully
2. Identify which test failed
3. Fix the code (not the test, unless the test was wrong)
4. Re-run validation

### Step 3: Review Coverage Report

If coverage is below 90%:
1. Identify uncovered lines (see coverage report)
2. Add tests for uncovered branches
3. Re-run coverage check

### Step 4: Commit Only on Success

**Never commit code that fails validation.**

## 5. Testing Patterns for This Repository

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGist } from '@/hooks/useGist';

describe('useGist', () => {
  it('should load gist data', async () => {
    const { result } = renderHook(() => useGist());
    
    await act(async () => {
      await result.current.loadGist('abc123');
    });
    
    expect(result.current.gist).not.toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GistInput } from '@/components/GistInput';

describe('GistInput', () => {
  it('should show error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<GistInput onSubmit={vi.fn()} />);
    
    await user.type(screen.getByRole('textbox'), 'invalid-url');
    await user.click(screen.getByRole('button', { name: /preview/i }));
    
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });
});
```

### Testing Lib Functions

```typescript
import { inferContentType } from '@/lib/contentTypeInference';

describe('inferContentType', () => {
  it('should detect HTML content', () => {
    const content = '<!DOCTYPE html><html><body>Hello</body></html>';
    expect(inferContentType(content, 'unknown.txt')).toBe('html');
  });
});
```

### Mocking External Dependencies

```typescript
// Mock fetch
vi.mocked(global.fetch).mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve({ id: 'abc123', files: {} }),
} as Response);

// Mock localStorage (already in setup.ts)
// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button' },
  AnimatePresence: ({ children }) => children,
}));
```

## 6. Test File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `[name].test.ts` | `parseGistUrl.test.ts` |
| Component test | `[Component].test.tsx` | `GistInput.test.tsx` |
| Integration test | `[feature].integration.test.ts` | `gistFlow.integration.test.ts` |

## 7. Test Commands Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## 8. What to Test Checklist

For every code change, ensure:

- [ ] Happy path is tested
- [ ] Error cases are tested
- [ ] Edge cases are tested (empty input, null, undefined)
- [ ] Boundary conditions are tested (min/max values)
- [ ] Async behavior is tested (loading, success, error states)
- [ ] User interactions are tested (clicks, typing, navigation)
- [ ] Accessibility is considered (roles, labels)

## 9. Common Testing Mistakes to Avoid

❌ **Testing implementation details** - Test behavior, not internals
❌ **Snapshot testing without understanding** - Snapshots should be intentional
❌ **Ignoring async behavior** - Always await async operations
❌ **Not cleaning up** - Use proper cleanup in beforeEach/afterEach
❌ **Testing too many things at once** - Each test should verify one behavior
❌ **Duplicating test setup** - Use describe blocks and beforeEach
