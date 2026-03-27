#!/usr/bin/env node
/* eslint-disable no-restricted-syntax */

/**
 * sync-schemas.js
 * Pulls all *.schema.ts changes from MetGo-BE into Marketplace-BE.
 *
 * Usage:
 *   node scripts/sync-schemas.js           # preview (dry-run)
 *   node scripts/sync-schemas.js --apply   # apply changes
 */

const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const SOURCE_ROOT = path.resolve(__dirname, '../../../MetGo/MetGo-BE');
const TARGET_ROOT = path.resolve(__dirname, '..');
const DRY_RUN = !process.argv.includes('--apply');

/**
 * Import-path rewrites applied when content differs due to project structure.
 * Each entry: { from: RegExp, to: string }
 */
const IMPORT_REWRITES = [
  {
    // MetGo uses business/schema/, Marketplace uses business/shared/schema/
    from: /from 'src\/modules\/business\/schema\//g,
    to: "from 'src/modules/business/shared/schema/",
  },
];

/**
 * Source-path prefixes that are stored at a different location in the target.
 * When a source file matches `src`, the script resolves it against `tgt`
 * instead of the default mirrored path.
 * Each entry: { src: string, tgt: string }  (relative to src/)
 */
const PATH_REMAPS = [
  {
    src: 'modules/business/schema/',
    tgt: 'modules/business/shared/schema/',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkSchemas(dir, base = dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSchemas(full, base, results);
    } else if (entry.isFile() && entry.name.endsWith('.schema.ts')) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

function applyRewrites(content) {
  let result = content;
  for (const { from, to } of IMPORT_REWRITES) {
    result = result.replace(from, to);
  }
  return result;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function log(tag, msg) {
  const colors = {
    ADD: '\x1b[32m', UPDATE: '\x1b[33m', SAME: '\x1b[90m', INFO: '\x1b[36m',
  };
  const reset = '\x1b[0m';
  console.log(`${colors[tag] || ''}[${tag}]${reset} ${msg}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`Source repo not found: ${SOURCE_ROOT}`);
    process.exit(1);
  }

  const srcSchemas = walkSchemas(path.join(SOURCE_ROOT, 'src'));

  const stats = { added: 0, updated: 0, unchanged: 0 };

  console.log(`\nSource : ${SOURCE_ROOT}`);
  console.log(`Target : ${TARGET_ROOT}`);
  console.log(`Mode   : ${DRY_RUN ? 'DRY RUN (pass --apply to write)' : 'APPLY'}\n`);

  for (const relPath of srcSchemas) {
    const srcFile = path.join(SOURCE_ROOT, 'src', relPath);

    // Resolve target path, applying any structural remaps
    const remap = PATH_REMAPS.find(r => relPath.startsWith(r.src));
    const tgtRelPath = remap
      ? relPath.replace(remap.src, remap.tgt)
      : relPath;
    const tgtFile = path.join(TARGET_ROOT, 'src', tgtRelPath);

    const srcContent = fs.readFileSync(srcFile, 'utf8');
    const rewritten = applyRewrites(srcContent);

    if (!fs.existsSync(tgtFile)) {
      log('ADD', relPath);
      stats.added++;
      if (!DRY_RUN) {
        ensureDir(tgtFile);
        fs.writeFileSync(tgtFile, rewritten, 'utf8');
      }
    } else {
      const tgtContent = fs.readFileSync(tgtFile, 'utf8');
      if (rewritten !== tgtContent) {
        log('UPDATE', relPath);
        stats.updated++;
        if (!DRY_RUN) {
          fs.writeFileSync(tgtFile, rewritten, 'utf8');
        }
      } else {
        log('SAME', relPath);
        stats.unchanged++;
      }
    }
  }

  console.log('\n── Summary ──────────────────────────────────────');
  console.log(`  Added    : ${stats.added}`);
  console.log(`  Updated  : ${stats.updated}`);
  console.log(`  Unchanged: ${stats.unchanged}`);
  if (DRY_RUN && (stats.added + stats.updated) > 0) {
    console.log('\n  Run with --apply to write changes.');
  }
  console.log('');
}

main();
