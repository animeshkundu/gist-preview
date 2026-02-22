<div align="center">
  <h1>✨ GistPreview</h1>
  <p><strong>Render any public GitHub Gist as a beautiful, responsive, shareable web preview.</strong></p>

  <p>
    <a href="https://animeshkundu.github.io/gist-preview/"><strong>🌐 Live Demo</strong></a>
    ·
    <a href="./docs/TECH_SPECS.md"><strong>📘 Tech Specs</strong></a>
    ·
    <a href="./docs/PRD.md"><strong>🧭 Product Docs</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/animeshkundu/gist-preview/ci.yml?branch=main&label=CI" alt="CI" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Coverage-90%25%2B-brightgreen" alt="Coverage 90%+" />
    <img src="https://img.shields.io/github/license/animeshkundu/gist-preview" alt="License" />
  </p>
</div>

---

## 🚀 Why GistPreview?

GistPreview takes the friction out of sharing and testing Gists by turning raw files into polished previews with smart content detection, responsive viewports, and one-click sharing.

## ✨ Features

- **🔗 Smart URL parsing** — Accepts full Gist URLs or plain IDs
- **🧠 Content-aware rendering** — Detects HTML, Markdown, React/JSX, JSON, CSS, JavaScript, and plain text
- **⚛️ React transpilation** — Compiles and runs JSX with React support
- **📱 Responsive previews** — Switch between desktop, tablet, and mobile layouts
- **🖥️ Fullscreen mode** — Supports clean, immersive presentation mode
- **📂 Multi-file navigation** — Quickly switch between files in a gist
- **💾 Recent history** — Saves recently viewed gists in localStorage
- **🌙 Dark-first UI** — Optimized for modern developer workflows

## ⚡ Quick Start

1. Open the [live app](https://animeshkundu.github.io/gist-preview/)
2. Paste a public Gist URL (or just the gist ID)
3. Press **Enter** or click **Preview**
4. Switch viewport modes as needed
5. Share with generated URL parameters

## 🧩 Supported Content Types

| Type | Detection Strategy | Rendering |
|------|--------------------|-----------|
| HTML | `<!DOCTYPE>`, `<html>`, semantic tags | Sandboxed webpage preview |
| Markdown | Headers, lists, links, fences | Styled markdown document |
| React/JSX | JSX syntax, React patterns, hooks | Live React execution via transpilation |
| JSON | Valid parse + structure checks | Syntax-highlighted output |
| CSS | Selectors, rules, units, `@` directives | Code renderer with formatting |
| JavaScript | JS syntax/keyword heuristics | Code renderer with formatting |
| Plain text | Fallback | Clean text rendering |

## 🔗 Shareable URL Format

```text
https://animeshkundu.github.io/gist-preview/?gist={gistId}&file={filename}
```

Shared links open directly in preview mode for fast collaboration and demos.

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit gist URL |
| `Escape` | Exit fullscreen (when unlocked) |

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4.1 + shadcn/ui
- **Animation:** Framer Motion
- **Icons:** Phosphor Icons
- **Markdown:** Marked
- **Persistence:** localStorage
- **Testing:** Vitest + React Testing Library + Playwright
- **CI/CD:** GitHub Actions

## 👩‍💻 Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit/integration tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run e2e` | Run Playwright end-to-end tests |
| `./scripts/validate.sh` | Run full validation pipeline |

## 🧱 Project Structure

```text
src/
├── components/     # Feature components and UI composition
├── hooks/          # Reusable React hooks
├── lib/            # Parsing, API, rendering, inference utilities
├── types/          # Centralized TypeScript type definitions
└── __tests__/      # Global test setup
```

## 📈 API Limits

GistPreview uses the public GitHub API for unauthenticated gist access:

- **Rate limit:** 60 requests/hour/IP
- **Scope:** Public gists only

## 📚 Documentation

- [PRD](./docs/PRD.md)
- [Technical Specs](./docs/TECH_SPECS.md)
- [Agent Guide](./docs/AGENT.md)
- [Agent Instructions](./docs/agent-instructions/)
- [Architecture Docs](./docs/architecture/)
- [ADRs](./docs/adrs/)
- [Specs](./docs/specs/)
- [History](./docs/history/)
- [Security Policy](./docs/SECURITY.md)

## 📄 License

MIT — see [LICENSE](./LICENSE).

<div align="center">
  Built with ❤️ using GitHub Spark
</div>
