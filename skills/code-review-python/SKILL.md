---
name: code-review-python
description: Performs structured code reviews on Python and FastAPI codebases covering correctness, async safety, security, Pydantic v2 patterns, testing, and style.
---

# Code Review Best Practices

When asked to review code — a file, a function, a PR diff, or a module — follow this checklist systematically. Always provide **specific, actionable feedback** with line references and concrete improvement suggestions. Never give vague praise or criticism.

---

## 1. Understand the Intent First

Before writing any comment:

- Read the code **top-to-bottom** at least once without commenting.
- Understand what the code is **supposed to do**, not just what it does.
- Note the surrounding context (imports, dependencies, callers).

---

## 2. Correctness & Logic

Check for bugs, edge-cases, and incorrect assumptions.

- **Off-by-one errors**, incorrect loop bounds, or fence-post mistakes.
- **None/null safety**: are optional values guarded before use?
- **Exception handling**: are exceptions caught at the right level? Are bare `except:` or `except Exception:` clauses swallowing errors silently?
- **Async correctness**: are `await` calls present where required? Is there any blocking I/O (e.g., `time.sleep`, synchronous DB calls) in an async context?
- **Return values**: is every code path returning a value? Are early returns correct?
- **Concurrency**: any shared mutable state in async code? Any race conditions?

**Example annotation style:**
```
# ❌ Bug: This will silently ignore ALL exceptions, masking real failures.
try:
    result = await some_call()
except Exception:
    pass

# ✅ Fix: Log and re-raise, or handle specifically.
try:
    result = await some_call()
except SpecificError as e:
    logger.error("Failed during some_call: %s", e)
    raise
```

---

## 3. Security

- **Never log secrets**, tokens, or PII (passwords, API keys, user data).
- **Input validation**: all external inputs (request bodies, query params, path params) must be validated — prefer Pydantic models over raw dict access.
- **SQL Injection**: never use raw string formatting in queries; always use parameterized queries or ORM methods.
- **CORS**: ensure `allow_origins=["*"]` is only used in local/dev environments; flag it with a `# FIXME` if it is not environment-gated.
- **Secrets in code**: flag any hardcoded credentials, tokens, or keys as **CRITICAL**.
- **Authentication & authorization**: verify that protected endpoints use proper dependency injection (e.g., `Depends(get_current_user)`).

---

## 4. Pydantic & Data Models

- Use `model_config = ConfigDict(...)` not `class Config`.
- Use `@field_validator` / `@model_validator`, not `@validator` / `@root_validator`.
- Use `model_dump()` / `model_dump_json()`, not `.dict()` / `.json()`.
- Use `BaseSettings` from `pydantic_settings` (separate package) for env config.
- Pydantic models should be the single source of truth for shape and validation — avoid duplicate manual validation.

---

## 5. FastAPI Patterns

- **Router organization**: routers should live in dedicated routing directories (e.g., `api/routers/`), with a single responsibility (one logical domain per router).
- **Dependency injection**: use `Depends()` for shared logic (auth, DB sessions, config). Avoid instantiating dependencies inside route functions.
- **Response models**: always declare `response_model=` on route decorators so the API contract is explicit and documented.
- **Status codes**: use explicit `status_code=` (e.g., `status_code=201` for creation, `status_code=204` for deletion).
- **Error responses**: use `HTTPException` with appropriate status codes. Never return `500` for client errors.
- **Lifespan events**: startup/shutdown logic belongs in lifespan context managers, not in `@app.on_event` (deprecated in FastAPI 0.93+).

---

## 6. Design & Architecture

- **Single Responsibility**: each function/class should do one thing. If a function is doing more than one logical thing, suggest splitting it.
- **DRY (Don't Repeat Yourself)**: flag duplicated logic and suggest extraction into a shared utility or base class.
- **Dependency direction**: high-level modules should not import from low-level implementation details.
- **Magic values**: flag any hardcoded strings or numbers that should be constants or config values.
- **God objects**: classes that know too much or do too much should be flagged for decomposition.

---

## 7. Testing

- **Coverage**: is the changed code covered by unit tests? If not, call this out explicitly.
- **Test scope**: unit tests should mock external I/O (e.g., `httpx`, DB, MCP clients). Integration tests may use real services.
- **Edge cases**: are tests covering error paths, not just the happy path?
- **Assertions**: tests must assert on the **expected output** — not just that the code ran without exception.
- **Test isolation**: tests must not depend on global state or execution order. Use fixtures to set up and tear down state.
- **Naming**: test names should follow `test_<what>_<condition>_<expected_outcome>` convention.

---

## 8. Documentation & Readability

- **Docstrings**: public functions and classes must have docstrings. Use Google-style docstrings for consistency:
  ```python
  def my_func(x: int) -> str:
      """One-line summary.

      Args:
          x: Description of x.

      Returns:
          Description of the return value.

      Raises:
          ValueError: If x is negative.
      """
  ```
- **Inline comments**: complex or non-obvious logic must be explained inline. If the comment just restates what the code does, remove it.
- **Variable names**: single-letter names (except loop counters like `i`) and cryptic abbreviations should be flagged.
- **Function length**: functions longer than ~50 lines are a signal to refactor. Flag them.

---

## 9. Style & Consistency

- **Type hints**: all function signatures must have type hints for arguments and return values.
- **Imports**: standard library → third-party → local (PEP 8). No wildcard imports (`from foo import *`).
- **Formatting**: ensure code adheres to the project's formatting and linting rules (e.g., `ruff`, `black`). Flag obvious style deviations (long lines >120 chars, inconsistent quoting, etc.).
- **Logging**: use `logger.error("msg: %s", var)` (lazy %-formatting), never f-strings in log calls (performance anti-pattern).
- **TODO/FIXME comments**: all `# TODO` and `# FIXME` comments must include context. Flag any that are vague or very old.

---

## 10. Output Format

When delivering a code review, structure your response as follows:

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

Use this as a mental checklist before finalizing any review:

- [ ] Logic is correct for all known edge cases
- [ ] No silent exception swallowing
- [ ] No blocking I/O in async context
- [ ] All inputs are validated (Pydantic)
- [ ] No secrets hardcoded or logged
- [ ] CORS / auth guards are correct for environment
- [ ] Pydantic V2 syntax used throughout
- [ ] FastAPI router / dependency patterns are followed
- [ ] Test coverage exists for the changed code
- [ ] Type hints present on all public functions
- [ ] Docstrings present on public functions and classes
- [ ] No magic numbers or strings — use constants/config
- [ ] Logging uses %-formatting, not f-strings
