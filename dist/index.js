#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const list_1 = require("./list");
const install_1 = require("./install");
const search_1 = require("./search");
const info_1 = require("./info");
const install_all_1 = require("./install-all");
const program = new commander_1.Command();
program
    .name('ai-skills')
    .description('CLI to manage and install AI skills across agents (Claude Code, VSCode, Cursor, Antigravity)')
    .version('2.0.0');
program
    .command('list')
    .description('List available skills, grouped by category and concept')
    .option('-l, --lang <lang>', 'Filter by language (e.g. typescript, python, java, general)')
    .option('-c, --category <category>', 'Filter by category (engineering, architecture, security, data, frontend, backend)')
    .option('--concept <concept>', 'Filter by concept (e.g. testing, code-review, architecture)')
    .option('--tag <tag>', 'Filter by tag (e.g. jest, owasp, pandas)')
    .option('--categories', 'List all available categories')
    .option('--concepts', 'List all available concepts')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, list_1.listSkills)(options);
}));
program
    .command('search')
    .description('Search skills by keyword across id, description, tags, concept, and category')
    .argument('<query>', 'Search query')
    .action((query) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, search_1.searchSkills)(query);
}));
program
    .command('info')
    .description('Show detailed information about a specific skill')
    .argument('<concept>', 'The concept (e.g. testing, code-review, architecture)')
    .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
    .action((concept, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, info_1.showSkillInfo)(concept, options.lang);
}));
program
    .command('install')
    .description('Install a skill into the current project')
    .argument('<concept>', 'The concept to install (e.g. testing, code-review, git-workflow)')
    .option('-a, --agent <agent>', 'Target agent (antigravity, claude-code, cursor, vsc)')
    .option('-l, --lang <lang>', 'Language variant (default: general)', 'general')
    .action((concept, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, install_1.installSkill)(concept, options.agent, options.lang);
}));
program
    .command('install-all')
    .description('Install all skills listed in .ai-skills.json lockfile')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, install_all_1.installAll)();
}));
program
    .command('init')
    .description('Create a .ai-skills.json lockfile in the current directory')
    .action(() => {
    (0, install_all_1.initLockfile)();
});
program.parse(process.argv);
