---
name: hol-guard-general
description: "Protect local AI coding harnesses with HOL Guard, review approvals and receipts, and scan agent plugins, skills, MCP servers, and packages before release."
---

# HOL Guard

Use HOL Guard when an AI coding harness or agent should be protected before tool execution, when Guard approvals or receipts need review, or when a plugin, skill, MCP server, or agent package needs a security scan.

## Safety rules

- Never read `.env` files.
- Never bypass a Guard approval or denial.
- Do not claim a workspace is protected until a HOL Guard command proves it.
- Prefer Guard-owned install and run commands over manual edits to harness configuration.
- Preserve existing user changes and inspect `git status --short` before editing a repository.
- Treat scanner failures as real until inspected.

## Install and detect

Check for the runtime first:

```bash
command -v hol-guard
```

If it is missing and the user wants runtime protection, install it in an isolated environment:

```bash
pipx install hol-guard
```

Then inspect the local environment:

```bash
hol-guard status
hol-guard detect --json
```

## Protect a supported AI harness

HOL Guard supports local coding harnesses including Codex, Claude Code, Copilot CLI, Cursor, Gemini CLI, Hermes, OpenClaw, OpenCode, and Antigravity.

Use the Guard-owned flow:

```bash
hol-guard bootstrap
hol-guard install <harness>
hol-guard run <harness> --dry-run
hol-guard run <harness>
hol-guard status
```

Common harness names:

- `codex`
- `claude-code`
- `copilot`
- `cursor`
- `gemini`
- `hermes`
- `openclaw`
- `opencode`
- `antigravity`

Examples:

```bash
hol-guard install codex
hol-guard run codex --dry-run
hol-guard run codex
hol-guard doctor codex --json
```

```bash
hol-guard install claude-code
hol-guard run claude-code --dry-run
hol-guard run claude-code
hol-guard doctor claude-code --json
```

A deny, review requirement, or Guard error must stop the protected action. Do not manually invoke the blocked downstream tool to work around the result.

## Review approvals and evidence

When Guard queues work for review:

```bash
hol-guard approvals
hol-guard approvals open
hol-guard receipts
hol-guard diff <harness>
```

For terminal-only approval handling:

```bash
hol-guard approvals approve <request-id>
hol-guard approvals deny <request-id>
```

Only approve after reading the risk reason and understanding the requested scope.

For audit and handoff evidence:

```bash
hol-guard receipts
hol-guard inventory
hol-guard abom --format json
hol-guard events
hol-guard explain <artifact-id>
```

Cloud sync is optional and user-directed:

```bash
hol-guard connect
hol-guard connect status
hol-guard sync
```

## Scan plugins, skills, MCP servers, and packages

The scanner is distributed separately from the HOL Guard runtime. Check it independently:

```bash
command -v plugin-scanner
```

If scanning is requested and it is missing:

```bash
pipx install plugin-scanner
```

Scan a repository or package root:

```bash
plugin-scanner lint .
plugin-scanner verify .
```

Or scan a specific package:

```bash
plugin-scanner lint <path>
plugin-scanner verify <path>
```

For a Codex marketplace, scan the repository root containing `.agents/plugins/marketplace.json`. For a Claude Code project, scan the workspace root containing `.claude/`, `.mcp.json`, hooks, or agent folders. For an MCP server or skill package, scan the package root that contains its server configuration, package metadata, or `SKILL.md`.

## Debugging

Use Guard-owned diagnostics before changing harness configuration:

```bash
hol-guard doctor
hol-guard doctor <harness> --json
hol-guard detect --json
hol-guard settings show
hol-guard explain install-connect
```

When reporting a result, state the command that ran, what Guard found, what remains blocked or risky, what evidence exists, and the exact next command if user action is required. Do not claim protection, approval, or release readiness without command output proving it.
