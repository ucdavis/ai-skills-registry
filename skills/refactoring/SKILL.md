---
name: refactoring
description: Refactoring guidance and code smell detection. Use when improving existing code without changing behavior.
category: engineering
tags: [refactoring, clean-code, solid, dry]
---

# Refactoring

This skill covers how to safely improve existing code.

## Language Detection

- `tsconfig.json`, `*.ts` → read `typescript/instructions.md`
- `*.py` → (coming soon)
- Other → apply SOLID/DRY principles from general knowledge

## Universal Refactoring Rules

- Never change behavior while refactoring — keep tests green throughout.
- Refactor in small, committed steps.
- Eliminate one code smell at a time.
- Common smells: long functions, deep nesting, magic numbers, duplicated logic, large classes.
