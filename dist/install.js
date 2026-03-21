"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSkill = installSkill;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const list_1 = require("./list");
const REMOTE_BASE_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main";
function getSkillDirectoryName(skill) {
    return `${skill.concept}-${skill.language}`;
}
// Skills are now at skills/<concept>-<language>/<file> (no agent in path)
function downloadSkillFiles(skill) {
    return __awaiter(this, void 0, void 0, function* () {
        const contents = {};
        const skillDir = getSkillDirectoryName(skill);
        for (const file of skill.files) {
            if (process.env.AI_SKILLS_LOCAL_DEV === "true") {
                const localPath = path_1.default.join(__dirname, "..", "skills", skillDir, file);
                if (fs_1.default.existsSync(localPath)) {
                    contents[file] = fs_1.default.readFileSync(localPath, "utf-8");
                    continue;
                }
            }
            const baseUrl = process.env.AI_SKILLS_REPO_URL || REMOTE_BASE_URL;
            const fileUrl = `${baseUrl}/skills/${skillDir}/${file}`;
            const response = yield axios_1.default.get(fileUrl, { responseType: "text" });
            contents[file] = response.data;
        }
        return contents;
    });
}
function applyNativeInstall(skill, fileContents, agent, nativeConfig) {
    const cwd = process.cwd();
    if (nativeConfig.strategy === "commands-dir") {
        const commandsDir = path_1.default.join(cwd, nativeConfig.commandsDir);
        fs_1.default.mkdirSync(commandsDir, { recursive: true });
        const targetFile = path_1.default.join(commandsDir, `${skill.concept}-${skill.language}.md`);
        const combined = Object.values(fileContents).join("\n\n---\n\n");
        fs_1.default.writeFileSync(targetFile, combined);
        return targetFile;
    }
    else if (nativeConfig.strategy === "append") {
        const targetFile = path_1.default.join(cwd, nativeConfig.file);
        fs_1.default.mkdirSync(path_1.default.dirname(targetFile), { recursive: true });
        const header = `\n\n# === AI Skill: ${skill.concept} [${skill.language}] (${skill.id} v${skill.version}) ===\n\n`;
        fs_1.default.appendFileSync(targetFile, header + Object.values(fileContents).join("\n\n"));
        return targetFile;
    }
    else if (nativeConfig.strategy === "skill-folder") {
        const rootDir = nativeConfig.dir || ".agent/skills";
        const targetDir = path_1.default.join(cwd, rootDir, getSkillDirectoryName(skill));
        fs_1.default.mkdirSync(targetDir, { recursive: true });
        for (const [filename, content] of Object.entries(fileContents)) {
            const targetFilePath = path_1.default.join(targetDir, filename);
            fs_1.default.mkdirSync(path_1.default.dirname(targetFilePath), { recursive: true });
            fs_1.default.writeFileSync(targetFilePath, content);
        }
        return targetDir;
    }
    else {
        // dir strategy: <rootDir>/<agent>/<concept>-<language>/
        const rootDir = nativeConfig.strategy === "dir" && nativeConfig.dir
            ? nativeConfig.dir
            : ".ai-skills";
        const targetDir = path_1.default.join(cwd, rootDir, agent, getSkillDirectoryName(skill));
        fs_1.default.mkdirSync(targetDir, { recursive: true });
        for (const [filename, content] of Object.entries(fileContents)) {
            const targetFilePath = path_1.default.join(targetDir, filename);
            fs_1.default.mkdirSync(path_1.default.dirname(targetFilePath), { recursive: true });
            fs_1.default.writeFileSync(targetFilePath, content);
        }
        return targetDir;
    }
}
function applyDefaultInstall(skill, fileContents) {
    // Default: .ai-skills/<concept>-<language>/
    const targetDir = path_1.default.join(process.cwd(), ".ai-skills", getSkillDirectoryName(skill));
    fs_1.default.mkdirSync(targetDir, { recursive: true });
    for (const [filename, content] of Object.entries(fileContents)) {
        const targetFilePath = path_1.default.join(targetDir, filename);
        fs_1.default.mkdirSync(path_1.default.dirname(targetFilePath), { recursive: true });
        fs_1.default.writeFileSync(targetFilePath, content);
    }
    return targetDir;
}
function installSkill(concept, agent, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const [index, agentsConfig] = yield Promise.all([
            (0, list_1.fetchRegistryIndex)(),
            (0, list_1.fetchAgentsConfig)(),
        ]);
        const skill = index.skills.find((s) => s.concept.toLowerCase() === concept.toLowerCase() &&
            s.language.toLowerCase() === lang.toLowerCase());
        if (!skill) {
            console.error(chalk_1.default.red(`\nSkill not found: concept='${concept}', language='${lang}'`));
            console.log(chalk_1.default.yellow("Run `ai-skills list` to see available skills."));
            process.exit(1);
        }
        const spinnerMsg = agent
            ? `Installing '${skill.id}' for ${agent}...`
            : `Installing '${skill.id}'...`;
        const spinner = (0, ora_1.default)(spinnerMsg).start();
        try {
            const fileContents = yield downloadSkillFiles(skill);
            let installedAt;
            if (agent && agentsConfig.agents[agent]) {
                installedAt = applyNativeInstall(skill, fileContents, agent, agentsConfig.agents[agent].nativeInstall);
            }
            else if (agent) {
                console.error(chalk_1.default.red(`\nUnknown agent: '${agent}'`));
                process.exit(1);
            }
            else {
                installedAt = applyDefaultInstall(skill, fileContents);
            }
            spinner.succeed(chalk_1.default.green(`Installed '${skill.id}' → ${installedAt}`));
            if (skill.tags.length > 0) {
                console.log(chalk_1.default.gray(`  tags: ${skill.tags.join(", ")}`));
            }
        }
        catch (error) {
            spinner.fail(chalk_1.default.red(`Failed to install '${skill.id}'.`));
            if (axios_1.default.isAxiosError(error)) {
                console.error(chalk_1.default.red(error.message));
            }
            else {
                console.error(error);
            }
            process.exit(1);
        }
    });
}
