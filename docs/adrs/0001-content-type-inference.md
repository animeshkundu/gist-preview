# ADR-0001: Content-Based Type Inference Over Extension-Based Detection

## Status
Accepted

## Context
GitHub Gists often have files without extensions (e.g., `gistfile1.txt`) or with generic extensions that don't reflect the actual content type. Relying solely on file extensions would result in many files being rendered as plain text when they could be rendered as HTML, Markdown, JSON, etc.

## Decision
Implement a content-based type inference engine that analyzes file content patterns to determine the appropriate rendering format. The engine:

1. First checks for known file extensions (`.html`, `.md`, `.json`, `.css`, `.js`, etc.)
2. If extension is unknown or generic, analyzes content using pattern matching:
   - HTML: DOCTYPE declarations, `<html>` tags, multiple HTML elements
   - Markdown: Headers, links, code blocks, lists, bold/italic patterns
   - JSON: Valid JSON.parse() result
   - CSS: Selector patterns, @rules, CSS units
   - JavaScript: Keywords, arrow functions, common JS patterns
3. Uses confidence scoring (0-1) to select the best match (threshold: 0.5)
4. Falls back to 'code' if code-like patterns detected, otherwise 'text'

See `src/lib/contentTypeInference.ts` for implementation.

## Consequences

**Easier:**
- Files without extensions are rendered appropriately
- Better user experience for gists with generic filenames
- More accurate content display without requiring correct extensions

**Harder:**
- Additional complexity in the rendering pipeline
- Edge cases where content matches multiple patterns
- Potential for false positives (content incorrectly classified)
- Tests must cover pattern matching edge cases
