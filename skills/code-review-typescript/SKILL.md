---
name: code-review-typescript
description: Performs structured code reviews on TypeScript codebases covering correctness, type safety, async patterns, security, testing, and style. Use when reviewing TypeScript code, pull requests, or when asked to do a code review on a TypeScript or Node.js project.
---

# Code Review — TypeScript

When asked to review code — a file, a function, a PR diff, or a module — follow this checklist systematically. Always provide **specific, actionable feedback** with line references and concrete improvement suggestions. Never give vague praise or criticism.

---

## 1. Understand the Intent First

Before writing any comment:

- Read the code **top-to-bottom** at least once without commenting.
- Understand what the code is **supposed to do**, not just what it does.
- Note the surrounding context (imports, types, callers).

---

## 2. Correctness & Logic

Check for bugs, edge cases, and incorrect assumptions.

- **Null/undefined safety**: are optional values guarded before use? Look for unchecked `?.` chains that silently return `undefined` instead of throwing.
- **Type narrowing gaps**: is `typeof`, `instanceof`, or a discriminated union guard used before accessing a narrowed type?
- **Return completeness**: does every code path return a value? Does TypeScript's `noImplicitReturns` flag these?
- **Array/object mutation**: is the caller's data mutated unintentionally? Flag in-place sorts or push/splice on received arrays.
- **Equality**: `==` vs `===` — always use `===` in TypeScript.
- **Off-by-one errors**, incorrect loop bounds, or fence-post mistakes.

**Example:**
```typescript
// ❌ Bug: silently returns undefined if user is not found — caller likely expects to throw
const name = users.find(u => u.id === id)?.name;

// ✅ Fix: be explicit about the missing case
const user = users.find(u => u.id === id);
if (!user) throw new Error(`User ${id} not found`);
const name = user.name;
```

---

## 3. Type Safety

- **`any` usage**: flag every `any`. Suggest `unknown` + type guard, or a proper interface.
- **Type assertions (`as`)**: flag casts that bypass the type system without a guard. `as unknown as X` is almost always wrong.
- **Non-null assertions (`!`)**: flag every `!` postfix operator — it disables null checking. Require a comment explaining why it's safe, or replace with a guard.
- **`strict: true`**: if the tsconfig lacks `strict: true`, flag it. At minimum, `strictNullChecks` and `noImplicitAny` must be enabled.
- **Overly wide types**: `string | number | boolean | object` — suggest a discriminated union or a named type.
- **`interface` vs `type`**: prefer `interface` for object shapes that may be extended; `type` for unions, intersections, and aliases.

**Example:**
```typescript
// ❌ Unsafe: assertion without evidence
const result = response.data as UserProfile;

// ✅ Safe: validate at the boundary
if (!isUserProfile(response.data)) throw new TypeError('Unexpected API response shape');
const result: UserProfile = response.data;
```

---

## 4. Async & Concurrency

- **Unhandled promise rejections**: every `Promise` must be either `await`-ed, `.catch()`-ed, or explicitly `void`-ed with a comment.
- **Floating `async` functions**: `async` functions called without `await` silently drop errors.
- **Blocking in async context**: `fs.readFileSync`, `execSync`, or CPU-heavy loops in an async function block the event loop — flag them.
- **Sequential vs parallel**: independent `await` calls that could run with `Promise.all` are a performance issue.
- **`Promise.all` failure modes**: `Promise.all` fails fast on the first rejection; use `Promise.allSettled` when partial failure is acceptable.
- **Race conditions**: shared mutable state mutated across `await` points without a lock is a race condition.

**Example:**
```typescript
// ❌ Sequential when independent
const user = await fetchUser(id);
const orders = await fetchOrders(id);

// ✅ Parallel
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

---

## 5. Security

- **Hardcoded secrets**: flag any hardcoded API keys, tokens, passwords, or connection strings as **CRITICAL**.
- **Never log secrets or PII**: check `console.log` / logger calls for request bodies, auth headers, or user data.
- **Input validation**: all external inputs (HTTP request bodies, query params, env vars) must be validated — flag raw `req.body.x` access without a schema (Zod, Valibot, or class-validator).
- **Prototype pollution**: `Object.assign({}, userInput)` or `{...userInput}` with untrusted input can pollute prototypes — prefer explicit field extraction.
- **SQL/NoSQL injection**: never use template literals or string concatenation to build queries; always use parameterized queries or an ORM.
- **`eval` / `Function()`**: flag any dynamic code execution.
- **Path traversal**: `path.join(baseDir, userInput)` without normalization and boundary-checking is a vulnerability.

---

## 6. Design & Architecture

- **Single Responsibility**: each function/class should do one thing. If a name needs "and", flag it.
- **DRY**: flag duplicated logic and suggest extraction.
- **Dependency direction**: high-level modules should not import implementation details from lower-level modules.
- **Magic values**: hardcoded strings and numbers should be named constants or config entries.
- **Long parameter lists (4+)**: suggest an options object with a typed interface.
- **Boolean parameters**: a `doX(data, true)` call is opaque — suggest two functions or a discriminated union.
- **God functions**: functions over ~50 lines are a signal to decompose.

---

## 7. Error Handling

- **Silent swallowing**: `catch (e) {}` or `catch (e) { return null; }` hides failures — require logging and re-throwing or explicit handling.
- **Error types**: throwing plain strings (`throw "something failed"`) loses stack traces — always throw `Error` instances or subclasses.
- **Error propagation**: errors at async boundaries must be caught or they become unhandled rejections.
- **Result types**: in domain logic, consider `Result<T, E>` patterns over throwing for expected failures.

```typescript
// ❌ Loses the stack trace
throw "user not found";

// ✅
throw new UserNotFoundError(`User ${id} not found`);
```

---

## 8. Testing

- **Coverage**: is the changed code covered? Call out specific untested paths explicitly.
- **Test scope**: unit tests must mock external I/O (HTTP clients, DB, filesystem). Integration tests may use real services.
- **Edge cases**: are error paths, empty inputs, and boundary values tested — not just the happy path?
- **Assertions**: tests must assert on the expected **output** or **side effect** — not just that the code ran without throwing.
- **Isolation**: tests must not share mutable state or depend on execution order. Use `beforeEach`/`afterEach` to reset.
- **Naming**: `it('should <do X> when <condition>')` — not `it('test 1')`.
- **`expect.assertions(n)`**: use in async tests to catch cases where the assertion is never reached.

---

## 9. Style & Consistency

- **ESLint**: flag obvious ESLint violations if a config is present.
- **`const` over `let`**: prefer `const` for all values that are not reassigned.
- **Imports**: external packages before internal modules; no wildcard imports (`import * as foo`).
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/classes/components, `SCREAMING_SNAKE_CASE` for module-level constants.
- **`console.log`**: flag any left in production code — use a proper logger.
- **TODO/FIXME comments**: must include context and ideally a ticket reference. Flag vague or stale ones.
- **Unused variables**: flag `_unused` that are not intentional; TypeScript's `noUnusedLocals` should catch these.

---

## 10. Output Format

Structure your response as follows:

### Summary
A 2–4 sentence overview: what does the code do, is it generally well-written, what is the most important concern?

### Critical Issues 🔴
Issues that **must** be fixed before merging: security vulnerabilities, data loss risks, correctness bugs, broken contracts. Number each item.

### Improvements 🟡
Things that are not blocking but meaningfully improve quality: design issues, missing tests, performance problems, unclear naming. Number each item.

### Minor / Nits 🟢
Style, convention, and cleanup items that improve consistency but have minimal functional impact. Can be bulleted for brevity.

### Positive Highlights ✅
Call out what is done well. This is not optional — good feedback is balanced.

---

## Quick Reference Checklist

- [ ] Logic is correct for all known edge cases
- [ ] No unchecked null/undefined access
- [ ] No `any` — use `unknown` + type guard or a proper type
- [ ] No unsafe type assertions (`as X`) without a guard
- [ ] No non-null assertions (`!`) without justification
- [ ] `strict: true` (or at minimum `strictNullChecks` + `noImplicitAny`) in tsconfig
- [ ] All promises are awaited, caught, or explicitly voided
- [ ] No blocking I/O in async context
- [ ] Independent async calls use `Promise.all`
- [ ] No hardcoded secrets or PII in logs
- [ ] All external inputs are validated with a schema
- [ ] No silent exception swallowing
- [ ] Errors thrown as `Error` instances, not strings
- [ ] Test coverage exists for the changed code
- [ ] No `console.log` left in production paths
- [ ] No magic numbers or strings — use named constants
