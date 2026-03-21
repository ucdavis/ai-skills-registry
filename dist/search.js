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
exports.searchSkills = searchSkills;
const chalk_1 = __importDefault(require("chalk"));
const list_1 = require("./list");
function matchesQuery(skill, query) {
    const q = query.toLowerCase();
    return (skill.concept.toLowerCase().includes(q) ||
        skill.language.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some(t => t.toLowerCase().includes(q)) ||
        skill.id.toLowerCase().includes(q));
}
function searchSkills(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const index = yield (0, list_1.fetchRegistryIndex)();
        const results = index.skills.filter(s => matchesQuery(s, query));
        if (results.length === 0) {
            console.log(chalk_1.default.yellow(`No skills found matching '${query}'.`));
            return;
        }
        console.log(chalk_1.default.green(`\nSearch results for '${query}' (${results.length} found):`));
        console.log('='.repeat(40));
        for (const skill of results) {
            console.log(`\n  ${chalk_1.default.cyan.bold(skill.id)}  ${chalk_1.default.magenta('<' + skill.category + '>')}`);
            console.log(`  ${chalk_1.default.dim(skill.description)}`);
            console.log(`  lang: ${chalk_1.default.yellow(skill.language)}`);
            if (skill.tags.length > 0) {
                console.log(`  tags: ${skill.tags.map(t => chalk_1.default.gray(t)).join(', ')}`);
            }
            console.log(`  install: ${chalk_1.default.dim(`ai-skills install ${skill.concept} --agent <agent> --lang ${skill.language}`)}`);
        }
        console.log();
    });
}
