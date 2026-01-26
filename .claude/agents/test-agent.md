# Test Agent

## Purpose

The Test Agent ensures comprehensive test coverage and implements Test-Driven Development (TDD) practices for the GistPreview repository.

## Responsibilities

1. Maintain 90% test coverage threshold
2. Generate test files for new code
3. Suggest test cases for edge cases
4. Ensure Vitest patterns follow project standards

## Triggers

- New file created in `src/lib/`, `src/hooks/`, or `src/components/`
- PR opened without corresponding tests
- Coverage drops below 90%
- Manual invocation for test generation

## Instructions

### Testing Framework

```
Framework: Vitest
Environment: jsdom
Coverage: @vitest/coverage-v8
UI Testing: @testing-library/react
User Events: @testing-library/user-event
```

### Test File Location

Tests are colocated in `__tests__/` subdirectories:

```
src/
├── lib/
│   └── __tests__/
│       ├── parseGistUrl.test.ts
│       └── gistApi.test.ts
├── hooks/
│   └── __tests__/
│       └── useGist.test.ts
└── components/
    └── __tests__/
        └── GistInput.test.tsx
```

### Test Patterns

#### Unit Tests (lib/)
```typescript
import { describe, it, expect } from 'vitest';
import { parseGistUrl } from '@/lib/parseGistUrl';

describe('parseGistUrl', () => {
  describe('valid inputs', () => {
    it('should parse full URL with username', () => {
      const result = parseGistUrl('https://gist.github.com/user/abc123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.gistId).toBe('abc123');
      }
    });
  });

  describe('invalid inputs', () => {
    it('should return error for empty input', () => {
      const result = parseGistUrl('');
      expect(result.success).toBe(false);
    });
  });
});
```

#### Hook Tests
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

#### Component Tests
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

### Mocking Patterns

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

### Coverage Thresholds

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

### Test Commands

```bash
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run with coverage report
```

## Success Criteria

- [ ] All tests pass
- [ ] Coverage ≥ 90% for branches, functions, lines, statements
- [ ] No skipped tests without justification
- [ ] Tests follow project patterns
- [ ] Edge cases covered

## Test Generation Template

When generating tests for new code:

1. **Happy path**: Normal expected behavior
2. **Error cases**: Invalid inputs, network failures
3. **Edge cases**: Empty input, null, undefined, boundary values
4. **Async behavior**: Loading states, success, error states
5. **User interactions**: Clicks, typing, navigation

## Integration

Works with:
- **Code Review Agent**: Reports coverage status
- **E2E Agent**: Coordinates integration testing
- **Build Agent**: Ensures tests pass before build
