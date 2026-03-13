---
name: pr-generator
description: Generate GitHub pull request descriptions by analyzing git changes between two branches. Use when the user asks to create or draft a PR description based on branch diffs (for example, "Generate a PR for the changes between featureBranch and mainBranch") and expects a filled template with summary, motivation, and change impact flags.
metadata:
  domain: git-workflow
  id: git-workflow/pr-generator
  concept: git-workflow
  language: general
  category: engineering
  version: 1.0.0
  tags: [git, pr, pull-request, automation]
---

# Pr Description Generator

## Overview

Generate a PR description by comparing a base branch and a head branch, summarizing key changes, and filling the required template sections.
Detect whether dependency installs, env changes, or database updates are required based on the diff.

## Workflow

### 1. Gather inputs

Require both branches and the repo root. If missing, ask for:

- Base branch (target, usually main/master)
- Head branch (feature branch)
- Any required scope (subfolder or package)

### 2. Collect change data

Run the helper script to gather all required data in files:

- `scripts/collect_pr_changes.py <base> <head> --repo <path>`

Use the generated files in `pr_change_snapshot/`:

- `name_status.txt` (file-level changes)
- `diff.txt` (full diff)
- `log.txt` (commit log)

### 3. Classify impacts

Set the template flags using these heuristics:

- **Requires `npm install`**: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or workspace config changed.
- **Requires env update**: `.env*`, `*.env`, `.env.example`, configuration templates, or documentation about new env vars changed.
- **Database changes**: migrations, schema files, ORM model changes, or db-related modules changed.

If uncertain, leave the flag as `:x:` and note uncertainty in Additional Information.

### 4. Summarize changes

Build a concise summary that covers:

- Main features or fixes
- Notable files or areas
- Related issue or ticket reference if present in branch names or commit messages

### 5. Note UI impact

If UI files changed (`.tsx`, `.jsx`, `.css`, `.scss`, `web/`, `frontend/`, `client/`), request screenshots or note that screenshots are required.

### 6. Output the PR template

Output the PR in a markdown fenced code block so it can be copy/pasted as-is.
Populate the template exactly. Keep the formatting and headings unchanged.
Replace `:x:` with `:white_check_mark:` where required.

```
## Description

- :x: This PR requires an `npm install`.
- :x: This PR requires an update to the `env` file.
- :x: This PR makes changes to the database.

### Summary of Changes:

Please include a summary of the changes and the related issue.

### Motivation for Change:

Explain the motivation for the change and the approach used.

### Additional Information
Please add any other relevant information or context about the pull request.

---

## Screenshots (if applicable)
If your changes include UI updates, please provide screenshots for better context.
```

## Resources

This skill includes a helper script:

- `scripts/collect_pr_changes.py`: Writes name-status, full diff, and log outputs to `pr_change_snapshot/`.
