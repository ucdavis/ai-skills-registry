---
name: architecture-general
description: Architecture decisions: layering, design patterns, microservices trade-offs, and domain-driven design
---

# Architecture — General

## Layering
- Separate concerns: **presentation → application (use cases) → domain → infrastructure**.
- Dependencies flow inward only — domain has no external dependencies.
- Never import infrastructure code from domain or application layers.
- Thin controllers: route, validate, delegate to use case, return response.

## Design Patterns

| Pattern | When to use |
|---------|-------------|
| Repository | Abstract data access — business logic never queries DB directly |
| Factory | Complex object initialization with many dependencies |
| Strategy | Behavior varies by context; avoid long `if/else` chains |
| Observer/Event | Decouple components across bounded contexts |
| Adapter | Integrate third-party APIs without coupling domain to them |

## Microservices
- Each service owns its data. No shared databases.
- Define API contracts (OpenAPI/gRPC) before implementation.
- Prefer async messaging (queues) for cross-service operations that don't need immediate consistency.
- Design for failure: timeouts, circuit breakers, retries with exponential backoff.
- Avoid distributed monoliths — if services always deploy together, they're a monolith.

## Domain-Driven Design
- Identify bounded contexts before defining APIs.
- Use ubiquitous language — code names match business vocabulary.
- Separate aggregates at transactional boundaries, not technical ones.
- Value objects are immutable; entities have identity and mutable state.

## Decisions to Document
- **What** was decided.
- **Why** — constraints and alternatives considered.
- **Consequences** — trade-offs accepted.
- Use Architecture Decision Records (ADRs) in `docs/decisions/`.

## Trade-offs to Consider
- Consistency vs. availability (CAP theorem).
- Build vs. buy for infrastructure components.
- Sync vs. async for cross-service calls.
- Monolith-first vs. microservices for new systems — default to monolith.
