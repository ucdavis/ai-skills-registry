#!/usr/bin/env node

/**
 * Validates YAML frontmatter in all SKILL.md files.
 * Exits with code 1 if any file has invalid frontmatter.
 *
 * Usage: node scripts/lint-frontmatter.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_DIR = path.join(__dirname, "..", "skills");

function findSkillFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(full));
    } else if (entry.name === "SKILL.md") {
      results.push(full);
    }
  }
  return results;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? match[1] : null;
}

let hasErrors = false;

for (const file of findSkillFiles(SKILLS_DIR)) {
  const rel = path.relative(path.join(SKILLS_DIR, ".."), file);
  const content = fs.readFileSync(file, "utf-8");
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    console.error(`FAIL  ${rel} — missing YAML frontmatter`);
    hasErrors = true;
    continue;
  }

  try {
    const doc = yaml.load(frontmatter);
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
      console.error(`FAIL  ${rel} — frontmatter is not a YAML mapping`);
      hasErrors = true;
    } else if (typeof doc.name !== "string" || doc.name.trim().length === 0) {
      console.error(`FAIL  ${rel} — missing required field: name`);
      hasErrors = true;
    } else if (typeof doc.description !== "string" || doc.description.trim().length === 0) {
      console.error(`FAIL  ${rel} — missing required field: description`);
      hasErrors = true;
    }
  } catch (err) {
    console.error(`FAIL  ${rel} — ${err.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log("All SKILL.md frontmatter is valid.");
}
