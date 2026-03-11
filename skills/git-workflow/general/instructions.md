---
id: git-workflow/general
concept: git-workflow
language: general
category: engineering
version: 1.0.0
---

# Git Workflow

## Branch Naming
```
<type>/<short-description>
```
| Type | Use for |
|------|---------|
| `feat` | New functionality |
| `fix` | Bug fixes |
| `chore` | Tooling, deps, config |
| `refactor` | Code improvements, no behavior change |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `hotfix` | Urgent production fix |

Examples: `feat/user-auth`, `fix/login-redirect`, `chore/upgrade-node`

## Commit Messages (Conventional Commits)
```
<type>(<scope>): <subject>

[body — explain why, not what]

[footer — Closes #123, breaking changes]
```
- Subject: imperative mood, no period, max 72 characters.
- Body: explain *why* the change was made. Reference issues.

```
feat(auth): add JWT refresh token support

Adds sliding window refresh to prevent session expiry during active use.
Tokens expire after 7 days of inactivity. Refresh endpoint is POST /auth/refresh.

Closes #142
```

## Pull Requests
- **Title**: follows conventional commit format.
- **Description**: what changed, why, and how to test it.
- **Size**: one logical change per PR. Large PRs get worse reviews.
- **Reviewers**: request at least one before merging.
- **Link**: reference the related issue.

## Merge Strategy
- **Squash and merge** for feature branches → clean linear history on `main`.
- **Merge commit** for release branches → preserves release history.
- Delete branches after merge.
- Never force-push to `main` or `develop`.

## Rules
- Never commit `.env` files, secrets, or credentials.
- Add `.env.example` with placeholder values.
- CI must be green before merging.
