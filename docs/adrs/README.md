# Architecture Decision Records (ADRs)

This directory contains all Architecture Decision Records for the GistPreview project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its context and consequences. ADRs help future maintainers (human and AI) understand why the codebase is structured the way it is.

## ADR Index

| ADR | Title | Status |
|-----|-------|--------|
| [0000-template](0000-template.md) | ADR Template | Template |
| [0001-content-type-inference](0001-content-type-inference.md) | Content-Based Type Inference | Accepted |
| [0002-centralized-type-definitions](0002-centralized-type-definitions.md) | Centralized Type Definitions | Accepted |

## When to Create an ADR

Create an ADR when:
- Adding new dependencies
- Changing data flow or state management patterns
- Modifying API contracts or interfaces
- Introducing new architectural patterns
- Making decisions that affect multiple parts of the system
- Deprecating existing approaches

## How to Create an ADR

1. Copy `0000-template.md` to a new file with the next available number
2. Fill in all sections thoughtfully
3. Get the ADR reviewed if possible
4. Update this README with the new entry

## ADR Lifecycle

- **Proposed**: Initial state, under discussion
- **Accepted**: Decision has been made and implemented
- **Deprecated**: No longer applies to current code
- **Superseded**: Replaced by a newer ADR (link to it)
