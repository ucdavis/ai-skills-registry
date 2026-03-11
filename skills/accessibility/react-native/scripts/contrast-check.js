#!/usr/bin/env node
/**
 * rn-accessibility contrast-check script
 * Usage: node scripts/contrast-check.js [src-directory]
 *
 * Extracts hex color pairs from JS/TS StyleSheet definitions and
 * calculates WCAG 2.1 contrast ratios.
 *
 * No external dependencies required.
 */

const fs = require('fs');
const path = require('path');

// ---- WCAG contrast math ----

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagResult(ratio, isLargeText = false) {
  const threshold = isLargeText ? 3.0 : 4.5;
  return {
    pass: ratio >= threshold,
    level: ratio >= 7 ? 'AAA' : ratio >= (isLargeText ? 3 : 4.5) ? 'AA' : 'FAIL',
    ratio: Math.round(ratio * 100) / 100,
  };
}

// ---- Extract colors from source ----

const HEX_PATTERN = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;

function extractColors(src) {
  const matches = new Set();
  let m;
  while ((m = HEX_PATTERN.exec(src)) !== null) {
    matches.add('#' + m[1].toUpperCase());
  }
  return [...matches];
}

function expandHex(hex) {
  const h = hex.replace('#', '');
  return h.length === 3
    ? '#' + h.split('').map(c => c + c).join('').toUpperCase()
    : hex.toUpperCase();
}

// ---- File walker ----
function walkDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.expo'].includes(entry.name)) {
        results.push(...walkDir(fullPath));
      }
    } else if (['.tsx', '.jsx', '.js', '.ts'].some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---- Known problematic pairs (common RN defaults) ----
const KNOWN_PAIRS = [
  { text: '#999999', bg: '#FFFFFF', desc: 'Placeholder gray on white' },
  { text: '#AAAAAA', bg: '#FFFFFF', desc: 'Light gray on white' },
  { text: '#CCCCCC', bg: '#FFFFFF', desc: 'Very light gray on white' },
  { text: '#888888', bg: '#222222', desc: 'Mid gray on dark (dark mode)' },
];

// ---- Main ----
const targetDir = process.argv[2] || './src';

console.log('\n🎨 React Native Accessibility — Color Contrast Check\n');

// Check known problematic pairs first
console.log('── Common problem pairs ──\n');
KNOWN_PAIRS.forEach(({ text, bg, desc }) => {
  const ratio = contrastRatio(text, bg);
  const result = wcagResult(ratio);
  const icon = result.pass ? '✅' : '❌';
  console.log(`${icon} ${desc}`);
  console.log(`   ${text} on ${bg}: ${result.ratio}:1 [${result.level}]\n`);
});

// Scan for hex colors in source
if (fs.existsSync(targetDir)) {
  const files = walkDir(targetDir);
  const allColors = new Set();

  files.forEach(f => {
    const src = fs.readFileSync(f, 'utf-8');
    extractColors(src).forEach(c => allColors.add(expandHex(c)));
  });

  if (allColors.size > 0) {
    console.log(`── Colors found in ${targetDir} (${allColors.size} unique) ──\n`);
    const colorList = [...allColors];

    // Check all pairs (only print failing ones to avoid noise)
    const failures = [];
    for (let i = 0; i < colorList.length; i++) {
      for (let j = i + 1; j < colorList.length; j++) {
        const ratio = contrastRatio(colorList[i], colorList[j]);
        if (ratio < 4.5 && ratio > 1.5) {
          // Potentially used as text+background combo
          failures.push({ c1: colorList[i], c2: colorList[j], ratio });
        }
      }
    }

    if (failures.length === 0) {
      console.log('✅ No obvious contrast failures detected in color combinations.\n');
    } else {
      console.log(`⚠️  ${failures.length} color pair(s) with ratio < 4.5:1 (may fail for normal text):\n`);
      failures.sort((a, b) => a.ratio - b.ratio).slice(0, 20).forEach(f => {
        const r = Math.round(f.ratio * 100) / 100;
        const largeOk = f.ratio >= 3 ? ' [OK for large text ≥18pt]' : ' [FAIL for all text]';
        console.log(`   ❌ ${f.c1} / ${f.c2}: ${r}:1${largeOk}`);
      });
    }
  }
}

console.log('\n── Manual steps ──');
console.log('  • Take screenshots and run through Colour Contrast Analyser');
console.log('  • Check on both light and dark mode');
console.log('  • Test with iOS "Increase Contrast" and Android "High contrast text"');
console.log('  • See references/contrast.md for safe replacement palettes\n');
