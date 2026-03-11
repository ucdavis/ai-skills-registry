#!/usr/bin/env node
import { Command } from 'commander';

import { listSkills } from './list';
import { installSkill } from './install';
import { searchSkills } from './search';
import { showSkillInfo } from './info';
import { installAll, initLockfile } from './install-all';

const program = new Command();

program
  .name('ai-skills')
  .description('CLI to manage and install AI skills across agents (Claude Code, VSCode, Cursor, Antigravity)')
  .version('2.0.0');

program
  .command('list')
  .description('List available skills, grouped by category and concept')
  .option('-l, --lang <lang>', 'Filter by language (e.g. typescript, python, java, general)')
  .option('-c, --category <category>', 'Filter by category (engineering, architecture, security, data, frontend, backend)')
  .option('--concept <concept>', 'Filter by concept (e.g. testing, code-review, architecture)')
  .option('--tag <tag>', 'Filter by tag (e.g. jest, owasp, pandas)')
  .action(async (options) => {
    await listSkills(options);
  });

program
  .command('search')
  .description('Search skills by keyword across id, description, tags, concept, and category')
  .argument('<query>', 'Search query')
  .action(async (query: string) => {
    await searchSkills(query);
  });

program
  .command('info')
  .description('Show detailed information about a specific skill')
  .argument('<concept>', 'The concept (e.g. testing, code-review, architecture)')
  .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
  .action(async (concept: string, options) => {
    await showSkillInfo(concept, options.lang);
  });

program
  .command('install')
  .description('Install a skill into the current project')
  .argument('<concept>', 'The concept to install (e.g. testing, code-review, git-workflow)')
  .requiredOption('-a, --agent <agent>', 'Target agent (antigravity, claude-code, cursor, vsc)')
  .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
  .option('--native', "Install to the agent's native config location (.claude/commands/, .cursorrules, etc.)")
  .action(async (concept: string, options) => {
    await installSkill(concept, options.agent, options.lang, options.native ?? false);
  });

program
  .command('install-all')
  .description('Install all skills listed in .ai-skills.json lockfile')
  .option('--native', "Install each skill to its agent's native config location")
  .action(async (options) => {
    await installAll(options.native ?? false);
  });

program
  .command('init')
  .description('Create a .ai-skills.json lockfile in the current directory')
  .action(() => {
    initLockfile();
  });

program.parse(process.argv);
