---
name: typescript
description: Testing strategy and patterns. Use when writing, reviewing, or generating tests for any language.
metadata:
  domain: testing
  id: testing/typescript
  concept: testing
  language: typescript
  category: engineering
  version: 1.0.0
  category: engineering
  tags: [testing, tdd, unit-testing, mocking]
---

# Testing — TypeScript

## Framework
- **Vitest** for new projects (fast, native ESM, Jest-compatible API).
- **Jest** only if already configured — don't mix frameworks.
- Run: `vitest run` / `vitest run --coverage`

## File Conventions
- Co-locate: `src/utils/format.ts` → `src/utils/format.test.ts`
- Shared fixtures: `tests/fixtures/` or `src/__tests__/helpers/`

## Test Structure
```typescript
describe('formatDate', () => {
  it('should return ISO date string when given a valid Date', () => {
    // Arrange
    const date = new Date('2026-01-15');

    // Act
    const result = formatDate(date);

    // Assert
    expect(result).toBe('2026-01-15');
  });
});
```

## Mocking
```typescript
// Module mock — top of file
vi.mock('../services/emailService');

// Spy without full mock
const spy = vi.spyOn(mailer, 'send').mockResolvedValue(undefined);

// Restore after each test
afterEach(() => vi.restoreAllMocks());

// Time control
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
```

## Async Tests
```typescript
// Always await; use assertions count for safety
it('should reject with AuthError when token is expired', async () => {
  expect.assertions(1);
  await expect(verifyToken('expired')).rejects.toThrow('Token expired');
});
```

## Coverage Targets
- Business logic: 85%+ branch coverage.
- Utility functions: 100% line coverage.
- Do not write tests just to hit numbers — test behavior.
