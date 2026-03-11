---
name: architecture
description: System architecture guidance including layering, design patterns, microservices, and domain-driven design.
category: architecture
tags: [architecture, design-patterns, microservices, clean-architecture, ddd]
---

# Architecture

This skill covers system design decisions at the macro and micro level.

## Language Detection

- `*.py`, `pyproject.toml` → read `python/instructions.md` for Python-specific patterns
- All other languages → read `general/instructions.md`

## Universal Principles

- Dependencies flow inward: domain layer has no external dependencies.
- Separate I/O from business logic.
- Design for failure: timeouts, retries, circuit breakers.
- Prefer boring technology for infrastructure; save innovation for where it matters.
