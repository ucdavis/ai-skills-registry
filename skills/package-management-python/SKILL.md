---
name: package-management-python
description: Manage Python packages, virtual environments, and dependencies using uv. Use when installing packages, creating virtual environments, initializing Python projects, resolving dependencies, or running Python scripts.
---

# Python Package Management with uv

This workspace exclusively uses `uv` for Python package management, dependency resolution, and virtual environment handling. Never fall back to `pip` or `python -m venv` unless `uv` explicitly fails.

## Rules

### Package Installation
- **NEVER** use `pip install`
- **ALWAYS** use `uv add <package>` (for `pyproject.toml`-managed projects) or `uv pip install <package>` (for ad-hoc installs)

### Virtual Environments
- **NEVER** use `python -m venv`
- **ALWAYS** use `uv venv` to create virtual environments

### Dependency Resolution
- Use `uv pip compile` to generate lockfiles (`requirements.txt` or `uv.lock`) instead of `pip freeze`

### Project Initialization
- Use `uv init` when initializing a new Python project

### Performance
- Assume `uv` is available; do not fall back to `pip` unless `uv` explicitly fails

## Command Reference

| Task | Command |
|------|---------|
| Install / add a package | `uv add <package>` |
| Ad-hoc install (no pyproject.toml) | `uv pip install <package>` |
| Run a script | `uv run <script.py>` |
| Sync environment to lockfile | `uv sync` |
| Install a dev tool | `uv tool install <tool>` |
| Create a virtual environment | `uv venv` |
| Compile a lockfile | `uv pip compile requirements.in -o requirements.txt` |
| Initialize a new project | `uv init` |

## Common Workflows

### New project from scratch
```bash
uv init my-project
cd my-project
uv add requests fastapi
uv run python -c "import requests; print('ok')"   # verify deps installed
uv run main.py
```

### Clone and set up an existing project
```bash
git clone <repo-url> && cd <repo>
uv sync
uv pip list              # verify pinned dependencies resolved
uv run main.py
```

### Migrate from pip to uv
```bash
uv venv .venv
uv pip install -r requirements.txt
uv pip list                                          # verify all packages present
uv pip compile requirements.in -o requirements.txt   # regenerate lockfile
```
