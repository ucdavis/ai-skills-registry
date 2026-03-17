# AI Skills Registry

> **Disclaimer:** This project is experimental and a proof-of-concept. The CLI, registry format, and APIs are subject to breaking changes. Some skill definitions are placeholders and not fully fleshed out — they serve as examples of the intended structure rather than production-ready prompts.

A centralized registry and CLI for managing AI coding assistant skills. Keep prompts, context definitions, and strategy documents organized across agents, languages, themes, and services — installable in one command.

**Supported agents:** Google Antigravity · Claude Code · Cursor · Visual Studio Code (Copilot)

---

## Features

- **Multi-agent** — skills for Antigravity, Claude Code, Cursor, and VSCode Copilot
- **Rich metadata** — each skill has a description, theme, tags, and version
- **Themes** — cross-cutting concerns: `quality`, `architecture`, `security`, `dx`
- **Tags** — find skills by framework or service (e.g. `jest`, `owasp`, `pandas`)
- **Native install** — install directly to each agent's config location (`.claude/commands/`, `.cursorrules`, etc.)
- **Lockfile** — pin team skills in `.ai-skills.json` and restore with one command
- **Dynamic fetching** — no local clone needed; fetches from GitHub at runtime

---

## Contributing

We welcome contributions from the community! Whether you want to add a new skill, fix a bug, or improve documentation, please check out our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to get started.

---

## Quickstart

```bash
npm install
npm run build
npm link        # makes `ai-skills` available globally
```

---

## Commands

### `list` — browse available skills

```bash
ai-skills list

# Filter by any dimension
ai-skills list --lang typescript
ai-skills list --category security
ai-skills list --concept testing
ai-skills list --tag owasp

# List all available groupings
ai-skills list --categories
ai-skills list --concepts
```

### `search` — find skills by keyword

Searches across id, description, tags, concept, and agent name.

```bash
ai-skills search testing
ai-skills search "code review"
ai-skills search aws
```

### `info` — inspect a skill before installing

```bash
ai-skills info testing --lang typescript
ai-skills info code-review --lang general
```

### `install` — iInstall a specific skill into your project's `ai-skills` directory:

```bash
ai-skills install testing --lang typescript
ai-skills install security
```

Standard installs use `.ai-skills/<concept>-<language>/`.

To install directly into an agent's specific native config location, provide the `--agent` argument:

```bash
# Installs to .cursor/skills/testing-typescript/
ai-skills install testing --agent cursor

# Installs to .claude/skills/code-review-general/
ai-skills install code-review --agent claude-code

# Installs to .agent/skills/git-workflow-general/
ai-skills install git-workflow --agent antigravity
```

### `install-all` — restore from lockfile

```bash
# Create a lockfile
ai-skills init
```

`.ai-skills.json` example:

```json
{
  "skills": [
    { "id": "testing-typescript" },
    { "id": "security-general" },
    { "id": "git-workflow-general", "agent": "claude-code" }
  ]
}
```

Then run `install-all` to download and apply them all at once. Skills with an `agent` specified will be installed natively for that agent. Skills without an agent will be installed in the default `.ai-skills` structure.

```bash
ai-skills install-all
```

---

## Agent Native Install Locations

| Agent | Strategy | Location |
|-------|----------|----------|
| `antigravity` | Skill folder | `.agent/skills/<concept>-<language>/` |
| `claude-code` | Skill folder | `.claude/skills/<concept>-<language>/` |
| `cursor` | Skill folder | `.cursor/skills/<concept>-<language>/` |
| `vsc` | Skill folder | `.github/skills/<concept>-<language>/` |

---

## Skill Schema

Each skill in `skills.json`:

```json
{
  "id": "testing-typescript",
  "concept": "testing",
  "language": "typescript",
  "category": "engineering",
  "tags": ["vitest", "jest", "tdd", "mocking", "coverage"],
  "description": "TypeScript testing with Vitest/Jest: file structure, mocking strategy, async patterns, and coverage targets",
  "version": "1.0.0",
  "files": ["SKILL.md"]
}
```

**Themes:** `quality` · `architecture` · `security` · `dx`

Skill files use YAML frontmatter matching the manifest entry, followed by the actual instructions in Markdown.

---

## Available Skills

<!-- START_SKILLS_TABLE -->
| ID | Category | Tags |
|----|-------|------|
| `testing-general` | engineering | unit-testing, boundaries, null-safety, tdd |
| `testing-typescript` | engineering | vitest, jest, tdd, mocking, coverage |
| `testing-python` | engineering | pytest, unittest, mocking, fixtures, tdd |
| `testing-java` | engineering | junit, mockito, tdd, integration-testing |
| `code-review-general` | engineering | review, best-practices, security, readability, performance |
| `code-review-python` | engineering | code-review, python, fastapi, pydantic, async |
| `code-review-typescript` | engineering | code-review, typescript, async, type-safety, node |
| `refactoring-typescript` | engineering | typescript, clean-code, dry, solid, type-safety |
| `git-workflow-general` | engineering | git, commits, branching, pr, conventional-commits |
| `security-general` | security | owasp, injection, xss, secrets, auth, input-validation |
| `architecture-general` | architecture | design-patterns, microservices, clean-architecture, ddd, solid |
| `architecture-python` | architecture | pep8, design-patterns, separation-of-concerns, clean-architecture, mypy |
| `data-science-python` | data | pandas, numpy, jupyter, sklearn, reproducibility, data-validation |
| `accessibility-react-native` | engineering | a11y, react-native, expo, ios, android |
| `skill-authoring-general` | engineering | authoring, agent, skills, scaffolding, specification |
| `package-management-python` | engineering | uv, pip, venv, pyproject, dependencies, lockfile |
| `accessibility-general` | auditing | accessibility, testing, wcag, ui, design |
| `design-frontend` | frontend | design, styling, ui, ux, aesthetics |
| `ci-cd-github-actions` | devops | ci-cd, github-actions, devops, workflow, automation |
| `project-management-jira` | project-management | project-management, jira, agile, user-stories |
| `git-workflow-pr-generator` | engineering | git, pr, pull-request, automation |
| `documentation-project` | documentation | documentation, docs, project, architecture, overview |
| `documentation-readme` | documentation | documentation, readme, generative |
| `infrastructure-terraform` | devops | infrastructure, terraform, iac, aws, azure, gcp |
| `assistant-rocky-lti-assist` | engineering | assistant, coding, fastapi, react, mcp |
| `git-workflow-monorepo` | engineering | git, monorepo, branching, versioning, semver, commits, pr, merge-conflicts |
<!-- END_SKILLS_TABLE -->

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `AI_SKILLS_REGISTRY_URL` | GitHub `skills.json` | Custom manifest location |
| `AI_SKILLS_REPO_URL` | GitHub raw root | Custom repo base URL |
| `AI_SKILLS_AGENTS_URL` | GitHub `agents.json` | Custom agents config location |
