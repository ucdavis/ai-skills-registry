# Repository Research Checklist

Follow this checklist before drafting documentation so every section is grounded in facts from the codebase.

## 1. Inventory the Project

- Run `ls` / `tree` to understand top-level structure.
- Identify primary language(s) and frameworks by scanning `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, etc.
- Note mono-repo subdirectories (frontend, backend, infra).

## 2. Dependency & Runtime Discovery

- Record language runtimes (Node version from `.nvmrc` or engines, Python version from `.python-version`, etc.).
- Capture major dependencies (web frameworks, ORMs, schedulers, email services, logging libs).
- Flag infra-as-code definitions (Terraform, CloudFormation) for deployment/environment insights.

## 3. Configuration & Secrets

- Search for `.env.example`, `config/*.yml`, `settings.py`, etc.
- Build an environment variable table listing defaults and descriptions.
- Note secret management strategies (Vault, AWS Secrets Manager, Doppler, plain env vars).

## 4. Database Insights

- Locate migration folders (`prisma/migrations`, `db/migrate`, `migrations/`, `schema.sql`).
- Derive table names, columns, foreign keys, and indexes to feed the ERD.
- Check ORM models for relationships if schema files are absent.

## 5. API Surface

- Inspect routing files (`routes/*.ts`, `controllers/`, `api/`). Document HTTP method, path, parameters, auth guards, and response types.
- For GraphQL, capture queries/mutations and schemas, then translate into REST-equivalent descriptions for `web-apis.md`.
- Review frontend routing (Next.js pages, React Router config) for navigation maps.

## 6. Logging & Error Handling

- Search for logging framework initialization (`winston`, `pino`, `logrus`, `structlog`).
- Document log levels, transports (stdout, ELK, Datadog), and correlation IDs.
- Identify global error handlers, middleware, or exception filters.

## 7. Emails & Notifications

- Find templates in `emails/`, `notifications/`, `templates/` or transactional providers (SendGrid, Postmark calls).
- Capture trigger conditions and dynamic template data.

## 8. Scheduled Workloads

- Explore cron definitions, Celery/Sidekiq workers, Temporal workflows, GitHub Actions schedules.
- Record cadence, purpose, and monitoring hooks.

## 9. Operations & Deployment

- Read IaC, CI/CD configs, or docs to list environments, URLs, and release process.
- Capture access roles (RBAC configs, policy files) for the permission matrix.
- Review backup scripts or retention policies if present; otherwise reference organization standards.

## 10. Collaboration Tooling

- Locate `.git/config`, README badges, or contribution guides to determine Git remotes and branch strategy.
- Check issue tracker integrations (JIRA project keys in commits, `.jira` configs) for linking instructions.

Document uncertainties explicitly ("Not present in repo" or "Pending confirmation") so stakeholders know where further clarification is needed.
