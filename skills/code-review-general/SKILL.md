---
name: code-review-general
description: General code review process: priority ordering, what to block on, how to give actionable feedback
---

# Code Review — General

## Review Priority Order
1. **Correctness** — does it do what it should? Are edge cases handled?
2. **Security** — does it introduce vulnerabilities? (See security skill for checklist.)
3. **Performance** — N+1 queries, unnecessary allocations in hot paths, missing indexes.
4. **Readability** — will the next engineer understand this without context?
5. **Style** — does it match project conventions? (Never block on style alone.)

## Red Flags (always block)
- Hardcoded secrets, API keys, or credentials.
- Missing input validation at API/service boundaries.
- Unhandled error paths that leave state corrupted.
- Race conditions in concurrent code.
- Silent exception swallowing (`catch (e) {}`).

## Structural Issues (should fix)
- Functions doing more than one thing.
- Deep nesting — suggest early returns / guard clauses.
- Duplicated logic that should be extracted.
- Magic numbers or strings without named constants.

## Suggestions (non-blocking)
- Better variable/function names.
- Simpler implementations.
- Additional test cases for uncovered paths.

## Tone
- Quote the specific line. Explain the problem. Offer a concrete alternative.
- Distinguish: **"must fix"**, **"should fix"**, **"consider"**.
- Approve with comments for minor issues — block only for correctness, security, or missing tests.
- Separate your opinion from objective issues.
