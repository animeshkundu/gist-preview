# Docs Agent

## Purpose

The Docs Agent ensures documentation stays synchronized with code changes. It follows the **Docs = Code** principle from our [Core Philosophy](../../docs/agent-instructions/00-core-philosophy.md).

## Responsibilities

1. Update `docs/TECH_SPECS.md` on architecture changes
2. Create/update ADRs in `docs/adrs/` for major decisions
3. Record handoffs in `docs/history/`
4. Sync README with feature additions
5. Maintain changelog

## Triggers

- Architectural changes detected
- New dependencies added
- API contracts modified
- Feature completed
- PR merged to main

## Instructions

### Documentation Hierarchy

```
docs/
├── adrs/                    # Architecture Decision Records
│   ├── 0000-template.md     # ADR template
│   ├── 0001-*.md           # Accepted ADRs
│   └── README.md
├── specs/                   # Technical Specifications
│   └── README.md
├── architecture/            # System diagrams (Mermaid.js)
│   └── README.md
├── history/                 # Handoffs and deprecated patterns
│   └── README.md
├── agent-instructions/      # AI Agent operating protocols
├── PRD.md                   # Product Requirements
├── TECH_SPECS.md           # Comprehensive technical specs
└── AGENT.md                # Quick reference for agents
```

### ADR Creation Triggers

Create an ADR when:
- Adding new dependencies
- Changing data flow or state management patterns
- Modifying API contracts or interfaces
- Introducing new architectural patterns
- Making decisions that affect multiple parts of the system
- Deprecating existing approaches

### ADR Template

```markdown
# ADR-XXXX: [Short Title]

## Status
Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Tradeoff 1
- Tradeoff 2

## References
- Links to relevant documentation
```

### Documentation Update Checklist

#### For Feature Changes
- [ ] Update `docs/TECH_SPECS.md` with new feature details
- [ ] Update `README.md` feature list
- [ ] Add/update JSDoc comments in code
- [ ] Update `.github/copilot-instructions.md` if patterns change

#### For Architectural Changes
- [ ] Create new ADR in `docs/adrs/`
- [ ] Update `docs/architecture/README.md` diagrams
- [ ] Update relevant specs

#### For API Changes
- [ ] Update type definitions in `src/types/`
- [ ] Update `docs/TECH_SPECS.md` API section
- [ ] Update examples in documentation

### Handoff Documentation

When completing significant work, record in `docs/history/`:

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

### Gotchas
- Important thing to know
```

### Sync Commands

```bash
# Verify documentation links
# (Manual verification recommended)

# Check for outdated references
grep -r "TODO" docs/
grep -r "FIXME" docs/
```

## Success Criteria

- [ ] All code changes have corresponding documentation
- [ ] ADRs exist for architectural decisions
- [ ] TECH_SPECS.md accurately reflects implementation
- [ ] README.md is current with features
- [ ] No broken links in documentation
- [ ] History recorded for significant work

## Integration

Works with:
- **Code Review Agent**: Verifies docs are updated
- **Build Agent**: Ensures docs build correctly
- **All Agents**: Provides context for decision-making
