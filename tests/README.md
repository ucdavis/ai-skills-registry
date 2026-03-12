# Tests

This folder contains end-to-end (E2E) tests for the `ai-skills` CLI.

## How it works

[e2e.test.js](e2e.test.js) runs a full integration test suite against a locally served copy of the registry. It:

1. **Builds the CLI** — runs `npm run build` to compile TypeScript to `dist/`
2. **Starts a local HTTP server** — spawns a Node.js HTTP server on port 8080 to serve the project root as the registry
3. **Creates a sandbox directory** — `test_sandbox/` at the project root, used as the working directory for all CLI commands
4. **Runs CLI commands** via `node dist/index.js`, with `AI_SKILLS_REGISTRY_URL` and `AI_SKILLS_REPO_URL` pointing to the local server
5. **Asserts expected files exist** in the sandbox after each install command
6. **Tears down** — stops the server and deletes `test_sandbox/`

## Requirements

- Node.js (no Python required)
- [vitest](https://vitest.dev/) (installed as a dev dependency)

## Running the tests

```bash
npm test
```

## Test cases

### `list`

| Test | Command | What it checks |
|------|---------|----------------|
| All skills | `ai-skills list` | Output includes `testing`, `architecture`, `security`, `code-review` |
| Filter by lang | `ai-skills list --lang typescript` | Shows `testing`, `refactoring` |
| Filter by lang | `ai-skills list --lang python` | Shows `testing`, `architecture`, `data-science`, `package-management` |
| Filter by category | `ai-skills list --category security` | Shows `security`, excludes `data-science` |
| Filter by category | `ai-skills list --category architecture` | Shows `architecture`, excludes `security` |
| Filter by concept | `ai-skills list --concept testing` | Shows `testing` skills |
| Filter by tag | `ai-skills list --tag vitest` | Shows vitest-tagged skills |
| Filter by tag | `ai-skills list --tag owasp` | Shows `security` |

### `search`

| Test | Command | What it checks |
|------|---------|----------------|
| Keyword match | `ai-skills search boundary` | Returns `testing/general` |
| Keyword match | `ai-skills search owasp` | Returns `security` |
| Keyword match | `ai-skills search refactor` | Returns `refactoring` |
| Keyword match | `ai-skills search data` | Returns `data-science` |
| Keyword match | `ai-skills search uv` | Returns `package-management` |
| Keyword match | `ai-skills search fastapi` | Returns `code-review` |
| No results | `ai-skills search nonexistent_skill_xyz` | Exits cleanly without error |

### `info`

| Test | Command | What it checks |
|------|---------|----------------|
| TypeScript testing | `ai-skills info testing --lang typescript` | Shows `vitest`, `typescript` |
| Python testing | `ai-skills info testing --lang python` | Shows `python` |
| Java testing | `ai-skills info testing --lang java` | Shows `java` |
| Security | `ai-skills info security` | Shows `security` details |
| Architecture | `ai-skills info architecture` | Shows `architecture` details |
| Package management | `ai-skills info package-management --lang python` | Shows `uv`, `python` |
| Code review | `ai-skills info code-review --lang python` | Shows `fastapi`, `python` |
| Unknown concept | `ai-skills info nonexistent_concept_xyz` | Exits with error message |

### `install` (standard — `.ai-skills/<concept>/<lang>/`)

| Test | Command | Expected file |
|------|---------|---------------|
| Python testing | `ai-skills install testing --lang python` | `.ai-skills/testing/python/SKILL.md` |
| TypeScript testing | `ai-skills install testing --lang typescript` | `.ai-skills/testing/typescript/SKILL.md` |
| Security | `ai-skills install security` | `.ai-skills/security/general/SKILL.md` |
| Architecture | `ai-skills install architecture` | `.ai-skills/architecture/general/SKILL.md` |
| Data science | `ai-skills install data-science --lang python` | `.ai-skills/data-science/python/SKILL.md` |
| Accessibility | `ai-skills install accessibility --lang react-native` | `.ai-skills/accessibility/react-native/SKILL.md` |
| Package management | `ai-skills install package-management --lang python` | `.ai-skills/package-management/python/SKILL.md` |
| Code review | `ai-skills install code-review --lang python` | `.ai-skills/code-review/python/SKILL.md` |

### `install with agent` (agent-native locations)

| Test | Command | Expected file |
|------|---------|---------------|
| cursor | `ai-skills install code-review --agent cursor` | `.cursorrules` (appended) |
| cursor (multiple) | `ai-skills install security --agent cursor` | `.cursorrules` (appended again) |
| claude-code | `ai-skills install security --agent claude-code` | `.claude/commands/security.md` |
| claude-code (multiple) | `ai-skills install code-review --agent claude-code` | `.claude/commands/code-review.md` |
| vsc | `ai-skills install git-workflow --agent vsc` | `.github/copilot-instructions.md` |
| antigravity | `ai-skills install refactoring --agent antigravity --lang typescript` | `.agent/skills/refactoring/` |

### `init`

| Test | What it checks |
|------|----------------|
| Creates lockfile | `.ai-skills.json` exists |
| Valid JSON | `.ai-skills.json` parses without error |

### `install-all`

| Test | Command | What it checks |
|------|---------|----------------|
| Standard install | `ai-skills install-all` | Installs `testing/general` and `refactoring/typescript` for antigravity |
| Without agent | `ai-skills install-all` | Lockfile with no agent installs skills to `.ai-skills/default/` |
| Native install | `ai-skills install-all` | Installs `git-workflow` and `architecture` to `.claude/commands/` |

## Environment variables

The test runner overrides these env vars to redirect the CLI to the local server:

| Variable | Value during tests |
|----------|--------------------|
| `AI_SKILLS_REGISTRY_URL` | `http://localhost:8080/skills.json` |
| `AI_SKILLS_REPO_URL` | `http://localhost:8080` |
