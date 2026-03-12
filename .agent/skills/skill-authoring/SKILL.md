---
name: skill-authoring
description: Create well-formatted Agent Skills following the agentskills.io specification. Use when writing, authoring, scaffolding, or reviewing a new skill, SKILL.md file, or skill directory structure.
compatibility: Designed for Claude Code (or similar agentic coding assistants)
metadata:
  spec: https://agentskills.io/specification
---

# Skill Authoring

This skill guides creation of valid, well-structured Agent Skills following the [agentskills.io specification](https://agentskills.io/specification).

## Directory Structure

Every skill is a directory named after the skill itself:

```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable scripts
├── references/       # Optional: supplementary documentation
└── assets/           # Optional: templates, static resources
```

The directory name **must exactly match** the `name` field in `SKILL.md`.

## SKILL.md Format

`SKILL.md` must begin with YAML frontmatter, followed by Markdown instructions.

### Required Fields

| Field         | Rules |
|---------------|-------|
| `name`        | 1–64 chars. Lowercase `a-z`, digits, hyphens only. No leading/trailing/consecutive hyphens. Must match directory name. |
| `description` | 1–1024 chars. Describe **what** it does and **when** to use it. Include keywords agents use to identify the task. |

### Optional Fields

| Field            | Notes |
|------------------|-------|
| `license`        | License name or path to bundled license file. |
| `compatibility`  | 1–500 chars. Only include if the skill has specific environment requirements (tools, network, OS, product). |
| `metadata`       | Arbitrary key-value map for extra properties (author, version, etc.). |
| `allowed-tools`  | Space-delimited pre-approved tools, e.g. `Bash(git:*) Read`. Experimental. |

### Minimal Template

```markdown
---
name: my-skill
description: Does X and Y. Use when the user asks about Z.
---

# My Skill

Instructions here.
```

### Full Template

```markdown
---
name: my-skill
description: Extracts and transforms X. Use when working with X files or when the user mentions Y or Z.
license: MIT
compatibility: Requires python3 and internet access
metadata:
  author: my-org
  version: "1.0"
allowed-tools: Bash(python3:*) Read Write
---

# My Skill

Brief overview.

## Steps

1. Step one
2. Step two

## Examples

Input: ...
Output: ...

## Edge Cases

- Handle ...
```

## Writing Good Instructions

**Body content** (after frontmatter) has no format restrictions — write whatever helps agents perform the task.

Recommended sections:
- Step-by-step instructions
- Input/output examples
- Common edge cases and how to handle them

**Size guidelines:**
- Keep `SKILL.md` under 500 lines (~5000 tokens)
- Move detailed reference material to `references/` files
- Agents load `references/` files on demand — keep them focused and small

## Writing a Good `description`

The description is how agents decide whether to activate a skill. Make it specific:

- State what the skill **does** (actions, outputs)
- State **when to use it** (trigger phrases, task types)
- Include domain-specific keywords

Good:
```yaml
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

Poor:
```yaml
description: Helps with PDFs.
```

## Validation

Run the reference validator if available:

```bash
skills-ref validate ./my-skill
```

Common validation errors:
- `name` contains uppercase letters or spaces → use lowercase hyphens only
- `name` doesn't match directory name → rename one to match the other
- `description` is empty or too vague → expand with what/when language
- Consecutive hyphens in `name` (e.g. `my--skill`) → not allowed

## Checklist Before Publishing

- [ ] Directory name matches `name` field exactly
- [ ] `name` is lowercase with hyphens, no consecutive hyphens
- [ ] `description` explains both what it does and when to trigger it
- [ ] Body instructions are clear, actionable, and under 500 lines
- [ ] Large reference material is in `references/` not inline
- [ ] Scripts in `scripts/` are self-contained with helpful error messages
- [ ] `compatibility` field included only if environment requirements exist
