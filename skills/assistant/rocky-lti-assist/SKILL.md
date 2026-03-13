---
name: rocky-lti-assist
description: Coding assistant for the Rocky-LTI project — a Canvas LTI 1.3 integration with an AI-powered educational agent. Use when working on FastAPI endpoints, MCP server components, SQLAlchemy models, Alembic migrations, Azure Functions workers, React/TypeScript frontend, or LTI/OAuth authentication flows in this codebase.
metadata:
  project: rocky-lti
  version: "1.0"
---

# Rocky-LTI Coding Assistant

Provides project-aware coding guidance for the Rocky-LTI Canvas integration.

## Project Overview

Rocky-LTI is a Canvas LMS integration using LTI 1.3 that exposes an AI agent (Rocky) to students and instructors. The AI agent is powered via Model Context Protocol (MCP), with Canvas course data surfaced as MCP resources and tools.

## Monorepo Structure

```
rocky-lti/
├── lti/
│   ├── backend/
│   │   ├── agent/           # FastAPI server + MCP (PRIMARY backend)
│   │   │   ├── src/
│   │   │   │   ├── app.py   # FastAPI entrypoint
│   │   │   │   ├── api/     # Routes, models, services
│   │   │   │   ├── canvas_mcp/  # MCP server (servers, services, classes, models)
│   │   │   │   └── env.py   # Pydantic settings
│   │   │   ├── tests/       # pytest-asyncio tests
│   │   │   └── alembic/     # DB migrations (agent-side)
│   │   ├── db/              # Shared SQLAlchemy models package
│   │   │   └── src/canvas_lti_db/
│   │   └── workers/         # Azure Functions (async tasks)
│   ├── setup/               # LTI tool registration scripts
│   └── web/
│       ├── lti-frontend/    # Production React 19 + TypeScript app
│       └── lti-test-app/    # Dev/test Vite app
├── packages/
│   ├── rocky-chat/          # Shared npm chat component
│   └── rocky-chat-next/     # Next.js variant
└── infrastructure/terraform/ # Azure IaC
```

## Tech Stack & Conventions

### Python Backend
- **Runtime**: Python 3.13, managed exclusively with `uv`
- **Framework**: FastAPI with async/await throughout
- **ORM**: SQLAlchemy (async) + asyncpg (PostgreSQL)
- **MCP**: FastMCP for Canvas resource/tool/prompt exposure
- **Auth**: python-jose for JWT; LTI 1.3 OIDC launch flow
- **Observability**: OpenTelemetry + Azure Monitor

**Never use `pip` or `python -m venv`. Always use:**
```bash
uv add <package>          # add dependency
uv run <script.py>        # run script
uv sync                   # sync environment
uv run pytest             # run tests
```

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **State**: React Query for server state
- **Styling**: Sass
- **AI Streaming**: OpenAI SDK (streaming responses)
- **Package manager**: npm (workspace at root)

### Infrastructure
- **Cloud**: Azure Container Apps (deployment target)
- **CI/CD**: GitHub Actions (`.github/workflows/`)
  - `develop` push → test environment
  - Release/RC tags → stage environment
- **IaC**: Terraform under `infrastructure/terraform/`
- **Containers**: Multi-stage Docker builds

## Key Patterns

### FastAPI Route Structure
Routes live under `lti/backend/agent/src/api/` organized by domain (e.g., `lti/`, `oauth/`, `agent/`, `tools/`). Each domain typically has:
- `router.py` — FastAPI router with endpoint definitions
- `models.py` — Pydantic request/response models
- `service.py` — Business logic (called from router)
- `db.py` — Database access layer

### MCP Components (`canvas_mcp/`)
- `servers/` — FastMCP server instances
- `services/` — Canvas API data fetching
- `classes/` — Domain abstractions
- `models/` — Pydantic models for MCP types

### Database Models
- Shared models in `lti/backend/db/src/canvas_lti_db/`
- Migrations split: `lti/backend/agent/alembic/` and `lti/backend/db/alembic/`
- Always use async SQLAlchemy patterns

### Testing
- Framework: `pytest` + `pytest-asyncio`
- Tests in `lti/backend/agent/tests/`
- Mock Canvas OAuth server (Docker) for integration tests
- Run: `uv run pytest` from `lti/backend/agent/`

### LTI 1.3 Auth Flow
1. Canvas initiates OIDC login (`/lti/login`)
2. App redirects back with signed JWT
3. Canvas POSTs launch JWT (`/lti/launch`)
4. App validates JWT, creates session

### Environment Config
- `lti/backend/agent/src/env.py` — Pydantic `BaseSettings`
- Secrets via environment variables (Azure Key Vault in prod)

## Common Tasks

### Add a new API endpoint
1. Add route in appropriate `api/<domain>/router.py`
2. Define Pydantic models in `api/<domain>/models.py`
3. Implement logic in `api/<domain>/service.py`
4. Write async tests in `tests/`

### Add a new MCP resource or tool
1. Implement in `canvas_mcp/services/`
2. Register in appropriate `canvas_mcp/servers/` file
3. Add Pydantic types to `canvas_mcp/models/`

### Add a database model
1. Add SQLAlchemy model to `lti/backend/db/src/canvas_lti_db/`
2. Generate migration: `uv run alembic revision --autogenerate -m "description"`
3. Apply: `uv run alembic upgrade head`

### Add a frontend feature
1. Work in `lti/web/lti-frontend/src/`
2. Use React Query for data fetching
3. Shared chat UI lives in `packages/rocky-chat/`

## Pydantic v2

This project uses Pydantic v2. Key differences:
- Use `model_validator`, `field_validator` (not v1 `@validator`)
- Use `model_dump()` not `.dict()`
- Use `model_config = ConfigDict(...)` not `class Config`
- Settings via `pydantic-settings` `BaseSettings`

## Code Quality Guidelines

- Prefer async/await for all I/O
- Keep routers thin — delegate to services
- Use dependency injection (`Depends`) for DB sessions, auth
- Type-annotate all function signatures
- Write tests for new endpoints and services
- Follow existing module structure — don't create new top-level packages without discussion
