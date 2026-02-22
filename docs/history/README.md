# History and Handoffs

This directory maintains a historical record of significant changes, handoffs between agents/developers, and deprecated patterns.

## Purpose

- Track the evolution of the codebase
- Document context for complex changes
- Record lessons learned
- Facilitate smooth handoffs between agents

## Contents

- [Handoffs](#handoffs) - Inter-agent handoff records
- [Deprecated Patterns](#deprecated-patterns) - Patterns no longer in use
- [Changelog](#changelog) - Human-readable change history
- [changelog.md](./changelog.md) - Chronological record of completed updates

---

## Handoffs

When handing off work to another agent or developer, document:

### Handoff Template

```markdown
## Handoff: [Feature/Task Name]

**Date**: YYYY-MM-DD
**From**: [Agent/Developer]
**To**: [Agent/Developer]

### Context
What was being worked on and why.

### Current State
- What has been completed
- What is in progress
- What is blocked

### Next Steps
1. Specific action item
2. Specific action item

### Key Files
- `path/to/file.ts` - Description
- `path/to/file.ts` - Description

### Gotchas
- Important thing to know
- Edge case to be aware of

### Resources
- Link to relevant docs
- Link to relevant issues
```

---

## Deprecated Patterns

Record patterns that are no longer used to prevent future agents from reintroducing them.

### Template

```markdown
## Deprecated: [Pattern Name]

**Deprecated**: YYYY-MM-DD
**Replaced By**: [New pattern or ADR reference]

### What It Was
Description of the deprecated pattern.

### Why Deprecated
Reason for deprecation.

### Migration Path
How to update code using the old pattern.
```

### Current Deprecated Patterns

*None yet documented.*

---

## Changelog

### Format

```markdown
## [Version/Date]

### Added
- New feature description

### Changed
- Change description

### Deprecated
- Deprecated feature description

### Removed
- Removed feature description

### Fixed
- Bug fix description

### Security
- Security fix description
```

---

## Guidelines

### When to Update History

1. **Completing significant work**: Add a changelog entry
2. **Handing off to another agent**: Create a handoff record
3. **Deprecating a pattern**: Document in deprecated patterns
4. **Making breaking changes**: Document migration path

### Best Practices

- Be specific and include file paths
- Explain the "why" not just the "what"
- Include links to related ADRs and specs
- Keep entries concise but complete
