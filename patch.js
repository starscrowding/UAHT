#!/usr/bin/env node

// Patch script: replace `.some` with `?.some` in @web3modal/ui dist file
// Runs before build (see package.json: "node patch.js && next build")

const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'node_modules', '@web3modal', 'ui', 'dist', 'index.js');

function patchFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[patch] File not found: ${filePath}. Skipping.`);
      return;
    }

    const original = fs.readFileSync(filePath, 'utf8');
    let count = 0;

    // Replace occurrences of `.some` that are NOT already optional chained (i.e., not `?.some`).
    // Restrict to cases where previous char looks like a valid property access receiver end: word, ) or ]
    // Avoids touching strings/comments in most minified bundles and avoids `?.some` double-patching.
    const patched = original.replace(/([\w\)\]])\.some\b/g, (match, p1) => {
      count += 1;
      return `${p1}?.some`;
    });

    if (patched !== original) {
      fs.writeFileSync(filePath, patched, 'utf8');
      console.log(`[patch] Patched ${filePath} (${count} replacement${count === 1 ? '' : 's'}).`);
    } else {
      console.log(`[patch] No changes needed for ${filePath}.`);
    }
  } catch (err) {
    console.error(`[patch] Failed to patch ${filePath}:`, err);
    // Don't hard fail build for patch issues; exit gracefully.
  }
}

patchFile(targetPath);
