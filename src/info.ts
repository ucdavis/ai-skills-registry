import chalk from "chalk";
import { fetchRegistryIndex, fetchAgentsConfig } from "./list.js";

export async function showSkillInfo(concept: string, lang: string) {
  const [index, agentsConfig] = await Promise.all([
    fetchRegistryIndex(),
    fetchAgentsConfig(),
  ]);

  const skill = index.skills.find(
    (s) =>
      s.concept.toLowerCase() === concept.toLowerCase() &&
      s.language.toLowerCase() === lang.toLowerCase(),
  );

  if (!skill) {
    console.error(chalk.red(`\nSkill not found: '${concept}/${lang}'`));
    console.log(
      chalk.yellow(
        "Run `ai-skills list` or `ai-skills search <query>` to find skills.",
      ),
    );
    process.exit(1);
  }

  console.log(chalk.green("\nSkill Details:"));
  console.log("=".repeat(40));
  console.log(`  ${chalk.bold("ID:")}          ${chalk.cyan(skill.id)}`);
  console.log(`  ${chalk.bold("Description:")} ${skill.description}`);
  console.log(`  ${chalk.bold("Concept:")}     ${skill.concept}`);
  console.log(
    `  ${chalk.bold("Language:")}    ${chalk.yellow(skill.language)}`,
  );
  console.log(
    `  ${chalk.bold("Category:")}    ${chalk.magenta(skill.category)}`,
  );
  console.log(
    `  ${chalk.bold("Tags:")}        ${skill.tags.map((t) => chalk.gray(t)).join(", ")}`,
  );
  console.log(`  ${chalk.bold("Version:")}     ${skill.version}`);
  console.log(`  ${chalk.bold("Files:")}       ${skill.files.join(", ")}`);

  const agents = Object.entries(agentsConfig.agents);
  if (agents.length > 0) {
    console.log(`\n  ${chalk.bold("Install for each agent:")}`);
    for (const [agentId, agentConfig] of agents) {
      const cfg = agentConfig.nativeInstall;
      let nativePath = "";
      if (cfg.strategy === "commands-dir")
        nativePath = `${cfg.commandsDir}/${skill.concept}.md`;
      else if (cfg.strategy === "append") nativePath = cfg.file!;
      else
        nativePath = `.ai-skills/${agentId}/${skill.concept}-${skill.language}/`;

      console.log(`\n    ${chalk.blue(agentConfig.label)}`);
      console.log(
        `      default: ${chalk.dim(`ai-skills install ${skill.concept} --lang ${skill.language}`)}`,
      );
      console.log(
        `      native:  ${chalk.dim(`ai-skills install ${skill.concept} --agent ${agentId} --lang ${skill.language}`)} → ${chalk.gray(nativePath)}`,
      );
    }
  }
  console.log();
}
