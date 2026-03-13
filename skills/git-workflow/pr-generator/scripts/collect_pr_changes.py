#!/usr/bin/env python3
"""Collect git diff/log data between two branches.

Usage:
  collect_pr_changes.py <base_branch> <head_branch> [--repo PATH]

Outputs:
  - name_status.txt
  - diff.txt
  - log.txt
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> str:
    result = subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    return result.stdout


def write_output(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect git diff/log data.")
    parser.add_argument("base_branch", help="Base branch (target branch)")
    parser.add_argument("head_branch", help="Head branch (feature branch)")
    parser.add_argument("--repo", default=".", help="Repo path (default: .)")
    args = parser.parse_args()

    repo_path = Path(args.repo).resolve()
    if not (repo_path / ".git").exists():
        print(f"Not a git repo: {repo_path}", file=sys.stderr)
        return 2

    base = args.base_branch
    head = args.head_branch

    name_status = run(["git", "diff", "--name-status", f"{base}..{head}"], repo_path)
    diff = run(["git", "diff", f"{base}..{head}"], repo_path)
    log = run(["git", "log", "--oneline", f"{base}..{head}"], repo_path)

    out_dir = repo_path / "pr_change_snapshot"
    out_dir.mkdir(parents=True, exist_ok=True)

    write_output(out_dir / "name_status.txt", name_status)
    write_output(out_dir / "diff.txt", diff)
    write_output(out_dir / "log.txt", log)

    print(f"Wrote outputs to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
