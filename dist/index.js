#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { listSkills } from './list.js';
import { installSkill } from './install.js';
import { searchSkills } from './search.js';
import { showSkillInfo } from './info.js';
import { installAll, initLockfile } from './install-all.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const program = new Command();
program
    .name('ai-skills')
    .description('CLI to manage and install AI skills across agents (Claude Code, VSCode, Cursor, Antigravity)')
    .version(pkg.version);
program
    .command('list')
    .description('List available skills, grouped by category and concept')
    .option('-l, --lang <lang>', 'Filter by language (e.g. typescript, python, java, general)')
    .option('-c, --category <category>', 'Filter by category (engineering, architecture, security, data, frontend, backend)')
    .option('--concept <concept>', 'Filter by concept (e.g. testing, code-review, architecture)')
    .option('--tag <tag>', 'Filter by tag (e.g. jest, owasp, pandas)')
    .option('--categories', 'List all available categories')
    .option('--concepts', 'List all available concepts')
    .action(async (options) => {
    await listSkills(options);
});
program
    .command('search')
    .description('Search skills by keyword across id, description, tags, concept, and category')
    .argument('<query>', 'Search query')
    .action(async (query) => {
    await searchSkills(query);
});
program
    .command('info')
    .description('Show detailed information about a specific skill')
    .argument('<concept>', 'The concept (e.g. testing, code-review, architecture)')
    .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
    .action(async (concept, options) => {
    await showSkillInfo(concept, options.lang);
});
program
    .command('install')
    .description('Install a skill into the current project')
    .argument('<concept>', 'The concept to install (e.g. testing, code-review, git-workflow)')
    .option('-a, --agent <agent>', 'Target agent (antigravity, claude-code, cursor, vsc)')
    .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
    .action(async (concept, options) => {
    await installSkill(concept, options.agent, options.lang);
});
program
    .command('install-all')
    .description('Install all skills listed in .ai-skills.json lockfile')
    .action(async () => {
    await installAll();
});
program
    .command('init')
    .description('Create a .ai-skills.json lockfile in the current directory')
    .action(() => {
    initLockfile();
});
program.parse(process.argv);
