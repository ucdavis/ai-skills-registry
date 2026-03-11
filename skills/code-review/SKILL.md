---
name: code-review
description: Code review process and language-specific checklists. Use when reviewing PRs or auditing existing code.
category: engineering
tags: [code-review, quality, security, best-practices]
---

# Code Review

This skill provides review priorities, checklists, and language-specific patterns.

## Language Detection

- `pom.xml`, `build.gradle`, `*.java` → read `java/instructions.md`
- All other languages → read `general/instructions.md`

## Universal Review Order

1. **Correctness** — does it do what it should?
2. **Security** — does it introduce vulnerabilities?
3. **Performance** — are there obvious bottlenecks?
4. **Readability** — can the next engineer understand it?
5. **Style** — does it match project conventions?
