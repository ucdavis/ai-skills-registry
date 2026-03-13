---
name: python
description: Manage Python packages, virtual environments, and dependencies using uv. Use when installing packages, creating virtual environments, initializing Python projects, resolving dependencies, or running Python scripts in a uv-managed workspace.
compatibility: Requires uv to be installed in the environment
metadata:
  author: tpa
  version: "1.0"
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

## Examples

### Adding a dependency
```bash
# Good
uv add requests

# Bad — never do this
pip install requests
```

### Creating a virtual environment
```bash
# Good
uv venv .venv

# Bad — never do this
python -m venv .venv
```

### Running a script
```bash
uv run main.py
```

### Syncing dependencies after cloning a project
```bash
uv sync
```
