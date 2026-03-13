const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const REGISTRY_URL = `http://localhost:${PORT}/skills.json`;
const REPO_URL = `http://localhost:${PORT}`;

const PROJECT_ROOT = path.join(__dirname, '..');
const TEST_DIR = path.join(PROJECT_ROOT, 'test_sandbox');
const CLI_PATH = path.join(PROJECT_ROOT, 'dist', 'index.js');

let serverProcess;

function startServer() {
  serverProcess = spawn('node', ['-e', `
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    const server = http.createServer((req, res) => {
      const filePath = path.join(${JSON.stringify(PROJECT_ROOT)}, req.url === '/' ? 'index.html' : req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200);
        res.end(data);
      });
    });
    server.listen(${PORT});
  `], {
    stdio: 'ignore'
  });

  execSync('sleep 1');
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
}

function runCli(command) {
  const env = {
    ...process.env,
    AI_SKILLS_REGISTRY_URL: REGISTRY_URL,
    AI_SKILLS_REPO_URL: REPO_URL,
  };

  return execSync(`node ${CLI_PATH} ${command}`, {
    env,
    cwd: TEST_DIR,
    encoding: 'utf-8'
  });
}

function runCliExpectFailure(command) {
  const env = {
    ...process.env,
    AI_SKILLS_REGISTRY_URL: REGISTRY_URL,
    AI_SKILLS_REPO_URL: REPO_URL,
  };

  try {
    execSync(`node ${CLI_PATH} ${command}`, {
      env,
      cwd: TEST_DIR,
      encoding: 'utf-8'
    });
    throw new Error('Expected command to fail but it succeeded');
  } catch (err) {
    if (err.message === 'Expected command to fail but it succeeded') throw err;
    return { stdout: err.stdout || '', stderr: err.stderr || '' };
  }
}

describe('ai-skills CLI E2E', () => {
  beforeAll(() => {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    startServer();

    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR);
  });

  afterAll(() => {
    stopServer();
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // ── list ──────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('shows all skills', () => {
      const out = runCli('list');
      expect(out).toContain('testing');
      expect(out).toContain('architecture');
      expect(out).toContain('security');
      expect(out).toContain('code-review');
    });

    it('--lang typescript filters to typescript skills', () => {
      const out = runCli('list --lang typescript');
      expect(out).toContain('testing');
      expect(out).toContain('refactoring');
    });

    it('--lang python filters to python skills', () => {
      const out = runCli('list --lang python');
      expect(out).toContain('testing');
      expect(out).toContain('architecture');
      expect(out).toContain('data-science');
      expect(out).toContain('package-management');
      expect(out).toContain('code-review');
    });

    it('--category security filters to security skills', () => {
      const out = runCli('list --category security');
      expect(out).toContain('security');
      expect(out).not.toContain('data-science');
    });

    it('--category architecture filters to architecture skills', () => {
      const out = runCli('list --category architecture');
      expect(out).toContain('architecture');
      expect(out).not.toContain('security');
    });

    it('--concept testing filters to testing concept', () => {
      const out = runCli('list --concept testing');
      expect(out).toContain('testing');
    });

    it('--tag vitest filters to vitest-tagged skills', () => {
      const out = runCli('list --tag vitest');
      expect(out).toContain('testing');
    });

    it('--tag owasp filters to owasp-tagged skills', () => {
      const out = runCli('list --tag owasp');
      expect(out).toContain('security');
    });

    it('--category devops filters to devops skills', () => {
      const out = runCli('list --category devops');
      expect(out).toContain('ci-cd');
      expect(out).toContain('infrastructure');
    });

    it('--concept design filters to design concept', () => {
      const out = runCli('list --concept design');
      expect(out).toContain('design');
    });
  });

  // ── search ────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('"boundary" finds testing/general', () => {
      const out = runCli('search boundary');
      expect(out).toContain('testing/general');
    });

    it('"owasp" finds security skill', () => {
      const out = runCli('search owasp');
      expect(out).toContain('security');
    });

    it('"refactor" finds refactoring skill', () => {
      const out = runCli('search refactor');
      expect(out).toContain('refactoring');
    });

    it('"data" finds data-science skill', () => {
      const out = runCli('search data');
      expect(out).toContain('data-science');
    });

    it('"uv" finds package-management skill', () => {
      const out = runCli('search uv');
      expect(out).toContain('package-management');
    });

    it('"fastapi" finds code-review skill', () => {
      const out = runCli('search fastapi');
      expect(out).toContain('code-review');
    });

    it('"terraform" finds infrastructure/terraform skill', () => {
      const out = runCli('search terraform');
      expect(out).toContain('infrastructure/terraform');
    });

    it('"nonexistent_skill_xyz" returns no results gracefully', () => {
      const out = runCli('search nonexistent_skill_xyz');
      expect(out).not.toContain('Error');
    });
  });

  // ── info ──────────────────────────────────────────────────────────────────

  describe('info', () => {
    it('testing --lang typescript shows vitest details', () => {
      const out = runCli('info testing --lang typescript');
      expect(out).toContain('vitest');
      expect(out).toContain('typescript');
    });

    it('testing --lang python shows pytest details', () => {
      const out = runCli('info testing --lang python');
      expect(out).toContain('python');
    });

    it('testing --lang java shows java details', () => {
      const out = runCli('info testing --lang java');
      expect(out).toContain('java');
    });

    it('security shows owasp details', () => {
      const out = runCli('info security');
      expect(out).toContain('security');
    });

    it('architecture shows architecture details', () => {
      const out = runCli('info architecture');
      expect(out).toContain('architecture');
    });

    it('package-management --lang python shows uv details', () => {
      const out = runCli('info package-management --lang python');
      expect(out).toContain('uv');
      expect(out).toContain('python');
    });

    it('code-review --lang python shows fastapi details', () => {
      const out = runCli('info code-review --lang python');
      expect(out).toContain('fastapi');
      expect(out).toContain('python');
    });

    it('design --lang frontend shows design details', () => {
      const out = runCli('info design --lang frontend');
      expect(out).toContain('design');
      expect(out).toContain('frontend');
    });

    it('iac --lang terraform shows terraform details', () => {
      const out = runCli('info iac --lang terraform');
      expect(out).toContain('terraform');
      expect(out).toContain('azure');
    });

    it('unknown concept exits with error', () => {
      const { stdout, stderr } = runCliExpectFailure('info nonexistent_concept_xyz');
      expect(stdout + stderr).toMatch(/not found|error/i);
    });
  });

  // ── install (standard) ────────────────────────────────────────────────────

  describe('install (standard .ai-skills/)', () => {
    it('testing --lang python', () => {
      runCli('install testing --lang python');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'testing', 'python', 'SKILL.md'))).toBe(true);
    });

    it('testing --lang typescript', () => {
      runCli('install testing --lang typescript');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'testing', 'typescript', 'SKILL.md'))).toBe(true);
    });

    it('security', () => {
      runCli('install security');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'security', 'general', 'SKILL.md'))).toBe(true);
    });

    it('architecture', () => {
      runCli('install architecture');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'architecture', 'general', 'SKILL.md'))).toBe(true);
    });

    it('data-science --lang python', () => {
      runCli('install data-science --lang python');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'data-science', 'python', 'SKILL.md'))).toBe(true);
    });

    it('accessibility --lang react-native', () => {
      runCli('install accessibility --lang react-native');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'accessibility', 'react-native', 'SKILL.md'))).toBe(true);
    });

    it('package-management --lang python', () => {
      runCli('install package-management --lang python');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'package-management', 'python', 'SKILL.md'))).toBe(true);
    });

    it('code-review --lang python', () => {
      runCli('install code-review --lang python');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'code-review', 'python', 'SKILL.md'))).toBe(true);
    });

    it('design --lang frontend', () => {
      runCli('install design --lang frontend');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'design', 'frontend', 'SKILL.md'))).toBe(true);
    });
  });

  // ── install (native) ──────────────────────────────────────────────────────

  describe('install with agent (native)', () => {
    it('cursor: appends to .cursorrules', () => {
      runCli('install code-review --agent cursor --lang general');
      expect(fs.existsSync(path.join(TEST_DIR, '.cursorrules'))).toBe(true);
      const content = fs.readFileSync(path.join(TEST_DIR, '.cursorrules'), 'utf-8');
      expect(content).toContain('code-review');
    });

    it('cursor: appends multiple skills to .cursorrules', () => {
      runCli('install security --agent cursor');
      const content = fs.readFileSync(path.join(TEST_DIR, '.cursorrules'), 'utf-8');
      expect(content).toContain('security');
    });

    it('claude-code: creates .claude/commands/<concept>.md', () => {
      runCli('install security --agent claude-code --lang general');
      expect(fs.existsSync(path.join(TEST_DIR, '.claude', 'commands', 'security.md'))).toBe(true);
    });

    it('claude-code: creates separate file per concept', () => {
      runCli('install code-review --agent claude-code');
      expect(fs.existsSync(path.join(TEST_DIR, '.claude', 'commands', 'code-review.md'))).toBe(true);
    });

    it('vsc: appends to .github/copilot-instructions.md', () => {
      runCli('install git-workflow --agent vsc');
      expect(fs.existsSync(path.join(TEST_DIR, '.github', 'copilot-instructions.md'))).toBe(true);
      const content = fs.readFileSync(path.join(TEST_DIR, '.github', 'copilot-instructions.md'), 'utf-8');
      expect(content).toContain('git-workflow');
    });

    it('antigravity: installs to .agent/skills/<concept>/', () => {
      runCli('install refactoring --agent antigravity --lang typescript');
      expect(fs.existsSync(path.join(TEST_DIR, '.agent', 'skills', 'refactoring'))).toBe(true);
    });
  });

  // ── init ──────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('creates .ai-skills.json', () => {
      runCli('init');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills.json'))).toBe(true);
    });

    it('.ai-skills.json is valid JSON', () => {
      const content = fs.readFileSync(path.join(TEST_DIR, '.ai-skills.json'), 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  // ── install-all ───────────────────────────────────────────────────────────

  describe('install-all', () => {
    it('installs skills with agent to native locations', () => {
      fs.writeFileSync(path.join(TEST_DIR, '.ai-skills.json'), JSON.stringify({
        skills: [
          { id: "testing/general", agent: "antigravity" },
          { id: "refactoring/typescript", agent: "antigravity" }
        ]
      }));
      runCli('install-all');
      expect(fs.existsSync(path.join(TEST_DIR, '.agent', 'skills', 'testing', 'SKILL.md'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, '.agent', 'skills', 'refactoring', 'SKILL.md'))).toBe(true);
    });

    it('installs skills without agent to default folder', () => {
      fs.writeFileSync(path.join(TEST_DIR, '.ai-skills.json'), JSON.stringify({
        skills: [
          { id: "security/general" }
        ]
      }));
      runCli('install-all');
      expect(fs.existsSync(path.join(TEST_DIR, '.ai-skills', 'security', 'general', 'SKILL.md'))).toBe(true);
    });

    it('installs skills to respective specific native locations', () => {
      fs.writeFileSync(path.join(TEST_DIR, '.ai-skills.json'), JSON.stringify({
        skills: [
          { id: "git-workflow/general", agent: "claude-code" },
          { id: "architecture/general", agent: "claude-code" }
        ]
      }));
      runCli('install-all');
      expect(fs.existsSync(path.join(TEST_DIR, '.claude', 'commands', 'git-workflow.md'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, '.claude', 'commands', 'architecture.md'))).toBe(true);
    });
  });
});
