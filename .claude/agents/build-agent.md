# Build Agent

## Purpose

The Build Agent optimizes the build pipeline, monitors performance, and ensures production builds work correctly.

## Responsibilities

1. Validate Vite build configuration
2. Check bundle size for regressions
3. Run optimization analysis
4. Monitor Tailwind CSS purging efficiency
5. Test production builds

## Triggers

- PR opened with dependency changes
- Build configuration modified
- Performance regression detected
- Manual invocation
- Pre-release builds

## Instructions

### Build Configuration

```
Build Tool: Vite 7
TypeScript: tsc -b && vite build
Styles: Tailwind CSS 4.1 with @tailwindcss/vite
Output: dist/
```

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Optimize dependencies
npm run optimize
```

### Pre-Build Validation

Before building, ensure:

```bash
# TypeScript check
npm run typecheck

# Lint check
npm run lint

# Tests pass
npm test
```

### Build Analysis

#### Bundle Size Monitoring

Check for bundle size regressions:

```bash
# Build and analyze
npm run build

# Check dist/ folder size
du -sh dist/

# List largest files
ls -lhS dist/assets/
```

#### Performance Targets

| Metric | Target | Max |
|--------|--------|-----|
| Initial JS Bundle | < 200KB | 300KB |
| CSS Bundle | < 50KB | 75KB |
| First Contentful Paint | < 1.5s | 2s |
| Time to Interactive | < 3s | 4s |

### Vite Configuration

Key configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### Tailwind CSS Optimization

Ensure proper purging in production:

```javascript
// tailwind.config.js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],
```

### Dependency Audit

When dependencies change:

```bash
# Audit for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Analyze bundle composition
npx vite-bundle-visualizer
```

### Build Failure Troubleshooting

Common issues and solutions:

| Error | Solution |
|-------|----------|
| TypeScript errors | Run `npm run typecheck` first |
| Missing dependencies | Run `npm ci` |
| Path alias issues | Check tsconfig.json paths |
| Tailwind not building | Check content paths |

### CI/CD Integration

The build runs in GitHub Actions:

```yaml
- name: Build
  run: npm run build

- name: Upload build artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

## Success Criteria

- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] Bundle size within targets
- [ ] All assets correctly generated
- [ ] Source maps created
- [ ] No security vulnerabilities (npm audit)

## Performance Monitoring

Track these metrics over time:

1. **Build Time**: Should be < 30s
2. **Bundle Size**: Track growth per release
3. **Lighthouse Score**: Maintain > 90

## Integration

Works with:
- **Code Review Agent**: Reports build status
- **Test Agent**: Tests must pass before build
- **E2E Agent**: E2E tests on built output
