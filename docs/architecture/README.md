# Architecture Documentation

This directory contains high-level system architecture documentation, including diagrams and design overviews.

## Contents

- [System Architecture](#system-architecture)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (React 19)"
        UI[User Interface]
        subgraph "Components"
            GI[GistInput]
            GP[GistPreview]
            PF[PreviewFrame]
            FS[FileSelector]
            VT[ViewportToggle]
            RG[RecentGists]
        end
        subgraph "Hooks"
            UG[useGist]
            URG[useRecentGists]
        end
        subgraph "Lib"
            PGU[parseGistUrl]
            GA[gistApi]
            CR[contentRenderer]
            CTI[contentTypeInference]
        end
    end

    subgraph "External Services"
        GHAPI[GitHub Gist API]
        LS[localStorage]
    end

    UI --> GI
    GI --> PGU
    PGU --> UG
    UG --> GA
    GA --> GHAPI
    UG --> GP
    GP --> PF
    GP --> FS
    GP --> VT
    PF --> CR
    CR --> CTI
    URG --> LS
    RG --> URG
```

## Component Hierarchy

```mermaid
graph TD
    App[App]
    App --> Landing[Landing View]
    App --> Preview[Preview View]

    Landing --> GI[GistInput]
    Landing --> RG[RecentGists]
    Landing --> Footer[Footer]

    Preview --> GP[GistPreview]
    GP --> Header[Header]
    GP --> VT[ViewportToggle]
    GP --> FS[FileSelector]
    GP --> AB[ActionBar]
    GP --> PF[PreviewFrame]
    GP --> FSO[Fullscreen Overlay]

    PF --> Iframe[Sandboxed iframe]
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant GistInput
    participant parseGistUrl
    participant useGist
    participant gistApi
    participant GitHub API
    participant GistPreview
    participant PreviewFrame
    participant contentRenderer

    User->>GistInput: Enter Gist URL
    GistInput->>parseGistUrl: Validate URL
    parseGistUrl-->>GistInput: ParseResult

    alt Valid URL
        GistInput->>useGist: loadGist(gistId)
        useGist->>gistApi: fetchGist(gistId)
        gistApi->>GitHub API: GET /gists/{id}
        GitHub API-->>gistApi: GistData
        gistApi-->>useGist: GistApiResult
        useGist-->>GistPreview: gist, selectedFile
        GistPreview->>PreviewFrame: file content
        PreviewFrame->>contentRenderer: getRenderedContent()
        contentRenderer-->>PreviewFrame: HTML string
        PreviewFrame-->>User: Rendered preview
    else Invalid URL
        parseGistUrl-->>GistInput: Error message
        GistInput-->>User: Show error
    end
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Landing

    Landing --> Loading: Submit Gist URL
    Loading --> Preview: Fetch Success
    Loading --> Landing: Fetch Error

    Preview --> Preview: Change File
    Preview --> Preview: Change Viewport
    Preview --> Fullscreen: Click Fullscreen
    Fullscreen --> Preview: Exit Fullscreen
    Preview --> Landing: Click Back

    state Fullscreen {
        [*] --> Normal
        Normal --> Locked: Loaded from URL
        Normal --> Normal: ESC pressed
    }
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 19 | UI components and state |
| Language | TypeScript | Type safety |
| Bundler | Vite 7 | Development and build |
| Styling | Tailwind CSS 4.1 | Utility-first CSS |
| UI Components | shadcn/ui | Accessible primitives |
| Animations | Framer Motion | Smooth transitions |
| Icons | Phosphor Icons | Consistent iconography |
| Markdown | Marked | MD to HTML conversion |
| Testing | Vitest + RTL | Unit and component tests |
| CI/CD | GitHub Actions | Automated pipelines |

## Security Architecture

```mermaid
graph LR
    subgraph "Trusted Zone"
        App[React App]
        API[gistApi Module]
    end

    subgraph "Sandboxed Zone"
        IFrame[iframe sandbox=allow-scripts]
        Content[Gist Content]
    end

    subgraph "External"
        GitHub[GitHub API]
    end

    App --> API
    API --> GitHub
    App -- srcDoc --> IFrame
    IFrame --> Content

    style IFrame fill:#ff9,stroke:#333
    style Content fill:#ff9,stroke:#333
```

**Key Security Measures:**
- Gist content runs in sandboxed iframe (`sandbox="allow-scripts"`)
- No `allow-same-origin` prevents XSS attacks
- Content injected via `srcDoc`, not external URL
- No user data stored beyond localStorage

## Guidelines for Updating

When updating architecture diagrams:
1. Use Mermaid.js syntax (renders in GitHub)
2. Keep diagrams focused on one concept
3. Update when system design changes
4. Add explanatory text below diagrams
