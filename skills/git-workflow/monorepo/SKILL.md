---
name: monorepo
description: Provides Git monorepo workflow standards covering branching strategy, semantic version release tagging, commit message formats, pull request guidelines, and merge conflict resolution. Use when the user asks about branching, versioning, commit conventions, PR reviews, or resolving merge conflicts in a monorepo.
metadata:
  domain: git-workflow
  id: git-workflow/monorepo
  concept: git-workflow
  language: general
  category: engineering
  version: 1.0.0
  tags: [git, monorepo, branching, versioning, semver, commits, pr, merge-conflicts]
---

# Git Monorepo Usage Standards

## Branching Strategy

### Main Branch (`main`)
* The `main` branch serves as the primary branch, representing the stable, production-ready version of the project.
* Only thoroughly tested and approved changes should be merged into `main`.
* Direct commits to `main` should be restricted, and changes should be integrated via pull requests from `develop`.
* If a bug fix is required on the `main` branch while the `develop` branch holds updates for the next minor or major release, a hotfix branch can be created from `main` (e.g., `main-PROJ-<ticket-number>`). Once complete and merged into `main`, merge `main` back into `develop` to keep branches in sync (feature branches off `develop` may need to resolve resulting merge conflicts).

### Development Branch (`develop`)
* The `develop` branch serves as the integration branch, where feature branches are merged for testing and stabilization before being promoted to `main`.
* All feature development and bug fixing should be based on and merged into `develop`.
  * Exceptions:
    * Bug fix branches applied directly to `main` (see Main Branch section above).
    * Developing a major release with breaking API changes which requires a `develop-next` branch.
* Continuous integration (CI) pipelines should be triggered upon changes to `develop` to ensure the integrity of the codebase.

### Feature Branches
* Feature branches should originate from the `develop` branch and adhere to the following naming convention: `develop-PROJ-<ticket-number>`. For instance, a feature branch could be named `develop-PROJ-123`.
* Each feature branch should encapsulate a single feature or user story.
* Upon completion, a pull request should be opened to merge the feature branch into `develop`.
* Feature branches should undergo code review and testing before merging.

### Bugfix Branches
* Bugfix branches use the same naming convention as feature branches: `develop-PROJ-<ticket-number>` (e.g., `develop-PROJ-123`). They are distinguished by the ticket type in the issue tracker, not the branch name prefix.
  * Exceptions:
    * Bug fix branches applied directly to `main` (see Main Branch section above).
* These branches are reserved for addressing specific bugs or issues identified during development or testing phases.
* Pull requests for bugfix branches should target the `develop` branch.
  * Exceptions:
    * Bug fix branches applied directly to `main` (see Main Branch section above).
* Bugfix branches should include clear descriptions of the issue being addressed and the proposed solution.

## Version Release Tagging

### Semantic Versioning
* Version numbers should adhere to Semantic Versioning (SemVer) guidelines (`MAJOR.MINOR.PATCH`).
* `MAJOR` version for incompatible API changes.
* `MINOR` version for backward-compatible feature additions.
* `PATCH` version for backward-compatible bug fixes.

### Release Tagging Process
* Upon reaching a stable state in `develop`, a release candidate should be tagged for testing.
* Release candidates should be tagged with a version number following SemVer guidelines (e.g., `v1.0.0-rc.1`).
* Thorough testing and validation should be performed on release candidates.
* Upon approval, release candidates can be promoted to full releases.
* Full releases should be tagged with the corresponding version number (e.g., `v1.0.0`).
* Tagged releases should include annotated release notes detailing changes since the last release.

## Commit Message Guidelines

### Prefix Format
* Commits related to tracked issues should start with the ticket number in uppercase, immediately followed by a colon (`:`).
* Example: `PROJ-123:`

### Commit Message Content
* Following the ticket prefix, provide a concise and descriptive summary of the changes introduced by the commit.
* Ensure clarity and specificity in the commit message to facilitate understanding and review.
* Optionally, provide additional context or details about the changes made in the commit.

### Examples
* `PROJ-123: Implemented user authentication feature`
* `PROJ-456: Fixed formatting issues in the README file`

## Best Practices

* **Single version system**: Use one version for the entire monorepo rather than per-package versioning. This eliminates the need to track inter-service dependencies and simplifies release management across microservices, micro frontends, and infrastructure.

* **Tracking branch versions**: When no release candidate tag exists, use these practices to identify which version a branch targets:
  * Ensure all tickets being worked are associated with a version in your issue tracker if they require code changes in the monorepo.
  * Ensure all commits and branches contain ticket numbers so they can be easily correlated to tickets.
  * Ensure that we aren’t mixing multiple tickets into a single branch (always create a new branch when working a new ticket).

* **Avoiding Merge Conflicts**:
  * **Work in small chunks**: Break down your work into smaller, more manageable commits. This way, if there are conflicts, they'll be easier to identify and resolve.
  * **Communicate with your team**: If you're working on a project with others, talk to them about what you're working on. This can help avoid situations where multiple people make changes to the same file at the same time.
  * **Pull frequently**: Before you start working on a branch, make sure you pull down the latest changes from the dependent/parent branch. This will help reduce the chance of conflicts arising from changes made by others since you branched off.

* **Understanding and Resolving Merge Conflicts**:
  * **Identify the culprit**: The first step is to identify which files have conflicts. You can use the `git status` command to see a list of files with merge conflicts.
  * **Examine the changes**: For each conflicted file, Git will insert markers around the sections where there are conflicts (`<<<<<<< HEAD (local)`, `=======`, and `>>>>>>> branch_name (theirs)`).
  * **Resolve**: Carefully analyze the conflicting sections and decide which changes you want to keep. Stage the resolved file with `git add` and commit the changes.

* **Pull Requests and Reviews**:
  * **Small and Focused**: Aim for pull requests that address a single issue or feature. This makes them easier to review and merge.
  * **Self-review**: Before submitting, run your own tests, review your code for style and functionality, and utilize linters or code analysis tools.
  * **Clear Communication**:
    * **Title**: Craft a clear and concise title that reflects the purpose of the pull request.
    * **Description**: Provide a detailed description explaining the changes made, their context, and any potential impacts.
    * **Code Comments**: Include comments within the code to explain complex changes or logic.
  * **Promptness**: Review pull requests in a timely manner to keep development flowing.
  * **Code Review Focus**: Check functionality, efficiency, tests, and provide constructive feedback with a positive tone. Use comments and collaboration to reach an agreement.

## Version Control Branching Edge Cases

* **Long-running parallel work** (e.g., major rewrites, breaking API changes): Branch from `develop` as `develop-next`.
  * Merge `develop` into `main` when the current release is ready — do not wait for `develop-next`.
  * Merge `develop-next` into `develop` when that work is ready for release.
  * If the `main` release history needs preserving before the `develop-next` changes land, snapshot `main` to a named tag (e.g., `v1.x-final`) before merging.
  * Coordinate with the team before starting a `develop-next` branch to align on versioning and merge strategy.
