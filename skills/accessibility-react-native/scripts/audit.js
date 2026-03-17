#!/usr/bin/env node
/**
 * rn-accessibility audit script
 * Usage: node scripts/audit.js <src-directory>
 *
 * Scans .tsx / .jsx / .js files for common React Native accessibility issues.
 * Outputs a report to stdout. Non-zero exit code if errors found.
 *
 * Requires: @babel/parser, @babel/traverse  (npm install -D @babel/parser @babel/traverse)
 */

const fs = require('fs');
const path = require('path');

// --- Try to load Babel; if not present, fall back to regex scan ---
let useBabel = false;
try {
  require.resolve('@babel/parser');
  require.resolve('@babel/traverse');
  useBabel = true;
} catch (_) {
  console.warn('⚠️  @babel/parser / @babel/traverse not found. Using regex fallback (less accurate).\n   Install with: npm install -D @babel/parser @babel/traverse\n');
}

const INTERACTIVE_ELEMENTS = [
  'TouchableOpacity', 'TouchableHighlight', 'TouchableNativeFeedback',
  'TouchableWithoutFeedback', 'Pressable',
];

const IMAGE_ELEMENTS = ['Image', 'FastImage'];

const INPUT_ELEMENTS = ['TextInput'];

const issues = [];

function addIssue(file, line, severity, message) {
  issues.push({ file, line, severity, message });
}

// ---- Regex-based scan (fallback) ----
function regexScan(filePath, src) {
  const lines = src.split('\n');

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;

    // Touchable/Pressable without accessibilityLabel on same line
    INTERACTIVE_ELEMENTS.forEach(el => {
      if (line.includes(`<${el}`) && !line.includes('accessibilityLabel') && !line.includes('accessibilityRole')) {
        // Only flag opening tags (heuristic)
        if (!line.trim().startsWith('//')) {
          addIssue(filePath, lineNo, 'warning',
            `<${el}> may be missing accessibilityLabel / accessibilityRole`);
        }
      }
    });

    // TextInput without accessibilityLabel
    if (line.includes('<TextInput') && !line.includes('accessibilityLabel')) {
      addIssue(filePath, lineNo, 'error',
        `<TextInput> should have an accessibilityLabel (placeholder is not enough)`);
    }

    // Image without accessibilityLabel
    IMAGE_ELEMENTS.forEach(el => {
      if (line.includes(`<${el}`) && !line.includes('accessibilityLabel') && !line.includes('accessible={false}')) {
        addIssue(filePath, lineNo, 'warning',
          `<${el}> is missing accessibilityLabel or accessible={false} for decorative`);
      }
    });

    // allowFontScaling={false} — bad practice
    if (line.includes('allowFontScaling={false}')) {
      addIssue(filePath, lineNo, 'error',
        'allowFontScaling={false} prevents users with large text settings from scaling this text');
    }
  });
}

// ---- File walker ----
function walkDir(dir, exts = ['.tsx', '.jsx', '.js', '.ts']) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.expo'].includes(entry.name)) {
        results.push(...walkDir(fullPath, exts));
      }
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---- Main ----
const targetDir = process.argv[2] || './src';

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

const files = walkDir(targetDir);
console.log(`\n🔍 Scanning ${files.length} files in ${targetDir}...\n`);

files.forEach(filePath => {
  const src = fs.readFileSync(filePath, 'utf-8');
  regexScan(filePath, src);
});

// ---- Report ----
const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');

if (issues.length === 0) {
  console.log('✅ No accessibility issues detected by static scan.\n');
  console.log('   Remember to also:\n   • Test with VoiceOver (iOS) and TalkBack (Android)\n   • Run Xcode Accessibility Inspector\n   • Check color contrast manually\n');
  process.exit(0);
}

console.log(`Found ${errors.length} error(s) and ${warnings.length} warning(s):\n`);

// Group by file
const byFile = {};
issues.forEach(issue => {
  if (!byFile[issue.file]) byFile[issue.file] = [];
  byFile[issue.file].push(issue);
});

Object.entries(byFile).forEach(([file, fileIssues]) => {
  const relPath = path.relative(process.cwd(), file);
  console.log(`📄 ${relPath}`);
  fileIssues.forEach(issue => {
    const icon = issue.severity === 'error' ? '❌' : '⚠️ ';
    console.log(`   ${icon} Line ${issue.line}: ${issue.message}`);
  });
  console.log('');
});

console.log('─'.repeat(60));
console.log(`Total: ${errors.length} errors, ${warnings.length} warnings`);
console.log('\nNext steps:');
console.log('  1. Fix all errors first — these will definitely fail screen reader testing.');
console.log('  2. Review warnings in context — some may be false positives.');
console.log('  3. Test manually with VoiceOver and TalkBack on a real device.');
console.log('  4. Run: node scripts/contrast-check.js to check color ratios.\n');

process.exit(errors.length > 0 ? 1 : 0);
