---
name: project
description: Generate full project documentation packages (index, README/overview, development setup, database ERDs, architecture UML, REST/web UI specs, logging, emails, scheduled jobs, ops runbooks, Jira/Git guides, PRDs). Use when asked to inspect a codebase and produce markdown docs under docs/ plus supporting README.
metadata:
  domain: documentation
  id: documentation/project
  concept: documentation
  language: general
  category: documentation
  version: 1.0.0
  tags: [documentation, docs, project, architecture, overview]
---

# Project Documentation Toolkit

## Overview

Produce an end-to-end documentation suite for any repository by auditing the codebase, extracting technical truths, and writing markdown deliverables under `docs/` plus a top-level README or overview section. Follow the workflow below to stay consistent and traceable back to source code.

## Workflow Quickstart

1. **Audit the repo** – Load [references/research_checklist.md](references/research_checklist.md) and inventory languages, frameworks, configs, databases, routes, jobs, and integrations.
2. **Capture hard facts** – Take structured notes for runtimes, env vars, schema details, API endpoints, background jobs, deployments, and collaboration tooling.
3. **Generate docs** – Use the templates in [references/doc_templates.md](references/doc_templates.md) to draft each markdown file, inserting the audited facts, diagrams, and tables.
4. **Cross-link and verify** – Ensure `docs/index.md` links to every file, diagrams compile (Mermaid), tables render, and unknown data is explicitly labeled as TODO or "Not documented".
5. **Final pass** – Confirm folder structure, run markdown lint if available, and highlight assumptions in a final notes section if stakeholders must confirm.

## Research Guidance

- Start every engagement by reading [references/research_checklist.md](references/research_checklist.md). It lists concrete places to inspect (migrations, routers, workers, deployment manifests) and the artifacts each doc requires.
- When facts are missing from the repo, state the gap rather than guessing, and recommend next steps (e.g., "Need PM confirmation for backup retention window").

## Documentation Package

All files live under `./docs` unless stated otherwise. Templates and sample snippets for each deliverable reside in [references/doc_templates.md](references/doc_templates.md).

### docs/index.md (Hub + README/Overview)

- Provide the project introduction, purpose, target audience, and quick product summary.
- Include a table of contents linking to _every_ other markdown file (relative paths) plus the README if it exists separately.
- Either create a dedicated `README.md` alongside `docs/` or embed the overview directly in `index.md`. Always mention prerequisites (languages, frameworks, services) and a brief architecture recap that links to `architecture.md`.

### docs/development.md (Development & Runtime Environment)

- Document prerequisites, installation commands, databases/services to start, and run/test scripts.
- Present env vars/config in a table (name, required, default, description) and cite where they are defined.
- Note troubleshooting steps, common migration commands, and how to seed test data.

### docs/database.md

- Summarize supported databases/environments and list connection details or secrets owners.
- Draw a Mermaid ERD describing key tables, keys, and relationships (see template reference).
- For each table, describe columns with types, primary keys, indexes, and relationships. Include restore/backup steps, seed scripts, or migration commands needed locally.

### docs/architecture.md

- Outline system components, deployment topology, and module boundaries.
- Include at least one Mermaid `classDiagram` or `flowchart` showing services, classes, or layers and how they interact.
- Summarize folder structure, design patterns, third-party integrations, and data flow between tiers.

### docs/web-apis.md

- Catalog REST (or GraphQL) endpoints: method, route, params/query/body, auth, response formats, and error codes.
- Describe major frontend routes or views, navigation flow, and guarded pages. Provide a simple site map or flowchart when helpful.

### docs/logging-and-errors.md

- Describe logging frameworks, log levels, sinks, rotation/retention, observability tooling, and correlation IDs.
- Explain error-handling approach: middleware, exception classes, retry/backoff logic, alerting, and known error codes/messages.
- Specify where logs live (files, cloud services) and how engineers monitor them.

### docs/emails.md

- For every outbound email/notification, list recipients, subject, triggers, sending service, throttling rules, and template data fields.
- Include links to template files or code modules plus monitoring/alerting references.

### docs/scheduled-jobs.md

- Document each cron or background job (purpose, schedule, implementation file, dependencies, datastore touchpoints, monitoring, retries).
- For ETL workloads, outline source → transform → destination plus validation/rollback procedures.

### docs/operations.md (Operational Information)

- Capture environment matrix (Prod/Staging/Test/Dev) with URLs, hostnames, infra notes, secrets handling, logging destinations, and integrations/dependencies.
- Provide an access/role permission matrix, backup & retention policy summary, and detailed release plan (local build, change ticket template, release steps, rollback instructions referencing org standards if available).

### docs/jira-and-git.md

- List JIRA project keys, board URLs, workflow states, ticket naming conventions, and any service desk contacts.
- Document Git remotes, default branches, branching strategy, PR requirements, CI gates, tagging/versioning, and merge responsibilities.

### docs/prd.md (Feature Table)

- Build a markdown table with columns `ID`, `Description`, `User Story`, `Expected Behavior` to capture core features/backlog items.
- Use stable IDs (PRM###) and keep descriptions outcome-oriented. Add release groupings or acceptance criteria after the table if needed.

## Diagram & Formatting Standards

- Mermaid blocks must render standalone in Markdown (no indentation). Validate syntax using https://mermaid.live when uncertain.
- Use sentence case headers, wrap file names in backticks (`architecture.md`), and link between docs for discoverability.
- Prefer declarative, audit-friendly language ("Service emits structured JSON logs" vs. "We log stuff").
- Call out assumptions or unknowns explicitly at the end of each doc section.

## Validation Checklist

- `docs/` folder contains: `index.md`, `development.md`, `database.md`, `architecture.md`, `web-apis.md`, `logging-and-errors.md`, `emails.md`, `scheduled-jobs.md`, `operations.md`, `jira-and-git.md`, `prd.md`.
- README exists (or `index.md` doubles as overview) and references the docs folder.
- All internal links are relative and tested.
- ERD/UML/flow diagrams reference actual schema/modules found during the audit.
- Environment tables, job schedules, and endpoint lists cite their source files where possible (e.g., "Derived from routes/api.ts").
