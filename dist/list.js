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
exports.fetchRegistryIndex = fetchRegistryIndex;
exports.fetchAgentsConfig = fetchAgentsConfig;
exports.listSkills = listSkills;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REMOTE_REGISTRY_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/skills.json";
const REMOTE_AGENTS_URL = "https://raw.githubusercontent.com/ucdavis/ai-skills-registry/main/agents.json";
function localPackagePath(filename) {
    return path_1.default.join(__dirname, "..", filename);
}
function readLocalJson(filename) {
    if (process.env.AI_SKILLS_LOCAL_DEV !== "true")
        return null;
    const filePath = localPackagePath(filename);
    if (fs_1.default.existsSync(filePath)) {
        return JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
    }
    return null;
}
function fetchRegistryIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        const envUrl = process.env.AI_SKILLS_REGISTRY_URL;
        if (envUrl) {
            const spinner = (0, ora_1.default)("Fetching registry index...").start();
            try {
                const response = yield axios_1.default.get(envUrl);
                spinner.succeed("Registry index fetched.");
                return response.data;
            }
            catch (error) {
                spinner.fail("Failed to fetch registry index.");
                if (axios_1.default.isAxiosError(error))
                    console.error(chalk_1.default.red(error.message));
                process.exit(1);
            }
        }
        const local = readLocalJson("skills.json");
        if (local)
            return local;
        const spinner = (0, ora_1.default)("Fetching registry index...").start();
        try {
            const response = yield axios_1.default.get(REMOTE_REGISTRY_URL);
            spinner.succeed("Registry index fetched.");
            return response.data;
        }
        catch (error) {
            spinner.fail("Failed to fetch registry index.");
            if (axios_1.default.isAxiosError(error))
                console.error(chalk_1.default.red(error.message));
            process.exit(1);
        }
    });
}
function fetchAgentsConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const envUrl = process.env.AI_SKILLS_AGENTS_URL;
        if (envUrl) {
            try {
                const response = yield axios_1.default.get(envUrl);
                return response.data;
            }
            catch (_a) {
                /* fall through */
            }
        }
        const local = readLocalJson("agents.json");
        if (local)
            return local;
        try {
            const response = yield axios_1.default.get(REMOTE_AGENTS_URL);
            return response.data;
        }
        catch (_b) {
            return { agents: {} };
        }
    });
}
const CATEGORY_LABELS = {
    engineering: "Engineering",
    architecture: "Architecture",
    security: "Security",
    data: "Data Science",
    frontend: "Frontend",
    backend: "Backend",
};
function listSkills() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        var _a, _b;
        const index = yield fetchRegistryIndex();
        let skills = index.skills;
        if (options.categories) {
            const categories = Array.from(new Set(skills.map((s) => s.category))).sort();
            console.log(chalk_1.default.green("\nAvailable Categories:"));
            console.log("=".repeat(40));
            for (const c of categories) {
                const label = (_a = CATEGORY_LABELS[c]) !== null && _a !== void 0 ? _a : c;
                console.log(`  ${chalk_1.default.blue.bold(label)} ${chalk_1.default.dim(`(${c})`)}`);
            }
            console.log();
            return;
        }
        if (options.concepts) {
            const concepts = Array.from(new Set(skills.map((s) => s.concept))).sort();
            console.log(chalk_1.default.green("\nAvailable Concepts:"));
            console.log("=".repeat(40));
            for (const c of concepts) {
                console.log(`  ${chalk_1.default.cyan.bold(c)}`);
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
            console.log(chalk_1.default.yellow("No skills found matching the given filters."));
            return;
        }
        console.log(chalk_1.default.green(`\nAvailable Skills (${skills.length}):`));
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
            const label = (_b = CATEGORY_LABELS[category]) !== null && _b !== void 0 ? _b : category;
            console.log(chalk_1.default.blue.bold(`\n  ${label}`));
            for (const [concept, conceptSkills] of Object.entries(concepts)) {
                console.log(`\n    ${chalk_1.default.cyan.bold(concept)}`);
                for (const skill of conceptSkills) {
                    console.log(`      ${chalk_1.default.yellow(skill.language.padEnd(12))} ${chalk_1.default.dim(skill.description)}`);
                    if (skill.tags.length > 0) {
                        console.log(`      ${"".padEnd(12)} ${chalk_1.default.gray(skill.tags.join(", "))}`);
                    }
                }
            }
        }
        console.log();
    });
}
