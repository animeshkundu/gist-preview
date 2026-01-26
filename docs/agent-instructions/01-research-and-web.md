# Research and Web Search Protocol

AI agents must leverage internet research as a first-class capability. This document defines when and how to use web search effectively.

## 1. Internet is First-Class

**Agents MUST use web search to find current best practices before coding.**

### When to Search

| Scenario | Action |
|----------|--------|
| Adding a new dependency | Search for latest version, security advisories, alternatives |
| Implementing a pattern | Search for "best practices [pattern] [language] [year]" |
| Handling an edge case | Search for how others have solved similar problems |
| Using a third-party API | Search for current documentation, rate limits, gotchas |
| Writing tests | Search for testing patterns specific to the framework |
| Debugging an error | Search the exact error message |

### When NOT to Search

- Basic language syntax (use existing knowledge)
- Patterns already documented in `docs/specs/`
- Decisions already made in `docs/adrs/`

## 2. Validation Through Search

Before finalizing any implementation, validate through search:

### Library Version Verification
```
Search: "[library name] latest version [year]"
Search: "[library name] changelog breaking changes"
Search: "[library name] security vulnerabilities"
```

### Pattern Verification
```
Search: "[pattern] [framework] best practices [year]"
Search: "[pattern] [framework] anti-patterns to avoid"
Search: "[pattern] performance considerations"
```

### API Verification
```
Search: "[API name] documentation"
Search: "[API name] rate limits"
Search: "[API name] deprecation notices"
```

## 3. Research Saturation

**Research until information saturation is reached before implementation.**

### Saturation Indicators

You have reached saturation when:
- Multiple sources agree on the best approach
- You understand the trade-offs of different solutions
- You can explain why the chosen approach is best
- You've found no contradicting recent information

### Saturation Process

1. **Initial Search** (2-3 queries)
   - Understand the problem space
   - Identify main approaches

2. **Deep Dive** (3-5 queries)
   - Compare approaches
   - Find edge cases and gotchas
   - Identify the community consensus

3. **Validation Search** (1-2 queries)
   - Confirm no recent changes invalidate the approach
   - Check for security considerations

4. **Document Findings**
   - Add relevant learnings to `docs/specs/` or `docs/adrs/`
   - Include search sources as references

## 4. Search Query Patterns

### Effective Query Templates

```
# For best practices
"[topic] best practices [language/framework] [current year]"

# For comparisons
"[option A] vs [option B] [use case]"

# For implementation
"how to [task] in [framework] example"

# For debugging
"[exact error message]"
"[error code] [framework] solution"

# For security
"[library/pattern] security vulnerabilities CVE"
"[approach] security considerations"

# For performance
"[approach] performance benchmark [framework]"
"optimize [feature] [framework]"
```

### Query Refinement

If initial results are unhelpful:
1. Add the framework/language name
2. Add the current year
3. Add "example" or "tutorial"
4. Try different terminology
5. Search in specific sites (e.g., "site:stackoverflow.com")

## 5. Source Reliability Hierarchy

When multiple sources conflict, prioritize:

1. **Official Documentation** - Primary source of truth
2. **GitHub Issues/PRs** - Real-world problems and solutions
3. **Recent Blog Posts** (< 1 year) - Current practices
4. **Stack Overflow** (accepted + upvoted) - Community consensus
5. **Older Blog Posts** (> 1 year) - May be outdated
6. **Random Forum Posts** - Verify before trusting

## 6. Documenting Research

When research informs a decision, document it:

### In ADRs
```markdown
## Research Conducted

**Query**: "[search query]"
**Findings**: 
- Source 1: [finding]
- Source 2: [finding]

**Conclusion**: Based on [sources], we chose [approach] because [reason].
```

### In Code Comments
```typescript
// Using [pattern] based on [source] recommendation for [reason]
// See: [URL or reference]
```

## 7. Project-Specific Research Context

For this repository (GistPreview), research should consider:

### Technology Stack
- React 19 + TypeScript
- Vite 7.x build system
- Tailwind CSS 4.1
- Vitest for testing
- GitHub Actions for CI/CD

### Domain-Specific Research
```
# For Gist API changes
"GitHub Gist API [year] changes"
"GitHub REST API rate limiting"

# For iframe security
"iframe sandbox security [year]"
"postMessage security best practices"

# For content rendering
"markdown rendering security XSS"
"syntax highlighting performance"
```

## 8. Red Flags to Watch For

When researching, be alert to:

⚠️ **Outdated Information**: Check publication dates
⚠️ **Framework Version Mismatch**: Ensure advice applies to our versions
⚠️ **Deprecated APIs**: Verify APIs are not deprecated
⚠️ **Security Vulnerabilities**: Check for CVEs
⚠️ **Performance Gotchas**: Consider production scale
⚠️ **Browser Compatibility**: Verify cross-browser support
