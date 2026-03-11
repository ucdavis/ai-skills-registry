# AI Skills Registry

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
ai-skills list --agent claude-code
ai-skills list --lang typescript
ai-skills list --theme security
ai-skills list --tag owasp
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
ai-skills info testing --agent claude-code --lang typescript
ai-skills info code-review --agent cursor --lang general
```

### `install` — install a skill into your project

```bash
# Default: installs to .ai-skills/<agent>/<lang>/<concept>/
ai-skills install testing --agent claude-code --lang typescript

# Native: installs to the agent's own config location
ai-skills install testing --agent claude-code --lang typescript --native
# → writes to .claude/commands/testing.md

ai-skills install code-review --agent cursor --lang general --native
# → appends to .cursorrules

ai-skills install testing --agent vsc --lang general --native
# → appends to .github/copilot-instructions.md
```

### `install-all` — restore from lockfile

```bash
# Create a lockfile
ai-skills init

# Edit .ai-skills.json, then install everything
ai-skills install-all
ai-skills install-all --native
```

`.ai-skills.json` example:

```json
{
  "skills": [
    { "id": "claude-code/typescript/testing" },
    { "id": "claude-code/general/git-workflow" },
    { "id": "vsc/general/testing" },
    { "id": "cursor/python/architecting" }
  ]
}
```

---

## Agent Native Install Locations

| Agent | Strategy | Location |
|-------|----------|----------|
| `claude-code` | Slash command | `.claude/commands/<concept>.md` |
| `cursor` | Append | `.cursorrules` |
| `vsc` | Append | `.github/copilot-instructions.md` |
| `antigravity` | Directory | `.ai-skills/antigravity/<lang>/<concept>/` |

---

## Skill Schema

Each skill in `skills.json`:

```json
{
  "id": "claude-code/typescript/testing",
  "agent": "claude-code",
  "language": "typescript",
  "concept": "testing",
  "theme": "quality",
  "tags": ["vitest", "jest", "tdd", "mocking", "coverage"],
  "description": "TypeScript testing patterns for Claude Code",
  "version": "1.0.0",
  "author": "tpa",
  "files": ["instructions.md"]
}
```

**Themes:** `quality` · `architecture` · `security` · `dx`

Skill files use YAML frontmatter matching the manifest entry, followed by the actual instructions in Markdown.

---

## Available Skills

| ID | Theme | Tags |
|----|-------|------|
| `antigravity/typescript/testing` | quality | jest, vitest, tdd |
| `antigravity/python/data-science` | architecture | pandas, numpy, sklearn |
| `antigravity/general/code-review` | quality | review, owasp, readability |
| `cursor/python/architecting` | architecture | pep8, clean-architecture |
| `cursor/typescript/testing` | quality | jest, vitest, tdd |
| `cursor/general/code-review` | quality | review, security |
| `claude-code/java/code-review` | quality | owasp, concurrency, immutability |
| `claude-code/typescript/testing` | quality | vitest, tdd, mocking |
| `claude-code/general/git-workflow` | dx | git, conventional-commits, pr |
| `claude-code/general/security` | security | owasp, injection, auth |
| `vsc/general/testing` | quality | unit-testing, boundaries |
| `vsc/typescript/refactoring` | quality | solid, dry, type-safety |
| `vsc/general/architecture` | architecture | ddd, microservices, patterns |

---

## Adding New Skills

1. Create the directory: `skills/<agent>/<language>/<concept>/`
2. Add a file (e.g. `instructions.md`) with YAML frontmatter and content
3. Add an entry to `skills.json`
4. Commit and push to `main`

The CLI fetches live from GitHub — no build or release step needed.

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `AI_SKILLS_REGISTRY_URL` | GitHub `skills.json` | Custom manifest location |
| `AI_SKILLS_REPO_URL` | GitHub raw root | Custom repo base URL |
| `AI_SKILLS_AGENTS_URL` | GitHub `agents.json` | Custom agents config location |
