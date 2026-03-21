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
exports.installAll = installAll;
exports.initLockfile = initLockfile;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const list_1 = require("./list");
const install_1 = require("./install");
const LOCKFILE_NAME = ".ai-skills.json";
function getLegacySkillId(id) {
    return `${id.concept}/${id.language}`;
}
function installAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const lockfilePath = path_1.default.join(process.cwd(), LOCKFILE_NAME);
        if (!fs_1.default.existsSync(lockfilePath)) {
            console.error(chalk_1.default.red(`\nNo ${LOCKFILE_NAME} found in current directory.`));
            console.log(chalk_1.default.yellow(`Create one with your desired skills, e.g.:\n`));
            console.log(chalk_1.default.dim(`{
  "skills": [
    { "id": "testing-typescript" },
    { "id": "git-workflow-general", "agent": "claude-code" }
  ]
}`));
            process.exit(1);
        }
        const lockfile = JSON.parse(fs_1.default.readFileSync(lockfilePath, "utf-8"));
        if (!lockfile.skills || lockfile.skills.length === 0) {
            console.log(chalk_1.default.yellow("No skills listed in .ai-skills.json."));
            return;
        }
        const index = yield (0, list_1.fetchRegistryIndex)();
        console.log(chalk_1.default.green(`\nInstalling ${lockfile.skills.length} skill(s) from ${LOCKFILE_NAME}...\n`));
        let successCount = 0;
        let failCount = 0;
        for (const entry of lockfile.skills) {
            const skill = index.skills.find((s) => s.id === entry.id || getLegacySkillId(s) === entry.id);
            if (!skill) {
                console.error(chalk_1.default.red(`  ✗ Skill not found: '${entry.id}'`));
                failCount++;
                continue;
            }
            try {
                yield (0, install_1.installSkill)(skill.concept, entry.agent, skill.language);
                successCount++;
            }
            catch (_a) {
                failCount++;
            }
        }
        console.log();
        if (successCount > 0)
            console.log(chalk_1.default.green(`  ${successCount} skill(s) installed successfully.`));
        if (failCount > 0)
            console.log(chalk_1.default.red(`  ${failCount} skill(s) failed.`));
    });
}
function initLockfile() {
    const lockfilePath = path_1.default.join(process.cwd(), LOCKFILE_NAME);
    if (fs_1.default.existsSync(lockfilePath)) {
        console.log(chalk_1.default.yellow(`${LOCKFILE_NAME} already exists.`));
        return;
    }
    const template = { skills: [] };
    fs_1.default.writeFileSync(lockfilePath, JSON.stringify(template, null, 2) + "\n");
    console.log(chalk_1.default.green(`Created ${LOCKFILE_NAME}`));
    console.log(chalk_1.default.dim('Add entries to the "skills" array, then run: ai-skills install-all'));
    console.log(chalk_1.default.dim('Each entry needs an "id" (e.g. "testing-typescript"). The "agent" field is optional to install it native (e.g. "claude-code"). Legacy "concept/language" IDs are still accepted.'));
}
