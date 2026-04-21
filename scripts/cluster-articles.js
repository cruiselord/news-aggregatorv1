#!/usr/bin/env node

// shim for the TypeScript clustering script. Users can either run this
// file with Node (it will spawn ts-node) or directly invoke the .ts file
// with `npx ts-node`.

const { execSync } = require('child_process');

try {
  execSync('npx ts-node scripts/cluster-articles.ts', { stdio: 'inherit' });
} catch (err) {
  console.error('failed to run ts-node clustering script', err);
  process.exit(1);
}

