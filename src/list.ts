import axios from "axios";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";

const REMOTE_REGISTRY_URL =
  "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/skills.json";
const REMOTE_AGENTS_URL =
  "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/agents.json";

function localPackagePath(filename: string): string {
  return path.join(__dirname, "..", filename);
}

function readLocalJson<T>(filename: string): T | null {
  const filePath = localPackagePath(filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  }
  return null;
}

export interface NativeInstallConfig {
  strategy: "dir" | "commands-dir" | "append" | "skill-folder";
  dir?: string;
  commandsDir?: string;
  contextFile?: string;
  file?: string;
}

export interface AgentConfig {
  label: string;
  description: string;
  nativeInstall: NativeInstallConfig;
}

export interface AgentsConfig {
  agents: Record<string, AgentConfig>;
}

export interface SkillManifest {
  id: string; // flattened skill name, e.g. "testing-typescript"
  concept: string;
  language: string;
  category: string; // engineering | architecture | security | data | frontend | backend
  tags: string[];
  description: string;
  version: string;
  author: string;
  files: string[];
}

export interface RegistryIndex {
  skills: SkillManifest[];
}

export async function fetchRegistryIndex(): Promise<RegistryIndex> {
  const envUrl = process.env.AI_SKILLS_REGISTRY_URL;
  if (envUrl) {
    const spinner = ora("Fetching registry index...").start();
    try {
      const response = await axios.get<RegistryIndex>(envUrl);
      spinner.succeed("Registry index fetched.");
      return response.data;
    } catch (error) {
      spinner.fail("Failed to fetch registry index.");
      if (axios.isAxiosError(error)) console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  const local = readLocalJson<RegistryIndex>("skills.json");
  if (local) return local;

  const spinner = ora("Fetching registry index...").start();
  try {
    const response = await axios.get<RegistryIndex>(REMOTE_REGISTRY_URL);
    spinner.succeed("Registry index fetched.");
    return response.data;
  } catch (error) {
    spinner.fail("Failed to fetch registry index.");
    if (axios.isAxiosError(error)) console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function fetchAgentsConfig(): Promise<AgentsConfig> {
  const envUrl = process.env.AI_SKILLS_AGENTS_URL;
  if (envUrl) {
    try {
      const response = await axios.get<AgentsConfig>(envUrl);
      return response.data;
    } catch {
      /* fall through */
    }
  }

  const local = readLocalJson<AgentsConfig>("agents.json");
  if (local) return local;

  try {
    const response = await axios.get<AgentsConfig>(REMOTE_AGENTS_URL);
    return response.data;
  } catch {
    return { agents: {} };
  }
}

export interface ListOptions {
  lang?: string;
  category?: string;
  tag?: string;
  concept?: string;
  categories?: boolean;
  concepts?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  engineering: "Engineering",
  architecture: "Architecture",
  security: "Security",
  data: "Data Science",
  frontend: "Frontend",
  backend: "Backend",
};

export async function listSkills(options: ListOptions = {}) {
  const index = await fetchRegistryIndex();

  let skills = index.skills;

  if (options.categories) {
    const categories = Array.from(
      new Set(skills.map((s) => s.category)),
    ).sort();
    console.log(chalk.green("\nAvailable Categories:"));
    console.log("=".repeat(40));
    for (const c of categories) {
      const label = CATEGORY_LABELS[c] ?? c;
      console.log(`  ${chalk.blue.bold(label)} ${chalk.dim(`(${c})`)}`);
    }
    console.log();
    return;
  }

  if (options.concepts) {
    const concepts = Array.from(new Set(skills.map((s) => s.concept))).sort();
    console.log(chalk.green("\nAvailable Concepts:"));
    console.log("=".repeat(40));
    for (const c of concepts) {
      console.log(`  ${chalk.cyan.bold(c)}`);
    }
    console.log();
    return;
  }

  if (options.lang) {
    skills = skills.filter(
      (s) => s.language.toLowerCase() === options.lang!.toLowerCase(),
    );
  }
  if (options.category) {
    skills = skills.filter(
      (s) => s.category.toLowerCase() === options.category!.toLowerCase(),
    );
  }
  if (options.tag) {
    skills = skills.filter((s) =>
      s.tags.some((t) => t.toLowerCase() === options.tag!.toLowerCase()),
    );
  }
  if (options.concept) {
    skills = skills.filter(
      (s) => s.concept.toLowerCase() === options.concept!.toLowerCase(),
    );
  }

  if (skills.length === 0) {
    console.log(chalk.yellow("No skills found matching the given filters."));
    return;
  }

  console.log(chalk.green(`\nAvailable Skills (${skills.length}):`));
  console.log("=".repeat(40));

  // Group by category, then concept
  const byCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = {};
      if (!acc[skill.category][skill.concept])
        acc[skill.category][skill.concept] = [];
      acc[skill.category][skill.concept].push(skill);
      return acc;
    },
    {} as Record<string, Record<string, SkillManifest[]>>,
  );

  for (const [category, concepts] of Object.entries(byCategory)) {
    const label = CATEGORY_LABELS[category] ?? category;
    console.log(chalk.blue.bold(`\n  ${label}`));

    for (const [concept, conceptSkills] of Object.entries(concepts)) {
      console.log(`\n    ${chalk.cyan.bold(concept)}`);
      for (const skill of conceptSkills) {
        console.log(
          `      ${chalk.yellow(skill.language.padEnd(12))} ${chalk.dim(skill.description)}`,
        );
        if (skill.tags.length > 0) {
          console.log(
            `      ${"".padEnd(12)} ${chalk.gray(skill.tags.join(", "))}`,
          );
        }
      }
    }
  }
  console.log();
}
