import axios from "axios";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REMOTE_REGISTRY_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/skills.json";
const REMOTE_AGENTS_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/agents.json";
function localPackagePath(filename) {
    return path.join(__dirname, "..", filename);
}
function readLocalJson(filename) {
    if (process.env.AI_SKILLS_LOCAL_DEV !== "true")
        return null;
    const filePath = localPackagePath(filename);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return null;
}
export async function fetchRegistryIndex() {
    const envUrl = process.env.AI_SKILLS_REGISTRY_URL;
    if (envUrl) {
        const spinner = ora("Fetching registry index...").start();
        try {
            const response = await axios.get(envUrl);
            spinner.succeed("Registry index fetched.");
            return response.data;
        }
        catch (error) {
            spinner.fail("Failed to fetch registry index.");
            if (axios.isAxiosError(error))
                console.error(chalk.red(error.message));
            process.exit(1);
        }
    }
    const local = readLocalJson("skills.json");
    if (local)
        return local;
    const spinner = ora("Fetching registry index...").start();
    try {
        const response = await axios.get(REMOTE_REGISTRY_URL);
        spinner.succeed("Registry index fetched.");
        return response.data;
    }
    catch (error) {
        spinner.fail("Failed to fetch registry index.");
        if (axios.isAxiosError(error))
            console.error(chalk.red(error.message));
        process.exit(1);
    }
}
export async function fetchAgentsConfig() {
    const envUrl = process.env.AI_SKILLS_AGENTS_URL;
    if (envUrl) {
        try {
            const response = await axios.get(envUrl);
            return response.data;
        }
        catch {
            /* fall through */
        }
    }
    const local = readLocalJson("agents.json");
    if (local)
        return local;
    try {
        const response = await axios.get(REMOTE_AGENTS_URL);
        return response.data;
    }
    catch {
        return { agents: {} };
    }
}
const CATEGORY_LABELS = {
    engineering: "Engineering",
    architecture: "Architecture",
    security: "Security",
    data: "Data Science",
    frontend: "Frontend",
    backend: "Backend",
};
export async function listSkills(options = {}) {
    const index = await fetchRegistryIndex();
    let skills = index.skills;
    if (options.categories) {
        const categories = Array.from(new Set(skills.map((s) => s.category))).sort();
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
        skills = skills.filter((s) => s.language.toLowerCase() === options.lang.toLowerCase());
    }
    if (options.category) {
        skills = skills.filter((s) => s.category.toLowerCase() === options.category.toLowerCase());
    }
    if (options.tag) {
        skills = skills.filter((s) => s.tags.some((t) => t.toLowerCase() === options.tag.toLowerCase()));
    }
    if (options.concept) {
        skills = skills.filter((s) => s.concept.toLowerCase() === options.concept.toLowerCase());
    }
    if (skills.length === 0) {
        console.log(chalk.yellow("No skills found matching the given filters."));
        return;
    }
    console.log(chalk.green(`\nAvailable Skills (${skills.length}):`));
    console.log("=".repeat(40));
    // Group by category, then concept
    const byCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category])
            acc[skill.category] = {};
        if (!acc[skill.category][skill.concept])
            acc[skill.category][skill.concept] = [];
        acc[skill.category][skill.concept].push(skill);
        return acc;
    }, {});
    for (const [category, concepts] of Object.entries(byCategory)) {
        const label = CATEGORY_LABELS[category] ?? category;
        console.log(chalk.blue.bold(`\n  ${label}`));
        for (const [concept, conceptSkills] of Object.entries(concepts)) {
            console.log(`\n    ${chalk.cyan.bold(concept)}`);
            for (const skill of conceptSkills) {
                console.log(`      ${chalk.yellow(skill.language.padEnd(12))} ${chalk.dim(skill.description)}`);
                if (skill.tags.length > 0) {
                    console.log(`      ${"".padEnd(12)} ${chalk.gray(skill.tags.join(", "))}`);
                }
            }
        }
    }
    console.log();
}
