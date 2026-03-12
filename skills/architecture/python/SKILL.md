---
name: python
description: System architecture guidance including layering, design patterns, microservices, and domain-driven design.
metadata:
  domain: architecture
  id: architecture/python
  concept: architecture
  language: python
  category: architecture
  version: 1.0.0
  category: architecture
  tags: [architecture, design-patterns, microservices, clean-architecture, ddd]
---

# Architecture — Python

In addition to general architecture principles, apply these Python-specific patterns:

## Code Quality
- Follow PEP-8. Use `ruff` for linting and formatting.
- Use type hints everywhere. Run `mypy --strict` in CI.
- Prefer `dataclasses` or `pydantic` for structured data over plain dicts.

## Project Structure
```
src/
  myapp/
    domain/          # pure business logic, no I/O
      models.py
      services.py
    application/     # use cases, orchestrates domain
      use_cases.py
    infrastructure/  # DB, HTTP, filesystem
      repositories.py
      http_client.py
    presentation/    # FastAPI routes, CLI, etc.
      routes.py
  tests/
    unit/
    integration/
```

## Patterns
- **Repository**: abstract data access behind a protocol/ABC.
  ```python
  class UserRepository(Protocol):
      def find_by_id(self, user_id: UUID) -> User | None: ...
      def save(self, user: User) -> None: ...
  ```
- **Dependency injection**: accept dependencies as constructor args, not global imports.
- **Factories**: use `@classmethod` factory methods for complex initialization.
- **Value objects**: use `@dataclass(frozen=True)` for immutable domain objects.

## Error Handling
- Define domain-specific exception classes in `domain/exceptions.py`.
- Catch broad exceptions only at the boundary (presentation layer).
- Never use bare `except:` — always specify the exception type.
- Log with context; re-raise when the caller needs to handle it.

## Async
- Use `asyncio` + `async/await` for I/O-bound work (HTTP, DB with asyncpg/SQLAlchemy async).
- Don't mix sync and async without `asyncio.run_in_executor` for blocking calls.
- Use `asyncio.gather` for concurrent independent I/O operations.
