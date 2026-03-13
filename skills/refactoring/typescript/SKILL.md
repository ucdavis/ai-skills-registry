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
  tags: [refactoring, clean-code, solid, dry]
---

# Refactoring — TypeScript

## Before You Start
- Ensure existing tests are green. If there are no tests, write them first.
- Refactor in small, committed steps — one change at a time.
- Run `tsc --noEmit` and `eslint` after each change.
- Never change behavior while refactoring — if you are, that's a feature.

## Type Safety
- Replace `any` with proper types or `unknown` + type guard.
- Enable `strict: true` in `tsconfig.json` if not set.
- Use `interface` for object shapes; `type` for unions and intersections.
- Prefer `readonly` arrays and properties when data should not be mutated.

```typescript
// Before
function process(data: any) { ... }

// After
function process(data: unknown) {
  if (!isOrderData(data)) throw new TypeError('Invalid order data');
  ...
}
```

```typescript
// Prefer discriminated unions over boolean flags
type Result =
  | { status: 'ok'; value: string }
  | { status: 'error'; message: string };
```

## Naming
- Names should say *what*, not *how*. Rename when you have to read the body to understand the call site.
- Boolean variables and functions: prefix with `is`, `has`, `can`, `should`.
- Avoid abbreviations except universally understood ones (`url`, `id`, `ctx`).

```typescript
// Before
const d = users.filter(u => u.a);

// After
const activeUsers = users.filter(user => user.isActive);
```

## SOLID Principles
- **Single Responsibility**: if the function name needs "and", split it.
- **Open/Closed**: use strategy pattern over `if/else` chains that grow over time.
- **Liskov Substitution**: subtypes must be substitutable without breaking callers.
- **Interface Segregation**: split large interfaces; callers should not depend on methods they don't use.
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
| Comments explaining *what* | Rename so it's self-evident |
| Mutable shared state | Encapsulate behind a function; return new values |
| Callback pyramid | Async/await with named steps |

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

## Example: Extract Function
```typescript
// Before — inline logic that hides intent
const total = items.reduce((sum, item) => {
  const discounted = item.price * (1 - item.discountRate);
  return sum + discounted * item.quantity;
}, 0);

// After — named helpers reveal intent
const lineTotal = (item: Item) => item.price * (1 - item.discountRate) * item.quantity;
const total = items.reduce((sum, item) => sum + lineTotal(item), 0);
```

## Example: Options Object
```typescript
// Before
function createUser(name: string, age: number, role: string, active: boolean) { ... }

// After
interface CreateUserOptions {
  name: string;
  age: number;
  role: string;
  active: boolean;
}
function createUser(options: CreateUserOptions) { ... }
```

## Example: Async Flattening
```typescript
// Before — callback pyramid / chained .then
fetchUser(id)
  .then(user => fetchOrders(user.id)
    .then(orders => fetchInvoices(orders[0].id)
      .then(invoices => process(user, orders, invoices))));

// After — sequential async/await
async function loadUserData(id: string) {
  const user = await fetchUser(id);
  const orders = await fetchOrders(user.id);
  const invoices = await fetchInvoices(orders[0].id);
  return process(user, orders, invoices);
}
```

## Example: Strategy Pattern
```typescript
// Before — growing switch that requires editing this function for each new type
function calculateShipping(method: string, weight: number): number {
  if (method === 'standard') return weight * 0.5;
  if (method === 'express') return weight * 1.2;
  if (method === 'overnight') return weight * 2.5;
  throw new Error('Unknown method');
}

// After — register new strategies without touching existing code
type ShippingStrategy = (weight: number) => number;

const shippingStrategies: Record<string, ShippingStrategy> = {
  standard: w => w * 0.5,
  express:  w => w * 1.2,
  overnight: w => w * 2.5,
};

function calculateShipping(method: string, weight: number): number {
  const strategy = shippingStrategies[method];
  if (!strategy) throw new Error(`Unknown shipping method: ${method}`);
  return strategy(weight);
}
```

## Dead Code
- Delete unused exports, parameters, branches, and commented-out code — don't leave `// removed` comments.
- Use `tsc --noEmit` and your linter's `no-unused-vars` / `@typescript-eslint/no-unused-vars` to surface dead code automatically.

## When Not to Refactor
- Don't refactor code you don't understand yet — read it first.
- Don't refactor when no tests exist and writing them isn't feasible right now.
- Don't refactor stable, rarely-touched code just for style — the risk/reward is poor.
