# JIRA Card Context Checklist

Follow this checklist before drafting a card so every section ties back to verifiable facts.

## Product + Codebase

- Inspect the repository structure (`ls`, `tree`) to see which service or package owns the feature.
- Capture runtime details (language versions, frameworks, package managers) that influence implementation notes.
- Record critical dependencies (APIs, queues, schedulers) relevant to the card.

## Stakeholders + Workflows

- Identify the downstream consumers (end users, internal teams, automation jobs) and their goals.
- Confirm the owning squad, point people, and review expectations.
- Note related tickets, specs, or PRDs to link for traceability.

## Data + Interfaces

- List data sources and storage locations (tables, documents, caches) touched by the change.
- Document API routes, events, or UI entry points that need updates.
- Flag feature flags, config toggles, or environment-specific behavior.

## Risks + Validation

- Enumerate failure scenarios, guardrails, and monitoring hooks.
- Outline testing expectations (unit, integration, QA sign-off) and required evidence.
- Capture sequencing or deployment dependencies (migrations, staged rollouts).

Use these bullets as prompts while investigating project files or interviewing stakeholders. Note unknowns explicitly instead of guessing.
