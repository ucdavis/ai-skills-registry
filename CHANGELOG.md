# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]

## [1.4.1] - 2026-04-01

### Fixed
- Fixed YAML frontmatter parsing robustness by normalizing quoted descriptions in `skills.json` and related skill metadata formatting (PR #2, thanks to @rlorenzo).

## [1.4.0] - 2026-03-30

### Added
- Added `assistant-ucd-mobile` skill: coding standards, component defaults, and best practices for the UCD Mobile app (Expo, React Native, NativeWind, Expo Router).

## [1.3.3] - 2026-03-28

### Changed
- Synchronized the latest `git-workflow-release` and `skill-authoring-general` skill updates to all locally tracked native agent directories (`.agent/`, `.claude/`, `.cursor/`, `.github/`).

## [1.3.2] - 2026-03-28

### Changed
- Updated `git-workflow-release` instructions to explicitly require the release commit message to include a summary of the changelog entries (bumped skill to v1.1.0).

## [1.3.1] - 2026-03-28

### Changed
- Updated all npm dependencies in `package.json` to their latest versions.
- Explicitly assigned `"types": ["node"]` within `tsconfig.json` to fix compilation issues resulting from dependency bumps.

## [1.3.0] - 2026-03-28

### Changed
- Added SemVer guidelines to `skill-authoring-general` (bumped to `v1.1.0`), detailing how to version skills in `skills.json`.

## [1.2.3] - 2026-03-26

### Security
- Updated `picomatch` to resolve high-severity ReDoS vulnerability via extglob quantifiers and method injection in POSIX character classes ([GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj), [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p)).

## [1.2.2] - 2026-03-26

### Changed
- Updated `assistant-rocky-lti-assist` skill to document `ruff` as the project's linter and formatter (replaces flake8/black/isort), including usage commands and `pyproject.toml` configuration reference.

## [1.2.1] - 2026-03-23

### Changed
- Clarified native agent installation paths and standard `.ai-skills` directory structure.
- Updated terminology from "Themes" to "Categories" across all documentation.
- Removed local development instructions from README for simplicity.

### Fixed
- Fixed typo in `ai-skills install` instructions.

## [1.2.0] - 2026-03-21

### Added
- Added `git-workflow-release` skill to the registry.
- Command line interface now clearly logs when using the local vs remote github registry data.

### Fixed
- Fixed `__dirname` context resolution issues during local repository commands.
- Fixed Vitest test configuration failing locally due to ESM vs CJS context.

## [1.1.1] - 2026-03-21

### Fixed
- Fixed install.js issue

## [1.1.0] - 2026-03-21

### Added
- Created initial `CHANGELOG.md`.
- Added versioning guidelines and changelog instructions to `CONTRIBUTING.md`.

### Changed
- CLI commands now dynamically read the version from `package.json` at runtime instead of a hardcoded string.
- Switched default `npm install` instructions in `README.md` to use the tarball URL (`https://github.com/ucdavis/ai-skills-registry/tarball/main`) to fix `ENOTDIR` symlink issues caused by standard GitHub repository installation in `npm`.

## [1.0.0] - 2026-03-21
### Added
- Initial release of `ai-skills-registry`.
- Core CLI functionality (`list`, `search`, `info`, `install`, `install-all`).
- Provided a starter set of skills spanning multiple categories.

