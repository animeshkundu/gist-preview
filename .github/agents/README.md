# GitHub Agents Configuration

This directory contains configurations for GitHub-native agent integrations.

## Available Configurations

### Workflows

Agent-triggered workflows are defined in `.github/workflows/`:

| Workflow | Purpose |
|----------|---------|
| `ci.yml` | Main CI/CD pipeline (typecheck, lint, test, build) |
| `website.yml` | Marketing website deployment |

### Future Agent Integrations

As GitHub expands AI agent capabilities, this directory will contain:

- Copilot Workspace settings
- Agent-specific permissions
- Custom agent definitions
- Workflow automation rules

## Integration with Claude Agents

The Claude agents defined in `.claude/agents/` can trigger GitHub workflows:

```
Code Review Agent → Triggers CI checks
Test Agent       → Triggers test workflow
Build Agent      → Triggers build workflow
E2E Agent        → Triggers Playwright tests
```

## Workflow Triggers

| Event | Workflow | Agent |
|-------|----------|-------|
| `pull_request` | ci.yml | Code Review Agent |
| `push` to main | ci.yml, website.yml | Build Agent |
| `workflow_dispatch` | Any | Manual trigger |

## Related Documentation

- [Claude Agents](../../.claude/agents/) - Specialized AI agent configurations
- [Agent Instructions](../../docs/agent-instructions/) - Operating protocols
- [CI Workflow](../workflows/ci.yml) - Main CI/CD pipeline
