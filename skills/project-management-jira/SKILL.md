---
name: project-management-jira
description: Craft comprehensive JIRA tickets (summary, context, requirements, deliverables, definition of done) from a title plus repo/user inputs. Trigger when the user asks for help drafting or refining a JIRA card, ticket, or story and expects structured markdown saved to disk.
---

## Overview

Produce a single, production-ready JIRA ticket that can be pasted directly into the tracker. Always gather verifiable evidence from the repository or supporting docs so every section is grounded in facts instead of guesses.

## Required Inputs

- Card title or summary phrase supplied by the user.
- Any user-provided notes, links, or attachments.
- Facts gathered while investigating the workspace (logs, code references, specs). Use [references/context_checklist.md](references/context_checklist.md) to stay systematic.

## Workflow

1. **Clarify scope**: Ask for missing details (impacted users, environments, deadlines) if the request is ambiguous.
2. **Research context**: Follow the context checklist to inventory relevant code, configs, data stores, and stakeholders. Capture file paths or line links for citation.
3. **Define outcomes**: Translate goals into observable success metrics (e.g., “calendar defaults to current term for all roles”).
4. **Enumerate requirements**: Convert each behavior into acceptance criteria that are testable and cover edge cases, accessibility, performance, and error states.
5. **Plan deliverables**: List tangible artifacts (code changes, migrations, docs, dashboards) plus owners for reviews or sign-offs.
6. **List verification steps**: Spell out deployment, monitoring, and rollback checks so the Definition of Done is unambiguous.
7. **Capture dependencies**: Mention related tickets, sequencing constraints, feature flags, or rollout toggles.

## Card Structure

- Start from [references/jira_card_template.md](references/jira_card_template.md) and tailor the sections to the feature.
- Keep headings consistent (`Summary`, `Context`, `Requirements / Acceptance Criteria`, `Deliverables`, `Definition of Done`). Add `Rollout Plan`, `Analytics`, or `Open Questions` only when necessary.
- Reference concrete sources (file paths, dashboards, links) inline so engineers can trace assertions quickly.

## Writing Guidance

- **Summary**: One paragraph describing who is affected, the current pain, and the desired state.
- **Context**: Bullet critical background items (related tickets, metrics, assumptions, blockers). Note unknowns explicitly instead of inventing details.
- **Requirements / Acceptance Criteria**: Use ordered lists; each item must be independently testable.
- **Deliverables**: Capture code, docs, experiments, or reviews required before close.
- **Definition of Done**: Combine deployment, verification, alerting, and stakeholder sign-off in checklist form.

## Output Instructions

- Save the final ticket as `jira-card-[slug].md` in the working directory. Build `[slug]` by lowercasing the card title, replacing spaces with hyphens, and stripping non-alphanumeric characters except hyphens.
- Include the card title as an H1 at the top of the file followed by the sections defined above.
- If multiple cards are requested, generate one file per card.

## Quality Checklist

- Every requirement maps to a single verification step in the Definition of Done.
- All assertions cite a source (file path, log, metric, or stakeholder note).
- Dependencies, blockers, and assumptions are called out explicitly.
- The tone is actionable, concise, and free of speculative language.
- File slug matches the rules in Output Instructions.

## References

- [references/context_checklist.md](references/context_checklist.md) — prompts for collecting facts before drafting.
- [references/jira_card_template.md](references/jira_card_template.md) — markdown scaffold for the ticket body.
