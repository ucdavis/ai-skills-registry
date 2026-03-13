# AI Skills Registry

> **Disclaimer:** This project is experimental and a proof-of-concept. The CLI, registry format, and APIs are subject to breaking changes. Some skill definitions are placeholders and not fully fleshed out — they serve as examples of the intended structure rather than production-ready prompts.

A centralized registry and CLI for managing AI coding assistant skills. Keep prompts, context definitions, and strategy documents organized across agents, languages, themes, and services — installable in one command.

**Supported agents:** Google Antigravity · Claude Code · Cursor · Visual Studio Code (Copilot)

---

## Features

- **Multi-agent** — skills for Antigravity, Claude Code, Cursor, and VSCode Copilot
- **Rich metadata** — each skill has a description, theme, tags, version, and author
- **Themes** — cross-cutting concerns: `quality`, `architecture`, `security`, `dx`
- **Tags** — find skills by framework or service (e.g. `jest`, `owasp`, `pandas`)
- **Native install** — install directly to each agent's config location (`.claude/commands/`, `.cursorrules`, etc.)
- **Lockfile** — pin team skills in `.ai-skills.json` and restore with one command
- **Dynamic fetching** — no local clone needed; fetches from GitHub at runtime

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

To install directly into an agent's specific native config location, provide the `--agent` argument:

```bash
# Appends to .cursorrules
ai-skills install testing --agent cursor

# Creates .claude/commands/code-review.md
ai-skills install code-review --agent claude-code

# Appends to .agent/skills/git-workflow/
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
    { "id": "testing/typescript" },
    { "id": "security/general" },
    { "id": "git-workflow/general", "agent": "claude-code" }
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
| `claude-code` | Slash command | `.claude/commands/<concept>.md` |
| `cursor` | Append | `.cursorrules` |
| `vsc` | Append | `.github/copilot-instructions.md` |
| `antigravity` | Skill folder | `.agent/skills/<concept>/` |

---

## Skill Schema

Each skill in `skills.json`:

```json
{
  "id": "testing/typescript",
  "concept": "testing",
  "language": "typescript",
  "category": "engineering",
  "tags": ["vitest", "jest", "tdd", "mocking", "coverage"],
  "description": "TypeScript testing with Vitest/Jest: file structure, mocking strategy, async patterns, and coverage targets",
  "version": "1.0.0",
  "author": "tpa",
  "files": ["SKILL.md"]
}
```

**Themes:** `quality` · `architecture` · `security` · `dx`

Skill files use YAML frontmatter matching the manifest entry, followed by the actual instructions in Markdown.

---

## Available Skills

| ID | Category | Tags |
|----|-------|------|
| `testing/typescript` | engineering | jest, vitest, tdd |
| `data-science/python` | data | pandas, numpy, sklearn |
| `code-review/general` | engineering | review, owasp, readability |
| `code-review/python` | engineering | python, fastapi, pydantic |
| `architecture/python` | architecture | pep8, clean-architecture |
| `testing/general` | engineering | unit-testing, boundaries |
| `refactoring/typescript` | engineering | solid, dry, type-safety |
| `git-workflow/general` | engineering | git, conventional-commits, pr |
| `security/general` | security | owasp, injection, auth |
| `package-management/python` | engineering | uv, pip, venv |
| `accessibility/general` | auditing | accessibility, testing, ui |
| `design/frontend` | frontend | design, styling, ux |
| `ci-cd/github-actions` | devops | ci-cd, automation |
| `project-management/jira` | project-management | jira, agile |
| `git-workflow/pr-generator` | engineering | pr, automation |
| `documentation/project` | documentation | architecture, overview |
| `documentation/readme` | documentation | generative, docs |
| `infrastructure/terraform` | devops | iac, aws, azure, gcp |

---

## Adding New Skills

1. Create the directory: `skills/<concept>/<language>/`
2. Add a `SKILL.md` file with YAML frontmatter following the `agentskills.io` standard.
3. Add any necessary supplemental files, such as `scripts/` or `references/`.
4. Add an entry to `skills.json`
5. Commit and push to `main`

The CLI fetches live from GitHub — no build or release step needed.

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `AI_SKILLS_REGISTRY_URL` | GitHub `skills.json` | Custom manifest location |
| `AI_SKILLS_REPO_URL` | GitHub raw root | Custom repo base URL |
| `AI_SKILLS_AGENTS_URL` | GitHub `agents.json` | Custom agents config location |
