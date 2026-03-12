import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fetchRegistryIndex } from './list';
import { installSkill } from './install';

export interface SkillsLockfileEntry {
  id: string;       // "<concept>/<language>"
  agent?: string;   // which agent to install for (required for --native)
  version?: string;
}

export interface SkillsLockfile {
  skills: SkillsLockfileEntry[];
}

const LOCKFILE_NAME = '.ai-skills.json';

export async function installAll() {
  const lockfilePath = path.join(process.cwd(), LOCKFILE_NAME);

  if (!fs.existsSync(lockfilePath)) {
    console.error(chalk.red(`\nNo ${LOCKFILE_NAME} found in current directory.`));
    console.log(chalk.yellow(`Create one with your desired skills, e.g.:\n`));
    console.log(chalk.dim(`{
  "skills": [
    { "id": "testing/typescript" },
    { "id": "git-workflow/general", "agent": "claude-code" }
  ]
}`));
    process.exit(1);
  }

  const lockfile: SkillsLockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));

  if (!lockfile.skills || lockfile.skills.length === 0) {
    console.log(chalk.yellow('No skills listed in .ai-skills.json.'));
    return;
  }

  const index = await fetchRegistryIndex();

  console.log(chalk.green(`\nInstalling ${lockfile.skills.length} skill(s) from ${LOCKFILE_NAME}...\n`));

  let successCount = 0;
  let failCount = 0;

  for (const entry of lockfile.skills) {

    const skill = index.skills.find(s => s.id === entry.id);
    if (!skill) {
      console.error(chalk.red(`  ✗ Skill not found: '${entry.id}'`));
      failCount++;
      continue;
    }
    try {
      await installSkill(skill.concept, entry.agent, skill.language);
      successCount++;
    } catch {
      failCount++;
    }
  }

  console.log();
  if (successCount > 0) console.log(chalk.green(`  ${successCount} skill(s) installed successfully.`));
  if (failCount > 0) console.log(chalk.red(`  ${failCount} skill(s) failed.`));
}

export function initLockfile() {
  const lockfilePath = path.join(process.cwd(), LOCKFILE_NAME);

  if (fs.existsSync(lockfilePath)) {
    console.log(chalk.yellow(`${LOCKFILE_NAME} already exists.`));
    return;
  }

  const template: SkillsLockfile = { skills: [] };
  fs.writeFileSync(lockfilePath, JSON.stringify(template, null, 2) + '\n');
  console.log(chalk.green(`Created ${LOCKFILE_NAME}`));
  console.log(chalk.dim('Add entries to the "skills" array, then run: ai-skills install-all'));
  console.log(chalk.dim('Each entry needs an "id" (e.g. "testing/typescript"). The "agent" field is optional to install it native (e.g. "claude-code").'));
}
