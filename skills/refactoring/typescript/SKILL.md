---
name: typescript
description: Refactoring guidance and code smell detection. Use when improving existing code without changing behavior.
metadata:
  domain: refactoring
  id: refactoring/typescript
  concept: refactoring
  language: typescript
  category: engineering
  version: 1.0.0
  category: engineering
  tags: [refactoring, clean-code, solid, dry]
---

# Refactoring — TypeScript

## Before You Start
- Ensure existing tests are green. If there are no tests, write them first.
- Refactor in small, committed steps — one change at a time.
- Run `tsc --noEmit` and `eslint` after each change.

## Type Safety
- Replace `any` with proper types or `unknown` + type guard.
- Enable `strict: true` in `tsconfig.json` if not set.
- Use `interface` for object shapes; `type` for unions and intersections.

```typescript
// Before
function process(data: any) { ... }

// After
function process(data: unknown) {
  if (!isOrderData(data)) throw new TypeError('Invalid order data');
  ...
}
```

## SOLID Principles
- **Single Responsibility**: if the function name needs "and", split it.
- **Open/Closed**: use strategy pattern over `if/else` chains that grow over time.
- **Dependency Inversion**: accept interfaces, not concrete classes.

## Common Smells → Fixes

| Smell | Fix |
|-------|-----|
| Long parameter list (4+) | Extract to typed options object |
| Deep nesting | Early returns / guard clauses |
| Magic numbers/strings | Named constants or enums |
| Copy-pasted logic | Extract to named function or generic utility |
| Large file (300+ lines) | Split into focused modules |
| Boolean parameter | Two functions, or discriminated union |

## Example: Guard Clauses
```typescript
// Before — deep nesting
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        // actual logic...
      }
    }
  }
}

// After — guard clauses
function processOrder(order: Order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (order.status !== 'pending') return;
  // actual logic...
}
```
