import axios from "axios";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { fetchRegistryIndex, fetchAgentsConfig, } from "./list.js";
const REMOTE_BASE_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main";
function getSkillDirectoryName(skill) {
    return `${skill.concept}-${skill.language}`;
}
// Skills are now at skills/<concept>-<language>/<file> (no agent in path)
async function downloadSkillFiles(skill) {
    const contents = {};
    const skillDir = getSkillDirectoryName(skill);
    for (const file of skill.files) {
        if (process.env.AI_SKILLS_LOCAL_DEV === "true") {
            const localPath = path.join(__dirname, "..", "skills", skillDir, file);
            if (fs.existsSync(localPath)) {
                contents[file] = fs.readFileSync(localPath, "utf-8");
                continue;
            }
        }
        const baseUrl = process.env.AI_SKILLS_REPO_URL || REMOTE_BASE_URL;
        const fileUrl = `${baseUrl}/skills/${skillDir}/${file}`;
        const response = await axios.get(fileUrl, { responseType: "text" });
        contents[file] = response.data;
    }
    return contents;
}
function applyNativeInstall(skill, fileContents, agent, nativeConfig) {
    const cwd = process.cwd();
    if (nativeConfig.strategy === "commands-dir") {
        const commandsDir = path.join(cwd, nativeConfig.commandsDir);
        fs.mkdirSync(commandsDir, { recursive: true });
        const targetFile = path.join(commandsDir, `${skill.concept}-${skill.language}.md`);
        const combined = Object.values(fileContents).join("\n\n---\n\n");
        fs.writeFileSync(targetFile, combined);
        return targetFile;
    }
    else if (nativeConfig.strategy === "append") {
        const targetFile = path.join(cwd, nativeConfig.file);
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        const header = `\n\n# === AI Skill: ${skill.concept} [${skill.language}] (${skill.id} v${skill.version}) ===\n\n`;
        fs.appendFileSync(targetFile, header + Object.values(fileContents).join("\n\n"));
        return targetFile;
    }
    else if (nativeConfig.strategy === "skill-folder") {
        const rootDir = nativeConfig.dir || ".agent/skills";
        const targetDir = path.join(cwd, rootDir, getSkillDirectoryName(skill));
        fs.mkdirSync(targetDir, { recursive: true });
        for (const [filename, content] of Object.entries(fileContents)) {
            const targetFilePath = path.join(targetDir, filename);
            fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
            fs.writeFileSync(targetFilePath, content);
        }
        return targetDir;
    }
    else {
        // dir strategy: <rootDir>/<agent>/<concept>-<language>/
        const rootDir = nativeConfig.strategy === "dir" && nativeConfig.dir
            ? nativeConfig.dir
            : ".ai-skills";
        const targetDir = path.join(cwd, rootDir, agent, getSkillDirectoryName(skill));
        fs.mkdirSync(targetDir, { recursive: true });
        for (const [filename, content] of Object.entries(fileContents)) {
            const targetFilePath = path.join(targetDir, filename);
            fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
            fs.writeFileSync(targetFilePath, content);
        }
        return targetDir;
    }
}
function applyDefaultInstall(skill, fileContents) {
    // Default: .ai-skills/<concept>-<language>/
    const targetDir = path.join(process.cwd(), ".ai-skills", getSkillDirectoryName(skill));
    fs.mkdirSync(targetDir, { recursive: true });
    for (const [filename, content] of Object.entries(fileContents)) {
        const targetFilePath = path.join(targetDir, filename);
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
        fs.writeFileSync(targetFilePath, content);
    }
    return targetDir;
}
export async function installSkill(concept, agent, lang) {
    const [index, agentsConfig] = await Promise.all([
        fetchRegistryIndex(),
        fetchAgentsConfig(),
    ]);
    const skill = index.skills.find((s) => s.concept.toLowerCase() === concept.toLowerCase() &&
        s.language.toLowerCase() === lang.toLowerCase());
    if (!skill) {
        console.error(chalk.red(`\nSkill not found: concept='${concept}', language='${lang}'`));
        console.log(chalk.yellow("Run `ai-skills list` to see available skills."));
        process.exit(1);
    }
    const spinnerMsg = agent
        ? `Installing '${skill.id}' for ${agent}...`
        : `Installing '${skill.id}'...`;
    const spinner = ora(spinnerMsg).start();
    try {
        const fileContents = await downloadSkillFiles(skill);
        let installedAt;
        if (agent && agentsConfig.agents[agent]) {
            installedAt = applyNativeInstall(skill, fileContents, agent, agentsConfig.agents[agent].nativeInstall);
        }
        else if (agent) {
            console.error(chalk.red(`\nUnknown agent: '${agent}'`));
            process.exit(1);
        }
        else {
            installedAt = applyDefaultInstall(skill, fileContents);
        }
        spinner.succeed(chalk.green(`Installed '${skill.id}' → ${installedAt}`));
        if (skill.tags.length > 0) {
            console.log(chalk.gray(`  tags: ${skill.tags.join(", ")}`));
        }
    }
    catch (error) {
        spinner.fail(chalk.red(`Failed to install '${skill.id}'.`));
        if (axios.isAxiosError(error)) {
            console.error(chalk.red(error.message));
        }
        else {
            console.error(error);
        }
        process.exit(1);
    }
}
