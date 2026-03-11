---
name: testing
description: Testing strategy and patterns. Use when writing, reviewing, or generating tests for any language.
category: engineering
tags: [testing, tdd, unit-testing, mocking]
---

# Testing

This skill covers testing strategy, patterns, and tool usage across languages.

## Language Detection

Read the language-specific file based on the project:

- `package.json`, `tsconfig.json`, `*.ts` → read `typescript/instructions.md`
- `*.py`, `pyproject.toml`, `requirements.txt` → read `python/instructions.md`
- `pom.xml`, `build.gradle`, `*.java` → read `java/instructions.md`
- No language detected or multi-language → read `general/instructions.md`

## Universal Principles

Regardless of language:
- Test behavior, not implementation.
- One assertion per test where possible.
- Name tests as specifications: *"should \<behavior\> when \<condition\>"*.
- Cover the happy path, edge cases, and error paths.
- Mock only what you don't control (HTTP, DB, filesystem, time).
