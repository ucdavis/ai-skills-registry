# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Unreleased]

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

