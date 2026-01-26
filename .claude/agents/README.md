# Claude Agents Configuration

This directory contains specialized AI agent configurations for the GistPreview project.

## Available Agents

| Agent | Purpose |
|-------|---------|
| [code-review-agent.md](code-review-agent.md) | Automated PR review and quality assurance |
| [test-agent.md](test-agent.md) | Testing and coverage enforcement |
| [docs-agent.md](docs-agent.md) | Documentation synchronization |
| [build-agent.md](build-agent.md) | Build optimization and performance |
| [e2e-agent.md](e2e-agent.md) | End-to-end testing with Playwright |

## Agent Hierarchy

Following the **CEO Model** from our [Core Philosophy](../../docs/agent-instructions/00-core-philosophy.md):

```
┌────────────────────────────────────────┐
│         Code Review Agent (CEO)        │
│   Oversees all quality and compliance  │
└────────────────┬───────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│  Test  │  │  Docs  │  │ Build  │
│ Agent  │  │ Agent  │  │ Agent  │
└────────┘  └────────┘  └────────┘
                 │
                 ▼
           ┌──────────┐
           │   E2E    │
           │  Agent   │
           └──────────┘
```

## Usage

Each agent file contains:
1. **Purpose**: What the agent is responsible for
2. **Triggers**: When the agent should be invoked
3. **Instructions**: Specific prompts and guidelines
4. **Success Criteria**: How to measure success
5. **Integration**: How it works with other agents

## Related Documentation

- [Agent Instructions](../../docs/agent-instructions/) - Operating protocols for AI agents
- [Claude Instructions](../../claude.md) - Claude AI configuration
