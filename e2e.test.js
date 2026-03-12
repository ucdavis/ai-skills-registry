const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const REGISTRY_URL = `http://localhost:${PORT}/skills.json`;
const REPO_URL = `http://localhost:${PORT}`;

const TEST_DIR = path.join(__dirname, 'test_sandbox');
const CLI_PATH = path.join(__dirname, 'dist', 'index.js');

let serverProcess;

function startServer() {
  console.log('Starting local HTTP server...');
  serverProcess = spawn('python3', ['-m', 'http.server', PORT.toString()], {
    cwd: __dirname,
    stdio: 'ignore'
  });
  
  // Give the server a moment to start
  execSync('sleep 2');
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping local HTTP server...');
    serverProcess.kill();
  }
}

function runCli(command) {
  const env = {
    ...process.env,
    AI_SKILLS_REGISTRY_URL: REGISTRY_URL,
    AI_SKILLS_REPO_URL: REPO_URL,
  };
  
  try {
    return execSync(`node ${CLI_PATH} ${command}`, {
      env,
      cwd: TEST_DIR,
      encoding: 'utf-8'
    });
  } catch (error) {
    console.error(`Error running command: ai-skills ${command}`);
    console.error(error.stdout);
    console.error(error.stderr);
    throw error;
  }
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File expected but not found: ${filePath}`);
  }
}

async function runTests() {
  console.log('Building CLI...');
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });

  startServer();

  // Setup sandbox
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR);

  try {
    console.log('\n--- Test: list ---');
    const listOut = runCli('list');
    if (!listOut.includes('testing') || !listOut.includes('architecture')) {
      throw new Error('list command failed to display expected skills');
    }
    console.log('✅ list command passed');

    console.log('\n--- Test: list --lang typescript ---');
    const listTsOut = runCli('list --lang typescript');
    if (!listTsOut.includes('testing') || !listTsOut.includes('refactoring')) {
      throw new Error('list --lang failed');
    }
    console.log('✅ list --lang passed');

    console.log('\n--- Test: search "boundary" ---');
    const searchOut = runCli('search boundary');
    if (!searchOut.includes('testing/general')) {
      throw new Error('search command failed to find matching skill');
    }
    console.log('✅ search command passed');

    console.log('\n--- Test: info testing --lang typescript ---');
    const infoOut = runCli('info testing --lang typescript');
    if (!infoOut.includes('vitest') || !infoOut.includes('typescript')) {
      throw new Error('info command failed to return accurate info');
    }
    console.log('✅ info command passed');

    console.log('\n--- Test: install (Standard) ---');
    runCli('install testing --agent antigravity --lang python');
    assertExists(path.join(TEST_DIR, '.ai-skills', 'antigravity', 'testing', 'python', 'SKILL.md'));
    console.log('✅ install (standard) passed');

    console.log('\n--- Test: install (Native cursor) ---');
    // For cursor, it appends to .cursorrules
    runCli('install code-review --agent cursor --lang general --native');
    assertExists(path.join(TEST_DIR, '.cursorrules'));
    console.log('✅ install (native cursor) passed');

    console.log('\n--- Test: install (Native claude-code) ---');
    runCli('install security --agent claude-code --lang general --native');
    assertExists(path.join(TEST_DIR, '.claude', 'commands', 'security.md'));
    console.log('✅ install (native claude-code) passed');

    console.log('\n--- Test: init ---');
    runCli('init');
    assertExists(path.join(TEST_DIR, '.ai-skills.json'));
    console.log('✅ init command passed');

    console.log('\n--- Test: install-all ---');
    // populate lockfile
    fs.writeFileSync(path.join(TEST_DIR, '.ai-skills.json'), JSON.stringify({
      skills: [
        { id: "testing/general", agent: "antigravity" },
        { id: "refactoring/typescript", agent: "antigravity" }
      ]
    }));
    runCli('install-all');
    assertExists(path.join(TEST_DIR, '.ai-skills', 'antigravity', 'testing', 'general', 'SKILL.md'));
    assertExists(path.join(TEST_DIR, '.ai-skills', 'antigravity', 'refactoring', 'typescript', 'SKILL.md'));
    console.log('✅ install-all passed');

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exitCode = 1;
  } finally {
    // Teardown
    stopServer();
    if (fs.existsSync(TEST_DIR)) {
      console.log('Cleaning up sandbox...');
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  }
}

runTests();
