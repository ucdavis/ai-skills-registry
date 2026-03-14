# Contributing to AI Skills Registry

First off, thank you for considering contributing to the AI Skills Registry! It's people like you that make this registry a great tool for the community.

## How to Contribute

We welcome all contributions! If you're looking to add a new skill to the registry, here is the process:

### 1. Fork and Clone the Repository
Start by forking the `ai-skills-registry` repository to your own GitHub account and cloning it locally.

```bash
git clone https://github.com/<your-username>/ai-skills-registry.git
cd ai-skills-registry
npm install
```

### 2. Create the Skill Files
Skills are organized by concept and language in the `skills/` directory. Create a new folder for your skill if it doesn't exist:

```bash
mkdir -p skills/<concept>/<language>/
```
For example: `skills/authentication/python/`

Inside your new folder, create a `SKILL.md` file.

### 3. Write Your SKILL.md
Your `SKILL.md` must start with YAML frontmatter following the `agentskills.io` standard, followed by the actual markdown instructions for the AI agent.

Example `SKILL.md`:
```markdown
---
description: Your brief description of the skill here.
---

### Instructions
Write the specific instructions and context the AI needs here to effectively execute this skill...
```

You can also include supplementary files in your skill's directory (e.g., inside a `scripts/` or `references/` subfolder) if your skill requires them.

### 4. Update the Registry Manifest (`skills.json`)
You must add an entry for your new skill to the root `skills.json` file. This allows the CLI to discover and install your skill.

Add an object to the `skills` array like this:
```json
{
  "id": "<concept>/<language>",
  "concept": "<concept>",
  "language": "<language>",
  "category": "<category>",
  "tags": ["tag1", "tag2"],
  "description": "<Same description you put in the SKILL.md frontmatter>",
  "version": "1.0.0",
  "author": "<your-github-username>",
  "files": [
    "SKILL.md",
    "optional/extra/file.md"
  ]
}
```

### 5. Build and Test
Run the build script to ensure everything compiles correctly and the README's available skills table is updated automatically.

```bash
npm run build
npm test
```

### 6. Submit a Pull Request
Commit your changes, push to your fork, and open a Pull Request against the `main` branch of the `ucdavis/ai-skills-registry` repository.

Once your PR is merged, the CLI will immediately be able to fetch your new skill live from the repository — no additional release step is required!
