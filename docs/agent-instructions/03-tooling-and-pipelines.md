# Tooling and Pipelines Protocol

This document defines how AI agents should create tools, automate tasks, and work with CI/CD pipelines.

## 1. Tool Creation Philosophy

**If you perform a verification task twice, you MUST write a script for it.**

### The Rule of Two

1. First time: Perform manually, note the steps
2. Second time: Recognize the pattern, create a script
3. Third time onwards: Run the script

### Script Location

```
scripts/
├── validate.sh        # Primary validation script (lint, test, build)
├── check-coverage.sh  # Quick coverage check
├── setup-dev.sh       # Development environment setup
└── [task].sh          # Additional automation scripts
```

### Script Requirements

Every script must:
- Have a clear purpose documented at the top
- Exit with appropriate codes (0 for success, non-zero for failure)
- Provide helpful output for debugging
- Be idempotent (safe to run multiple times)

**Template:**
```bash
#!/bin/bash
# Purpose: [What this script does]
# Usage: ./scripts/[name].sh
# Exit codes:
#   0 - Success
#   1 - Failure

set -e  # Exit on error

echo "🔍 [Step description]..."
# Command here

echo "✅ [Success message]"
```

## 2. Primary Validation Script

The `./scripts/validate.sh` script is the primary tool for self-validation:

```bash
#!/bin/bash
# Primary validation script for AI agents
# Run this before committing ANY code changes

set -e

echo "🔍 Running TypeScript type check..."
npm run typecheck

echo "🔍 Running ESLint..."
npm run lint

echo "🔍 Running tests..."
npm test

echo "🔍 Checking coverage..."
npm run test:coverage

echo "✅ All validations passed!"
```

### When to Run

- **Always** before committing
- After making any code changes
- Before opening a PR
- After resolving merge conflicts

## 3. CI/CD Pipeline

### GitHub Actions Workflow

The repository uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/ci.yml`.

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CI/CD Pipeline                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │  Checkout  │───▶│ Setup Node │───▶│  Install   │───▶│  Type   │ │
│  │            │    │   (20.x)   │    │ (npm ci)   │    │  Check  │ │
│  └────────────┘    └────────────┘    └────────────┘    └────┬────┘ │
│                                                              │      │
│                                                              ▼      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │   Build    │◀───│  Coverage  │◀───│   Test     │◀───│  Lint   │ │
│  │            │    │   (90%+)   │    │            │    │         │ │
│  └─────┬──────┘    └────────────┘    └────────────┘    └─────────┘ │
│        │                                                            │
│        ▼                                                            │
│  ┌────────────┐    ┌────────────┐                                   │
│  │  Deploy    │───▶│  GitHub    │                                   │
│  │ (if main)  │    │   Pages    │                                   │
│  └────────────┘    └────────────┘                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### CI Failure Response

When CI fails:
1. Read the error message from the workflow logs
2. Identify which step failed
3. Run the same command locally to reproduce
4. Fix the issue
5. Run `./scripts/validate.sh` locally
6. Push the fix

## 4. Development Tooling

### TypeScript

**Purpose**: Static type checking
**Command**: `npm run typecheck`
**Config**: `tsconfig.json`

Type errors must be fixed, not ignored:
- ❌ Don't use `any`
- ❌ Don't use `// @ts-ignore`
- ✅ Define proper types
- ✅ Use generics where appropriate

### ESLint

**Purpose**: Code quality and consistency
**Command**: `npm run lint`
**Config**: `eslint.config.js`

Key rules:
- React hooks rules enforced
- Unused variables flagged
- Import ordering

### Vitest

**Purpose**: Unit and integration testing
**Commands**:
- `npm test` - Run once
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - With coverage

**Config**: `vitest.config.ts`

### Vite

**Purpose**: Build and development server
**Commands**:
- `npm run dev` - Development server (port 5000)
- `npm run build` - Production build

**Config**: `vite.config.ts`

## 5. Dependency Management

### Adding Dependencies

Before adding a dependency:
1. **Search for alternatives** - Is there a smaller/better option?
2. **Check security** - Are there known vulnerabilities?
3. **Verify maintenance** - Is the package actively maintained?
4. **Check bundle size** - What's the impact on build size?

### Commands

```bash
# Add production dependency
npm install [package-name]

# Add dev dependency
npm install --save-dev [package-name]

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
```

### Documenting Dependencies

When adding a new dependency, update `docs/specs/` or create an ADR explaining:
- Why this dependency was chosen
- What alternatives were considered
- Any configuration required

## 6. Common Development Tasks

### Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm test` |
| Test (watch) | `npm run test:watch` |
| Test (coverage) | `npm run test:coverage` |
| Build | `npm run build` |
| Full validation | `./scripts/validate.sh` |

### Development Workflow

```bash
# 1. Start development
npm run dev

# 2. Make changes...

# 3. Validate before commit
./scripts/validate.sh

# 4. If tests fail, run in watch mode to iterate
npm run test:watch

# 5. Once passing, commit
git add .
git commit -m "feat: description"
```

## 7. Creating New Scripts

When creating a new automation script:

### 1. Identify the Pattern
What task is being repeated?

### 2. Document the Steps
Write down each step manually performed.

### 3. Create the Script
```bash
#!/bin/bash
# scripts/[task-name].sh
# Purpose: [Description]
# Usage: ./scripts/[task-name].sh [args]

set -e

# Step 1
echo "📋 [Step 1 description]..."
# commands

# Step 2
echo "📋 [Step 2 description]..."
# commands

echo "✅ Done!"
```

### 4. Make Executable
```bash
chmod +x scripts/[task-name].sh
```

### 5. Document
Add to the README or this document.

## 8. Debugging Tools

### Browser DevTools
- Use React DevTools for component debugging
- Use Network tab for API issues
- Use Console for runtime errors

### Node.js Debugging
```bash
# Debug tests
npm run test -- --inspect-brk

# Debug build
npm run build -- --debug
```

### Logging
```typescript
// Development logging (remove before commit)
console.log('[DEBUG]', variable);

// Production logging (keep)
console.error('[Error]', error);
```

## 9. Tool Creation Checklist

Before creating a new tool/script:

- [ ] Is this task performed more than once?
- [ ] Does a similar tool already exist?
- [ ] Can existing tools be extended instead?
- [ ] Is the tool idempotent?
- [ ] Does the tool have proper error handling?
- [ ] Is the tool documented?
- [ ] Is the tool tested (if complex)?
