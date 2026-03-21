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
exports.showSkillInfo = showSkillInfo;
const chalk_1 = __importDefault(require("chalk"));
const list_1 = require("./list");
function showSkillInfo(concept, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const [index, agentsConfig] = yield Promise.all([
            (0, list_1.fetchRegistryIndex)(),
            (0, list_1.fetchAgentsConfig)(),
        ]);
        const skill = index.skills.find((s) => s.concept.toLowerCase() === concept.toLowerCase() &&
            s.language.toLowerCase() === lang.toLowerCase());
        if (!skill) {
            console.error(chalk_1.default.red(`\nSkill not found: '${concept}/${lang}'`));
            console.log(chalk_1.default.yellow("Run `ai-skills list` or `ai-skills search <query>` to find skills."));
            process.exit(1);
        }
        console.log(chalk_1.default.green("\nSkill Details:"));
        console.log("=".repeat(40));
        console.log(`  ${chalk_1.default.bold("ID:")}          ${chalk_1.default.cyan(skill.id)}`);
        console.log(`  ${chalk_1.default.bold("Description:")} ${skill.description}`);
        console.log(`  ${chalk_1.default.bold("Concept:")}     ${skill.concept}`);
        console.log(`  ${chalk_1.default.bold("Language:")}    ${chalk_1.default.yellow(skill.language)}`);
        console.log(`  ${chalk_1.default.bold("Category:")}    ${chalk_1.default.magenta(skill.category)}`);
        console.log(`  ${chalk_1.default.bold("Tags:")}        ${skill.tags.map((t) => chalk_1.default.gray(t)).join(", ")}`);
        console.log(`  ${chalk_1.default.bold("Version:")}     ${skill.version}`);
        console.log(`  ${chalk_1.default.bold("Files:")}       ${skill.files.join(", ")}`);
        const agents = Object.entries(agentsConfig.agents);
        if (agents.length > 0) {
            console.log(`\n  ${chalk_1.default.bold("Install for each agent:")}`);
            for (const [agentId, agentConfig] of agents) {
                const cfg = agentConfig.nativeInstall;
                let nativePath = "";
                if (cfg.strategy === "commands-dir")
                    nativePath = `${cfg.commandsDir}/${skill.concept}.md`;
                else if (cfg.strategy === "append")
                    nativePath = cfg.file;
                else
                    nativePath = `.ai-skills/${agentId}/${skill.concept}-${skill.language}/`;
                console.log(`\n    ${chalk_1.default.blue(agentConfig.label)}`);
                console.log(`      default: ${chalk_1.default.dim(`ai-skills install ${skill.concept} --lang ${skill.language}`)}`);
                console.log(`      native:  ${chalk_1.default.dim(`ai-skills install ${skill.concept} --agent ${agentId} --lang ${skill.language}`)} → ${chalk_1.default.gray(nativePath)}`);
            }
        }
        console.log();
    });
}
