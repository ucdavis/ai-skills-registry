import chalk from 'chalk';
import { fetchRegistryIndex } from './list.js';
function matchesQuery(skill, query) {
    const q = query.toLowerCase();
    return (skill.concept.toLowerCase().includes(q) ||
        skill.language.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some(t => t.toLowerCase().includes(q)) ||
        skill.id.toLowerCase().includes(q));
}
export async function searchSkills(query) {
    const index = await fetchRegistryIndex();
    const results = index.skills.filter(s => matchesQuery(s, query));
    if (results.length === 0) {
        console.log(chalk.yellow(`No skills found matching '${query}'.`));
        return;
    }
    console.log(chalk.green(`\nSearch results for '${query}' (${results.length} found):`));
    console.log('='.repeat(40));
    for (const skill of results) {
        console.log(`\n  ${chalk.cyan.bold(skill.id)}  ${chalk.magenta('<' + skill.category + '>')}`);
        console.log(`  ${chalk.dim(skill.description)}`);
        console.log(`  lang: ${chalk.yellow(skill.language)}`);
        if (skill.tags.length > 0) {
            console.log(`  tags: ${skill.tags.map(t => chalk.gray(t)).join(', ')}`);
        }
        console.log(`  install: ${chalk.dim(`ai-skills install ${skill.concept} --agent <agent> --lang ${skill.language}`)}`);
    }
    console.log();
}
