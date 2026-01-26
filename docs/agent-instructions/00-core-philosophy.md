# Core Philosophy for AI Agents

This document establishes the fundamental operating principles for all AI agents working on this repository.

## 1. Docs = Code

**No code is written without updating documentation first.**

Before implementing any feature or fix:
1. Create or update the relevant spec in `docs/specs/`
2. Ensure the change aligns with existing ADRs in `docs/adrs/`
3. Update architecture diagrams in `docs/architecture/` if system design changes
4. Only then proceed to write code

This ensures:
- Every code change has documented rationale
- Future agents understand the "why" behind decisions
- The codebase maintains consistency over time

## 2. Documentation Sync Workflow

After completing any work:
1. Update `docs/history/` with a summary of what was done
2. Record any learnings, deprecated patterns, or gotchas
3. If work was handed off from another agent, document the handoff context

```
docs/history/
├── handoffs/          # Inter-agent handoff records
├── deprecated/        # Patterns that are no longer used
└── changelog.md       # Human-readable change log
```

## 3. The CEO Model

When an agent initiates a task that requires sub-tasks:
- **The initiating agent is the "CEO"** - responsible for overall success
- **Sub-agents are "workers"** - execute specific, well-defined tasks
- The CEO must:
  - Define clear success criteria for each sub-task
  - Validate results from workers
  - Integrate work into the larger context
  - Handle failures and retries

**Communication Protocol:**
```
CEO Agent → Defines task → Worker Agent
                ↓
         Worker executes
                ↓
         Returns result
                ↓
CEO validates → Success? → Integrate
                ↓
              Failure? → Retry or escalate
```

## 4. First Principles Reasoning

Before implementing any solution:

### Step 1: Define the Problem
- What exactly is the issue?
- What constraints exist?
- What does success look like?

### Step 2: Decompose the Problem
- Break into atomic sub-problems
- Identify dependencies between sub-problems
- Determine the order of operations

### Step 3: Research Before Implementing
- Check existing codebase for similar solutions
- Read relevant ADRs and specs
- Search the web for current best practices (see `01-research-and-web.md`)

### Step 4: Plan the Solution
- Write pseudocode or outline the approach
- Identify potential failure modes
- Document the plan before coding

### Step 5: Implement Incrementally
- Make small, testable changes
- Validate each step before proceeding
- Commit logically grouped changes

### Step 6: Validate Thoroughly
- Run the validation script: `./scripts/validate.sh`
- Ensure all tests pass with 90%+ coverage
- Verify the solution solves the original problem

## 5. Anti-Patterns to Avoid

❌ **Cowboy Coding**: Writing code without reading documentation first
❌ **Hallucinating APIs**: Using functions/methods that don't exist
❌ **Ignoring Tests**: Skipping tests "because they're slow"
❌ **Over-Engineering**: Adding complexity without documented need
❌ **Silent Failures**: Catching errors without proper handling
❌ **Documentation Debt**: Promising to "update docs later"

## 6. When in Doubt

1. **Read the specs** in `docs/specs/`
2. **Check ADRs** in `docs/adrs/`
3. **Search the codebase** for similar patterns
4. **Search the web** for best practices
5. **Ask for clarification** rather than guessing

Remember: **It's better to pause and research than to write code that needs to be reverted.**
