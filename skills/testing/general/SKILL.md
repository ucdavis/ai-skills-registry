---
name: general
description: Testing strategy and patterns. Use when writing, reviewing, or generating tests for any language.
metadata:
  domain: testing
  id: testing/general
  concept: testing
  language: general
  category: engineering
  version: 1.0.0
  tags: [testing, tdd, unit-testing, mocking]
---

# Testing — General

## Structure
- One test file per source module.
- Name tests as specifications: `"should <behavior> when <condition>"`.
- Group related cases with describe/context blocks.
- Follow Arrange-Act-Assert (AAA), with a blank line between each phase.

## What to Test
- **Happy path**: expected inputs produce expected outputs.
- **Edge cases**: empty input, zero, maximum values, boundary conditions.
- **Error paths**: invalid input, missing data, external failures.

## Mocking
- Mock only what you don't control: HTTP calls, databases, filesystems, clocks.
- Never mock the unit under test.
- Restore mocks after each test to prevent state leakage.

## Assertions
- Assert specific values, not just that something was called.
- On error paths, assert both the error type and message.
- Avoid assertions inside loops — use parameterized tests instead.

## Coverage
- Focus on behavior coverage, not line coverage.
- 100% coverage does not mean a test suite is complete.
- Missing: edge cases, concurrent access, failure paths that coverage tools can't see.
