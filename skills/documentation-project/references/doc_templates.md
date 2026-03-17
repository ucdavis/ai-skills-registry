# Documentation Templates

Use these templates to generate each markdown deliverable. Adapt field names to the codebase you are documenting, but preserve the structure so downstream stakeholders can navigate consistently.

## docs/index.md

- **Purpose:** Acts as the documentation landing page and global table of contents.
- **Structure:**
  1. Title and one-paragraph overview of the product and audience
  2. Bulleted or table-based table of contents linking to every other doc
  3. Optional "How to use this documentation" tips
- **Snippet:**

  ```markdown
  # Project Documentation Hub

  > One-line value proposition.

  ## Contents

  - [README](../README.md)
  - [Development Environment](./development.md)
  - [Database](./database.md)
  - [Architecture](./architecture.md)
  - [Web APIs](./web-apis.md)
  - [Logging & Errors](./logging-and-errors.md)
  - [Emails](./emails.md)
  - [Scheduled Jobs](./scheduled-jobs.md)
  - [Operations](./operations.md)
  - [JIRA & Git](./jira-and-git.md)
  - [PRD](./prd.md)
  ```

## README.md (or Overview inside index.md)

- **Sections:** Introduction, primary features, target users, prerequisites, high-level architecture, quick start summary.
- Highlight runtime requirements (language, framework, package manager versions).
- Summarize architecture with a short paragraph and link to detailed docs.

## docs/development.md

- **Goal:** All instructions required to run the project locally.
- **Outline:**
  1. Prerequisites (OS, runtimes, language versions, package managers)
  2. Installation steps (clone, install dependencies, database setup, migrations)
  3. Environment configuration (env vars table, config files, secrets management)
  4. Running the app (commands for dev, build, lint, tests)
  5. Troubleshooting tips
- **Env Var Table Template:**
  ```markdown
  | Name         | Required | Default | Description                  |
  | ------------ | -------- | ------- | ---------------------------- |
  | APP_PORT     | Yes      | 8080    | Port for HTTP server         |
  | DATABASE_URL | Yes      | n/a     | PostgreSQL connection string |
  ```

## docs/database.md

- **Deliverables:**
  - Supported databases summary
  - Mermaid ERD for the production schema
  - Table-by-table breakdown including primary keys, indexes, relationships, and restore steps
- **Sample ERD:**
  ```mermaid
  erDiagram
      USERS ||--o{ PROJECTS : owns
      PROJECTS ||--o{ TASKS : includes
      USERS {
          uuid id PK
          text email UK
          timestamptz created_at
      }
      PROJECTS {
          uuid id PK
          text name
          uuid owner_id FK
      }
      TASKS {
          uuid id PK
          uuid project_id FK
          text status
      }
  ```
- **Table Description Template:**
  ```markdown
  ### users

  - **Columns:** `id (uuid, pk)`, `email (text, unique index users_email_key)`, `created_at (timestamptz, default now())`
  - **Indexes:** `users_email_key`, `users_created_at_idx`
  - **Relationships:** Referenced by `projects.owner_id`
  ```
- **Restore Instructions:** Document dump files, migration commands, or seed scripts.

## docs/architecture.md

- **Content:** System overview, module boundaries, deployment topology, UML class diagram(s).
- **Mermaid UML Template:**
  ```mermaid
  classDiagram
      class ApiServer {
          +start()
          -loadRoutes()
      }
      class AuthService {
          +verifyToken()
      }
      class Scheduler {
          +enqueue()
      }
      ApiServer --> AuthService : uses
      Scheduler --> ApiServer : triggers webhooks
  ```
- Include bullets that explain folder structure, design patterns, and data flow.

## docs/web-apis.md

- **REST Section:** Table listing `Method`, `Route`, `Description`, `Params`, `Auth`, `Responses`.
- **Web UI Section:** Describe major pages, route guards, and navigation map. Include optional Mermaid flowchart:
  ```mermaid
  flowchart TD
      Landing --> Dashboard
      Dashboard -->|nav| Settings
      Dashboard -->|cta| Reports
  ```

## docs/logging-and-errors.md

- **Logging:** Frameworks, log levels, sinks/targets, rotation/retention, observability tooling.
- **Error Handling:** Global middleware, retry/backoff strategies, error object shape, known error codes, alerting.
- Document log file paths and dashboards.

## docs/emails.md

- **Structure per email:** Name, recipients, subject, trigger condition, sending component, template fields, throttling/monitoring.
- Provide table or subsections per template.

## docs/scheduled-jobs.md

- **For each job:** Purpose, frequency/cron, triggering module, dependencies, datastore touchpoints, monitoring/alerts, retry/timeout semantics.
- **ETL Guidance:** Outline source → transform → destination steps, validation, and failure handling.

## docs/operations.md

- **Subsections:**
  1. Existing deployments (Prod/Staging/Test/Dev) with URLs, infra notes, secrets handling, integrations
  2. Access control matrix (roles × permissions)
  3. Backup and retention policy (what, where, how long, linked policy docs)
  4. Release plan (local build, change ticket template, release steps, rollback)
- **Role Matrix Template:**
  ```markdown
  | Role    | Permissions                  |
  | ------- | ---------------------------- |
  | Admin   | Full CRUD, release approvals |
  | Support | View tickets, rerun jobs     |
  ```

## docs/jira-and-git.md

- Describe JIRA projects, board URLs, ticket workflow, status definitions, and naming conventions.
- Provide Git remote URLs, default branches, branching model, PR checklist, required reviewers, CI gates, and release tagging strategy.

## docs/prd.md

- **Format:** Markdown table with columns `ID`, `Description`, `User Story`, `Expected Behavior`.
- **Example:**
  ```markdown
  | ID     | Description         | User Story                                                 | Expected Behavior                                                                         |
  | ------ | ------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
  | PRM001 | Create new URL list | As a curator, I can start an empty list so I can add URLs. | UI exposes "New list" action that creates an empty collection and focuses the name field. |
  ```
- Add backlog ordering, release grouping, and acceptance criteria notes under the table if needed.

## Writing Tips

- Use consistent heading levels across docs so ToCs look predictable.
- State assumptions explicitly when codebase lacks source data; prefer "Unknown" labels over guessing.
- Cross-link related docs so readers can pivot quickly (e.g., reference `architecture.md` from `scheduled-jobs.md`).
