---
name: git-workflow-release
description: Standardized process for committing changes and releasing a new version. Includes steps for bumping versions in package files, updating the CHANGELOG.md, ensuring the README.md is up to date, and creating git release tags. Use when the user asks to "prepare a release", "bump the version", or "release a new version".
---

# Git Workflow: Release Process

Follow these instructions to safely and consistently release a new version of the project.

## 1. Verify Clean Workspace and Tests
- Ensure there are no untracked files or uncommitted changes (unless they are part of the release).
- Ensure all tests pass (`npm test` or the language equivalent).

## 2. Update Documentation
- **README.md**: Ensure the `README.md` reflects any new features, installation steps, or usage examples introduced since the last release.
- **CHANGELOG.md**: 
  - Add a new section at the top of the changelog for the new version (e.g., `## [1.2.0] - YYYY-MM-DD`).
  - Categorize changes into `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
  - Review recent commit messages (`git log`) to capture all user-facing changes.

## 3. Bump the Version Number
- Consult the current version using `package.json` (or the language equivalent, such as `pyproject.toml` or `Cargo.toml`).
- Determine the new version number using Semantic Versioning (SemVer):
  - **MAJOR** version for incompatible API changes.
  - **MINOR** version for adding functionality in a backward-compatible manner.
  - **PATCH** version for backward-compatible bug fixes.
- Update the version number in all necessary files. For Node.js projects, use `npm version <major|minor|patch> --no-git-tag-version` if appropriate, or edit `package.json` manually.

## 4. Commit the Release Changes
- Stage the `package.json`, `CHANGELOG.md`, `README.md`, and any other updated metadata files.
- Commit with a standard release message:
  ```bash
  git commit -m "chore(release): bump version to v<NEW_VERSION>"
  ```

## 5. Tag the Release
- Create an annotated git tag for the new version.
  ```bash
  git tag -a v<NEW_VERSION> -m "Release v<NEW_VERSION>"
  ```

## 6. Push Changes
- Push the release commit and the new tag to the remote repository.
  ```bash
  git push origin main
  git push origin v<NEW_VERSION>
  ```
- *Note: Replace `main` with the appropriate default branch if different.*

## Edge Cases
- **Hotfixes**: If releasing a critical bug fix, bump the PATCH version and ensure the changelog explicitly calls out the fix.
- **Pre-releases**: Use `-alpha`, `-beta`, or `-rc` suffixes (e.g., `1.2.0-beta.1`) if preparing a pre-release version for testing.
