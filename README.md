# GistPreview

A modern, elegant web application that transforms GitHub Gists into beautifully rendered web pages.

![GistPreview](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)

## Features

- **🔗 Smart URL Parsing** - Paste any GitHub Gist URL or just the ID
- **🎨 Content-Aware Rendering** - Automatically detects HTML, Markdown, JSON, CSS, JavaScript, and code files
- **📱 Responsive Preview** - Desktop, tablet, and mobile viewport toggles
- **🖥️ Fullscreen Mode** - Immersive preview with locked mode for shared links
- **📸 Screenshot Sharing** - Capture and copy preview screenshots with one click
- **📂 Multi-file Support** - Navigate between files with type-aware badges
- **💾 Recent History** - Quick access to previously viewed gists
- **🌙 Dark Theme** - Developer-friendly dark interface

## Quick Start

1. Paste a GitHub Gist URL into the input field
2. Click **Preview** or press **Enter**
3. Use viewport controls to test responsive layouts
4. Click **Fullscreen** for an immersive view
5. Use **Screenshot** to capture and share

## Supported Content Types

| Type | Detection | Rendering |
|------|-----------|-----------|
| HTML | DOCTYPE, `<html>` tags, HTML elements | Full webpage with CSS/JS injection |
| Markdown | Headers, links, code blocks, lists | Styled dark-themed HTML |
| JSON | Valid JSON parsing | Syntax-highlighted with colors |
| CSS | Selectors, @rules, CSS units | Line numbers + language badge |
| JavaScript | Keywords, arrow functions | Line numbers + language badge |
| Plain Text | Default fallback | Clean text display |

## URL Sharing

Share gist previews with permanent links:

```
https://your-app.com/?gist={gistId}&file={filename}
```

When someone opens a shared link:
- Preview loads in **locked fullscreen mode**
- Clean, distraction-free viewing experience
- Copy button available for re-sharing

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit gist URL |
| `Escape` | Exit fullscreen (if not locked) |

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.1 with shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Phosphor Icons
- **Markdown**: Marked
- **Screenshots**: html2canvas
- **Persistence**: Spark KV storage

## Project Structure

```
src/
├── App.tsx              # Main app with routing
├── components/
│   ├── GistInput.tsx    # URL input with validation
│   ├── GistPreview.tsx  # Preview container
│   ├── PreviewFrame.tsx # Sandboxed iframe
│   ├── FileSelector.tsx # File tabs
│   ├── ViewportToggle.tsx
│   └── RecentGists.tsx
├── hooks/
│   ├── useGist.ts       # Gist fetching
│   └── useRecentGists.ts
├── lib/
│   ├── parseGistUrl.ts  # URL parsing
│   ├── gistApi.ts       # GitHub API
│   ├── contentRenderer.ts
│   └── contentTypeInference.ts
└── index.css            # Theme
```

## API Limits

GistPreview uses the public GitHub API:
- **Rate limit**: 60 requests per hour (unauthenticated)
- **Gist types**: Public gists only

## Documentation

- [PRD.md](./PRD.md) - Product requirements and design decisions
- [TECH_SPECS.md](./TECH_SPECS.md) - Technical architecture and implementation details

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

Built with ❤️ using [GitHub Spark](https://github.com/github/spark)
