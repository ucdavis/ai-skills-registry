---
name: java
description: Code review process and language-specific checklists. Use when reviewing PRs or auditing existing code.
metadata:
  domain: code-review
  id: code-review/java
  concept: code-review
  language: java
  category: engineering
  version: 1.0.0
  category: engineering
  tags: [code-review, quality, security, best-practices]
---

# Code Review — Java

In addition to the general review checklist, focus on these Java-specific areas:

## Memory Management
- Check for unclosed resources — prefer `try-with-resources` for streams, connections, files.
- Flag object retention in static fields or caches that prevent GC.
- Large allocations inside loops: `new byte[1024*1024]` in a tight loop is a problem.

## Concurrency
- Shared mutable state accessed without synchronization → must fix.
- Prefer `java.util.concurrent` types (`ConcurrentHashMap`, `AtomicInteger`, `ReentrantLock`) over raw `synchronized`.
- Double-checked locking without `volatile` is broken — flag it.
- `Thread.sleep()` used as synchronization is always wrong.
- Look for `HashMap` used in a multi-threaded context — should be `ConcurrentHashMap`.

## Security (Java-specific)
- SQL: parameterized queries only — never string concatenation.
- Deserialization: flag any `ObjectInputStream` with untrusted data.
- Sensitive data in logs: passwords, tokens, PII must not appear in stack traces or log output.
- `Runtime.exec()` with user input → command injection risk.

## Immutability
- Prefer `final` fields. Make classes immutable where appropriate.
- Return defensive copies from methods that expose internal collections.
- Use `List.copyOf()`, `Map.copyOf()`, `Collections.unmodifiableList()` for returned collections.

## API Design
- `equals()` and `hashCode()` must be overridden together.
- `Optional` is for return types only — not fields, not parameters.
- Checked exceptions swallowed with empty catch blocks → must fix.
- Checked exceptions thrown for programming errors → use `RuntimeException`.
