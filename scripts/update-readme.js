import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');
const skillsPath = path.join(rootDir, 'skills.json');

const skillsData = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
const skills = skillsData.skills || [];

let tableMarkdown = '| ID | Category | Tags |\n|----|-------|------|\n';
skills.forEach(skill => {
  const tagsStr = (skill.tags || []).join(', ');
  tableMarkdown += `| \`${skill.id}\` | ${skill.category} | ${tagsStr} |\n`;
});

const readmeContent = fs.readFileSync(readmePath, 'utf8');

const startMarker = '<!-- START_SKILLS_TABLE -->';
const endMarker = '<!-- END_SKILLS_TABLE -->';

const startIndex = readmeContent.indexOf(startMarker);
const endIndex = readmeContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find START_SKILLS_TABLE or END_SKILLS_TABLE markers in README.md');
  process.exit(1);
}

const beforeTable = readmeContent.slice(0, startIndex + startMarker.length);
const afterTable = readmeContent.slice(endIndex);

const newReadmeContent = `${beforeTable}\n${tableMarkdown}${afterTable}`;

fs.writeFileSync(readmePath, newReadmeContent, 'utf8');
console.log('README.md skills table updated successfully.');
